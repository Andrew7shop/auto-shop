import { inputClass, labelClass } from "@/components/form";
import { ConcernLinesFields } from "@/components/concern-lines-fields";

const ARRIVAL_TYPES = [
  { value: "WAITING", label: "Waiting" },
  { value: "DROP_OFF", label: "Drop-off" },
  { value: "TOWED_IN", label: "Towed in" },
];

export function WorkOrderDetailFields({
  jobCategories,
  laborRates,
  marketingSources,
}: {
  jobCategories: { id: string; code: string; name: string }[];
  laborRates: { id: string; name: string; ratePerHour: { toString(): string } }[];
  marketingSources: { id: string; name: string }[];
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="arrivalType" className={labelClass}>
            Arrival
          </label>
          <select id="arrivalType" name="arrivalType" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select arrival type
            </option>
            {ARRIVAL_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="laborRateId" className={labelClass}>
            Labor rate
          </label>
          <select id="laborRateId" name="laborRateId" className={inputClass} defaultValue="">
            <option value="">No labor rate</option>
            {laborRates.map((rate) => (
              <option key={rate.id} value={rate.id}>
                {rate.name} (${rate.ratePerHour.toString()}/hr)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Job category
        </label>
        <select id="categoryId" name="categoryId" className={inputClass} defaultValue="">
          <option value="">No category</option>
          {jobCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className={labelClass}>
          Customer states <span className="text-red-500">*</span>
        </h2>
        <p className="mb-2 text-sm text-zinc-500">Problems the customer describes with the vehicle.</p>
        <ConcernLinesFields />
      </div>

      <div>
        <label htmlFor="marketingSourceId" className={labelClass}>
          Marketing source
        </label>
        <select id="marketingSourceId" name="marketingSourceId" className={inputClass} defaultValue="">
          <option value="">Not specified</option>
          {marketingSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
