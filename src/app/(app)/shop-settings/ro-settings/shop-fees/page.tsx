import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ShopFeesPage() {
  const shopFees = await prisma.shopFee.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Shop Fees</h2>
          <p className="text-sm text-zinc-500">Named fees (Shop Supplies, Hazmat/Environmental, etc.).</p>
        </div>
        <Link
          href="/shop-settings/ro-settings/shop-fees/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New shop fee
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {shopFees.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-zinc-500">
                  No shop fees yet.
                </td>
              </tr>
            )}
            {shopFees.map((fee) => (
              <tr key={fee.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-4 py-2">
                  <Link href={`/shop-settings/ro-settings/shop-fees/${fee.id}/edit`} className="hover:underline">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {fee.name}
                      {!fee.active && <span className="ml-2 text-xs font-normal text-zinc-500">(Inactive)</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {fee.type === "PERCENT" ? `${fee.value.toString()}%` : formatCurrency(fee.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
