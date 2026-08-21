"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const requirementsSchema = z.object({
  requireCustomerType: z.coerce.boolean(),
  requireBusinessName: z.coerce.boolean(),
  requireAddress: z.coerce.boolean(),
  requirePhone: z.coerce.boolean(),
  requireEmail: z.coerce.boolean(),
  requireSource: z.coerce.boolean(),
  requireBirthday: z.coerce.boolean(),
});

export async function updateCustomerRequirements(formData: FormData) {
  const data = requirementsSchema.parse({
    requireCustomerType: formData.get("requireCustomerType") === "on",
    requireBusinessName: formData.get("requireBusinessName") === "on",
    requireAddress: formData.get("requireAddress") === "on",
    requirePhone: formData.get("requirePhone") === "on",
    requireEmail: formData.get("requireEmail") === "on",
    requireSource: formData.get("requireSource") === "on",
    requireBirthday: formData.get("requireBirthday") === "on",
  });

  await prisma.customerSettings.upsert({
    where: { id: "customers" },
    create: { id: "customers", ...data },
    update: data,
  });

  revalidatePath("/shop-settings/customers");
  revalidatePath("/customers/new");
  revalidatePath("/work-orders/new");
}
