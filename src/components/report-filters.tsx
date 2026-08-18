import { inputClass, labelClass, secondaryButtonClass } from "@/components/form";

export function ReportDayFilter({ dateKey }: { dateKey: string }) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3 print:hidden">
      <div>
        <label htmlFor="date" className={labelClass}>
          Date
        </label>
        <input id="date" name="date" type="date" defaultValue={dateKey} className={inputClass} />
      </div>
      <button type="submit" className={secondaryButtonClass}>
        Update
      </button>
    </form>
  );
}

export function ReportDateRangeFilter({ from, to }: { from: string; to: string }) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3 print:hidden">
      <div>
        <label htmlFor="from" className={labelClass}>
          From
        </label>
        <input id="from" name="from" type="date" defaultValue={from} className={inputClass} />
      </div>
      <div>
        <label htmlFor="to" className={labelClass}>
          To
        </label>
        <input id="to" name="to" type="date" defaultValue={to} className={inputClass} />
      </div>
      <button type="submit" className={secondaryButtonClass}>
        Update
      </button>
    </form>
  );
}
