import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, computeLineItemTotal } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";

export const dynamic = "force-dynamic";

export default async function FeesPage({ searchParams }: PageProps<"/reports/fees">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const invoices = await prisma.invoice.findMany({
    where: { issuedAt: { gte: start, lt: end } },
    include: { customer: true, workOrder: { include: { lineItems: true } } },
    orderBy: { issuedAt: "asc" },
  });

  const rows = invoices.flatMap((invoice) =>
    invoice.workOrder.lineItems
      .filter((item) => item.type === "FEE")
      .map((item) => ({ invoice, item }))
  );

  const total = rows.reduce((sum, r) => sum + computeLineItemTotal(r.item.quantity, r.item.unitPrice), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Fees</h1>

      <ReportDateRangeFilter from={from} to={to} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  No fees charged in this range.
                </td>
              </tr>
            )}
            {rows.map(({ invoice, item }) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
                  <Link href={`/invoices/${invoice.id}`} className="text-zinc-900 hover:underline dark:text-zinc-50">
                    #{invoice.number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-500">{formatDate(invoice.issuedAt)}</td>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </td>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{item.description}</td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(computeLineItemTotal(item.quantity, item.unitPrice))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td colSpan={4} className="px-4 py-2 text-right">
                Total fees
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
