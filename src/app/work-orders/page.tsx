import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
  const workOrders = await prisma.workOrder.findMany({
    include: { customer: true, vehicle: true },
    orderBy: { openedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Work orders</h1>
        <Link
          href="/work-orders/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New work order
        </Link>
      </div>

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {workOrders.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">No work orders yet.</p>
        )}
        {workOrders.map((wo) => (
          <Link
            key={wo.id}
            href={`/work-orders/${wo.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                #{wo.number} — {wo.customer.firstName} {wo.customer.lastName}
              </p>
              <p className="text-xs text-zinc-500">
                {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model} · {wo.description}
              </p>
            </div>
            <Badge status={wo.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
