import { Field, inputClass, labelClass } from "@/components/form";

type CustomerRequirements = {
  requireCustomerType: boolean;
  requireBusinessName: boolean;
  requireAddress: boolean;
  requireSource: boolean;
  requireBirthday: boolean;
};

export function CustomerProfileFields({
  settings,
  sources,
  defaultValues,
}: {
  settings: CustomerRequirements;
  sources: { id: string; name: string }[];
  defaultValues?: {
    customerType?: string;
    businessName?: string;
    address?: string;
    sourceId?: string;
    birthday?: string;
  };
}) {
  return (
    <>
      <div>
        <label htmlFor="customerType" className={labelClass}>
          Customer type {settings.requireCustomerType && <span className="text-red-500">*</span>}
        </label>
        <select
          id="customerType"
          name="customerType"
          required={settings.requireCustomerType}
          className={inputClass}
          defaultValue={defaultValues?.customerType ?? (settings.requireCustomerType ? "" : "INDIVIDUAL")}
        >
          {settings.requireCustomerType && !defaultValues?.customerType && (
            <option value="" disabled>
              Select a customer type
            </option>
          )}
          <option value="INDIVIDUAL">Individual</option>
          <option value="BUSINESS">Business</option>
        </select>
      </div>

      <Field
        name="businessName"
        label="Business name"
        required={settings.requireBusinessName}
        defaultValue={defaultValues?.businessName}
      />

      <Field
        name="address"
        label="Address"
        required={settings.requireAddress}
        defaultValue={defaultValues?.address}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sourceId" className={labelClass}>
            Customer source {settings.requireSource && <span className="text-red-500">*</span>}
          </label>
          <select
            id="sourceId"
            name="sourceId"
            required={settings.requireSource}
            className={inputClass}
            defaultValue={defaultValues?.sourceId ?? ""}
          >
            <option value="" disabled={settings.requireSource}>
              {settings.requireSource ? "Select a source" : "Not specified"}
            </option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
        <Field
          name="birthday"
          label="Birthday"
          type="date"
          required={settings.requireBirthday}
          defaultValue={defaultValues?.birthday}
        />
      </div>
    </>
  );
}
