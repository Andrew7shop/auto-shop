import { prisma } from "@/lib/prisma";

export async function getJobCategories(options?: { activeOnly?: boolean }) {
  return prisma.jobCategory.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
  });
}
