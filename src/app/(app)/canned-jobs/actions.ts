"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

const cannedJobSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  laborHours: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0),
});

export async function createCannedJob(formData: FormData) {
  const data = cannedJobSchema.parse({
    name: formData.get("name"),
    categoryId: emptyToUndefined(formData.get("categoryId")),
    description: emptyToUndefined(formData.get("description")),
    laborHours: emptyToUndefined(formData.get("laborHours")),
    price: formData.get("price"),
  });

  await prisma.cannedJob.create({
    data: {
      name: data.name,
      categoryId: data.categoryId ?? null,
      description: data.description,
      laborHours: data.laborHours,
      price: data.price,
    },
  });

  revalidatePath("/canned-jobs");
  redirect("/canned-jobs");
}

const updateCannedJobSchema = cannedJobSchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateCannedJob(formData: FormData) {
  const data = updateCannedJobSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    categoryId: emptyToUndefined(formData.get("categoryId")),
    description: emptyToUndefined(formData.get("description")),
    laborHours: emptyToUndefined(formData.get("laborHours")),
    price: formData.get("price"),
    active: formData.get("active") === "on",
  });

  await prisma.cannedJob.update({
    where: { id: data.id },
    data: {
      name: data.name,
      categoryId: data.categoryId ?? null,
      description: data.description ?? null,
      laborHours: data.laborHours ?? null,
      price: data.price,
      active: data.active,
    },
  });

  revalidatePath("/canned-jobs");
  redirect("/canned-jobs");
}
