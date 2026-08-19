import { prisma } from "@/lib/prisma";

export const DEFAULT_APPOINTMENT_SETTINGS = {
  openHour: 8,
  closeHour: 17,
  daysOpen: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const,
};

export async function getAppointmentSettings() {
  return prisma.appointmentSettings.findUnique({ where: { id: "appointments" } });
}
