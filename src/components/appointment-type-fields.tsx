"use client";

import { useState } from "react";
import { inputClass, labelClass } from "@/components/form";

export function AppointmentTypeFields({
  types,
  defaultTypeId,
  defaultDuration,
}: {
  types: { id: string; name: string; defaultDurationMinutes: number }[];
  defaultTypeId?: string;
  defaultDuration?: number;
}) {
  const [duration, setDuration] = useState(defaultDuration ?? 60);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="appointmentTypeId" className={labelClass}>
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="appointmentTypeId"
          name="appointmentTypeId"
          required
          defaultValue={defaultTypeId ?? ""}
          className={inputClass}
          onChange={(e) => {
            const selected = types.find((t) => t.id === e.target.value);
            if (selected) setDuration(selected.defaultDurationMinutes);
          }}
        >
          <option value="" disabled>
            Select a type
          </option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="durationMinutes" className={labelClass}>
          Duration (minutes)
        </label>
        <input
          id="durationMinutes"
          name="durationMinutes"
          type="number"
          min="15"
          step="15"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className={inputClass}
        />
      </div>
    </div>
  );
}
