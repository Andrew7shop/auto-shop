import { getRoSettings } from "@/lib/ro-settings";
import { updateTaxes } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function TaxesSettingsPage() {
  const settings = await getRoSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Taxes</h2>
        <p className="text-sm text-zinc-500">
          The default tax rate applied to new invoices. Enter as a decimal fraction (e.g. 0.0825 for 8.25%).
        </p>
      </div>

      <form action={updateTaxes} className="space-y-4">
        <div>
          <label htmlFor="defaultTaxRate" className={labelClass}>
            Default tax rate
          </label>
          <input
            id="defaultTaxRate"
            name="defaultTaxRate"
            type="number"
            step="0.0001"
            min="0"
            max="1"
            required
            defaultValue={settings?.defaultTaxRate.toString() ?? "0"}
            className={inputClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
