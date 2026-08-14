"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["TECHNICIAN", "ADVISOR", "MANAGER", "OTHER"]),
});

export async function createEmployee(formData: FormData) {
  const data = employeeSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
  });

  await prisma.employee.create({ data });

  revalidatePath("/employees");
  redirect("/employees");
}

const updateEmployeeSchema = employeeSchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateEmployee(formData: FormData) {
  const data = updateEmployeeSchema.parse({
    id: formData.get("id"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    active: formData.get("active") === "on",
  });

  await prisma.employee.update({
    where: { id: data.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      active: data.active,
    },
  });

  revalidatePath("/employees");
  revalidatePath("/tech-board");
  redirect("/employees");
}
