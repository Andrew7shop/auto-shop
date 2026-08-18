import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";

export const dynamic = "force-dynamic";

export default async function SalesDetailsPage({ searchParams }: PageProps<"/reports/sales-details">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const invoices = await prisma.invoice.findMany({
    where: { issuedAt: { gte: start, lt: end } },
    include: { customer: true, workOrder: { include: { lineItems: true } }, payments: true },
    orderBy: { issuedAt: "asc" },
  });

  const rows = invoices.map((invoice) => ({
    invoice,
    totals: computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments),
  }));

  const grand = rows.reduce(
    (sum, r) => ({
      subtotal: sum.subtotal + r.totals.subtotal,
      discount: sum.discount + r.totals.discountAmount,
      tax: sum.tax + r.totals.tax,
      tireFee: sum.tireFee + r.totals.tireFee,
      total: sum.total + r.totals.total,
    }),
    { subtotal: 0, discount: 0, tax: 0, tireFee: 0, total: 0 }
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sales Details</h1>

      <ReportDateRangeFilter from={from} to={to} />

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2 text-right">Subtotal</th>
              <th className="px-4 py-2 text-right">Discount</th>
              <th className="px-4 py-2 text-right">Tax</th>
              <th className="px-4 py-2 text-right">Tire fee</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                  No invoices in this range.
                </td>
              </tr>
            )}
            {rows.map(({ invoice, totals }) => (
              <tr key={invoice.id}>
                <td className="px-4 py-2">
                  <Link href={`/invoices/${invoice.id}`} className="text-zinc-900 hover:underline dark:text-zinc-50">
                    #{invoice.number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-500">{formatDate(invoice.issuedAt)}</td>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totals.subtotal)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {totals.discountAmount > 0 ? `-${formatCurrency(totals.discountAmount)}` : "—"}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totals.tax)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {totals.tireFee > 0 ? formatCurrency(totals.tireFee) : "—"}
                </td>
                <td className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totals.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td colSpan={3} className="px-4 py-2 text-right">
                Totals
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(grand.subtotal)}</td>
              <td className="px-4 py-2 text-right">-{formatCurrency(grand.discount)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(grand.tax)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(grand.tireFee)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(grand.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
