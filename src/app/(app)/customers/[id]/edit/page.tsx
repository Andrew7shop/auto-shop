import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCustomer } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { getCustomerSettings } from "@/lib/customer-settings";
import { getMarketingSources } from "@/lib/marketing-sources";
import { CustomerProfileFields } from "@/components/customer-profile-fields";

export const dynamic = "force-dynamic";

function dateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

export default async function EditCustomerPage({ params }: PageProps<"/customers/[id]/edit">) {
  const { id } = await params;

  const [customer, settings, sources] = await Promise.all([
    prisma.customer.findUnique({ where: { id } }),
    getCustomerSettings(),
    getMarketingSources({ activeOnly: true }),
  ]);
  if (!customer) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit customer</h1>
      <form action={updateCustomer} className="space-y-4">
        <input type="hidden" name="id" value={customer.id} />
        <CustomerProfileFields
          settings={settings}
          sources={sources}
          defaultValues={{
            customerType: customer.customerType,
            businessName: customer.businessName ?? undefined,
            address: customer.address ?? undefined,
            sourceId: customer.sourceId ?? undefined,
            birthday: dateInputValue(customer.birthday),
          }}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required defaultValue={customer.firstName} />
          <Field name="lastName" label="Last name" required defaultValue={customer.lastName} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            name="email"
            label="Email"
            type="email"
            required={settings.requireEmail}
            defaultValue={customer.email ?? undefined}
          />
          <Field
            name="phone"
            label="Phone"
            type="tel"
            required={settings.requirePhone}
            defaultValue={customer.phone ?? undefined}
          />
        </div>
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
