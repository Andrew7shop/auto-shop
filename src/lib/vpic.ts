const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

// Vehicle types that cover what a repair shop actually sees; the unfiltered
// "GetAllMakes" list is ~12k entries deep with trailer/incomplete-vehicle noise.
const MAKE_VEHICLE_TYPES = ["car", "truck", "multipurpose passenger vehicle (mpv)"];

let makesCache: { makes: string[]; fetchedAt: number } | null = null;
const MAKES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface DecodedVin {
  year: number;
  make: string;
  model: string;
  driveType?: string;
  engineType?: string;
}

const ENGINE_CONFIG_SHORTHAND: Record<string, string> = {
  "In-Line": "I",
  "V-Shaped": "V",
  "W Shaped": "W",
  "Horizontally Opposed (boxer)": "Flat",
  Rotary: "Rotary",
};

// Composes a shop-readable summary (e.g. "3.5L V6 Gasoline", "Electric") from the
// separate displacement/cylinder/configuration/fuel fields vPIC returns.
function buildEngineType(result: Record<string, string>): string | undefined {
  const parts: string[] = [];

  const displacement = Number(result.DisplacementL);
  if (Number.isFinite(displacement) && displacement > 0) {
    parts.push(`${displacement.toFixed(1)}L`);
  }

  const cylinders = result.EngineCylinders?.trim();
  const config = result.EngineConfiguration?.trim();
  const shorthand = config ? ENGINE_CONFIG_SHORTHAND[config] : undefined;
  if (shorthand && cylinders) {
    parts.push(`${shorthand}${cylinders}`);
  } else if (cylinders) {
    parts.push(`${cylinders}-cyl`);
  }

  const fuel = result.FuelTypePrimary?.trim();
  if (fuel) parts.push(fuel);

  return parts.length > 0 ? parts.join(" ") : undefined;
}

export async function decodeVin(vin: string): Promise<DecodedVin | { error: string }> {
  const trimmed = vin.trim();
  if (!trimmed) return { error: "Enter a VIN first" };

  let json: unknown;
  try {
    const res = await fetch(`${VPIC_BASE}/DecodeVinValues/${encodeURIComponent(trimmed)}?format=json`, {
      cache: "no-store",
    });
    if (!res.ok) return { error: "VIN lookup service is unavailable right now" };
    json = await res.json();
  } catch {
    return { error: "VIN lookup service is unavailable right now" };
  }

  const result = (json as { Results?: Array<Record<string, string>> }).Results?.[0];
  const make = result?.Make?.trim();
  const model = result?.Model?.trim();
  const year = Number(result?.ModelYear);

  if (!make || !model || !Number.isInteger(year)) {
    const errorText = result?.ErrorText?.trim();
    return { error: errorText || "Couldn't decode that VIN" };
  }

  const driveType = result?.DriveType?.trim() || undefined;
  const engineType = result ? buildEngineType(result) : undefined;

  return { year, make, model, driveType, engineType };
}

export async function getVehicleMakes(): Promise<string[]> {
  if (makesCache && Date.now() - makesCache.fetchedAt < MAKES_CACHE_TTL_MS) {
    return makesCache.makes;
  }

  try {
    const responses = await Promise.all(
      MAKE_VEHICLE_TYPES.map((type) =>
        fetch(`${VPIC_BASE}/GetMakesForVehicleType/${encodeURIComponent(type)}?format=json`).then((res) =>
          res.ok ? res.json() : { Results: [] },
        ),
      ),
    );

    const names = new Set<string>();
    for (const json of responses as Array<{ Results?: Array<{ MakeName?: string }> }>) {
      for (const row of json.Results ?? []) {
        if (row.MakeName) names.add(row.MakeName.trim());
      }
    }

    const makes = [...names].sort((a, b) => a.localeCompare(b));
    if (makes.length > 0) makesCache = { makes, fetchedAt: Date.now() };
    return makes;
  } catch {
    return [];
  }
}

// NHTSA reports GM's full-size pickups under one generic name regardless of tonnage —
// "Silverado"/"Sierra" cover the 1500, 2500HD, and 3500HD alike, unlike Ford (F-150 vs.
// F-250 vs. F-350) or Ram (1500 vs. 2500 vs. 3500), which are already distinct model
// names in vPIC. Expanding the generic name into its three real trim-series here is what
// lets the Model dropdown — and in turn the engine catalog lookup keyed off it — tell a
// 1500 apart from an HD.
const GM_TRUCK_TONNAGE_VARIANTS: Record<string, string[]> = {
  Silverado: ["Silverado 1500", "Silverado 2500HD", "Silverado 3500HD"],
  Sierra: ["Sierra 1500", "Sierra 2500HD", "Sierra 3500HD"],
};

export async function getVehicleModels(make: string, year: number): Promise<string[]> {
  const trimmedMake = make.trim();
  if (!trimmedMake || !Number.isInteger(year)) return [];

  try {
    const res = await fetch(
      `${VPIC_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(trimmedMake)}/modelyear/${year}?format=json`,
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { Results?: Array<{ Model_Name?: string }> };
    const names = new Set<string>();
    for (const row of json.Results ?? []) {
      if (row.Model_Name) names.add(row.Model_Name.trim());
    }
    for (const [generic, variants] of Object.entries(GM_TRUCK_TONNAGE_VARIANTS)) {
      if (names.delete(generic)) {
        for (const variant of variants) names.add(variant);
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
