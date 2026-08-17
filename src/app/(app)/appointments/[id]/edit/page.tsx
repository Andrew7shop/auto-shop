import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateAppointment, updateAppointmentStatus, deleteAppointment } from "../../actions";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { DeleteButton } from "@/components/delete-button";
import { toShopInputValue } from "@/lib/datetime";
import { APPOINTMENT_STATUSES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({ params }: PageProps<"/appointments/[id]/edit">) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { customer: { include: { vehicles: true } } },
  });
  if (!appointment) notFound();

  const durationMinutes = Math.round(
    (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60000
  );

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit appointment</h1>
      <p className="text-sm text-zinc-500">
        For {appointment.customer.firstName} {appointment.customer.lastName}
      </p>

      <form action={updateAppointmentStatus} className="flex items-center gap-2">
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</span>
        <select name="status" defaultValue={appointment.status} className={`${inputClass} w-auto py-1`}>
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className={secondaryButtonClass}>
          Update status
        </button>
      </form>

      <form action={updateAppointment} className="space-y-4">
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <input type="hidden" name="customerId" value={appointment.customerId} />
        {appointment.customer.vehicles.length > 0 && (
          <div>
            <label htmlFor="vehicleId" className={labelClass}>
              Vehicle
            </label>
            <select
              id="vehicleId"
              name="vehicleId"
              className={inputClass}
              defaultValue={appointment.vehicleId ?? ""}
            >
              <option value="">None / not specified</option>
              {appointment.customer.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="reason" className={labelClass}>
            Reason <span className="text-red-500">*</span>
          </label>
          <input
            id="reason"
            name="reason"
            required
            defaultValue={appointment.reason}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className={labelClass}>
              Start time <span className="text-red-500">*</span>
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={toShopInputValue(appointment.startsAt)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="durationMinutes" className={labelClass}>
              Duration (minutes)
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min="15"
              step="15"
              defaultValue={durationMinutes}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={appointment.notes ?? undefined}
            className={inputClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
      <form action={deleteAppointment}>
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <DeleteButton
          confirmText={`Delete this appointment (${appointment.reason})? This cannot be undone.`}
          className="text-sm text-red-600 hover:underline"
        >
          Delete appointment
        </DeleteButton>
      </form>
    </div>
  );
}
