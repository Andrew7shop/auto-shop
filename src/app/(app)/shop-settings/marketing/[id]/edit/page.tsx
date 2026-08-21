import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateMarketingSource } from "../../actions";
import { Field, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditMarketingSourcePage({ params }: PageProps<"/shop-settings/marketing/[id]/edit">) {
  const { id } = await params;

  const source = await prisma.marketingSource.findUnique({ where: { id } });
  if (!source) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit marketing source</h2>
      <form action={updateMarketingSource} className="space-y-4">
        <input type="hidden" name="id" value={source.id} />
        <Field name="name" label="Name" required defaultValue={source.name} />
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={source.active} />
          Active
        </label>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
