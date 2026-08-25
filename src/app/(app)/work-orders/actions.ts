"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRoSettings } from "@/lib/ro-settings";
import { NEW_VEHICLE_VALUE } from "@/lib/vehicle";
import { getCustomerSettings, buildCustomerProfileSchema } from "@/lib/customer-settings";

export async function createCustomerAndWorkOrder(formData: FormData) {
  const concerns = formData
    .getAll("concerns")
    .map((value) => value.toString().trim())
    .filter(Boolean);
  const description = z.string().min(1, "At least one concern is required").parse(concerns.join("\n"));

  const customerSettings = await getCustomerSettings();
  const customerAndWorkOrderSchema = buildCustomerProfileSchema(customerSettings).extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    vehicleYear: z.coerce.number().int().min(1900).max(2100),
    vehicleMake: z.string().min(1, "Make is required"),
    vehicleModel: z.string().min(1, "Model is required"),
    vehicleVin: z.string().optional(),
    vehicleDriveType: z.string().optional(),
    vehicleEngineType: z.string().optional(),
    vehicleLicensePlate: z.string().optional(),
    vehicleColor: z.string().optional(),
    categoryId: z.string().optional(),
    odometer: z.coerce.number().int().min(0).optional(),
    arrivalType: z.enum(["WAITING", "DROP_OFF", "TOWED_IN"]).optional(),
    laborRateId: z.string().optional(),
    marketingSourceId: z.string().optional(),
  });

  const data = customerAndWorkOrderSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    customerType: formData.get("customerType") || undefined,
    businessName: formData.get("businessName") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || "",
    address: formData.get("address") || undefined,
    sourceId: formData.get("sourceId") || undefined,
    birthday: formData.get("birthday") || undefined,
    vehicleYear: formData.get("vehicleYear"),
    vehicleMake: formData.get("vehicleMake"),
    vehicleModel: formData.get("vehicleModel"),
    vehicleVin: formData.get("vehicleVin") || undefined,
    vehicleDriveType: formData.get("vehicleDriveType") || undefined,
    vehicleEngineType: formData.get("vehicleEngineType") || undefined,
    vehicleLicensePlate: formData.get("vehicleLicensePlate") || undefined,
    vehicleColor: formData.get("vehicleColor") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    odometer: formData.get("odometer") || undefined,
    arrivalType: formData.get("arrivalType") || undefined,
    laborRateId: formData.get("laborRateId") || undefined,
    marketingSourceId: formData.get("marketingSourceId") || undefined,
  });

  const workOrder = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        customerType: data.customerType,
        businessName: data.businessName || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        sourceId: data.sourceId || null,
        birthday: data.birthday ?? null,
      },
    });

    return tx.workOrder.create({
      data: {
        customer: { connect: { id: customer.id } },
        vehicle: {
          create: {
            year: data.vehicleYear,
            make: data.vehicleMake,
            model: data.vehicleModel,
            vin: data.vehicleVin || null,
            driveType: data.vehicleDriveType || null,
            engineType: data.vehicleEngineType || null,
            licensePlate: data.vehicleLicensePlate || null,
            color: data.vehicleColor || null,
            customer: { connect: { id: customer.id } },
          },
        },
        category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
        description,
        odometer: data.odometer ?? null,
        arrivalType: data.arrivalType,
        laborRate: data.laborRateId ? { connect: { id: data.laborRateId } } : undefined,
        marketingSource: data.marketingSourceId ? { connect: { id: data.marketingSourceId } } : undefined,
      },
    });
  });

  revalidatePath("/customers");
  revalidatePath("/work-orders");
  revalidatePath("/job-board");
  redirect(`/work-orders/${workOrder.id}`);
}

const createSchema = z
  .object({
    customerId: z.string().min(1),
    vehicleId: z.string().min(1),
    vehicleYear: z.coerce.number().int().min(1900).max(2100).optional(),
    vehicleMake: z.string().min(1).optional(),
    vehicleModel: z.string().min(1).optional(),
    vehicleVin: z.string().optional(),
    vehicleDriveType: z.string().optional(),
    vehicleEngineType: z.string().optional(),
    vehicleLicensePlate: z.string().optional(),
    vehicleColor: z.string().optional(),
    categoryId: z.string().optional(),
    odometer: z.coerce.number().int().min(0).optional(),
    arrivalType: z.enum(["WAITING", "DROP_OFF", "TOWED_IN"]).optional(),
    laborRateId: z.string().optional(),
    marketingSourceId: z.string().optional(),
  })
  .refine(
    (data) => data.vehicleId !== NEW_VEHICLE_VALUE || (data.vehicleYear && data.vehicleMake && data.vehicleModel),
    { message: "Year, make, and model are required for a new vehicle", path: ["vehicleMake"] }
  );

export async function createWorkOrder(formData: FormData) {
  const concerns = formData
    .getAll("concerns")
    .map((value) => value.toString().trim())
    .filter(Boolean);
  const description = z.string().min(1, "At least one concern is required").parse(concerns.join("\n"));

  const data = createSchema.parse({
    customerId: formData.get("customerId"),
    vehicleId: formData.get("vehicleId"),
    vehicleYear: formData.get("vehicleYear") || undefined,
    vehicleMake: formData.get("vehicleMake") || undefined,
    vehicleModel: formData.get("vehicleModel") || undefined,
    vehicleVin: formData.get("vehicleVin") || undefined,
    vehicleDriveType: formData.get("vehicleDriveType") || undefined,
    vehicleEngineType: formData.get("vehicleEngineType") || undefined,
    vehicleLicensePlate: formData.get("vehicleLicensePlate") || undefined,
    vehicleColor: formData.get("vehicleColor") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    odometer: formData.get("odometer") || undefined,
    arrivalType: formData.get("arrivalType") || undefined,
    laborRateId: formData.get("laborRateId") || undefined,
    marketingSourceId: formData.get("marketingSourceId") || undefined,
  });

  const isNewVehicle = data.vehicleId === NEW_VEHICLE_VALUE;

  const workOrder = await prisma.workOrder.create({
    data: {
      customer: { connect: { id: data.customerId } },
      vehicle: isNewVehicle
        ? {
            create: {
              year: data.vehicleYear!,
              make: data.vehicleMake!,
              model: data.vehicleModel!,
              vin: data.vehicleVin || null,
              driveType: data.vehicleDriveType || null,
            engineType: data.vehicleEngineType || null,
            licensePlate: data.vehicleLicensePlate || null,
            color: data.vehicleColor || null,
              customer: { connect: { id: data.customerId } },
            },
          }
        : { connect: { id: data.vehicleId } },
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      description,
      odometer: data.odometer ?? null,
      arrivalType: data.arrivalType,
      laborRate: data.laborRateId ? { connect: { id: data.laborRateId } } : undefined,
      marketingSource: data.marketingSourceId ? { connect: { id: data.marketingSourceId } } : undefined,
    },
  });

  revalidatePath("/work-orders");
  revalidatePath("/job-board");
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
