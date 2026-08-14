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

export function computeInvoiceTotals(
  lineItems: { quantity: Moneyish; unitPrice: Moneyish }[],
  taxRate: Moneyish,
  payments: { amount: Moneyish }[]
) {
  const subtotal = sumLineItems(lineItems);
  const tax = subtotal * toNumber(taxRate);
  const total = subtotal + tax;
  const paid = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
  const balance = total - paid;
  return { subtotal, tax, total, paid, balance };
}
