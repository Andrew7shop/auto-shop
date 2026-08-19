import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formatTime,
  shopDateKey,
  shopMinutesSinceMidnight,
  mondayOfWeek,
  addDaysToKey,
  fromShopInputValue,
} from "@/lib/datetime";
import { layoutOverlaps, formatHourLabel } from "@/lib/calendar";
import { getAppointmentSettings, DEFAULT_APPOINTMENT_SETTINGS } from "@/lib/appointment-settings";
import { getAppointmentTypeBlockColor } from "@/lib/appointment-colors";

export const dynamic = "force-dynamic";

const WEEKDAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default async function AppointmentsPage({ searchParams }: PageProps<"/appointments">) {
  const { week } = await searchParams;
  const requestedWeek = typeof week === "string" ? week : undefined;
  const todayKey = shopDateKey(new Date());
  const weekStart = mondayOfWeek(requestedWeek ?? todayKey);

  const settings = await getAppointmentSettings();
  const openHour = settings?.openHour ?? DEFAULT_APPOINTMENT_SETTINGS.openHour;
  const closeHour = settings?.closeHour ?? DEFAULT_APPOINTMENT_SETTINGS.closeHour;
  const daysOpen = new Set<string>(settings?.daysOpen ?? DEFAULT_APPOINTMENT_SETTINGS.daysOpen);

  const PX_PER_MIN = 1;
  const DAY_MINUTES = (closeHour - openHour) * 60;
  const DAY_HEIGHT = DAY_MINUTES * PX_PER_MIN;
  const HOURS = Array.from({ length: closeHour - openHour + 1 }, (_, i) => openHour + i);

  const dayKeys = WEEKDAY_ORDER.filter((wd) => daysOpen.has(wd)).map((wd) =>
    addDaysToKey(weekStart, WEEKDAY_ORDER.indexOf(wd))
  );
  const dayLabels = WEEKDAY_ORDER.filter((wd) => daysOpen.has(wd)).map((wd) => WEEKDAY_LABELS[wd]);

  const rangeStart = fromShopInputValue(`${dayKeys[0]}T00:00`);
  const rangeEnd = fromShopInputValue(`${addDaysToKey(dayKeys[dayKeys.length - 1], 1)}T00:00`);

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: rangeStart, lt: rangeEnd } },
    include: { customer: true, vehicle: true, appointmentType: true },
    orderBy: { startsAt: "asc" },
  });

  const byDay = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    const key = shopDateKey(appt.startsAt);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(appt);
  }

  const prevWeek = addDaysToKey(weekStart, -7);
  const nextWeek = addDaysToKey(weekStart, 7);
  const currentWeek = mondayOfWeek(todayKey);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Appointments</h1>
          <p className="text-sm text-zinc-500">
            Week of {formatMonthDay(dayKeys[0])} – {formatMonthDay(dayKeys[dayKeys.length - 1])}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/appointments?week=${prevWeek}`}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            ← Prev
          </Link>
          <Link
            href={`/appointments?week=${currentWeek}`}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Today
          </Link>
          <Link
            href={`/appointments?week=${nextWeek}`}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Next →
          </Link>
          <Link
            href="/appointments/new"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New appointment
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div
          className="grid min-w-[900px]"
          style={{ gridTemplateColumns: `4rem repeat(${dayKeys.length}, 1fr)` }}
        >
          {/* Header row */}
          <div className="border-b border-r border-zinc-200 dark:border-zinc-800" />
          {dayKeys.map((key, i) => (
            <div
              key={key}
              className={`border-b border-r border-zinc-200 px-2 py-3 text-center last:border-r-0 dark:border-zinc-800 ${
                key === todayKey ? "bg-blue-50 dark:bg-blue-950/40" : ""
              }`}
            >
              <p className="text-xs text-zinc-500">{dayLabels[i]}</p>
              <p
                className={`text-sm font-semibold ${
                  key === todayKey ? "text-blue-700 dark:text-blue-300" : "text-zinc-900 dark:text-zinc-50"
                }`}
              >
                {formatMonthDay(key)}
              </p>
            </div>
          ))}

          {/* Time labels */}
          <div className="relative border-r border-zinc-200 dark:border-zinc-800" style={{ height: DAY_HEIGHT }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-1 -translate-y-1/2 text-right text-xs text-zinc-400"
                style={{ top: (hour - openHour) * 60 * PX_PER_MIN }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {dayKeys.map((key) => {
            const dayAppointments = byDay.get(key) ?? [];
            const laidOut = layoutOverlaps(dayAppointments);
            return (
              <div
                key={key}
                className={`relative border-r border-zinc-200 last:border-r-0 dark:border-zinc-800 ${
                  key === todayKey ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                }`}
                style={{ height: DAY_HEIGHT }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-zinc-100 dark:border-zinc-900"
                    style={{ top: (hour - openHour) * 60 * PX_PER_MIN }}
                  />
                ))}

                {laidOut.map(({ item: appt, lane, laneCount }) => {
                  const startMin = clamp(
                    shopMinutesSinceMidnight(appt.startsAt) - openHour * 60,
                    0,
                    DAY_MINUTES
                  );
                  const endMin = clamp(
                    shopMinutesSinceMidnight(appt.endsAt) - openHour * 60,
                    0,
                    DAY_MINUTES
                  );
                  const top = startMin * PX_PER_MIN;
                  const height = Math.max((endMin - startMin) * PX_PER_MIN, 24);
                  const colors = getAppointmentTypeBlockColor(appt.appointmentType?.color);
                  const dimmed = appt.status === "CANCELLED" || appt.status === "NO_SHOW";

                  return (
                    <Link
                      key={appt.id}
                      href={`/appointments/${appt.id}/edit`}
                      className={`absolute overflow-hidden rounded-md border px-1.5 py-1 text-xs leading-tight hover:ring-2 hover:ring-zinc-400 ${colors} ${
                        dimmed ? "opacity-50" : ""
                      }`}
                      style={{
                        top,
                        height,
                        left: `calc(${(lane / laneCount) * 100}% + 2px)`,
                        width: `calc(${100 / laneCount}% - 4px)`,
                      }}
                    >
                      <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                        {formatTime(appt.startsAt)} {appt.customer.firstName} {appt.customer.lastName}
                      </p>
                      <p className="truncate text-zinc-600 dark:text-zinc-400">
                        {appt.appointmentType?.name ?? "—"}
                        {appt.vehicle && ` · ${appt.vehicle.year} ${appt.vehicle.make} ${appt.vehicle.model}`}
                      </p>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {appointments.length === 0 && (
        <p className="rounded-lg border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          No appointments scheduled this week.
        </p>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatMonthDay(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${month}/${day}`;
}
