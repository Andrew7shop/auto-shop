"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const applicationSchema = z.object({
  appliesToParts: z.coerce.boolean(),
  appliesToTires: z.coerce.boolean(),
  appliesToBatteries: z.coerce.boolean(),
});

export async function updateMarkupApplication(formData: FormData) {
  const data = applicationSchema.parse({
    appliesToParts: formData.get("appliesToParts") === "on",
    appliesToTires: formData.get("appliesToTires") === "on",
    appliesToBatteries: formData.get("appliesToBatteries") === "on",
  });

  await prisma.markupSettings.upsert({
    where: { id: "markups" },
    create: { id: "markups", ...data },
    update: data,
  });

  revalidatePath("/shop-settings/markups");
}

const tierSchema = z
  .object({
    minCost: z.coerce.number().min(0),
    maxCost: z.coerce.number().min(0).optional(),
    multiplier: z.coerce.number().positive(),
  })
  .refine((data) => data.maxCost === undefined || data.maxCost > data.minCost, {
    message: "Max cost must be greater than min cost",
    path: ["maxCost"],
  });

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

export async function createMarkupTier(formData: FormData) {
  const data = tierSchema.parse({
    minCost: formData.get("minCost"),
    maxCost: emptyToUndefined(formData.get("maxCost")),
    multiplier: formData.get("multiplier"),
  });

  await prisma.markupTier.create({
    data: { minCost: data.minCost, maxCost: data.maxCost ?? null, multiplier: data.multiplier },
  });

  revalidatePath("/shop-settings/markups");
  redirect("/shop-settings/markups");
}

const updateTierSchema = z
  .object({
    id: z.string().min(1),
    minCost: z.coerce.number().min(0),
    maxCost: z.coerce.number().min(0).optional(),
    multiplier: z.coerce.number().positive(),
    active: z.coerce.boolean(),
  })
  .refine((data) => data.maxCost === undefined || data.maxCost > data.minCost, {
    message: "Max cost must be greater than min cost",
    path: ["maxCost"],
  });

export async function updateMarkupTier(formData: FormData) {
  const data = updateTierSchema.parse({
    id: formData.get("id"),
    minCost: formData.get("minCost"),
    maxCost: emptyToUndefined(formData.get("maxCost")),
    multiplier: formData.get("multiplier"),
    active: formData.get("active") === "on",
  });

  await prisma.markupTier.update({
    where: { id: data.id },
    data: {
      minCost: data.minCost,
      maxCost: data.maxCost ?? null,
      multiplier: data.multiplier,
      active: data.active,
    },
  });

  revalidatePath("/shop-settings/markups");
  redirect("/shop-settings/markups");
}
