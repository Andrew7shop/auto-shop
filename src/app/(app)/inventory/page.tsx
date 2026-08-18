import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const parts = await prisma.part.findMany({
    orderBy: { name: "asc" },
    include: { vendor: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Inventory</h1>
        <Link
          href="/inventory/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New part
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Part</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2 text-right">On hand</th>
              <th className="px-4 py-2 text-right">Unit cost</th>
              <th className="px-4 py-2 text-right">Unit price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {parts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  No parts yet.
                </td>
              </tr>
            )}
            {parts.map((part) => {
              const lowStock = part.quantityOnHand <= part.reorderPoint;
              return (
                <tr key={part.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-2">
                    <Link href={`/inventory/${part.id}/edit`} className="hover:underline">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{part.name}</span>
                      {part.description && (
                        <p className="text-xs text-zinc-500">{part.description}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{part.sku ?? "—"}</td>
                  <td className="px-4 py-2 text-zinc-500">{part.vendor?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={
                        lowStock
                          ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          : "text-zinc-900 dark:text-zinc-50"
                      }
                    >
                      {part.quantityOnHand}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(part.unitCost)}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(part.unitPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
