import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export default async function AccountsReceivablePage() {
  const [invoices, roSettings] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
      include: { customer: true, workOrder: { include: { lineItems: true } }, payments: true },
      orderBy: { issuedAt: "asc" },
    }),
    getRoSettings(),
  ]);

  const now = new Date();
  const rows = invoices.map((invoice) => {
    const totals = computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments);
    const daysOutstanding = Math.floor((now.getTime() - invoice.issuedAt.getTime()) / 86_400_000);
    return { invoice, balance: totals.balance, daysOutstanding };
  });

  const totalBalance = rows.reduce((sum, r) => sum + r.balance, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Accounts Receivable</h1>
      <p className="text-sm text-zinc-500">Live snapshot of unpaid and partially paid invoices, oldest first.</p>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Invoice</th>
              <th className="px-4 py-2">Issued</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2 text-right">Days outstanding</th>
              <th className="px-4 py-2 text-right">Balance due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  Nothing outstanding.
                </td>
              </tr>
            )}
            {rows.map(({ invoice, balance, daysOutstanding }) => (
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
                <td
                  className={`px-4 py-2 text-right ${
                    daysOutstanding > 60 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  {daysOutstanding}
                </td>
                <td className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(balance)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td colSpan={4} className="px-4 py-2 text-right">
                Total outstanding
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(totalBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
