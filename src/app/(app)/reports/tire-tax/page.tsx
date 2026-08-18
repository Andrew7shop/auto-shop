import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { resolveReportRange } from "@/lib/reports";
import { ReportDateRangeFilter } from "@/components/report-filters";

export const dynamic = "force-dynamic";

export default async function TireTaxPage({ searchParams }: PageProps<"/reports/tire-tax">) {
  const params = await searchParams;
  const { from, to, start, end } = resolveReportRange(params);

  const invoices = await prisma.invoice.findMany({
    where: { issuedAt: { gte: start, lt: end }, tireFeeTotal: { gt: 0 } },
    include: { customer: true },
    orderBy: { issuedAt: "asc" },
  });

  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.tireFeeTotal), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Tire Tax</h1>

      <ReportDateRangeFilter from={from} to={to} />

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2 text-right">Tire fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  No tire fees charged in this range.
                </td>
              </tr>
            )}
            {invoices.map((invoice) => (
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
                  {formatCurrency(invoice.tireFeeTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td colSpan={3} className="px-4 py-2 text-right">
                Total tire fees
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
