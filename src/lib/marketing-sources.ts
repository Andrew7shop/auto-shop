import { prisma } from "@/lib/prisma";

export async function getMarketingSources(options?: { activeOnly?: boolean }) {
  return prisma.marketingSource.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
