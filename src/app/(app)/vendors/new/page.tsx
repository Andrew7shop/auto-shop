import { createVendor } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewVendorPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New vendor</h1>
      <form action={createVendor} className="space-y-4">
        <Field name="name" label="Name" required />
        <div className="grid grid-cols-2 gap-4">
          <Field name="contactName" label="Contact name" />
          <Field name="phone" label="Phone" type="tel" />
        </div>
        <Field name="email" label="Email" type="email" />
        <Field name="address" label="Address" />
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create vendor
        </button>
      </form>
    </div>
  );
}
