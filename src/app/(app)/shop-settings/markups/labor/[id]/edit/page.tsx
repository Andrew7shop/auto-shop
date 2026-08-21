import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateLaborMarkupTier } from "../../../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditLaborMarkupTierPage({
  params,
}: PageProps<"/shop-settings/markups/labor/[id]/edit">) {
  const { id } = await params;

  const tier = await prisma.laborMarkupTier.findUnique({ where: { id } });
  if (!tier) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit labor markup range</h2>
      <form action={updateLaborMarkupTier} className="space-y-4">
        <input type="hidden" name="id" value={tier.id} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minHours" className={labelClass}>
              Min hours
            </label>
            <input
              id="minHours"
              name="minHours"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={tier.minHours.toString()}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="maxHours" className={labelClass}>
              Max hours
            </label>
            <input
              id="maxHours"
              name="maxHours"
              type="number"
              step="0.01"
              min="0"
              placeholder="No limit"
              defaultValue={tier.maxHours?.toString() ?? ""}
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
