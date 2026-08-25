"use client";

import { useEffect, useState, useTransition } from "react";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/form";
import {
  decodeVinAction,
  getVehicleMakesAction,
  getVehicleModelsAction,
  getKnownEngineTypesAction,
} from "@/lib/vehicle-lookup-actions";

const OTHER_VALUE = "__other__";
const MIN_YEAR = 1950;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR + 1 - i);
const DRIVE_TYPES = ["FWD", "RWD", "AWD", "4WD"];

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}

// NHTSA returns drive type as e.g. "4WD/4-Wheel Drive/4x4" — take the short code before the slash.
function normalizeDriveType(raw: string): string {
  return raw.split("/")[0].trim().toUpperCase();
}

export function VehicleLookupFields({ namePrefix = "" }: { namePrefix?: string }) {
  const fieldName = (base: string) => (namePrefix ? `${namePrefix}${capitalize(base)}` : base);

  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [driveType, setDriveType] = useState("");
  const [driveTypeMode, setDriveTypeMode] = useState<"select" | "manual">("select");
  const [engineType, setEngineType] = useState("");
  const [engineOptions, setEngineOptions] = useState<string[]>([]);
  const [engineMode, setEngineMode] = useState<"select" | "manual">("select");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");

  const [makes, setMakes] = useState<string[] | null>(null);
  const [makeMode, setMakeMode] = useState<"select" | "manual">("select");
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [modelMode, setModelMode] = useState<"select" | "manual">("select");

  const [decodeStatus, setDecodeStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [decoded, setDecoded] = useState(false);
  const [isDecoding, startDecode] = useTransition();

  useEffect(() => {
    getVehicleMakesAction().then((result) => {
      setMakes(result);
      if (result.length === 0) setMakeMode("manual");
    });
  }, []);

  useEffect(() => {
    if (decoded || makeMode !== "select" || !make || !year) return;
    let cancelled = false;
    getVehicleModelsAction(make, Number(year)).then((result) => {
      if (cancelled) return;
      setModelOptions(result);
      setModelMode(result.length > 0 ? "select" : "manual");
    });
    return () => {
      cancelled = true;
    };
  }, [make, year, makeMode, decoded]);

  useEffect(() => {
    if (decoded || !make || !model) return;
    let cancelled = false;
    getKnownEngineTypesAction(make, model).then((result) => {
      if (cancelled) return;
      setEngineOptions(result);
      setEngineMode("select");
    });
    return () => {
      cancelled = true;
    };
  }, [make, model, decoded]);

  function handleDecode() {
    setDecodeStatus(null);
    startDecode(async () => {
      const result = await decodeVinAction(vin);
      if ("error" in result) {
        setDecodeStatus({ type: "error", message: result.error });
        return;
      }
      setYear(String(result.year));
      setMake(result.make);
      setModel(result.model);
      setMakeMode("manual");
      setModelMode("manual");
      setDecoded(true);

      const details: string[] = [];
      if (result.driveType) {
        const normalized = normalizeDriveType(result.driveType);
        setDriveType(normalized);
        setDriveTypeMode(DRIVE_TYPES.includes(normalized) ? "select" : "manual");
        details.push(normalized);
      } else {
        setDriveType("");
        setDriveTypeMode("select");
      }
      setEngineMode("manual");
      if (result.engineType) {
        setEngineType(result.engineType);
        details.push(result.engineType);
      } else {
        setEngineType("");
      }
      const detailMessage = details.length > 0 ? ` (${details.join(", ")})` : "";
      setDecodeStatus({
        type: "success",
        message: `Decoded: ${result.year} ${result.make} ${result.model}${detailMessage}`,
      });
    });
  }

  function handleReset() {
    setDecoded(false);
    setDecodeStatus(null);
    setYear("");
    setMake("");
    setModel("");
    setModelOptions([]);
    setModelMode("select");
    setMakeMode(makes && makes.length > 0 ? "select" : "manual");
    setDriveType("");
    setDriveTypeMode("select");
    setEngineType("");
    setEngineOptions([]);
    setEngineMode("select");
  }

  const yearOptions = year && !YEARS.includes(Number(year)) ? [Number(year), ...YEARS] : YEARS;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={fieldName("vin")} className={labelClass}>
          VIN
        </label>
        <div className="flex gap-2">
          <input
            id={fieldName("vin")}
            name={fieldName("vin")}
            className={inputClass}
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            maxLength={17}
          />
          <button
            type="button"
            className={`${secondaryButtonClass} shrink-0`}
            onClick={handleDecode}
            disabled={isDecoding || !vin.trim()}
          >
            {isDecoding ? "Decoding…" : "Decode VIN"}
          </button>
        </div>
        {decodeStatus && (
          <p className={`mt-1 text-xs ${decodeStatus.type === "success" ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
            {decodeStatus.message}
            {decodeStatus.type === "success" && (
              <>
                {" · "}
                <button type="button" onClick={handleReset} className="underline">
                  Not right? Reset
                </button>
              </>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor={fieldName("year")} className={labelClass}>
            Year <span className="text-red-500">*</span>
          </label>
          <select
            id={fieldName("year")}
            name={fieldName("year")}
            required
            className={inputClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="" disabled>
              Select year
            </option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={fieldName("make")} className={labelClass}>
            Make <span className="text-red-500">*</span>
          </label>
          {makeMode === "select" ? (
            <select
              id={fieldName("make")}
              name={fieldName("make")}
              required
              className={inputClass}
              value={make}
              onChange={(e) => {
                if (e.target.value === OTHER_VALUE) {
                  setMakeMode("manual");
                  setMake("");
                } else {
                  setMake(e.target.value);
                }
                setModel("");
              }}
            >
              <option value="" disabled>
                {makes === null ? "Loading makes…" : "Select make"}
              </option>
              {(makes ?? []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other / not listed</option>
            </select>
          ) : (
            <input
              id={fieldName("make")}
              name={fieldName("make")}
              required
              className={inputClass}
              value={make}
              onChange={(e) => setMake(e.target.value)}
            />
          )}
        </div>

        <div>
          <label htmlFor={fieldName("model")} className={labelClass}>
            Model <span className="text-red-500">*</span>
          </label>
          {modelMode === "select" ? (
            <select
              id={fieldName("model")}
              name={fieldName("model")}
              required
              className={inputClass}
              value={model}
              onChange={(e) => {
                if (e.target.value === OTHER_VALUE) {
                  setModelMode("manual");
                  setModel("");
                } else {
                  setModel(e.target.value);
                }
              }}
              disabled={!year || !make}
            >
              <option value="" disabled>
                {!year || !make ? "Select year & make first" : "Select model"}
              </option>
              {modelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other / not listed</option>
            </select>
          ) : (
            <input
              id={fieldName("model")}
              name={fieldName("model")}
              required
              className={inputClass}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          )}
        </div>

        <div>
          <label htmlFor={fieldName("driveType")} className={labelClass}>
            Drivetrain
          </label>
          {driveTypeMode === "select" ? (
            <select
              id={fieldName("driveType")}
              name={fieldName("driveType")}
              className={inputClass}
              value={driveType}
              onChange={(e) => {
                if (e.target.value === OTHER_VALUE) {
                  setDriveTypeMode("manual");
                  setDriveType("");
                } else {
                  setDriveType(e.target.value);
                }
              }}
            >
              <option value="">Not specified</option>
              {DRIVE_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other</option>
            </select>
          ) : (
            <input
              id={fieldName("driveType")}
              name={fieldName("driveType")}
              className={inputClass}
              value={driveType}
              onChange={(e) => setDriveType(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={fieldName("engineType")} className={labelClass}>
            Engine
          </label>
          {engineMode === "select" ? (
            <select
              id={fieldName("engineType")}
              name={fieldName("engineType")}
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
              disabled={!make || !model}
            >
              <option value="">Select from vehicles on file</option>
              {engineOptions.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other / type new</option>
            </select>
          ) : (
            <input
              id={fieldName("engineType")}
              name={fieldName("engineType")}
              className={inputClass}
              placeholder="e.g. 3.5L V6 Gasoline"
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
            />
          )}
        </div>

        <div>
          <label htmlFor={fieldName("licensePlate")} className={labelClass}>
            License plate
          </label>
          <input
            id={fieldName("licensePlate")}
            name={fieldName("licensePlate")}
            className={inputClass}
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={fieldName("color")} className={labelClass}>
            Color
          </label>
          <input
            id={fieldName("color")}
            name={fieldName("color")}
            className={inputClass}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
