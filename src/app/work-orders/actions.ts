"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  description: z.string().min(1, "Description is required"),
  odometer: z.coerce.number().int().min(0).optional(),
});

export async function createWorkOrder(formData: FormData) {
  const data = createSchema.parse({
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId"),
    description: formData.get("description"),
    odometer: formData.get("odometer") || undefined,
  });

  const workOrder = await prisma.workOrder.create({
    data: {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      description: data.description,
      odometer: data.odometer ?? null,
    },
  });

  revalidatePath("/work-orders");
  redirect(`/work-orders/${workOrder.id}`);
}

const updateDetailsSchema = z.object({
  workOrderId: z.string().min(1),
  description: z.string().min(1, "Description is required"),
  odometer: z.coerce.number().int().min(0).optional(),
});

export async function updateWorkOrderDetails(formData: FormData) {
  const data = updateDetailsSchema.parse({
    workOrderId: formData.get("workOrderId"),
    description: formData.get("description"),
    odometer: formData.get("odometer") || undefined,
  });

  await prisma.workOrder.update({
    where: { id: data.workOrderId },
    data: {
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

async function assertLineItemsEditable(workOrderId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { workOrderId } });
  if (invoice) {
    redirect(`/work-orders/${workOrderId}?error=invoiced`);
  }
}

const lineItemSchema = z.object({
  workOrderId: z.string().min(1),
  type: z.enum(["LABOR", "PART"]),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
});

export async function addLineItem(formData: FormData) {
  const data = lineItemSchema.parse({
    workOrderId: formData.get("workOrderId"),
    type: formData.get("type"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });

  await assertLineItemsEditable(data.workOrderId);

  await prisma.lineItem.create({
    data: {
      workOrderId: data.workOrderId,
      type: data.type,
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
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitPrice: formData.get("unitPrice"),
  });

  await assertLineItemsEditable(data.workOrderId);

  await prisma.lineItem.update({
    where: { id: data.lineItemId },
    data: {
      type: data.type,
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

  const workOrder = await prisma.workOrder.findUniqueOrThrow({
    where: { id: workOrderId },
  });

  const invoice = await prisma.invoice.create({
    data: {
      workOrderId: workOrder.id,
      customerId: workOrder.customerId,
    },
  });

  revalidatePath(`/work-orders/${workOrderId}`);
  redirect(`/invoices/${invoice.id}`);
}
