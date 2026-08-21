import Link from "next/link";
import { getIntegrations } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export default async function IntegrationsSettingsPage() {
  const integrations = await getIntegrations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Integrations</h2>
          <p className="text-sm text-zinc-500">
            Add-on services that can be connected to the shop. Connecting one here saves the API key/account ID
            for later use — nothing is sent to these providers yet.
          </p>
        </div>
        <Link
          href="/shop-settings/integrations/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New integration
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Integration</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {integrations.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-zinc-500">
                  No integrations yet.
                </td>
              </tr>
            )}
            {integrations.map((integration) => (
              <tr key={integration.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-4 py-2">
                  <Link href={`/shop-settings/integrations/${integration.id}/edit`} className="hover:underline">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{integration.name}</span>
                    {integration.description && (
                      <p className="text-xs text-zinc-500">{integration.description}</p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={
                      integration.status === "CONNECTED"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }
                  >
                    {integration.status === "CONNECTED" ? "Connected" : "Disconnected"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
