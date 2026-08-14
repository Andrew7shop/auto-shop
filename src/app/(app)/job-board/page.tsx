import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, sumLineItems } from "@/lib/money";
import type { WorkOrderStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const COLUMNS: { key: string; title: string; statuses: WorkOrderStatus[] }[] = [
  { key: "estimates", title: "Estimates", statuses: ["OPEN", "WAITING_ON_APPROVAL"] },
  { key: "wip", title: "Work In Progress", statuses: ["IN_PROGRESS", "WAITING_ON_PARTS"] },
  { key: "completed", title: "Completed", statuses: ["COMPLETED"] },
];

export default async function JobBoardPage() {
  const workOrders = await prisma.workOrder.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { customer: true, vehicle: true, lineItems: true },
    orderBy: { openedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Job Board</h1>
          <p className="text-sm text-zinc-500">Work orders by stage</p>
        </div>
        <Link
          href="/work-orders/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New work order
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const items = workOrders.filter((wo) => column.statuses.includes(wo.status));
          return (
            <div key={column.key}>
              <h2 className="mb-3 flex items-center justify-between font-medium text-zinc-900 dark:text-zinc-50">
                {column.title}
                <span className="text-xs font-normal text-zinc-500">{items.length}</span>
              </h2>
              <div className="space-y-3">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
                    No jobs here.
                  </p>
                )}
                {items.map((wo) => (
                  <Link
                    key={wo.id}
                    href={`/work-orders/${wo.id}`}
                    className="block rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        #{wo.number} — {wo.customer.firstName} {wo.customer.lastName}
                      </p>
                      <Badge status={wo.status} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {wo.description}
                    </p>
                    {wo.lineItems.length > 0 && (
                      <p className="mt-2 text-xs font-medium text-zinc-500">
                        {formatCurrency(sumLineItems(wo.lineItems))}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
