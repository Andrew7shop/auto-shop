export const DOCUMENT_FIELD_SECTIONS = [
  {
    key: "laborDetails",
    label: "Labor Details",
    fields: [
      { key: "description", label: "Labor description" },
      { key: "hours", label: "Labor hours" },
      { key: "rate", label: "Labor rate" },
      { key: "total", label: "Labor total" },
    ],
  },
  {
    key: "partDetails",
    label: "Part Details",
    fields: [
      { key: "name", label: "Part name" },
      { key: "brand", label: "Part brand" },
      { key: "partNumber", label: "Part number" },
      { key: "additionalDetails", label: "Part additional details" },
      { key: "quantity", label: "Part quantity" },
      { key: "retailPrice", label: "Part retail price" },
      { key: "lineTotal", label: "Part line total" },
    ],
  },
  {
    key: "sublets",
    label: "Sublets",
    fields: [
      { key: "workDescription", label: "Sublet work description" },
      { key: "lineTotal", label: "Sublet work line total" },
    ],
  },
  {
    key: "fees",
    label: "Fees",
    fields: [
      { key: "itemizedJobFees", label: "Itemized job fees" },
      { key: "itemizedRoFees", label: "Itemized RO fees" },
    ],
  },
  {
    key: "discounts",
    label: "Discounts",
    fields: [
      { key: "itemizedJobDiscounts", label: "Itemized job discounts" },
      { key: "itemizedRoDiscounts", label: "Itemized RO discounts" },
    ],
  },
  {
    key: "taxes",
    label: "Taxes",
    fields: [{ key: "tireTax", label: "Tire tax" }],
  },
  {
    key: "roTotalSummary",
    label: "RO Total Summary",
    fields: [{ key: "itemizedSubtotals", label: "Itemized subtotal for labor, parts, and sublets" }],
  },
  {
    key: "declinedJobs",
    label: "Declined Jobs",
    fields: [{ key: "declinedJobs", label: "Declined jobs" }],
  },
  {
    key: "additionalDetails",
    label: "Additional Details",
    fields: [
      { key: "purposeForVisit", label: "Purpose for visit" },
      { key: "customerConcernFinding", label: "Customer concern / finding" },
      { key: "customerTimeIn", label: "Customer time in" },
      { key: "promisedTimeIn", label: "Promised time in" },
      { key: "promisedTimeOut", label: "Promised time out" },
      { key: "saveCustomerParts", label: "Save customer parts" },
      { key: "technicianOnJobs", label: "Technician on jobs" },
      { key: "serviceWriter", label: "Service writer" },
      { key: "defaultTechnician", label: "Default technician" },
      { key: "keytag", label: "Keytag" },
      { key: "previousApprovalHistory", label: "Previous approval history" },
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
