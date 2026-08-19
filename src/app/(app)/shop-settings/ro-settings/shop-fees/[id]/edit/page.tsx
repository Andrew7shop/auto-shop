import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateShopFee } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditShopFeePage({
  params,
}: PageProps<"/shop-settings/ro-settings/shop-fees/[id]/edit">) {
  const { id } = await params;

  const shopFee = await prisma.shopFee.findUnique({ where: { id } });
  if (!shopFee) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit shop fee</h2>
      <form action={updateShopFee} className="space-y-4">
        <input type="hidden" name="id" value={shopFee.id} />
        <Field name="name" label="Name" required defaultValue={shopFee.name} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select id="type" name="type" className={inputClass} defaultValue={shopFee.type}>
              <option value="FIXED">Flat $</option>
              <option value="PERCENT">Percent</option>
            </select>
          </div>
          <div>
            <label htmlFor="value" className={labelClass}>
              Value
            </label>
            <input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={shopFee.value.toString()}
              className={inputClass}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={shopFee.active} />
          Active
        </label>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
