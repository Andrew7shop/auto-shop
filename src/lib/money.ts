import type { Decimal } from "@/generated/prisma/internal/prismaNamespace";

type Moneyish = number | string | Decimal;

function toNumber(value: Moneyish): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatCurrency(value: Moneyish): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(toNumber(value));
}

export function computeLineItemTotal(quantity: Moneyish, unitPrice: Moneyish): number {
  return toNumber(quantity) * toNumber(unitPrice);
}

export function sumLineItems(items: { quantity: Moneyish; unitPrice: Moneyish }[]): number {
  return items.reduce((sum, item) => sum + computeLineItemTotal(item.quantity, item.unitPrice), 0);
}

type Charges = {
  taxRate: Moneyish;
  discountType: "PERCENT" | "FIXED";
  discountValue: Moneyish;
  tireFeeTotal: Moneyish;
};

export function computeInvoiceTotals(
  lineItems: { quantity: Moneyish; unitPrice: Moneyish }[],
  charges: Charges,
  payments: { amount: Moneyish }[]
) {
  const subtotal = sumLineItems(lineItems);
  const discountValue = toNumber(charges.discountValue);
  const discountAmount =
    charges.discountType === "PERCENT" ? subtotal * (discountValue / 100) : discountValue;
  const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
  const tax = discountedSubtotal * toNumber(charges.taxRate);
  const tireFee = toNumber(charges.tireFeeTotal);
  const total = discountedSubtotal + tax + tireFee;
  const paid = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
  const balance = Math.round((total - paid) * 100) / 100 || 0;
  return { subtotal, discountAmount, discountedSubtotal, tax, tireFee, total, paid, balance };
}
