import { prisma } from "@/lib/prisma";

export async function getAppointmentTypes(options?: { activeOnly?: boolean }) {
  return prisma.appointmentType.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}
