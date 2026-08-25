"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getBillingPlan } from "@/lib/billing-plans";

const selectPlanSchema = z.object({
  planId: z.string().refine((id) => getBillingPlan(id) !== undefined, "Unknown plan"),
});

export async function selectPlan(formData: FormData) {
  const { planId } = selectPlanSchema.parse({ planId: formData.get("planId") });

  await prisma.billingSettings.upsert({
    where: { id: "billing" },
    create: { id: "billing", currentPlanId: planId },
    update: { currentPlanId: planId },
  });

  revalidatePath("/billing");
}
