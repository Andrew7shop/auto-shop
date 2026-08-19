import { getRoSettings, DEFAULT_RO_SETTINGS } from "@/lib/ro-settings";
import { updatePaymentSettings } from "../actions";
import { primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "CHECK", label: "Check" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "OTHER", label: "Other" },
];

export default async function PaymentSettingsPage() {
  const settings = await getRoSettings();
  const enabled: string[] = settings?.enabledPaymentMethods ?? [...DEFAULT_RO_SETTINGS.enabledPaymentMethods];

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Payment Settings</h2>
        <p className="text-sm text-zinc-500">
          Which payment methods show up when recording a payment on an invoice.
        </p>
      </div>

      <form action={updatePaymentSettings} className="space-y-4">
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <label key={method.value} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                name="enabledPaymentMethods"
                value={method.value}
                defaultChecked={enabled.includes(method.value)}
              />
              {method.label}
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
