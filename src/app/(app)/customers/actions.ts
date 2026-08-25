"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCustomerSettings, buildCustomerProfileSchema } from "@/lib/customer-settings";

async function buildCustomerSchema() {
  const settings = await getCustomerSettings();
  return buildCustomerProfileSchema(settings).extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    notes: z.string().optional(),
  });
}

function readCustomerFormData(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    customerType: formData.get("customerType") || undefined,
    businessName: formData.get("businessName") || undefined,
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    sourceId: formData.get("sourceId") || undefined,
    birthday: formData.get("birthday") || undefined,
    notes: formData.get("notes") || undefined,
  };
}

export async function createCustomer(formData: FormData) {
  const customerSchema = await buildCustomerSchema();
  const data = customerSchema.parse(readCustomerFormData(formData));

  const customer = await prisma.customer.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      customerType: data.customerType,
      businessName: data.businessName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      sourceId: data.sourceId || null,
      birthday: data.birthday ?? null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

const updateCustomerIdSchema = z.object({
  id: z.string().min(1),
});

export async function updateCustomer(formData: FormData) {
  const { id } = updateCustomerIdSchema.parse({ id: formData.get("id") });
  const customerSchema = await buildCustomerSchema();
  const data = customerSchema.parse(readCustomerFormData(formData));

  await prisma.customer.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      customerType: data.customerType,
      businessName: data.businessName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      sourceId: data.sourceId || null,
      birthday: data.birthday ?? null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));

  const [workOrderCount, invoiceCount] = await Promise.all([
    prisma.workOrder.count({ where: { customerId: id } }),
    prisma.invoice.count({ where: { customerId: id } }),
  ]);

  if (workOrderCount > 0 || invoiceCount > 0) {
    redirect(`/customers/${id}?error=has-records`);
  }

  await prisma.customer.delete({ where: { id } });

  revalidatePath("/customers");
  redirect("/customers");
}

const vehicleSchema = z.object({
  customerId: z.string().min(1),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(1900).max(2100),
  vin: z.string().optional(),
  driveType: z.string().optional(),
  engineType: z.string().optional(),
  licensePlate: z.string().optional(),
  color: z.string().optional(),
  mileage: z.coerce.number().int().min(0).optional(),
});

export async function addVehicle(formData: FormData) {
  const data = vehicleSchema.parse({
    customerId: formData.get("customerId"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    vin: formData.get("vin") || undefined,
    driveType: formData.get("driveType") || undefined,
    engineType: formData.get("engineType") || undefined,
    licensePlate: formData.get("licensePlate") || undefined,
    color: formData.get("color") || undefined,
    mileage: formData.get("mileage") || undefined,
  });

  await prisma.vehicle.create({
    data: {
      customerId: data.customerId,
      make: data.make,
      model: data.model,
      year: data.year,
      vin: data.vin || null,
      driveType: data.driveType || null,
      engineType: data.engineType || null,
      licensePlate: data.licensePlate || null,
      color: data.color || null,
      mileage: data.mileage ?? null,
    },
  });

  revalidatePath(`/customers/${data.customerId}`);
}

const updateVehicleSchema = vehicleSchema.extend({
  id: z.string().min(1),
});

export async function updateVehicle(formData: FormData) {
  const data = updateVehicleSchema.parse({
    id: formData.get("id"),
    customerId: formData.get("customerId"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    vin: formData.get("vin") || undefined,
    driveType: formData.get("driveType") || undefined,
    engineType: formData.get("engineType") || undefined,
    licensePlate: formData.get("licensePlate") || undefined,
    color: formData.get("color") || undefined,
    mileage: formData.get("mileage") || undefined,
  });

  await prisma.vehicle.update({
    where: { id: data.id },
    data: {
      make: data.make,
      model: data.model,
      year: data.year,
      vin: data.vin || null,
      driveType: data.driveType || null,
      engineType: data.engineType || null,
      licensePlate: data.licensePlate || null,
      color: data.color || null,
      mileage: data.mileage ?? null,
    },
  });

  revalidatePath(`/customers/${data.customerId}`);
}

export async function deleteVehicle(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  const customerId = z.string().min(1).parse(formData.get("customerId"));

  const workOrderCount = await prisma.workOrder.count({ where: { vehicleId: id } });

  if (workOrderCount > 0) {
    redirect(`/customers/${customerId}?error=vehicle-has-work-orders`);
  }

  await prisma.vehicle.delete({ where: { id } });

  revalidatePath(`/customers/${customerId}`);
}
