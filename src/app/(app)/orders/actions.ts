"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function emptyToUndefined(value: FormDataEntryValue | null) {
  const str = value?.toString().trim();
  return str ? str : undefined;
}

const createOrderSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  expectedAt: z.string().optional(),
  notes: z.string().optional(),
});

export async function createOrder(formData: FormData) {
  const data = createOrderSchema.parse({
    vendorId: formData.get("vendorId"),
    expectedAt: emptyToUndefined(formData.get("expectedAt")),
    notes: emptyToUndefined(formData.get("notes")),
  });

  const order = await prisma.order.create({
    data: {
      vendorId: data.vendorId,
      expectedAt: data.expectedAt ? new Date(data.expectedAt) : undefined,
      notes: data.notes,
    },
  });

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

const lineItemSchema = z.object({
  orderId: z.string().min(1),
  partId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().min(0),
});

export async function addLineItem(formData: FormData) {
  const data = lineItemSchema.parse({
    orderId: formData.get("orderId"),
    partId: emptyToUndefined(formData.get("partId")),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitCost: formData.get("unitCost"),
  });

  const order = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!order || order.status !== "DRAFT") {
    redirect(`/orders/${data.orderId}?error=locked`);
  }

  await prisma.orderLineItem.create({
    data: {
      orderId: data.orderId,
      partId: data.partId,
      description: data.description,
      quantity: data.quantity,
      unitCost: data.unitCost,
    },
  });

  revalidatePath(`/orders/${data.orderId}`);
  redirect(`/orders/${data.orderId}`);
}

const removeLineItemSchema = z.object({
  lineItemId: z.string().min(1),
  orderId: z.string().min(1),
});

export async function removeLineItem(formData: FormData) {
  const data = removeLineItemSchema.parse({
    lineItemId: formData.get("lineItemId"),
    orderId: formData.get("orderId"),
  });

  const order = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!order || order.status !== "DRAFT") {
    redirect(`/orders/${data.orderId}?error=locked`);
  }

  await prisma.orderLineItem.delete({ where: { id: data.lineItemId } });

  revalidatePath(`/orders/${data.orderId}`);
  redirect(`/orders/${data.orderId}`);
}

const placeOrderSchema = z.object({ orderId: z.string().min(1) });

export async function placeOrder(formData: FormData) {
  const { orderId } = placeOrderSchema.parse({ orderId: formData.get("orderId") });

  await prisma.order.updateMany({
    where: { id: orderId, status: "DRAFT" },
    data: { status: "ORDERED", orderedAt: new Date() },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  redirect(`/orders/${orderId}`);
}

export async function receiveOrder(formData: FormData) {
  const { orderId } = placeOrderSchema.parse({ orderId: formData.get("orderId") });

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { lineItems: true },
    });
    if (!order || order.status !== "ORDERED") return;

    for (const item of order.lineItems) {
      if (!item.partId) continue;
      await tx.part.update({
        where: { id: item.partId },
        data: { quantityOnHand: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "RECEIVED", receivedAt: new Date() },
    });
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/inventory");
  redirect(`/orders/${orderId}`);
}

export async function cancelOrder(formData: FormData) {
  const { orderId } = placeOrderSchema.parse({ orderId: formData.get("orderId") });

  await prisma.order.updateMany({
    where: { id: orderId, status: { in: ["DRAFT", "ORDERED"] } },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  redirect(`/orders/${orderId}`);
}
