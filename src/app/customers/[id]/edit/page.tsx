import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCustomer } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default async function EditCustomerPage({ params }: PageProps<"/customers/[id]/edit">) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit customer</h1>
      <form action={updateCustomer} className="space-y-4">
        <input type="hidden" name="id" value={customer.id} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required defaultValue={customer.firstName} />
          <Field name="lastName" label="Last name" required defaultValue={customer.lastName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field name="email" label="Email" type="email" defaultValue={customer.email ?? undefined} />
          <Field name="phone" label="Phone" type="tel" defaultValue={customer.phone ?? undefined} />
        </div>
        <Field name="address" label="Address" defaultValue={customer.address ?? undefined} />
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={customer.notes ?? undefined}
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
