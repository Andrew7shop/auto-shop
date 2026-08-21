import { createCustomer } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { getCustomerSettings } from "@/lib/customer-settings";
import { getMarketingSources } from "@/lib/marketing-sources";
import { CustomerProfileFields } from "@/components/customer-profile-fields";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const [settings, sources] = await Promise.all([
    getCustomerSettings(),
    getMarketingSources({ activeOnly: true }),
  ]);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New customer</h1>
      <form action={createCustomer} className="space-y-4">
        <CustomerProfileFields settings={settings} sources={sources} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field name="email" label="Email" type="email" required={settings.requireEmail} />
          <Field name="phone" label="Phone" type="tel" required={settings.requirePhone} />
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create customer
        </button>
      </form>
    </div>
  );
}
