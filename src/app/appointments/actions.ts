"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
  startsAt: z.string().min(1, "Start time is required"),
  durationMinutes: z.coerce.number().int().positive(),
  notes: z.string().optional(),
});

export async function createAppointment(formData: FormData) {
  const data = createSchema.parse({
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId") || undefined,
    reason: formData.get("reason"),
    startsAt: formData.get("startsAt"),
    durationMinutes: formData.get("durationMinutes"),
    notes: formData.get("notes") || undefined,
  });

  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(startsAt.getTime() + data.durationMinutes * 60 * 1000);

  await prisma.appointment.create({
    data: {
      customerId: data.customerId,
      vehicleId: data.vehicleId || null,
      reason: data.reason,
      startsAt,
      endsAt,
      notes: data.notes || null,
    },
  });

  revalidatePath("/appointments");
  redirect("/appointments");
}

const updateSchema = createSchema.extend({
  appointmentId: z.string().min(1),
});

export async function updateAppointment(formData: FormData) {
  const data = updateSchema.parse({
    appointmentId: formData.get("appointmentId"),
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId") || undefined,
    reason: formData.get("reason"),
    startsAt: formData.get("startsAt"),
    durationMinutes: formData.get("durationMinutes"),
    notes: formData.get("notes") || undefined,
  });

  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(startsAt.getTime() + data.durationMinutes * 60 * 1000);

  await prisma.appointment.update({
    where: { id: data.appointmentId },
    data: {
      vehicleId: data.vehicleId || null,
      reason: data.reason,
      startsAt,
      endsAt,
      notes: data.notes || null,
    },
  });

  revalidatePath("/appointments");
  redirect("/appointments");
}

const statusSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW", "CANCELLED"]),
});

export async function updateAppointmentStatus(formData: FormData) {
  const data = statusSchema.parse({
    appointmentId: formData.get("appointmentId"),
    status: formData.get("status"),
  });

  await prisma.appointment.update({
    where: { id: data.appointmentId },
    data: { status: data.status },
  });

  revalidatePath("/appointments");
}

export async function deleteAppointment(formData: FormData) {
  const appointmentId = z.string().min(1).parse(formData.get("appointmentId"));

  await prisma.appointment.delete({ where: { id: appointmentId } });

  revalidatePath("/appointments");
  redirect("/appointments");
}
