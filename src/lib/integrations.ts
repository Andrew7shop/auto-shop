import { prisma } from "@/lib/prisma";

export async function getIntegrations() {
  return prisma.integration.findMany({ orderBy: { name: "asc" } });
}

/** Shows only the last 4 characters so a saved key/ID isn't fully exposed on screen. */
export function maskSecret(value: string): string {
  if (value.length <= 4) return "•".repeat(value.length);
  return `${"•".repeat(value.length - 4)}${value.slice(-4)}`;
}
