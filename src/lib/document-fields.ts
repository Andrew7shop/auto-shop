export const DOCUMENT_FIELD_SECTIONS = [
  {
    key: "laborDetails",
    label: "Labor Details",
    fields: [
      { key: "technician", label: "Technician" },
      { key: "hours", label: "Labor hours" },
      { key: "rate", label: "Labor rate" },
    ],
  },
  {
    key: "partDetails",
    label: "Part Details",
    fields: [
      { key: "partNumber", label: "Part number" },
      { key: "quantity", label: "Quantity" },
      { key: "unitPrice", label: "Unit price" },
    ],
  },
  {
    key: "sublets",
    label: "Sublets",
    fields: [
      { key: "vendor", label: "Vendor" },
      { key: "cost", label: "Cost" },
    ],
  },
  {
    key: "fees",
    label: "Fees",
    fields: [
      { key: "name", label: "Fee name" },
      { key: "amount", label: "Amount" },
    ],
  },
  {
    key: "discounts",
    label: "Discounts",
    fields: [
      { key: "reason", label: "Reason" },
      { key: "amount", label: "Amount" },
    ],
  },
  {
    key: "taxes",
    label: "Taxes",
    fields: [
      { key: "rate", label: "Tax rate" },
      { key: "amount", label: "Tax amount" },
    ],
  },
  {
    key: "roTotalSummary",
    label: "RO Total Summary",
    fields: [
      { key: "subtotal", label: "Subtotal" },
      { key: "total", label: "Total" },
      { key: "balanceDue", label: "Balance due" },
    ],
  },
  {
    key: "declinedJobs",
    label: "Declined Jobs",
    fields: [
      { key: "list", label: "Declined job list" },
      { key: "reason", label: "Decline reason" },
    ],
  },
  {
    key: "additionalDetails",
    label: "Additional Details",
    fields: [
      { key: "notes", label: "Notes" },
      { key: "odometer", label: "Odometer / VIN" },
    ],
  },
] as const;

export type DocumentType = "estimate" | "invoice";

export function fieldVisibilityKey(sectionKey: string, fieldKey: string): string {
  return `${sectionKey}.${fieldKey}`;
}

export type FieldVisibilityMap = Record<string, { estimate: boolean; invoice: boolean }>;

/** Every known field defaults to shown on both documents unless a saved settings row says otherwise. */
export function defaultFieldVisibility(): FieldVisibilityMap {
  const map: FieldVisibilityMap = {};
  for (const section of DOCUMENT_FIELD_SECTIONS) {
    for (const field of section.fields) {
      map[fieldVisibilityKey(section.key, field.key)] = { estimate: true, invoice: true };
    }
  }
  return map;
}

export function resolveFieldVisibility(stored: unknown): FieldVisibilityMap {
  const defaults = defaultFieldVisibility();
  if (!stored || typeof stored !== "object") return defaults;
  const storedMap = stored as Record<string, { estimate?: boolean; invoice?: boolean }>;
  for (const key of Object.keys(defaults)) {
    const entry = storedMap[key];
    if (entry) {
      defaults[key] = { estimate: entry.estimate ?? true, invoice: entry.invoice ?? true };
    }
  }
  return defaults;
}
