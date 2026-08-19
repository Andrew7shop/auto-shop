import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateAppointmentType } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { APPOINTMENT_TYPE_COLOR_OPTIONS } from "@/lib/appointment-colors";

export const dynamic = "force-dynamic";

export default async function EditAppointmentTypePage({
  params,
}: PageProps<"/shop-settings/appointments/types/[id]/edit">) {
  const { id } = await params;

  const appointmentType = await prisma.appointmentType.findUnique({ where: { id } });
  if (!appointmentType) notFound();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Edit appointment type</h2>
      <form action={updateAppointmentType} className="space-y-4">
        <input type="hidden" name="id" value={appointmentType.id} />
        <Field name="name" label="Name" required defaultValue={appointmentType.name} />
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
            defaultValue={appointmentType.defaultDurationMinutes}
            className={inputClass}
          />
        </div>
        <div>
          <p className={labelClass}>Color</p>
          <div className="flex flex-wrap gap-3">
            {APPOINTMENT_TYPE_COLOR_OPTIONS.map((color) => (
              <label
                key={color.value}
                className="flex cursor-pointer items-center justify-center rounded-full p-1 has-[:checked]:ring-2 has-[:checked]:ring-zinc-900 has-[:checked]:ring-offset-2 dark:has-[:checked]:ring-zinc-50 dark:has-[:checked]:ring-offset-zinc-950"
              >
                <input
                  type="radio"
                  name="color"
                  value={color.value}
                  defaultChecked={appointmentType.color === color.value}
                  className="sr-only"
                />
                <span className={`block h-6 w-6 rounded-full ${color.swatch}`} title={color.label} />
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={appointmentType.active} />
          Active
        </label>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
