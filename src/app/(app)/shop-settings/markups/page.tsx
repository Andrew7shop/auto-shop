import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";
import { getMarkupSettings, DEFAULT_MARKUP_SETTINGS, gpPercentForMultiplier } from "@/lib/markups";
import { updateMarkupApplication } from "./actions";
import { primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

const APPLIES_TO_OPTIONS = [
  { name: "appliesToParts", label: "Parts" },
  { name: "appliesToBatteries", label: "Batteries" },
  { name: "appliesToTires", label: "Tires" },
] as const;

export default async function MarkupsSettingsPage() {
  const [settings, tiers] = await Promise.all([
    getMarkupSettings(),
    prisma.markupTier.findMany({ orderBy: [{ active: "desc" }, { minCost: "asc" }] }),
  ]);
  const application = {
    appliesToParts: settings?.appliesToParts ?? DEFAULT_MARKUP_SETTINGS.appliesToParts,
    appliesToBatteries: settings?.appliesToBatteries ?? DEFAULT_MARKUP_SETTINGS.appliesToBatteries,
    appliesToTires: settings?.appliesToTires ?? DEFAULT_MARKUP_SETTINGS.appliesToTires,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Markups</h2>
        <p className="text-sm text-zinc-500">
          Cost-based price ranges. Each range multiplies a part&apos;s cost to a sell price and shows the resulting
          gross profit.
        </p>
      </div>

      <div className="max-w-md space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Applies to</h3>
          <p className="text-sm text-zinc-500">Which item types these price ranges are used for.</p>
        </div>
        <form action={updateMarkupApplication} className="space-y-3">
          <div className="space-y-2">
            {APPLIES_TO_OPTIONS.map((option) => (
              <label key={option.name} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" name={option.name} defaultChecked={application[option.name]} />
                {option.label}
              </label>
            ))}
          </div>
          <button type="submit" className={primaryButtonClass}>
            Save changes
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Price ranges</h3>
          <Link
            href="/shop-settings/markups/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New price range
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Cost range</th>
                <th className="px-4 py-2 text-right">Multiplier</th>
                <th className="px-4 py-2 text-right">Gross profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {tiers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                    No price ranges yet.
                  </td>
                </tr>
              )}
              {tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-2">
                    <Link href={`/shop-settings/markups/${tier.id}/edit`} className="hover:underline">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(tier.minCost)} – {tier.maxCost ? formatCurrency(tier.maxCost) : "and up"}
                      </span>
                      {!tier.active && <span className="ml-2 text-xs font-normal text-zinc-500">(Inactive)</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {tier.multiplier.toString()}x
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                    {gpPercentForMultiplier(tier.multiplier.toNumber()).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
