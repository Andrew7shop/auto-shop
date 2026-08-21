"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const integrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function createIntegration(formData: FormData) {
  const data = integrationSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  await prisma.integration.create({
    data: { name: data.name, description: data.description || null },
  });

  revalidatePath("/shop-settings/integrations");
  redirect("/shop-settings/integrations");
}

const updateIntegrationSchema = integrationSchema.extend({
  id: z.string().min(1),
});

export async function updateIntegration(formData: FormData) {
  const data = updateIntegrationSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  await prisma.integration.update({
    where: { id: data.id },
    data: { name: data.name, description: data.description || null },
  });

  revalidatePath("/shop-settings/integrations");
  redirect("/shop-settings/integrations");
}

const connectSchema = z.object({
  id: z.string().min(1),
  apiKey: z.string().optional(),
  accountId: z.string().optional(),
});

export async function connectIntegration(formData: FormData) {
  const data = connectSchema.parse({
    id: formData.get("id"),
    apiKey: formData.get("apiKey") || undefined,
    accountId: formData.get("accountId") || undefined,
  });

  await prisma.integration.update({
    where: { id: data.id },
    data: {
      status: "CONNECTED",
      apiKey: data.apiKey || null,
      accountId: data.accountId || null,
      connectedAt: new Date(),
    },
  });

  revalidatePath("/shop-settings/integrations");
  revalidatePath(`/shop-settings/integrations/${data.id}/edit`);
}

export async function disconnectIntegration(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));

  await prisma.integration.update({
    where: { id },
    data: { status: "DISCONNECTED", apiKey: null, accountId: null, connectedAt: null },
  });

  revalidatePath("/shop-settings/integrations");
  revalidatePath(`/shop-settings/integrations/${id}/edit`);
}
