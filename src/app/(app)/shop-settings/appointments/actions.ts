"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const WEEKDAY_VALUES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

const settingsSchema = z
  .object({
    openHour: z.coerce.number().int().min(0).max(23),
    closeHour: z.coerce.number().int().min(0).max(23),
    daysOpen: z.array(z.enum(WEEKDAY_VALUES)).min(1, "Select at least one day"),
  })
  .refine((data) => data.closeHour > data.openHour, {
    message: "Close hour must be after open hour",
    path: ["closeHour"],
  });

export async function updateAppointmentSettings(formData: FormData) {
  const data = settingsSchema.parse({
    openHour: formData.get("openHour"),
    closeHour: formData.get("closeHour"),
    daysOpen: formData.getAll("daysOpen"),
  });

  await prisma.appointmentSettings.upsert({
    where: { id: "appointments" },
    create: { id: "appointments", ...data },
    update: data,
  });

  revalidatePath("/shop-settings/appointments");
  revalidatePath("/appointments");
}
