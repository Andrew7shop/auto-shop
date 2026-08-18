import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePart } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditPartPage({ params }: PageProps<"/inventory/[id]/edit">) {
  const { id } = await params;

  const [part, vendors] = await Promise.all([
    prisma.part.findUnique({ where: { id } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!part) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit part</h1>
      <form action={updatePart} className="space-y-4">
        <input type="hidden" name="id" value={part.id} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="name" label="Name" required defaultValue={part.name} />
          <Field name="sku" label="SKU" defaultValue={part.sku ?? undefined} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={part.description ?? undefined}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="vendorId" className={labelClass}>
            Preferred vendor
          </label>
          <select id="vendorId" name="vendorId" className={inputClass} defaultValue={part.vendorId ?? ""}>
            <option value="">None</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="quantityOnHand"
            label="Quantity on hand"
            type="number"
            defaultValue={part.quantityOnHand}
          />
          <Field name="reorderPoint" label="Reorder point" type="number" defaultValue={part.reorderPoint} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="unitCost" className={labelClass}>
              Unit cost
            </label>
            <input
              id="unitCost"
              name="unitCost"
              type="number"
              step="0.01"
              min="0"
              defaultValue={part.unitCost.toString()}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="unitPrice" className={labelClass}>
              Unit price
            </label>
            <input
              id="unitPrice"
              name="unitPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={part.unitPrice.toString()}
              className={inputClass}
            />
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
