"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DOCUMENT_FIELD_SECTIONS, fieldVisibilityKey, type FieldVisibilityMap } from "@/lib/document-fields";

export async function updateFieldVisibility(formData: FormData) {
  const fieldVisibility: FieldVisibilityMap = {};

  for (const section of DOCUMENT_FIELD_SECTIONS) {
    for (const field of section.fields) {
      const key = fieldVisibilityKey(section.key, field.key);
      fieldVisibility[key] = {
        estimate: formData.get(`${key}.estimate`) === "on",
        invoice: formData.get(`${key}.invoice`) === "on",
      };
    }
  }

  await prisma.estimateInvoiceSettings.upsert({
    where: { id: "estimates-invoices" },
    create: { id: "estimates-invoices", fieldVisibility },
    update: { fieldVisibility },
  });

  revalidatePath("/shop-settings/estimates-invoices");
}
