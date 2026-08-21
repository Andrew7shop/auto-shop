import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateIntegration, connectIntegration, disconnectIntegration } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { maskSecret } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export default async function EditIntegrationPage({ params }: PageProps<"/shop-settings/integrations/[id]/edit">) {
  const { id } = await params;

  const integration = await prisma.integration.findUnique({ where: { id } });
  if (!integration) notFound();

  const isConnected = integration.status === "CONNECTED";

  return (
    <div className="max-w-md space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit integration</h2>
        <form action={updateIntegration} className="space-y-4">
          <input type="hidden" name="id" value={integration.id} />
          <Field name="name" label="Name" required defaultValue={integration.name} />
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={integration.description ?? undefined}
              className={inputClass}
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Save changes
          </button>
        </form>
      </div>

      <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Connection</h3>
          <p className="text-sm text-zinc-500">
            {isConnected
              ? "Connected. This saves the credentials below for later use — no data is sent to the provider yet."
              : "Not connected. Enter credentials to connect."}
          </p>
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              <p className="text-zinc-700 dark:text-zinc-300">
                API key: {integration.apiKey ? maskSecret(integration.apiKey) : "Not set"}
              </p>
              <p className="text-zinc-700 dark:text-zinc-300">
                Account ID: {integration.accountId ? maskSecret(integration.accountId) : "Not set"}
              </p>
              {integration.connectedAt && (
                <p className="mt-1 text-xs text-zinc-500">
                  Connected {integration.connectedAt.toLocaleString()}
                </p>
              )}
            </div>
            <form action={disconnectIntegration}>
              <input type="hidden" name="id" value={integration.id} />
              <button type="submit" className={secondaryButtonClass}>
                Disconnect
              </button>
            </form>
          </div>
        ) : (
          <form action={connectIntegration} className="space-y-4">
            <input type="hidden" name="id" value={integration.id} />
            <Field name="apiKey" label="API key" />
            <Field name="accountId" label="Account ID" />
            <button type="submit" className={primaryButtonClass}>
              Connect
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
