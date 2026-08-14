import Link from "next/link";
import { inputClass, secondaryButtonClass } from "@/components/form";

export function SearchFilterBar({
  q,
  placeholder,
  statusOptions,
  statusValue,
  basePath,
}: {
  q?: string;
  placeholder: string;
  statusOptions?: { value: string; label: string }[];
  statusValue?: string;
  basePath: string;
}) {
  const hasFilters = Boolean(q) || Boolean(statusValue);

  return (
    <form method="get" className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className={`${inputClass} max-w-xs`}
      />
      {statusOptions && (
        <select name="status" defaultValue={statusValue ?? ""} className={`${inputClass} w-auto`}>
          <option value="">All statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      <button type="submit" className={secondaryButtonClass}>
        Search
      </button>
      {hasFilters && (
        <Link href={basePath} className="text-sm text-zinc-500 hover:underline">
          Clear
        </Link>
      )}
    </form>
  );
}
