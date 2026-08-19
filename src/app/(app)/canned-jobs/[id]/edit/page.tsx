import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCannedJob } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { getJobCategories } from "@/lib/job-categories";

export const dynamic = "force-dynamic";

export default async function EditCannedJobPage({ params }: PageProps<"/canned-jobs/[id]/edit">) {
  const { id } = await params;

  const [cannedJob, jobCategories] = await Promise.all([
    prisma.cannedJob.findUnique({ where: { id } }),
    getJobCategories(),
  ]);
  if (!cannedJob) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit canned job</h1>
      <form action={updateCannedJob} className="space-y-4">
        <input type="hidden" name="id" value={cannedJob.id} />
        <Field name="name" label="Name" required defaultValue={cannedJob.name} />
        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            className={inputClass}
            defaultValue={cannedJob.categoryId ?? ""}
          >
            <option value="">No category</option>
            {jobCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={cannedJob.description ?? undefined}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="laborHours" className={labelClass}>
              Labor hours
            </label>
            <input
              id="laborHours"
              name="laborHours"
              type="number"
              step="0.25"
              min="0"
              defaultValue={cannedJob.laborHours?.toString()}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={cannedJob.price.toString()}
              className={inputClass}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={cannedJob.active} />
          Active
        </label>
        <p className="text-xs text-zinc-500">Inactive canned jobs stay listed, marked as inactive.</p>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
