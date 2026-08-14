import { createCustomer } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New customer</h1>
      <form action={createCustomer} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field name="email" label="Email" type="email" />
          <Field name="phone" label="Phone" type="tel" />
        </div>
        <Field name="address" label="Address" />
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
