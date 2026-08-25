"use client";

import { useState } from "react";
import { inputClass, labelClass } from "@/components/form";
import { NEW_VEHICLE_VALUE } from "@/lib/vehicle";
import { VehicleLookupFields } from "@/components/vehicle-lookup-fields";

export function VehicleSelectFields({
  vehicles,
}: {
  vehicles: { id: string; year: number; make: string; model: string }[];
}) {
  const [isNew, setIsNew] = useState(vehicles.length === 0);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="vehicleId" className={labelClass}>
          Vehicle <span className="text-red-500">*</span>
        </label>
        <select
          id="vehicleId"
          name="vehicleId"
          required
          className={inputClass}
          defaultValue={vehicles.length === 0 ? NEW_VEHICLE_VALUE : ""}
          onChange={(e) => setIsNew(e.target.value === NEW_VEHICLE_VALUE)}
        >
          {vehicles.length > 0 && (
            <option value="" disabled>
              Select a vehicle
            </option>
          )}
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.year} {v.make} {v.model}
            </option>
          ))}
          <option value={NEW_VEHICLE_VALUE}>+ Add a new vehicle</option>
        </select>
      </div>

      {isNew && (
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <VehicleLookupFields namePrefix="vehicle" />
        </div>
      )}
    </div>
  );
}
