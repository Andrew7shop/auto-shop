import { getRoSettings } from "@/lib/ro-settings";
import { updateDiscounts } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function DiscountsSettingsPage() {
  const settings = await getRoSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Discounts</h2>
        <p className="text-sm text-zinc-500">The default discount pre-filled on new invoices.</p>
      </div>

      <form action={updateDiscounts} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="defaultDiscountType" className={labelClass}>
              Discount type
            </label>
            <select
              id="defaultDiscountType"
              name="defaultDiscountType"
              className={inputClass}
              defaultValue={settings?.defaultDiscountType ?? "FIXED"}
            >
              <option value="FIXED">Flat $</option>
              <option value="PERCENT">Percent</option>
            </select>
          </div>
          <div>
            <label htmlFor="defaultDiscountValue" className={labelClass}>
              Discount
            </label>
            <input
              id="defaultDiscountValue"
              name="defaultDiscountValue"
              type="number"
              step="0.01"
              min="0"
              defaultValue={settings?.defaultDiscountValue.toString() ?? "0"}
              className={inputClass}
            />
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
