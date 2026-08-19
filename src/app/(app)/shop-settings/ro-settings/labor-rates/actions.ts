"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const laborRateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ratePerHour: z.coerce.number().min(0),
});

export async function createLaborRate(formData: FormData) {
  const data = laborRateSchema.parse({
    name: formData.get("name"),
    ratePerHour: formData.get("ratePerHour"),
  });

  await prisma.laborRate.create({ data });

  revalidatePath("/shop-settings/ro-settings/labor-rates");
  redirect("/shop-settings/ro-settings/labor-rates");
}

const updateLaborRateSchema = laborRateSchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateLaborRate(formData: FormData) {
  const data = updateLaborRateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    ratePerHour: formData.get("ratePerHour"),
    active: formData.get("active") === "on",
  });

  await prisma.laborRate.update({
    where: { id: data.id },
    data: { name: data.name, ratePerHour: data.ratePerHour, active: data.active },
  });

  revalidatePath("/shop-settings/ro-settings/labor-rates");
  redirect("/shop-settings/ro-settings/labor-rates");
}
