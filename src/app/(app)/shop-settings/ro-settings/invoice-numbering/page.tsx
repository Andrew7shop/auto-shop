import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";
import { updateInvoiceNumbering } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function InvoiceNumberingSettingsPage() {
  const settings = await getRoSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Invoice Numbering</h2>
        <p className="text-sm text-zinc-500">
          Cosmetic formatting applied when an invoice number is displayed or printed. The underlying invoice
          numbering itself isn&apos;t affected.
        </p>
      </div>

      <form action={updateInvoiceNumbering} className="space-y-4">
        <div>
          <label htmlFor="invoiceNumberPrefix" className={labelClass}>
            Prefix
          </label>
          <input
            id="invoiceNumberPrefix"
            name="invoiceNumberPrefix"
            type="text"
            placeholder="INV-"
            defaultValue={settings?.invoiceNumberPrefix ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="invoiceNumberPadding" className={labelClass}>
            Zero-padding (number of digits)
          </label>
          <input
            id="invoiceNumberPadding"
            name="invoiceNumberPadding"
            type="number"
            min="0"
            max="10"
            defaultValue={settings?.invoiceNumberPadding ?? 0}
            className={inputClass}
          />
        </div>
        <p className="text-sm text-zinc-500">
          Preview: {formatInvoiceNumber(1, settings)}
        </p>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
