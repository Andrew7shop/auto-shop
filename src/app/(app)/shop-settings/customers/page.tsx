import { getCustomerSettings } from "@/lib/customer-settings";
import { updateCustomerRequirements } from "./actions";
import { primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

const REQUIREMENTS = [
  { name: "requireCustomerType", label: "Customer type" },
  { name: "requireBusinessName", label: "Customer or business name" },
  { name: "requireAddress", label: "Address" },
  { name: "requirePhone", label: "Phone" },
  { name: "requireEmail", label: "Email" },
  { name: "requireSource", label: "Customer source" },
  { name: "requireBirthday", label: "Birthday" },
] as const;

export default async function CustomerSettingsPage() {
  const settings = await getCustomerSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Customers</h2>
        <p className="text-sm text-zinc-500">
          Which fields are required when adding a new customer. Unchecked fields stay optional.
        </p>
      </div>

      <form action={updateCustomerRequirements} className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Field</th>
                <th className="px-4 py-2 text-center">Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {REQUIREMENTS.map((req) => (
                <tr key={req.name}>
                  <td className="px-4 py-2 text-zinc-700 dark:text-zinc-300">{req.label}</td>
                  <td className="px-4 py-2 text-center">
                    <input type="checkbox" name={req.name} defaultChecked={settings[req.name]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
