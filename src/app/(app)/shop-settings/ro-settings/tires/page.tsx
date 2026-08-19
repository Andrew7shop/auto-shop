import { getRoSettings } from "@/lib/ro-settings";
import { updateTires } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function TiresSettingsPage() {
  const settings = await getRoSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tires</h2>
        <p className="text-sm text-zinc-500">The default tire fee pre-filled on new invoices.</p>
      </div>

      <form action={updateTires} className="space-y-4">
        <div>
          <label htmlFor="defaultTireFee" className={labelClass}>
            Default tire fee
          </label>
          <input
            id="defaultTireFee"
            name="defaultTireFee"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings?.defaultTireFee.toString() ?? "0"}
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
