import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, sumLineItems } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: true, lineItems: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Orders</h1>
        <Link
          href="/orders/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New order
        </Link>
      </div>

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {orders.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">No purchase orders yet.</p>
        )}
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Order #{order.number} · {order.vendor.name}
              </p>
              <p className="text-xs text-zinc-500">
                {order.lineItems.length} item{order.lineItems.length === 1 ? "" : "s"} ·{" "}
                {formatCurrency(sumLineItems(order.lineItems.map((i) => ({ quantity: i.quantity, unitPrice: i.unitCost }))))}
              </p>
            </div>
            <Badge status={order.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
