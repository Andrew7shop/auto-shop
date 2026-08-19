import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";
import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export default async function PaymentsReportPage({ searchParams }: PageProps<"/reports/payments">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const [payments, roSettings] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: start, lt: end } },
      include: { invoice: { include: { customer: true } } },
      orderBy: { paidAt: "asc" },
    }),
    getRoSettings(),
  ]);

  const byMethod = new Map<string, number>();
  for (const p of payments) {
    byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + Number(p.amount));
  }
  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Payment Details</h1>

      <ReportDateRangeFilter from={from} to={to} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {byMethod.size === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-zinc-500">
                  No payments in this range.
                </td>
              </tr>
            )}
            {[...byMethod.entries()].map(([method, amount]) => (
              <tr key={method}>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{method.replaceAll("_", " ")}</td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">{formatCurrency(amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td className="px-4 py-2 text-right">Total</td>
              <td className="px-4 py-2 text-right">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  No payments in this range.
                </td>
              </tr>
            )}
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-2 text-zinc-500">{formatDate(payment.paidAt)}</td>
                <td className="px-4 py-2">
                  <Link href={`/invoices/${payment.invoice.id}`} className="text-zinc-900 hover:underline dark:text-zinc-50">
                    #{formatInvoiceNumber(payment.invoice.number, roSettings)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                  {payment.invoice.customer.firstName} {payment.invoice.customer.lastName}
                </td>
                <td className="px-4 py-2 text-zinc-500">{payment.method.replaceAll("_", " ")}</td>
                <td className="px-4 py-2 text-zinc-500">{payment.reference ?? "—"}</td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
