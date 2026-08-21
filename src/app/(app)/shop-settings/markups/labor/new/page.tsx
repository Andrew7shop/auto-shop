import { createLaborMarkupTier } from "../../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewLaborMarkupTierPage() {
  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New labor markup range</h2>
        <p className="text-sm text-zinc-500">Leave max hours blank for an open-ended top range.</p>
      </div>
      <form action={createLaborMarkupTier} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minHours" className={labelClass}>
              Min hours
            </label>
            <input
              id="minHours"
              name="minHours"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="maxHours" className={labelClass}>
              Max hours
            </label>
            <input
              id="maxHours"
              name="maxHours"
              type="number"
              step="0.01"
              min="0"
              placeholder="No limit"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="multiplier" className={labelClass}>
            Multiplier
          </label>
          <input
            id="multiplier"
            name="multiplier"
            type="number"
            step="0.001"
            min="0.001"
            required
            defaultValue={1}
            placeholder="e.g. 1.25"
            className={inputClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create labor markup range
        </button>
      </form>
    </div>
  );
}
