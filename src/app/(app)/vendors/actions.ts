"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

export async function createVendor(formData: FormData) {
  const data = vendorSchema.parse({
    name: formData.get("name"),
    contactName: emptyToUndefined(formData.get("contactName")),
    email: emptyToUndefined(formData.get("email")),
    phone: emptyToUndefined(formData.get("phone")),
    address: emptyToUndefined(formData.get("address")),
    notes: emptyToUndefined(formData.get("notes")),
  });

  await prisma.vendor.create({ data });

  revalidatePath("/vendors");
  redirect("/vendors");
}

const updateVendorSchema = vendorSchema.extend({
  id: z.string().min(1),
});

export async function updateVendor(formData: FormData) {
  const data = updateVendorSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    contactName: emptyToUndefined(formData.get("contactName")),
    email: emptyToUndefined(formData.get("email")),
    phone: emptyToUndefined(formData.get("phone")),
    address: emptyToUndefined(formData.get("address")),
    notes: emptyToUndefined(formData.get("notes")),
  });

  await prisma.vendor.update({
    where: { id: data.id },
    data: {
      name: data.name,
      contactName: data.contactName ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/vendors");
  redirect("/vendors");
}
