import { prisma } from "@/lib/prisma";

export const DEFAULT_RO_SETTINGS = {
  defaultTaxRate: 0,
  defaultDiscountType: "FIXED" as const,
  defaultDiscountValue: 0,
  defaultTireFee: 0,
  gpPerHourGoal: null as number | null,
  invoiceNumberPrefix: null as string | null,
  invoiceNumberPadding: 0,
  enabledPaymentMethods: ["CASH", "CARD", "CHECK", "BANK_TRANSFER", "OTHER"] as const,
  showOdometerInOut: true,
  showMarketingSource: true,
  showTechOnLabor: true,
  showJobCategory: true,
  showPartsPurchaseOrder: true,
  showPartsBilling: true,
  showPaymentCardType: true,
  showTireDotCodes: true,
  showDigitalSignature: true,
};

export async function getRoSettings() {
  return prisma.roSettings.findUnique({ where: { id: "ro" } });
}
