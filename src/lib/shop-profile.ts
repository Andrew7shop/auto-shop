import { prisma } from "@/lib/prisma";

export const DEFAULT_SHOP_NAME = "Wrench & Wheel";

export async function getShopProfile() {
  return prisma.shopProfile.findUnique({ where: { id: "shop" } });
}
