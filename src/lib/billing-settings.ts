import { prisma } from "@/lib/prisma";

export async function getBillingSettings() {
  return prisma.billingSettings.findUnique({ where: { id: "billing" } });
}
