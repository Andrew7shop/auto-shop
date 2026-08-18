import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateVendor } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditVendorPage({ params }: PageProps<"/vendors/[id]/edit">) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit vendor</h1>
      <form action={updateVendor} className="space-y-4">
        <input type="hidden" name="id" value={vendor.id} />
        <Field name="name" label="Name" required defaultValue={vendor.name} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="contactName" label="Contact name" defaultValue={vendor.contactName ?? undefined} />
          <Field name="phone" label="Phone" type="tel" defaultValue={vendor.phone ?? undefined} />
        </div>
        <Field name="email" label="Email" type="email" defaultValue={vendor.email ?? undefined} />
        <Field name="address" label="Address" defaultValue={vendor.address ?? undefined} />
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} defaultValue={vendor.notes ?? undefined} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
