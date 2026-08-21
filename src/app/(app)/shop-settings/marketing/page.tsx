import Link from "next/link";
import { getMarketingSources } from "@/lib/marketing-sources";

export const dynamic = "force-dynamic";

export default async function MarketingSettingsPage() {
  const sources = await getMarketingSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Marketing Sources</h2>
          <p className="text-sm text-zinc-500">
            How customers say they heard about the shop. This list is shared with the marketing source dropdown on
            new work orders.
          </p>
        </div>
        <Link
          href="/shop-settings/marketing/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New marketing source
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {sources.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-zinc-500">No marketing sources yet.</td>
              </tr>
            )}
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-4 py-2">
                  <Link href={`/shop-settings/marketing/${source.id}/edit`} className="hover:underline">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {source.name}
                      {!source.active && <span className="ml-2 text-xs font-normal text-zinc-500">(Inactive)</span>}
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
