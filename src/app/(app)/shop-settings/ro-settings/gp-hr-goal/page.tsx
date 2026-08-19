import { getRoSettings } from "@/lib/ro-settings";
import { updateGpHrGoal } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function GpHrGoalSettingsPage() {
  const settings = await getRoSettings();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">GP/Hr Goal</h2>
        <p className="text-sm text-zinc-500">
          Target gross profit per labor hour. Shown alongside actual GP/hr on the Profit Details report.
        </p>
      </div>

      <form action={updateGpHrGoal} className="space-y-4">
        <div>
          <label htmlFor="gpPerHourGoal" className={labelClass}>
            GP/hr goal
          </label>
          <input
            id="gpPerHourGoal"
            name="gpPerHourGoal"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings?.gpPerHourGoal?.toString() ?? ""}
            placeholder="e.g. 95.00"
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
