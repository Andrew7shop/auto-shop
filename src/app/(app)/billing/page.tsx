import { BILLING_PLANS, DEFAULT_BILLING_PLAN_ID } from "@/lib/billing-plans";
import { getBillingSettings } from "@/lib/billing-settings";
import { formatCurrency } from "@/lib/money";
import { selectPlan } from "./actions";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const settings = await getBillingSettings();
  const currentPlanId = settings?.currentPlanId ?? DEFAULT_BILLING_PLAN_ID;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Billing</h1>
        <p className="text-sm text-zinc-500">
          Choose the package that fits your shop. This selection doesn&apos;t charge a card yet — it just records
          which plan the shop wants.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BILLING_PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-lg border bg-white p-5 dark:bg-zinc-950 ${
                isCurrent
                  ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
                {isCurrent && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    Current plan
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>

              <p className="mt-4">
                <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {plan.monthlyPrice === 0 ? "Free" : formatCurrency(plan.monthlyPrice)}
                </span>
                {plan.monthlyPrice > 0 && <span className="text-sm text-zinc-500"> / month</span>}
              </p>

              <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-zinc-400 dark:text-zinc-600">&#10003;</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <form action={selectPlan} className="mt-5">
                <input type="hidden" name="planId" value={plan.id} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className={`w-full rounded-md px-3 py-2 text-sm font-medium ${
                    isCurrent
                      ? "cursor-default bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
                      : "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  }`}
                >
                  {isCurrent ? "Selected" : "Select plan"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
