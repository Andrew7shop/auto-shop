"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const PAYMENT_METHOD_VALUES = ["CASH", "CARD", "CHECK", "BANK_TRANSFER", "OTHER"] as const;

async function upsertRoSettings(data: Record<string, unknown>) {
  await prisma.roSettings.upsert({
    where: { id: "ro" },
    create: { id: "ro", ...data },
    update: data,
  });
}

const taxesSchema = z.object({
  defaultTaxRate: z.coerce.number().min(0).max(1),
});

export async function updateTaxes(formData: FormData) {
  const data = taxesSchema.parse({ defaultTaxRate: formData.get("defaultTaxRate") });
  await upsertRoSettings(data);
  revalidatePath("/shop-settings/ro-settings/taxes");
}

const discountsSchema = z.object({
  defaultDiscountType: z.enum(["PERCENT", "FIXED"]),
  defaultDiscountValue: z.coerce.number().min(0),
});

export async function updateDiscounts(formData: FormData) {
  const data = discountsSchema.parse({
    defaultDiscountType: formData.get("defaultDiscountType"),
    defaultDiscountValue: formData.get("defaultDiscountValue"),
  });
  await upsertRoSettings(data);
  revalidatePath("/shop-settings/ro-settings/discounts");
}

const tiresSchema = z.object({
  defaultTireFee: z.coerce.number().min(0),
});

export async function updateTires(formData: FormData) {
  const data = tiresSchema.parse({ defaultTireFee: formData.get("defaultTireFee") });
  await upsertRoSettings(data);
  revalidatePath("/shop-settings/ro-settings/tires");
}

const paymentSettingsSchema = z.object({
  enabledPaymentMethods: z.array(z.enum(PAYMENT_METHOD_VALUES)).min(1, "Enable at least one payment method"),
});

export async function updatePaymentSettings(formData: FormData) {
  const data = paymentSettingsSchema.parse({
    enabledPaymentMethods: formData.getAll("enabledPaymentMethods"),
  });
  await upsertRoSettings(data);
  revalidatePath("/shop-settings/ro-settings/payment-settings");
}

const invoiceNumberingSchema = z.object({
  invoiceNumberPrefix: z.string().optional(),
  invoiceNumberPadding: z.coerce.number().int().min(0).max(10),
});

export async function updateInvoiceNumbering(formData: FormData) {
  const prefix = formData.get("invoiceNumberPrefix")?.toString().trim();
  const data = invoiceNumberingSchema.parse({
    invoiceNumberPrefix: prefix || undefined,
    invoiceNumberPadding: formData.get("invoiceNumberPadding"),
  });
  await upsertRoSettings({ ...data, invoiceNumberPrefix: data.invoiceNumberPrefix ?? null });
  revalidatePath("/shop-settings/ro-settings/invoice-numbering");
  revalidatePath("/invoices");
  revalidatePath("/reports");
}

const gpHrGoalSchema = z.object({
  gpPerHourGoal: z.coerce.number().min(0).optional(),
});

export async function updateGpHrGoal(formData: FormData) {
  const value = formData.get("gpPerHourGoal")?.toString().trim();
  const data = gpHrGoalSchema.parse({ gpPerHourGoal: value || undefined });
  await upsertRoSettings({ gpPerHourGoal: data.gpPerHourGoal ?? null });
  revalidatePath("/shop-settings/ro-settings/gp-hr-goal");
  revalidatePath("/reports/profit");
}

const ADVANCED_SETTING_FIELDS = [
  "showOdometerInOut",
  "showMarketingSource",
  "showTechOnLabor",
  "showJobCategory",
  "showPartsPurchaseOrder",
  "showPartsBilling",
  "showPaymentCardType",
  "showTireDotCodes",
  "showDigitalSignature",
] as const;

const advancedSettingsSchema = z.object(
  Object.fromEntries(ADVANCED_SETTING_FIELDS.map((field) => [field, z.coerce.boolean()])),
);

export async function updateAdvancedSettings(formData: FormData) {
  const raw = Object.fromEntries(
    ADVANCED_SETTING_FIELDS.map((field) => [field, formData.get(field) === "on"]),
  );
  const data = advancedSettingsSchema.parse(raw);
  await upsertRoSettings(data);
  revalidatePath("/shop-settings/ro-settings/advanced-settings");
}
