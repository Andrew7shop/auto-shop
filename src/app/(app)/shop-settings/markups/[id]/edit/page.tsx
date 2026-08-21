import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMarkupTier } from "../../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditMarkupTierPage({ params }: PageProps<"/shop-settings/markups/[id]/edit">) {
  const { id } = await params;

  const tier = await prisma.markupTier.findUnique({ where: { id } });
  if (!tier) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit price range</h2>
      <form action={updateMarkupTier} className="space-y-4">
        <input type="hidden" name="id" value={tier.id} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minCost" className={labelClass}>
              Min cost
            </label>
            <input
              id="minCost"
              name="minCost"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={tier.minCost.toString()}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="maxCost" className={labelClass}>
              Max cost
            </label>
            <input
              id="maxCost"
              name="maxCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="No limit"
              defaultValue={tier.maxCost?.toString() ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="multiplier" className={labelClass}>
            Multiplier
          </label>
          <input
            id="multiplier"
            name="multiplier"
            type="number"
            step="0.001"
            min="0.001"
            required
            defaultValue={tier.multiplier.toString()}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={tier.active} />
          Active
        </label>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
