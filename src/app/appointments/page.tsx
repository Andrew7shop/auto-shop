import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { updateAppointmentStatus } from "./actions";
import { inputClass, secondaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

const STATUSES = ["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW", "CANCELLED"] as const;

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: { customer: true, vehicle: true },
    orderBy: { startsAt: "asc" },
  });

  const groups = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    const key = appt.startsAt.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(appt);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Appointments</h1>
        <Link
          href="/appointments/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New appointment
        </Link>
      </div>

      {appointments.length === 0 && (
        <p className="rounded-lg border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          No appointments scheduled.
        </p>
      )}

      {[...groups.entries()].map(([day, appts]) => (
        <div key={day}>
          <h2 className="mb-2 text-sm font-medium text-zinc-500">{day}</h2>
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {appts.map((appt) => (
              <div key={appt.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {appt.startsAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} —{" "}
                    {appt.customer.firstName} {appt.customer.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {appt.reason}
                    {appt.vehicle && ` · ${appt.vehicle.year} ${appt.vehicle.make} ${appt.vehicle.model}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateAppointmentStatus} className="flex items-center gap-2">
                    <input type="hidden" name="appointmentId" value={appt.id} />
                    <select name="status" defaultValue={appt.status} className={`${inputClass} w-auto py-1`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className={secondaryButtonClass}>
                      Update
                    </button>
                  </form>
                  <Badge status={appt.status} />
                  <Link
                    href={`/appointments/${appt.id}/edit`}
                    className="text-xs text-zinc-500 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
