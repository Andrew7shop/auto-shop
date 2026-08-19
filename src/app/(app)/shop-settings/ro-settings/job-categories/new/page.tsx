import { createJobCategory } from "../actions";
import { Field, primaryButtonClass } from "@/components/form";

export default function NewJobCategoryPage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New job category</h2>
      <form action={createJobCategory} className="space-y-4">
        <Field name="code" label="Code" required placeholder="ACC" />
        <Field name="name" label="Name" required placeholder="Accessories" />
        <button type="submit" className={primaryButtonClass}>
          Create job category
        </button>
      </form>
    </div>
  );
}
