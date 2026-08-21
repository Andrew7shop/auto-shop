import { prisma } from "@/lib/prisma";

export const DEFAULT_MARKUP_SETTINGS = {
  appliesToParts: true,
  appliesToTires: false,
  appliesToBatteries: false,
};

export async function getMarkupSettings() {
  return prisma.markupSettings.findUnique({ where: { id: "markups" } });
}

/** GP% is constant across a tier since its multiplier is fixed: sellPrice = cost * multiplier. */
export function gpPercentForMultiplier(multiplier: number): number {
  if (multiplier <= 0) return 0;
  return (1 - 1 / multiplier) * 100;
}

/** Markup% is the increase over base rather than the margin on sell price: sellPrice = base * multiplier. */
export function markupPercentForMultiplier(multiplier: number): number {
  return (multiplier - 1) * 100;
}
