import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const DEFAULT_CUSTOMER_SETTINGS = {
  requireCustomerType: false,
  requireBusinessName: false,
  requireAddress: false,
  requirePhone: false,
  requireEmail: false,
  requireSource: false,
  requireBirthday: false,
};

export async function getCustomerSettings() {
  return (await prisma.customerSettings.findUnique({ where: { id: "customers" } })) ?? DEFAULT_CUSTOMER_SETTINGS;
}

/** Shared by every "add/edit a customer" form so the required-field settings apply everywhere a customer is created. */
export function buildCustomerProfileSchema(settings: {
  requireCustomerType: boolean;
  requireBusinessName: boolean;
  requireAddress: boolean;
  requirePhone: boolean;
  requireEmail: boolean;
  requireSource: boolean;
  requireBirthday: boolean;
}) {
  return z.object({
    customerType: z.enum(["INDIVIDUAL", "BUSINESS"]).default("INDIVIDUAL"),
    businessName: settings.requireBusinessName
      ? z.string().min(1, "Business name is required")
      : z.string().optional(),
    email: settings.requireEmail
      ? z.string().min(1, "Email is required").email("Enter a valid email")
      : z.string().email().optional().or(z.literal("")),
    phone: settings.requirePhone ? z.string().min(1, "Phone is required") : z.string().optional(),
    address: settings.requireAddress ? z.string().min(1, "Address is required") : z.string().optional(),
    sourceId: settings.requireSource ? z.string().min(1, "Customer source is required") : z.string().optional(),
    birthday: settings.requireBirthday ? z.coerce.date() : z.coerce.date().optional(),
  });
}
