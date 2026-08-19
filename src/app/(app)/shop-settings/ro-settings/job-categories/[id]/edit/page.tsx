import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateJobCategory } from "../../actions";
import { Field, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditJobCategoryPage({
  params,
}: PageProps<"/shop-settings/ro-settings/job-categories/[id]/edit">) {
  const { id } = await params;

  const jobCategory = await prisma.jobCategory.findUnique({ where: { id } });
  if (!jobCategory) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit job category</h2>
      <form action={updateJobCategory} className="space-y-4">
        <input type="hidden" name="id" value={jobCategory.id} />
        <Field name="code" label="Code" required defaultValue={jobCategory.code} />
        <Field name="name" label="Name" required defaultValue={jobCategory.name} />
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={jobCategory.active} />
          Active
        </label>
        <p className="text-xs text-zinc-500">
          Inactive categories stay assigned to existing work orders/canned jobs but won&apos;t appear as an
          option for new ones.
        </p>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
