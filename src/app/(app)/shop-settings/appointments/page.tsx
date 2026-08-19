import Link from "next/link";
import { getAppointmentSettings, DEFAULT_APPOINTMENT_SETTINGS } from "@/lib/appointment-settings";
import { getAppointmentTypes } from "@/lib/appointment-types";
import { APPOINTMENT_TYPE_COLOR_OPTIONS } from "@/lib/appointment-colors";
import { formatHourLabel } from "@/lib/calendar";
import { updateAppointmentSettings } from "./actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

const WEEKDAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default async function AppointmentsSettingsPage() {
  const [settings, appointmentTypes] = await Promise.all([
    getAppointmentSettings(),
    getAppointmentTypes(),
  ]);

  const openHour = settings?.openHour ?? DEFAULT_APPOINTMENT_SETTINGS.openHour;
  const closeHour = settings?.closeHour ?? DEFAULT_APPOINTMENT_SETTINGS.closeHour;
  const daysOpen: string[] = settings?.daysOpen ?? [...DEFAULT_APPOINTMENT_SETTINGS.daysOpen];

  return (
    <div className="max-w-2xl space-y-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Shop Hours</h2>
          <p className="text-sm text-zinc-500">
            The operating hours and days shown on the appointment calendar.
          </p>
        </div>

        <form action={updateAppointmentSettings} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="openHour" className={labelClass}>
                Opens at
              </label>
              <select id="openHour" name="openHour" className={inputClass} defaultValue={openHour}>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourLabel(hour)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="closeHour" className={labelClass}>
                Closes at
              </label>
              <select id="closeHour" name="closeHour" className={inputClass} defaultValue={closeHour}>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourLabel(hour)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className={labelClass}>Days open</p>
            <div className="flex flex-wrap gap-4">
              {WEEKDAYS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <input
                    type="checkbox"
                    name="daysOpen"
                    value={day.value}
                    defaultChecked={daysOpen.includes(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className={primaryButtonClass}>
            Save changes
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Appointment Types</h2>
            <p className="text-sm text-zinc-500">
              Named slots (Oil Change, Diagnostic, etc.) with their own duration and color.
            </p>
          </div>
          <Link href="/shop-settings/appointments/types/new" className={primaryButtonClass}>
            New type
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2 text-right">Duration</th>
                <th className="px-4 py-2">Color</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {appointmentTypes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                    No appointment types yet.
                  </td>
                </tr>
              )}
              {appointmentTypes.map((type) => {
                const swatch = APPOINTMENT_TYPE_COLOR_OPTIONS.find((c) => c.value === type.color)?.swatch;
                return (
                  <tr key={type.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-2">
                      <Link href={`/shop-settings/appointments/types/${type.id}/edit`} className="hover:underline">
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {type.name}
                          {!type.active && <span className="ml-2 text-xs font-normal text-zinc-500">(Inactive)</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                      {type.defaultDurationMinutes} min
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${swatch ?? "bg-zinc-400"}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
