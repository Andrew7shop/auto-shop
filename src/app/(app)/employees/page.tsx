import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: [{ active: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Employees</h1>
        <Link
          href="/employees/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New employee
        </Link>
      </div>

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {employees.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">No employees yet.</p>
        )}
        {employees.map((employee) => (
          <Link
            key={employee.id}
            href={`/employees/${employee.id}/edit`}
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {employee.firstName} {employee.lastName}
                {!employee.active && (
                  <span className="ml-2 text-xs font-normal text-zinc-500">(Inactive)</span>
                )}
              </p>
              <p className="text-xs text-zinc-500">{employee.role.replaceAll("_", " ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
