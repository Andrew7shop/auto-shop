import { createIntegration } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewIntegrationPage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New integration</h2>
      <form action={createIntegration} className="space-y-4">
        <Field name="name" label="Name" required placeholder="e.g. Nexpart" />
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea id="description" name="description" rows={2} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create integration
        </button>
      </form>
    </div>
  );
}
