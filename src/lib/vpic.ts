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

  return { year, make, model, driveType };
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
    return [...names].sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}
