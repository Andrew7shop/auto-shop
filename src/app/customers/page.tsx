import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { vehicles: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Customers</h1>
        <Link
          href="/customers/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New customer
        </Link>
      </div>

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {customers.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">No customers yet.</p>
        )}
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="text-xs text-zinc-500">
                {customer.phone ?? customer.email ?? "No contact info"} ·{" "}
                {customer.vehicles.length} vehicle{customer.vehicles.length === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
