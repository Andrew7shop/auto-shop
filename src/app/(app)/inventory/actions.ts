"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

const partSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(["PART", "TIRE", "BATTERY"]),
  quantityOnHand: z.coerce.number().int().min(0),
  reorderPoint: z.coerce.number().int().min(0),
  unitCost: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  vendorId: z.string().optional(),
});

export async function createPart(formData: FormData) {
  const data = partSchema.parse({
    sku: emptyToUndefined(formData.get("sku")),
    name: formData.get("name"),
    description: emptyToUndefined(formData.get("description")),
    category: formData.get("category"),
    quantityOnHand: formData.get("quantityOnHand"),
    reorderPoint: formData.get("reorderPoint"),
    unitCost: formData.get("unitCost"),
    unitPrice: formData.get("unitPrice"),
    vendorId: emptyToUndefined(formData.get("vendorId")),
  });

  await prisma.part.create({
    data: {
      sku: data.sku,
      name: data.name,
      description: data.description,
      category: data.category,
      quantityOnHand: data.quantityOnHand,
      reorderPoint: data.reorderPoint,
      unitCost: data.unitCost,
      unitPrice: data.unitPrice,
      vendorId: data.vendorId,
    },
  });

  revalidatePath("/inventory");
  redirect("/inventory");
}

const updatePartSchema = partSchema.extend({
  id: z.string().min(1),
});

export async function updatePart(formData: FormData) {
  const data = updatePartSchema.parse({
    id: formData.get("id"),
    sku: emptyToUndefined(formData.get("sku")),
    name: formData.get("name"),
    description: emptyToUndefined(formData.get("description")),
    category: formData.get("category"),
    quantityOnHand: formData.get("quantityOnHand"),
    reorderPoint: formData.get("reorderPoint"),
    unitCost: formData.get("unitCost"),
    unitPrice: formData.get("unitPrice"),
    vendorId: emptyToUndefined(formData.get("vendorId")),
  });

  await prisma.part.update({
    where: { id: data.id },
    data: {
      sku: data.sku ?? null,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      quantityOnHand: data.quantityOnHand,
      reorderPoint: data.reorderPoint,
      unitCost: data.unitCost,
      unitPrice: data.unitPrice,
      vendorId: data.vendorId ?? null,
    },
  });

  revalidatePath("/inventory");
  redirect("/inventory");
}
