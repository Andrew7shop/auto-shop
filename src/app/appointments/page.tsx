import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { updateAppointmentStatus } from "./actions";
import { inputClass, secondaryButtonClass } from "@/components/form";
import { formatDate, formatTime } from "@/lib/datetime";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { APPOINTMENT_STATUSES } from "@/lib/statuses";
import type { AppointmentStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const STATUSES = ["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW", "CANCELLED"] as const;

export default async function AppointmentsPage({ searchParams }: PageProps<"/appointments">) {
  const { q, status } = await searchParams;
  const searchTerm = typeof q === "string" ? q.trim() : "";
  const statusFilter =
    typeof status === "string" && APPOINTMENT_STATUSES.some((s) => s.value === status)
      ? (status as AppointmentStatus)
      : undefined;

  const appointments = await prisma.appointment.findMany({
    where: {
      status: statusFilter,
      ...(searchTerm
        ? {
            OR: [
              { reason: { contains: searchTerm, mode: "insensitive" } },
              { customer: { firstName: { contains: searchTerm, mode: "insensitive" } } },
              { customer: { lastName: { contains: searchTerm, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { customer: true, vehicle: true },
    orderBy: { startsAt: "asc" },
  });

  const groups = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    const key = formatDate(appt.startsAt, {
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

      <SearchFilterBar
        q={searchTerm}
        placeholder="Search by customer or reason"
        statusOptions={APPOINTMENT_STATUSES}
        statusValue={statusFilter}
        basePath="/appointments"
      />

      {appointments.length === 0 && (
        <p className="rounded-lg border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          {searchTerm || statusFilter ? "No appointments match your filters." : "No appointments scheduled."}
        </p>
      )}

      {[...groups.entries()].map(([day, appts]) => (
        <div key={day}>
          <h2 className="mb-2 text-sm font-medium text-zinc-500">{day}</h2>
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {appts.map((appt) => (
              <details key={appt.id} className="px-4 py-3">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatTime(appt.startsAt)} —{" "}
                      {appt.customer.firstName} {appt.customer.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {appt.reason}
                      {appt.vehicle &&
                        ` · ${appt.vehicle.year} ${appt.vehicle.make} ${appt.vehicle.model}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={appt.status} />
                    <span className="text-xs text-zinc-500 underline">Manage</span>
                  </div>
                </summary>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <form action={updateAppointmentStatus} className="flex items-center gap-2">
                    <input type="hidden" name="appointmentId" value={appt.id} />
                    <select
                      name="status"
                      defaultValue={appt.status}
                      className={`${inputClass} w-auto py-1`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className={secondaryButtonClass}>
                      Update status
                    </button>
                  </form>
                  <Link
                    href={`/appointments/${appt.id}/edit`}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
