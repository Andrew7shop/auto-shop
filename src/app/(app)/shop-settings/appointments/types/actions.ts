"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { APPOINTMENT_TYPE_COLOR_OPTIONS } from "@/lib/appointment-colors";

const COLOR_VALUES = APPOINTMENT_TYPE_COLOR_OPTIONS.map((c) => c.value) as [string, ...string[]];

const appointmentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  defaultDurationMinutes: z.coerce.number().int().positive(),
  color: z.enum(COLOR_VALUES),
});

export async function createAppointmentType(formData: FormData) {
  const data = appointmentTypeSchema.parse({
    name: formData.get("name"),
    defaultDurationMinutes: formData.get("defaultDurationMinutes"),
    color: formData.get("color"),
  });

  await prisma.appointmentType.create({ data });

  revalidatePath("/shop-settings/appointments");
  redirect("/shop-settings/appointments");
}

const updateAppointmentTypeSchema = appointmentTypeSchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateAppointmentType(formData: FormData) {
  const data = updateAppointmentTypeSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    defaultDurationMinutes: formData.get("defaultDurationMinutes"),
    color: formData.get("color"),
    active: formData.get("active") === "on",
  });

  await prisma.appointmentType.update({
    where: { id: data.id },
    data: {
      name: data.name,
      defaultDurationMinutes: data.defaultDurationMinutes,
      color: data.color,
      active: data.active,
    },
  });

  revalidatePath("/shop-settings/appointments");
  redirect("/shop-settings/appointments");
}
