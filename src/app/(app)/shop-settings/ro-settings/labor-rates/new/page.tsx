import { createLaborRate } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewLaborRatePage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New labor rate</h2>
      <form action={createLaborRate} className="space-y-4">
        <Field name="name" label="Name" required placeholder="Standard" />
        <div>
          <label htmlFor="ratePerHour" className={labelClass}>
            Rate / hr
          </label>
          <input
            id="ratePerHour"
            name="ratePerHour"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={0}
            className={inputClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create labor rate
        </button>
      </form>
    </div>
  );
}
