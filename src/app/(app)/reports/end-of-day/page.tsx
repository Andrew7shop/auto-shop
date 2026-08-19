import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { resolveReportDay } from "@/lib/reports";
import { ReportDayFilter } from "@/components/report-filters";
import { formatDate } from "@/lib/datetime";
import { PrintButton } from "@/components/print-button";
import { getShopProfile, DEFAULT_SHOP_NAME } from "@/lib/shop-profile";
import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export default async function EndOfDayPage({ searchParams }: PageProps<"/reports/end-of-day">) {
  const params = await searchParams;
  const { dateKey, start, end } = resolveReportDay(params);

  const [invoices, payments, completedWorkOrders, shopProfile, roSettings] = await Promise.all([
    prisma.invoice.findMany({
      where: { issuedAt: { gte: start, lt: end } },
      include: { customer: true, workOrder: { include: { lineItems: true } }, payments: true },
      orderBy: { issuedAt: "asc" },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: start, lt: end } },
      include: { invoice: { include: { customer: true } } },
      orderBy: { paidAt: "asc" },
    }),
    prisma.workOrder.count({ where: { completedAt: { gte: start, lt: end } } }),
    getShopProfile(),
    getRoSettings(),
  ]);

  const invoiceTotals = invoices.map((invoice) => computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments));
  const totalInvoiced = invoiceTotals.reduce((sum, t) => sum + t.total, 0);
  const totalTax = invoiceTotals.reduce((sum, t) => sum + t.tax, 0);

  const paymentsByMethod = new Map<string, number>();
  for (const p of payments) {
    paymentsByMethod.set(p.method, (paymentsByMethod.get(p.method) ?? 0) + Number(p.amount));
  }
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-8">
      <div className="hidden print:block">
        <p className="text-lg font-semibold">{shopProfile?.name || DEFAULT_SHOP_NAME}</p>
      </div>

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          End of Day — {formatDate(start, { month: "long", day: "numeric", year: "numeric" })}
        </h1>
        <PrintButton
          label="Print report"
          className="print:hidden rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        />
      </div>

      <ReportDayFilter dateKey={dateKey} />

      <section className="space-y-3">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
          Invoices issued ({invoices.length})
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                    No invoices issued.
                  </td>
                </tr>
              )}
              {invoices.map((invoice, i) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                    #{formatInvoiceNumber(invoice.number, roSettings)}
                  </td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                    {invoice.customer.firstName} {invoice.customer.lastName}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(invoiceTotals[i].total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                <td colSpan={2} className="px-4 py-2 text-right">
                  Total invoiced (tax collected {formatCurrency(totalTax)})
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(totalInvoiced)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
          Payments received ({payments.length})
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {paymentsByMethod.size === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-zinc-500">
                    No payments received.
                  </td>
                </tr>
              )}
              {[...paymentsByMethod.entries()].map(([method, amount]) => (
                <tr key={method}>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                    {method.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                <td className="px-4 py-2 text-right">Total collected</td>
                <td className="px-4 py-2 text-right">{formatCurrency(totalCollected)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <p className="text-sm text-zinc-500">
          Work orders completed: <span className="font-medium text-zinc-900 dark:text-zinc-50">{completedWorkOrders}</span>
        </p>
      </section>
    </div>
  );
}
