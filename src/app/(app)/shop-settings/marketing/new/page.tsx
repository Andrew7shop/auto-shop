import { createMarketingSource } from "../actions";
import { Field, primaryButtonClass } from "@/components/form";

export default function NewMarketingSourcePage() {
  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New marketing source</h2>
      <form action={createMarketingSource} className="space-y-4">
        <Field name="name" label="Name" required placeholder="e.g. Referral" />
        <button type="submit" className={primaryButtonClass}>
          Create marketing source
        </button>
      </form>
    </div>
  );
}
