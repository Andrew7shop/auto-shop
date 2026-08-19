export function formatInvoiceNumber(
  number: number,
  settings?: { invoiceNumberPrefix: string | null; invoiceNumberPadding: number } | null
): string {
  const prefix = settings?.invoiceNumberPrefix ?? "";
  const padding = settings?.invoiceNumberPadding ?? 0;
  return `${prefix}${String(number).padStart(padding, "0")}`;
}
