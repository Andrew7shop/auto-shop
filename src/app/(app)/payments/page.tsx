import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/datetime";
import { Badge } from "@/components/badge";
import { PaymentsBarChart } from "@/components/payments-bar-chart";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: { invoice: { include: { customer: true } } },
    orderBy: { paidAt: "asc" },
  });

  const succeededPayments = payments.filter((p) => p.status === "SUCCEEDED");

  const chartPayments = succeededPayments.map((p) => ({
    id: p.id,
    amount: p.amount.toNumber(),
    dateLabel: formatDate(p.paidAt, { month: "numeric", day: "numeric" }),
    fullLabel: formatDateTime(p.paidAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    customerName: `${p.invoice.customer.firstName} ${p.invoice.customer.lastName}`,
  }));

  const listPayments = [...payments].reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Payments</h1>
        <p className="text-sm text-zinc-500">Every payment recorded across all invoices.</p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        {succeededPayments.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">No succeeded payments recorded yet.</p>
        ) : (
          <PaymentsBarChart payments={chartPayments} />
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">All payments</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Date/time</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {listPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                    No payments received yet.
                  </td>
                </tr>
              )}
              {listPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-2 text-zinc-500">{formatDateTime(payment.paidAt)}</td>
                  <td className="px-4 py-2">
                    <Badge status={payment.status} />
                  </td>
                  <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                    <Link href={`/invoices/${payment.invoice.id}`} className="hover:underline">
                      {payment.invoice.customer.firstName} {payment.invoice.customer.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
