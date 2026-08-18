import { prisma } from "@/lib/prisma";
import { createOrder } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New order</h1>
      {vendors.length === 0 ? (
        <p className="text-sm text-zinc-500">
          You need at least one vendor before creating a purchase order.
        </p>
      ) : (
        <form action={createOrder} className="space-y-4">
          <div>
            <label htmlFor="vendorId" className={labelClass}>
              Vendor <span className="text-red-500">*</span>
            </label>
            <select id="vendorId" name="vendorId" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Select a vendor
              </option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expectedAt" className={labelClass}>
              Expected date
            </label>
            <input id="expectedAt" name="expectedAt" type="date" className={inputClass} />
          </div>
          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes
            </label>
            <textarea id="notes" name="notes" rows={3} className={inputClass} />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Create order
          </button>
        </form>
      )}
    </div>
  );
}
