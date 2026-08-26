"use client";

import { useEffect, useState } from "react";
import { inputClass, labelClass } from "@/components/form";
import { NEW_VEHICLE_VALUE } from "@/lib/vehicle";
import { VehicleLookupFields } from "@/components/vehicle-lookup-fields";
import { getKnownEngineTypesAction } from "@/lib/vehicle-lookup-actions";

const OTHER_VALUE = "__other__";

type VehicleOption = { id: string; year: number; make: string; model: string; engineType: string | null };

export function VehicleSelectFields({ vehicles }: { vehicles: VehicleOption[] }) {
  const [vehicleId, setVehicleId] = useState(vehicles.length === 0 ? NEW_VEHICLE_VALUE : "");
  const isNew = vehicleId === NEW_VEHICLE_VALUE;
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const [engineType, setEngineType] = useState("");
  const [engineOptions, setEngineOptions] = useState<string[]>([]);
  const [engineMode, setEngineMode] = useState<"select" | "manual">("select");

  useEffect(() => {
    if (!selectedVehicle) return;
    setEngineType(selectedVehicle.engineType ?? "");
    setEngineMode("select");
    setEngineOptions([]);
    let cancelled = false;
    getKnownEngineTypesAction(selectedVehicle.make, selectedVehicle.model).then((result) => {
      if (cancelled) return;
      setEngineOptions(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle?.id]);

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
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
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

      {selectedVehicle && (
        <div>
          <label htmlFor="vehicleEngineType" className={labelClass}>
            Engine
          </label>
          {engineMode === "select" ? (
            <select
              id="vehicleEngineType"
              name="vehicleEngineType"
              className={inputClass}
              value={engineType}
              onChange={(e) => {
                if (e.target.value === OTHER_VALUE) {
                  setEngineMode("manual");
                  setEngineType("");
                } else {
                  setEngineType(e.target.value);
                }
              }}
            >
              <option value="">Not specified</option>
              {engineOptions.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other / type new</option>
            </select>
          ) : (
            <input
              id="vehicleEngineType"
              name="vehicleEngineType"
              className={inputClass}
              placeholder="e.g. 3.5L V6 Gasoline"
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  );
}
