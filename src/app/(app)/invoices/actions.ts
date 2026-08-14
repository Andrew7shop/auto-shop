"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeInvoiceTotals } from "@/lib/money";

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "CARD", "CHECK", "BANK_TRANSFER", "OTHER"]),
  reference: z.string().optional(),
});

export async function recordPayment(formData: FormData) {
  const data = paymentSchema.parse({
    invoiceId: formData.get("invoiceId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    reference: formData.get("reference") || undefined,
  });

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: data.invoiceId },
    include: { workOrder: { include: { lineItems: true } }, payments: true },
  });

  await prisma.payment.create({
    data: {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference || null,
    },
  });

  const { total, paid } = computeInvoiceTotals(invoice.workOrder.lineItems, invoice.taxRate, [
    ...invoice.payments,
    { amount: data.amount },
  ]);

  const status = paid <= 0 ? "UNPAID" : paid >= total ? "PAID" : "PARTIALLY_PAID";

  await prisma.invoice.update({
    where: { id: data.invoiceId },
    data: { status },
  });

  revalidatePath(`/invoices/${data.invoiceId}`);
  revalidatePath("/invoices");
}

const taxRateSchema = z.object({
  invoiceId: z.string().min(1),
  taxRate: z.coerce.number().min(0).max(1),
});

export async function updateTaxRate(formData: FormData) {
  const data = taxRateSchema.parse({
    invoiceId: formData.get("invoiceId"),
    taxRate: formData.get("taxRate"),
  });

  await prisma.invoice.update({
    where: { id: data.invoiceId },
    data: { taxRate: data.taxRate },
  });

  revalidatePath(`/invoices/${data.invoiceId}`);
}

export async function voidInvoice(formData: FormData) {
  const invoiceId = z.string().min(1).parse(formData.get("invoiceId"));

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "VOID" },
  });

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
