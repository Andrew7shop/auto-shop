import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateLaborRate } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditLaborRatePage({
  params,
}: PageProps<"/shop-settings/ro-settings/labor-rates/[id]/edit">) {
  const { id } = await params;

  const laborRate = await prisma.laborRate.findUnique({ where: { id } });
  if (!laborRate) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit labor rate</h2>
      <form action={updateLaborRate} className="space-y-4">
        <input type="hidden" name="id" value={laborRate.id} />
        <Field name="name" label="Name" required defaultValue={laborRate.name} />
        <div>
          <label htmlFor="ratePerHour" className={labelClass}>
            Rate / hr
          </label>
          <input
            id="ratePerHour"
            name="ratePerHour"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={laborRate.ratePerHour.toString()}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={laborRate.active} />
          Active
        </label>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
