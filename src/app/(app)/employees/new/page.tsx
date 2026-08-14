import { createEmployee } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";

export default function NewEmployeePage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New employee</h1>
      <form action={createEmployee} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>
            Role
          </label>
          <select id="role" name="role" className={inputClass} defaultValue="TECHNICIAN">
            <option value="TECHNICIAN">Technician</option>
            <option value="ADVISOR">Advisor</option>
            <option value="MANAGER">Manager</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Create employee
        </button>
      </form>
    </div>
  );
}
