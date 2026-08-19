import { createShopFee } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewShopFeePage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New shop fee</h2>
      <form action={createShopFee} className="space-y-4">
        <Field name="name" label="Name" required placeholder="Shop Supplies" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select id="type" name="type" className={inputClass} defaultValue="FIXED">
              <option value="FIXED">Flat $</option>
              <option value="PERCENT">Percent</option>
            </select>
          </div>
          <div>
            <label htmlFor="value" className={labelClass}>
              Value
            </label>
            <input id="value" name="value" type="number" step="0.01" min="0" required defaultValue={0} className={inputClass} />
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create shop fee
        </button>
      </form>
    </div>
  );
}
