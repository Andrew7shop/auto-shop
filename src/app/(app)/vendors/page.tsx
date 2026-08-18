import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { parts: true, orders: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Vendors</h1>
        <Link
          href="/vendors/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New vendor
        </Link>
      </div>

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {vendors.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">No vendors yet.</p>
        )}
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${vendor.id}/edit`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{vendor.name}</p>
              <p className="text-xs text-zinc-500">
                {[vendor.contactName, vendor.phone, vendor.email].filter(Boolean).join(" · ") ||
                  "No contact info"}
              </p>
            </div>
            <p className="text-xs text-zinc-500">
              {vendor._count.parts} part{vendor._count.parts === 1 ? "" : "s"} ·{" "}
              {vendor._count.orders} order{vendor._count.orders === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
