import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";
import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export default async function SalesTaxPage({ searchParams }: PageProps<"/reports/sales-tax">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const [invoices, roSettings] = await Promise.all([
    prisma.invoice.findMany({
      where: { issuedAt: { gte: start, lt: end } },
      include: { customer: true, workOrder: { include: { lineItems: true } }, payments: true },
      orderBy: { issuedAt: "asc" },
    }),
    getRoSettings(),
  ]);

  const rows = invoices.map((invoice) => ({
    invoice,
    totals: computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments),
  }));

  const totalTaxable = rows.reduce((sum, r) => sum + r.totals.discountedSubtotal, 0);
  const totalTax = rows.reduce((sum, r) => sum + r.totals.tax, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sales Tax</h1>

      <ReportDateRangeFilter from={from} to={to} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Taxable amount</th>
              <th className="px-4 py-2 text-right">Rate</th>
              <th className="px-4 py-2 text-right">Tax collected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No invoices in this range.
                </td>
              </tr>
            )}
            {rows.map(({ invoice, totals }) => (
              <tr key={invoice.id}>
                <td className="px-4 py-2">
                  <Link href={`/invoices/${invoice.id}`} className="text-zinc-900 hover:underline dark:text-zinc-50">
                    #{formatInvoiceNumber(invoice.number, roSettings)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-500">{formatDate(invoice.issuedAt)}</td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totals.discountedSubtotal)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-500">
                  {(Number(invoice.taxRate) * 100).toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(totals.tax)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td className="px-4 py-2 text-right">Total</td>
              <td />
              <td className="px-4 py-2 text-right">{formatCurrency(totalTaxable)}</td>
              <td />
              <td className="px-4 py-2 text-right">{formatCurrency(totalTax)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
