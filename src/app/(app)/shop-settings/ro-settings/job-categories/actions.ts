"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const jobCategorySchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
});

export async function createJobCategory(formData: FormData) {
  const data = jobCategorySchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
  });

  await prisma.jobCategory.create({ data });

  revalidatePath("/shop-settings/ro-settings/job-categories");
  redirect("/shop-settings/ro-settings/job-categories");
}

const updateJobCategorySchema = jobCategorySchema.extend({
  id: z.string().min(1),
  active: z.coerce.boolean(),
});

export async function updateJobCategory(formData: FormData) {
  const data = updateJobCategorySchema.parse({
    id: formData.get("id"),
    code: formData.get("code"),
    name: formData.get("name"),
    active: formData.get("active") === "on",
  });

  await prisma.jobCategory.update({
    where: { id: data.id },
    data: { code: data.code, name: data.name, active: data.active },
  });

  revalidatePath("/shop-settings/ro-settings/job-categories");
  redirect("/shop-settings/ro-settings/job-categories");
}
