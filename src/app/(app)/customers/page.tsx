import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchFilterBar } from "@/components/search-filter-bar";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: PageProps<"/customers">) {
  const { q } = await searchParams;
  const searchTerm = typeof q === "string" ? q.trim() : "";

  const customers = await prisma.customer.findMany({
    where: searchTerm
      ? {
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        }
      : undefined,
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

      <SearchFilterBar q={searchTerm} placeholder="Search by name, phone, or email" basePath="/customers" />

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {customers.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">
            {searchTerm ? "No customers match your search." : "No customers yet."}
          </p>
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
