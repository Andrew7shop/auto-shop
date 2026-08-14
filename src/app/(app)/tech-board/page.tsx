import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, sumLineItems } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function TechBoardPage() {
  const [technicians, workOrders] = await Promise.all([
    prisma.employee.findMany({
      where: { role: "TECHNICIAN", active: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.workOrder.findMany({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { customer: true, vehicle: true, lineItems: true },
      orderBy: { openedAt: "desc" },
    }),
  ]);

  const columns = [
    ...technicians.map((tech) => ({
      key: tech.id,
      title: `${tech.firstName} ${tech.lastName}`,
      jobs: workOrders.filter((wo) => wo.assignedToId === tech.id),
    })),
    {
      key: "unassigned",
      title: "Unassigned",
      jobs: workOrders.filter((wo) => wo.assignedToId === null),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Tech Board</h1>
        <p className="text-sm text-zinc-500">Active jobs by technician</p>
      </div>

      {technicians.length === 0 && (
        <p className="rounded-lg border border-dashed border-zinc-300 px-6 py-6 text-sm text-zinc-500 dark:border-zinc-700">
          No active technicians yet.{" "}
          <Link href="/employees/new" className="underline">
            Add one
          </Link>{" "}
          to start assigning jobs.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column.key}>
            <h2 className="mb-3 flex items-center justify-between font-medium text-zinc-900 dark:text-zinc-50">
              {column.title}
              <span className="text-xs font-normal text-zinc-500">{column.jobs.length}</span>
            </h2>
            <div className="space-y-3">
              {column.jobs.length === 0 && (
                <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
                  No jobs here.
                </p>
              )}
              {column.jobs.map((wo) => (
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
        ))}
      </div>
    </div>
  );
}
