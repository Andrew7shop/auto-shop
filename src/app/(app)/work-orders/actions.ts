"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRoSettings } from "@/lib/ro-settings";

const createSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  odometer: z.coerce.number().int().min(0).optional(),
});

export async function createWorkOrder(formData: FormData) {
  const data = createSchema.parse({
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId"),
    categoryId: formData.get("categoryId") || undefined,
    description: formData.get("description"),
    odometer: formData.get("odometer") || undefined,
  });

  const workOrder = await prisma.workOrder.create({
    data: {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      categoryId: data.categoryId ?? null,
      description: data.description,
      odometer: data.odometer ?? null,
    },
  });

  revalidatePath("/work-orders");
  redirect(`/work-orders/${workOrder.id}`);
}

const updateDetailsSchema = z.object({
  workOrderId: z.string().min(1),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  odometer: z.coerce.number().int().min(0).optional(),
});

export async function updateWorkOrderDetails(formData: FormData) {
  const data = updateDetailsSchema.parse({
    workOrderId: formData.get("workOrderId"),
    categoryId: formData.get("categoryId") || undefined,
    description: formData.get("description"),
    odometer: formData.get("odometer") || undefined,
  });

  await prisma.workOrder.update({
    where: { id: data.workOrderId },
    data: {
      categoryId: data.categoryId ?? null,
      description: data.description,
      odometer: data.odometer ?? null,
    },
  });

  revalidatePath(`/work-orders/${data.workOrderId}`);
  redirect(`/work-orders/${data.workOrderId}`);
}

const statusSchema = z.object({
  workOrderId: z.string().min(1),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "WAITING_ON_PARTS",
    "WAITING_ON_APPROVAL",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export async function updateWorkOrderStatus(formData: FormData) {
  const data = statusSchema.parse({
    workOrderId: formData.get("workOrderId"),
    status: formData.get("status"),
  });

  await prisma.workOrder.update({
    where: { id: data.workOrderId },
    data: {
      status: data.status,
      completedAt: data.status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath(`/work-orders/${data.workOrderId}`);
  revalidatePath("/work-orders");
}

const assignSchema = z.object({
  workOrderId: z.string().min(1),
  assignedToId: z.string().optional(),
});

export async function assignTechnician(formData: FormData) {
  const data = assignSchema.parse({
    workOrderId: formData.get("workOrderId"),
    assignedToId: formData.get("assignedToId") || undefined,
  });

  await prisma.workOrder.update({
    where: { id: data.workOrderId },
    data: { assignedToId: data.assignedToId || null },
  });

  revalidatePath(`/work-orders/${data.workOrderId}`);
  revalidatePath("/tech-board");
}

async function assertLineItemsEditable(workOrderId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { workOrderId } });
  if (invoice) {
    redirect(`/work-orders/${workOrderId}?error=invoiced`);
  }
}

const lineItemSchema = z.object({
  workOrderId: z.string().min(1),
  type: z.enum(["LABOR", "PART", "FEE"]),
  partId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
});

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

export async function addLineItem(formData: FormData) {
  const data = lineItemSchema.parse({
    workOrderId: formData.get("workOrderId"),
    type: formData.get("type"),
    partId: emptyToUndefined(formData.get("partId")),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });

  await assertLineItemsEditable(data.workOrderId);

  await prisma.lineItem.create({
    data: {
      workOrderId: data.workOrderId,
      type: data.type,
      partId: data.partId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    },
  });

  revalidatePath(`/work-orders/${data.workOrderId}`);
}

const updateLineItemSchema = lineItemSchema.extend({
  lineItemId: z.string().min(1),
});

export async function updateLineItem(formData: FormData) {
  const data = updateLineItemSchema.parse({
    lineItemId: formData.get("lineItemId"),
    workOrderId: formData.get("workOrderId"),
    type: formData.get("type"),
    partId: emptyToUndefined(formData.get("partId")),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });

  await assertLineItemsEditable(data.workOrderId);

  await prisma.lineItem.update({
    where: { id: data.lineItemId },
    data: {
      type: data.type,
      partId: data.partId ?? null,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    },
  });

  revalidatePath(`/work-orders/${data.workOrderId}`);
  redirect(`/work-orders/${data.workOrderId}`);
}

export async function removeLineItem(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("lineItemId"));
  const workOrderId = z.string().min(1).parse(formData.get("workOrderId"));

  await assertLineItemsEditable(workOrderId);

  await prisma.lineItem.delete({ where: { id } });

  revalidatePath(`/work-orders/${workOrderId}`);
}

export async function generateInvoice(formData: FormData) {
  const workOrderId = z.string().min(1).parse(formData.get("workOrderId"));

  const [workOrder, roSettings] = await Promise.all([
    prisma.workOrder.findUniqueOrThrow({ where: { id: workOrderId } }),
    getRoSettings(),
  ]);

  const invoice = await prisma.invoice.create({
    data: {
      workOrderId: workOrder.id,
      customerId: workOrder.customerId,
      taxRate: roSettings?.defaultTaxRate ?? 0,
      discountType: roSettings?.defaultDiscountType ?? "FIXED",
      discountValue: roSettings?.defaultDiscountValue ?? 0,
      tireFeeTotal: roSettings?.defaultTireFee ?? 0,
    },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  redirect(`/invoices/${invoice.id}`);
}
