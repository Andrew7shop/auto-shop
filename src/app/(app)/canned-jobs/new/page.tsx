import { createCannedJob } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { JOB_CATEGORIES } from "@/lib/statuses";

export default function NewCannedJobPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New canned job</h1>
      <form action={createCannedJob} className="space-y-4">
        <Field name="name" label="Name" required />
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select id="category" name="category" className={inputClass} defaultValue="OTHER">
            {JOB_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea id="description" name="description" rows={2} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="laborHours" className={labelClass}>
              Labor hours
            </label>
            <input id="laborHours" name="laborHours" type="number" step="0.25" min="0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={0}
              className={inputClass}
            />
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create canned job
        </button>
      </form>
    </div>
  );
}
