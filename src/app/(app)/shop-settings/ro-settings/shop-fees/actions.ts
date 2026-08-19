"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const shopFeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().min(0),
});

export async function createShopFee(formData: FormData) {
  const data = shopFeeSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    value: formData.get("value"),
  });

  await prisma.shopFee.create({ data });

  revalidatePath("/shop-settings/ro-settings/shop-fees");
  redirect("/shop-settings/ro-settings/shop-fees");
}

const updateShopFeeSchema = shopFeeSchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateShopFee(formData: FormData) {
  const data = updateShopFeeSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    value: formData.get("value"),
    active: formData.get("active") === "on",
  });

  await prisma.shopFee.update({
    where: { id: data.id },
    data: { name: data.name, type: data.type, value: data.value, active: data.active },
  });

  revalidatePath("/shop-settings/ro-settings/shop-fees");
  redirect("/shop-settings/ro-settings/shop-fees");
}
