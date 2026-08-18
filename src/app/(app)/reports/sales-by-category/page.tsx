import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";
import { JOB_CATEGORIES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

export default async function SalesByCategoryPage({ searchParams }: PageProps<"/reports/sales-by-category">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const invoices = await prisma.invoice.findMany({
    where: { issuedAt: { gte: start, lt: end } },
    include: { workOrder: { include: { lineItems: true } }, payments: true },
    orderBy: { issuedAt: "asc" },
  });

  const byCategory = new Map<string, { count: number; total: number }>();
  for (const invoice of invoices) {
    const totals = computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments);
    const category = invoice.workOrder.category;
    const entry = byCategory.get(category) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += totals.discountedSubtotal;
    byCategory.set(category, entry);
  }

  const grandTotal = [...byCategory.values()].reduce((sum, e) => sum + e.total, 0);
  const rows = JOB_CATEGORIES.map((c) => ({ ...c, ...(byCategory.get(c.value) ?? { count: 0, total: 0 }) }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sales by Job Category</h1>

      <ReportDateRangeFilter from={from} to={to} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Invoices</th>
              <th className="px-4 py-2 text-right">Net sales</th>
              <th className="px-4 py-2 text-right">% of total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {grandTotal === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No invoices in this range.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.value}>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{row.label}</td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">{row.count}</td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(row.total)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-500">
                  {grandTotal > 0 ? `${((row.total / grandTotal) * 100).toFixed(1)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td className="px-4 py-2 text-right">Total</td>
              <td className="px-4 py-2 text-right">{invoices.length}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(grandTotal)}</td>
              <td className="px-4 py-2 text-right">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
