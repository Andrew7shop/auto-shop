// fueleconomy.gov (US DOE/EPA) exposes a free, no-key catalog of every trim/engine
// combination sold in the US since 1984 — unlike vPIC (a VIN decoder with no
// "engine options for a model" endpoint), this is a real trim-catalog lookup, so it
// can populate an Engine dropdown for any year/make/model even with no VIN and no
// prior vehicle on file.
const FE_BASE = "https://www.fueleconomy.gov/ws/rest/vehicle";

interface FeMenuItem {
  text: string;
  value: string;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchMenu(path: string): Promise<FeMenuItem[]> {
  try {
    const res = await fetch(`${FE_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: FeMenuItem[] = [];
    const pattern = /<menuItem>\s*<text>([\s\S]*?)<\/text>\s*<value>([\s\S]*?)<\/value>\s*<\/menuItem>/g;
    for (const match of xml.matchAll(pattern)) {
      items.push({ text: decodeXmlEntities(match[1]), value: decodeXmlEntities(match[2]) });
    }
    return items;
  } catch {
    return [];
  }
}

interface FeVehicleDetail {
  cylinders: string;
  displ: string;
  fuelType1: string;
  tCharger: string;
  sCharger: string;
  evMotor: string;
  atvType: string;
}

async function fetchVehicleDetail(id: string): Promise<FeVehicleDetail | null> {
  try {
    const res = await fetch(`${FE_BASE}/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const xml = await res.text();
    const field = (tag: string) => decodeXmlEntities(xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "");
    return {
      cylinders: field("cylinders"),
      displ: field("displ"),
      fuelType1: field("fuelType1"),
      tCharger: field("tCharger"),
      sCharger: field("sCharger"),
      evMotor: field("evMotor"),
      atvType: field("atvType"),
    };
  } catch {
    return null;
  }
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeFuelLabel(raw: string): string | undefined {
  const fuel = raw.trim();
  if (!fuel) return undefined;
  if (/diesel/i.test(fuel)) return "Diesel";
  if (/electricity/i.test(fuel)) return "Electric";
  if (/e85/i.test(fuel)) return "Flex-Fuel";
  if (/gasoline/i.test(fuel)) return "Gasoline";
  return fuel;
}

function describeEngine(detail: FeVehicleDetail): string | undefined {
  // fuelType1 is what actually distinguishes a full EV from a hybrid — hybrids still
  // report "Regular Gasoline" here and populate evMotor too (for their battery/motor),
  // so evMotor's presence alone isn't a reliable "no combustion engine" signal.
  if (/electricity/i.test(detail.fuelType1)) {
    return "Electric";
  }

  const parts: string[] = [];
  const displacement = Number(detail.displ);
  if (Number.isFinite(displacement) && displacement > 0) parts.push(`${displacement.toFixed(1)}L`);

  const cylinders = detail.cylinders.trim();
  if (cylinders) parts.push(`${cylinders}-cyl`);

  if (detail.tCharger.trim()) parts.push("Turbo");
  if (detail.sCharger.trim()) parts.push("Supercharged");

  const fuel = normalizeFuelLabel(detail.fuelType1);
  if (fuel) parts.push(fuel);

  const atvType = detail.atvType.trim();
  if (atvType && atvType !== "EV") parts.push(atvType);

  return parts.length > 0 ? parts.join(" ") : undefined;
}

const modelListCache = new Map<string, { models: FeMenuItem[]; fetchedAt: number }>();
const engineOptionsCache = new Map<string, { engines: string[]; fetchedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function getModelListForYearMake(year: number, make: string): Promise<FeMenuItem[]> {
  const key = `${year}|${normalize(make)}`;
  const cached = modelListCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.models;

  const models = await fetchMenu(`/menu/model?year=${year}&make=${encodeURIComponent(make)}`);
  modelListCache.set(key, { models, fetchedAt: Date.now() });
  return models;
}

// Real trim names on fueleconomy.gov rarely match our stored make/model verbatim —
// they append body style/drivetrain suffixes ours doesn't have (our "F-150" vs. their
// "F150 Pickup 4WD", our "Civic" vs. their "Civic 4Dr") — so match by normalized
// prefix, fe-name-is-more-specific only. Matching the other direction too would let a
// specific trim like "Accord Hybrid" pull in unrelated "Accord" gasoline engines, since
// "accordhybrid" also starts with "accord".
function matchesModel(feModelName: string, ourModel: string): boolean {
  const feNorm = normalize(feModelName);
  const ourNorm = normalize(ourModel);
  if (!feNorm || !ourNorm) return false;
  return feNorm.startsWith(ourNorm);
}

const MAX_OPTION_IDS = 25;

export async function getFuelEconomyEngineOptions(year: number, make: string, model: string): Promise<string[]> {
  const trimmedMake = make.trim();
  const trimmedModel = model.trim();
  if (!trimmedMake || !trimmedModel || !Number.isInteger(year)) return [];

  const key = `${year}|${normalize(trimmedMake)}|${normalize(trimmedModel)}`;
  const cached = engineOptionsCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.engines;

  const modelList = await getModelListForYearMake(year, trimmedMake);
  const matchedModelNames = modelList
    .map((item) => item.value)
    .filter((name) => matchesModel(name, trimmedModel));
  // The model name itself is sometimes already the exact trim (seen with single-trim
  // EVs), so it's always worth trying directly even if it wasn't in the year/make list.
  if (!matchedModelNames.some((name) => normalize(name) === normalize(trimmedModel))) {
    matchedModelNames.push(trimmedModel);
  }

  const optionLists = await Promise.all(
    matchedModelNames.map((name) => fetchMenu(`/menu/options?year=${year}&make=${encodeURIComponent(trimmedMake)}&model=${encodeURIComponent(name)}`)),
  );

  const optionIds = new Set<string>();
  for (const options of optionLists) {
    for (const option of options) optionIds.add(option.value);
    if (optionIds.size >= MAX_OPTION_IDS) break;
  }

  const details = await Promise.all([...optionIds].slice(0, MAX_OPTION_IDS).map((id) => fetchVehicleDetail(id)));

  const engines = new Set<string>();
  for (const detail of details) {
    if (!detail) continue;
    const description = describeEngine(detail);
    if (description) engines.add(description);
  }

  const result = [...engines].sort((a, b) => a.localeCompare(b));
  engineOptionsCache.set(key, { engines: result, fetchedAt: Date.now() });
  return result;
}
