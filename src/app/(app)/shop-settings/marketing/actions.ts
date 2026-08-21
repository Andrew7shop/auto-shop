"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const marketingSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function createMarketingSource(formData: FormData) {
  const data = marketingSourceSchema.parse({
    name: formData.get("name"),
  });

  await prisma.marketingSource.create({ data });

  revalidatePath("/shop-settings/marketing");
  revalidatePath("/work-orders/new");
  redirect("/shop-settings/marketing");
}

const updateMarketingSourceSchema = marketingSourceSchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateMarketingSource(formData: FormData) {
  const data = updateMarketingSourceSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    active: formData.get("active") === "on",
  });

  await prisma.marketingSource.update({
    where: { id: data.id },
    data: { name: data.name, active: data.active },
  });

  revalidatePath("/shop-settings/marketing");
  revalidatePath("/work-orders/new");
  redirect("/shop-settings/marketing");
}
