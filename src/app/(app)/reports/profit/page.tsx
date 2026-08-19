import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";
import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export default async function ProfitPage({ searchParams }: PageProps<"/reports/profit">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const [invoices, roSettings] = await Promise.all([
    prisma.invoice.findMany({
      where: { issuedAt: { gte: start, lt: end } },
      include: {
        customer: true,
        workOrder: { include: { lineItems: { include: { part: true } } } },
        payments: true,
      },
      orderBy: { issuedAt: "asc" },
    }),
    getRoSettings(),
  ]);

  const rows = invoices.map((invoice) => {
    const totals = computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments);
    const cost = invoice.workOrder.lineItems.reduce((sum, item) => {
      if (item.type !== "PART" || !item.part) return sum;
      return sum + Number(item.quantity) * Number(item.part.unitCost);
    }, 0);
    const laborHours = invoice.workOrder.lineItems.reduce(
      (sum, item) => (item.type === "LABOR" ? sum + Number(item.quantity) : sum),
      0
    );
    return {
      invoice,
      revenue: totals.discountedSubtotal,
      cost,
      profit: totals.discountedSubtotal - cost,
      laborHours,
    };
  });

  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
  const totalProfit = rows.reduce((sum, r) => sum + r.profit, 0);
  const totalLaborHours = rows.reduce((sum, r) => sum + r.laborHours, 0);
  const actualGpPerHour = totalLaborHours > 0 ? totalProfit / totalLaborHours : null;
  const gpPerHourGoal = roSettings?.gpPerHourGoal ? Number(roSettings.gpPerHourGoal) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Profit Details</h1>
      <p className="text-sm text-zinc-500">
        Revenue net of discounts, minus part cost for line items linked to inventory. Labor cost isn&apos;t
        tracked, and parts sold without a linked inventory item contribute $0 cost — so profit here may
        be overstated for those.
      </p>

      <ReportDateRangeFilter from={from} to={to} />

      {gpPerHourGoal !== null && (
        <div className="flex items-center gap-6 rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
          <p className="text-zinc-500">
            GP/hr goal: <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatCurrency(gpPerHourGoal)}</span>
          </p>
          <p className="text-zinc-500">
            Actual:{" "}
            <span
              className={`font-medium ${
                actualGpPerHour === null
                  ? "text-zinc-900 dark:text-zinc-50"
                  : actualGpPerHour >= gpPerHourGoal
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {actualGpPerHour === null ? "No labor hours in range" : formatCurrency(actualGpPerHour)}
            </span>
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2 text-right">Revenue</th>
              <th className="px-4 py-2 text-right">Parts cost</th>
              <th className="px-4 py-2 text-right">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  No invoices in this range.
                </td>
              </tr>
            )}
            {rows.map(({ invoice, revenue, cost, profit }) => (
              <tr key={invoice.id}>
                <td className="px-4 py-2">
                  <Link href={`/invoices/${invoice.id}`} className="text-zinc-900 hover:underline dark:text-zinc-50">
                    #{formatInvoiceNumber(invoice.number, roSettings)}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-500">{formatDate(invoice.issuedAt)}</td>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(revenue)}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(cost)}
                </td>
                <td className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(profit)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td colSpan={3} className="px-4 py-2 text-right">
                Totals
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(totalRevenue)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(totalCost)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(totalProfit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
