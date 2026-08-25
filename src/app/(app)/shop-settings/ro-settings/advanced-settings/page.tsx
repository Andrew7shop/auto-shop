import { getRoSettings, DEFAULT_RO_SETTINGS } from "@/lib/ro-settings";
import { updateAdvancedSettings } from "../actions";
import { primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

const FIELDS = [
  { name: "showOdometerInOut", label: "Odometer in & out" },
  { name: "showMarketingSource", label: "RO marketing source" },
  { name: "showTechOnLabor", label: "Tech on labor" },
  { name: "showJobCategory", label: "Job category" },
  { name: "showPartsPurchaseOrder", label: "Purchase orders for all parts" },
  { name: "showPartsBilling", label: "Billing for all parts" },
  { name: "showPaymentCardType", label: "Payment card type" },
  { name: "showTireDotCodes", label: "DOT codes for tires" },
  { name: "showDigitalSignature", label: "Digital signature for digital authorization" },
] as const;

export default async function AdvancedSettingsPage() {
  const settings = await getRoSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Advanced Settings</h2>
        <p className="text-sm text-zinc-500">Choose what data shows on a repair order.</p>
      </div>

      <form action={updateAdvancedSettings} className="space-y-4">
        <div className="space-y-2">
          {FIELDS.map((field) => (
            <label key={field.name} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                name={field.name}
                defaultChecked={settings?.[field.name] ?? DEFAULT_RO_SETTINGS[field.name]}
              />
              {field.label}
            </label>
          ))}
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
