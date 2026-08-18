import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateWorkOrderDetails } from "../../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { JOB_CATEGORIES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

export default async function EditWorkOrderPage({ params }: PageProps<"/work-orders/[id]/edit">) {
  const { id } = await params;

  const workOrder = await prisma.workOrder.findUnique({ where: { id } });
  if (!workOrder) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit work order</h1>
      <form action={updateWorkOrderDetails} className="space-y-4">
        <input type="hidden" name="workOrderId" value={workOrder.id} />
        <div>
          <label htmlFor="category" className={labelClass}>
            Job category
          </label>
          <select id="category" name="category" className={inputClass} defaultValue={workOrder.category}>
            {JOB_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
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
            rows={3}
            required
            defaultValue={workOrder.description}
            className={inputClass}
          />
        </div>
        <div className="max-w-xs">
          <label htmlFor="odometer" className={labelClass}>
            Odometer
          </label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            defaultValue={workOrder.odometer ?? undefined}
            className={inputClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
