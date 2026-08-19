import { createAppointmentType } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { APPOINTMENT_TYPE_COLOR_OPTIONS } from "@/lib/appointment-colors";

export default function NewAppointmentTypePage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New appointment type</h2>
      <form action={createAppointmentType} className="space-y-4">
        <Field name="name" label="Name" required placeholder="Oil Change" />
        <div>
          <label htmlFor="defaultDurationMinutes" className={labelClass}>
            Default duration (minutes)
          </label>
          <input
            id="defaultDurationMinutes"
            name="defaultDurationMinutes"
            type="number"
            min="15"
            step="15"
            required
            defaultValue={60}
            className={inputClass}
          />
        </div>
        <div>
          <p className={labelClass}>Color</p>
          <div className="flex flex-wrap gap-3">
            {APPOINTMENT_TYPE_COLOR_OPTIONS.map((color, i) => (
              <label
                key={color.value}
                className="flex cursor-pointer items-center justify-center rounded-full p-1 has-[:checked]:ring-2 has-[:checked]:ring-zinc-900 has-[:checked]:ring-offset-2 dark:has-[:checked]:ring-zinc-50 dark:has-[:checked]:ring-offset-zinc-950"
              >
                <input
                  type="radio"
                  name="color"
                  value={color.value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <span className={`block h-6 w-6 rounded-full ${color.swatch}`} title={color.label} />
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create appointment type
        </button>
      </form>
    </div>
  );
}
