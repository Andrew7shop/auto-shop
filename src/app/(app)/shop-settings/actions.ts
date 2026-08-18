"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

const shopProfileSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  shopId: z.string().optional(),
  licenseNumber: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
});

export async function updateShopProfile(formData: FormData) {
  const data = shopProfileSchema.parse({
    name: formData.get("name"),
    shopId: emptyToUndefined(formData.get("shopId")),
    licenseNumber: emptyToUndefined(formData.get("licenseNumber")),
    taxId: emptyToUndefined(formData.get("taxId")),
    address: emptyToUndefined(formData.get("address")),
    city: emptyToUndefined(formData.get("city")),
    state: emptyToUndefined(formData.get("state")),
    postalCode: emptyToUndefined(formData.get("postalCode")),
    phone: emptyToUndefined(formData.get("phone")),
  });

  await prisma.shopProfile.upsert({
    where: { id: "shop" },
    create: { id: "shop", ...data },
    update: data,
  });

  revalidatePath("/shop-settings");
  revalidatePath("/", "layout");
}
