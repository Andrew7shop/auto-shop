import { prisma } from "@/lib/prisma";
import { DOCUMENT_FIELD_SECTIONS, fieldVisibilityKey, resolveFieldVisibility } from "@/lib/document-fields";
import { updateFieldVisibility } from "./actions";
import { primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EstimatesInvoicesSettingsPage() {
  const settings = await prisma.estimateInvoiceSettings.findUnique({ where: { id: "estimates-invoices" } });
  const visibility = resolveFieldVisibility(settings?.fieldVisibility);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Estimates/Invoices</h2>
        <p className="text-sm text-zinc-500">
          Which fields appear on printed estimates and invoices, section by section.
        </p>
      </div>

      <form action={updateFieldVisibility} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {DOCUMENT_FIELD_SECTIONS.map((section) => (
            <div key={section.key} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{section.label}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-zinc-500">
                    <th className="px-4 py-2 font-medium">Field</th>
                    <th className="px-4 py-2 text-center font-medium">Estimate</th>
                    <th className="px-4 py-2 text-center font-medium">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {section.fields.map((field) => {
                    const key = fieldVisibilityKey(section.key, field.key);
                    const value = visibility[key];
                    return (
                      <tr key={key}>
                        <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">{field.label}</td>
                        <td className="px-4 py-2 text-center">
                          <input type="checkbox" name={`${key}.estimate`} defaultChecked={value.estimate} />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input type="checkbox" name={`${key}.invoice`} defaultChecked={value.invoice} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
