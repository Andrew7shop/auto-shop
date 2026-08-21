import { createMarkupTier } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewMarkupTierPage() {
  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New price range</h2>
        <p className="text-sm text-zinc-500">Leave max cost blank for an open-ended top range.</p>
      </div>
      <form action={createMarkupTier} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minCost" className={labelClass}>
              Min cost
            </label>
            <input
              id="minCost"
              name="minCost"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={0}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="maxCost" className={labelClass}>
              Max cost
            </label>
            <input
              id="maxCost"
              name="maxCost"
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
            defaultValue={2}
            placeholder="e.g. 2.5"
            className={inputClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create price range
        </button>
      </form>
    </div>
  );
}
