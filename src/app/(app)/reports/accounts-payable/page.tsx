import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, sumLineItems } from "@/lib/money";
import { formatDate } from "@/lib/datetime";
import { markOrderPaid } from "../../orders/actions";
import { secondaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function AccountsPayablePage() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["ORDERED", "RECEIVED"] }, paidAt: null },
    include: { vendor: true, lineItems: true },
    orderBy: { orderedAt: "asc" },
  });

  const now = new Date();
  const rows = orders.map((order) => {
    const amount = sumLineItems(order.lineItems.map((i) => ({ quantity: i.quantity, unitPrice: i.unitCost })));
    const since = order.orderedAt ?? order.createdAt;
    const daysSinceOrdered = Math.floor((now.getTime() - since.getTime()) / 86_400_000);
    return { order, amount, daysSinceOrdered };
  });

  const totalOwed = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Accounts Payable</h1>
      <p className="text-sm text-zinc-500">
        Live snapshot of vendor purchase orders that have been placed but not yet marked paid.
      </p>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Ordered</th>
              <th className="px-4 py-2 text-right">Days since ordered</th>
              <th className="px-4 py-2 text-right">Amount owed</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  Nothing owed to vendors.
                </td>
              </tr>
            )}
            {rows.map(({ order, amount, daysSinceOrdered }) => (
              <tr key={order.id}>
                <td className="px-4 py-2">
                  <Link href={`/orders/${order.id}`} className="text-zinc-900 hover:underline dark:text-zinc-50">
                    #{order.number}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{order.vendor.name}</td>
                <td className="px-4 py-2 text-zinc-500">
                  {order.orderedAt ? formatDate(order.orderedAt) : "—"}
                </td>
                <td
                  className={`px-4 py-2 text-right ${
                    daysSinceOrdered > 30 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
                  }`}
                >
                  {daysSinceOrdered}
                </td>
                <td className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(amount)}
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <form action={markOrderPaid}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="redirectTo" value="/reports/accounts-payable" />
                    <button type="submit" className={`${secondaryButtonClass} text-xs`}>
                      Mark paid
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
              <td colSpan={4} className="px-4 py-2 text-right">
                Total owed
              </td>
              <td className="px-4 py-2 text-right">{formatCurrency(totalOwed)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
