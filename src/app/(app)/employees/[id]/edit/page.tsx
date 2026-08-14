import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEmployee } from "../../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({ params }: PageProps<"/employees/[id]/edit">) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit employee</h1>
      <form action={updateEmployee} className="space-y-4">
        <input type="hidden" name="id" value={employee.id} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required defaultValue={employee.firstName} />
          <Field name="lastName" label="Last name" required defaultValue={employee.lastName} />
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>
            Role
          </label>
          <select id="role" name="role" className={inputClass} defaultValue={employee.role}>
            <option value="TECHNICIAN">Technician</option>
            <option value="ADVISOR">Advisor</option>
            <option value="MANAGER">Manager</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="active" defaultChecked={employee.active} />
          Active
        </label>
        <p className="text-xs text-zinc-500">
          Inactive employees are hidden from the Tech Board and can&apos;t be assigned new jobs.
        </p>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
