import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";
import { getJobCategories } from "@/lib/job-categories";

export const dynamic = "force-dynamic";

export default async function SalesByCategoryPage({ searchParams }: PageProps<"/reports/sales-by-category">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const [invoices, jobCategories] = await Promise.all([
    prisma.invoice.findMany({
      where: { issuedAt: { gte: start, lt: end } },
      include: { workOrder: { include: { lineItems: true } }, payments: true },
      orderBy: { issuedAt: "asc" },
    }),
    getJobCategories(),
  ]);

  const byCategory = new Map<string, { count: number; total: number }>();
  let uncategorizedTotal = { count: 0, total: 0 };
  for (const invoice of invoices) {
    const totals = computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments);
    const categoryId = invoice.workOrder.categoryId;
    if (!categoryId) {
      uncategorizedTotal = { count: uncategorizedTotal.count + 1, total: uncategorizedTotal.total + totals.discountedSubtotal };
      continue;
    }
    const entry = byCategory.get(categoryId) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += totals.discountedSubtotal;
    byCategory.set(categoryId, entry);
  }

  const grandTotal = invoices.reduce(
    (sum, invoice) => sum + computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments).discountedSubtotal,
    0
  );
  const rows = [
    ...jobCategories.map((c) => ({
      value: c.id,
      label: `${c.code} — ${c.name}`,
      ...(byCategory.get(c.id) ?? { count: 0, total: 0 }),
    })),
    ...(uncategorizedTotal.count > 0 ? [{ value: "none", label: "No category", ...uncategorizedTotal }] : []),
  ];

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
