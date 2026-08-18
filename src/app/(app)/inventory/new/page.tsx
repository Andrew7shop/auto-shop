import { prisma } from "@/lib/prisma";
import { createPart } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function NewPartPage() {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New part</h1>
      <form action={createPart} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field name="name" label="Name" required />
          <Field name="sku" label="SKU" />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea id="description" name="description" rows={2} className={inputClass} />
        </div>
        <div>
          <label htmlFor="vendorId" className={labelClass}>
            Preferred vendor
          </label>
          <select id="vendorId" name="vendorId" className={inputClass} defaultValue="">
            <option value="">None</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field name="quantityOnHand" label="Quantity on hand" type="number" defaultValue={0} />
          <Field name="reorderPoint" label="Reorder point" type="number" defaultValue={0} />
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
              defaultValue={0}
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
              defaultValue={0}
              className={inputClass}
            />
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create part
        </button>
      </form>
    </div>
  );
}
