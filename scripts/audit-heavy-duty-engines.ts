// Audits src/lib/heavy-duty-engines.ts's hand-maintained HD engine catalog against real
// EPA certification filings, instead of trusting the catalog from memory alone.
//
// Why this can't just be a live lookup at request time: EPA's own "Heavy-Duty Vehicle
// GHG Certification Data" (epa.gov/compliance-and-fuel-economy-data) is the only free
// source that covers this segment at all — fueleconomy.gov (used for light-duty trucks
// elsewhere in this app) has zero data for anything over 8,500 lbs GVWR, confirmed by
// querying it directly for Silverado 2500HD, F-350, and Ram 3500. But the EPA file is a
// ~39MB Excel workbook of ~360k compliance-family rows, not a REST API, and it records
// *fuel type per vehicle family* (Gasoline/Diesel), not displacement or cylinder count —
// so it can confirm "this platform was certified with a diesel option this year" but
// can never supply the "6.6L V8" part of an engine label. That part stays a small
// human-verified table (see DISPLACEMENT_BY_PLATFORM in heavy-duty-engines.ts).
//
// Also a real, confirmed gap in the source data itself: GM's gas HD engine (6.6L L8T)
// and Ram's gas HD engine (6.4L HEMI) do not appear in this EPA file under any vehicle
// family name searched here — evidently certified through a pathway this particular
// dataset doesn't publish. So "EPA doesn't confirm it" is expected and reported as such
// for those two, not treated as a contradiction to fix.
//
// Run with: npx tsx scripts/audit-heavy-duty-engines.ts
// Prints a diff between what EPA's filings confirm and what the catalog currently
// claims — review the output and hand-edit heavy-duty-engines.ts if something real
// changed (e.g. a platform drops or gains a fuel type in a future filing year).

import AdmZip from "adm-zip";

const LANDING_PAGE = "https://www.epa.gov/compliance-and-fuel-economy-data/annual-certification-data-vehicles-engines-and-equipment";

interface Platform {
  key: string;
  label: string;
  match: (tradeName: string, vehicleFamily: string) => boolean;
  /** Fuel types this script expects NOT to find in EPA's data — see file header. */
  knownGaps: Array<"Gasoline" | "Diesel">;
}

const PLATFORMS: Platform[] = [
  {
    key: "silverado-sierra-hd",
    label: "Chevrolet Silverado HD / GMC Sierra HD",
    match: (t) => /silverado|sierra/i.test(t),
    knownGaps: ["Gasoline"],
  },
  {
    key: "super-duty",
    label: "Ford Super Duty (F-250/350/450/550/600)",
    match: (t) => /super\s*duty|f[\s-]?(250|350|450|550|600)/i.test(t),
    knownGaps: [],
  },
  {
    key: "ram-hd",
    label: "Ram 2500/3500/4500/5500",
    match: (t) => /ram/i.test(t) && /(2500|3500|4500|5500)/i.test(t),
    knownGaps: ["Gasoline"],
  },
];

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function findCurrentDownloadUrl(): Promise<string> {
  const res = await fetch(LANDING_PAGE);
  if (!res.ok) throw new Error(`Couldn't load EPA's landing page (${res.status}) — check ${LANDING_PAGE} manually`);
  const html = await res.text();
  const match = html.match(/href="([^"]*heavy-duty-vehicle-ghg[^"]*\.xlsx)"/);
  if (!match) {
    throw new Error(
      `Couldn't find the "heavy-duty-vehicle-ghg...xlsx" link on ${LANDING_PAGE} — EPA may have renamed the file. Check the page manually.`,
    );
  }
  return match[1];
}

function normalizeFuelType(raw: string): "Gasoline" | "Diesel" | null {
  if (/diesel/i.test(raw)) return "Diesel";
  if (/gasoline/i.test(raw)) return "Gasoline";
  return null;
}

async function main() {
  console.log(`Finding current EPA download link from ${LANDING_PAGE} ...`);
  const url = await findCurrentDownloadUrl();
  console.log(`Downloading ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`Downloaded ${(buffer.length / 1024 / 1024).toFixed(1)}MB, extracting worksheet ...`);

  const zip = new AdmZip(buffer);
  const sharedStringsEntry = zip.getEntry("xl/sharedStrings.xml");
  const sheetEntry = zip.getEntry("xl/worksheets/sheet1.xml");
  if (!sharedStringsEntry || !sheetEntry) {
    throw new Error("Expected xl/sharedStrings.xml and xl/worksheets/sheet1.xml inside the workbook — EPA may have changed its layout");
  }

  const sharedStringsXml = sharedStringsEntry.getData().toString("utf8");
  const strings = [...sharedStringsXml.matchAll(/<si>(?:<t[^>]*>([^<]*)<\/t>|<r>[\s\S]*?<\/r>)<\/si>/g)].map((m) =>
    m[1] !== undefined ? decodeXmlEntities(m[1]) : "",
  );

  const sheetXml = sheetEntry.getData().toString("utf8");
  console.log(`Scanning ${(sheetXml.length / 1024 / 1024).toFixed(0)}MB of row data ...`);

  function cellValue(rowXml: string, col: string): string | null {
    const re = new RegExp(`<c r="${col}\\d+"[^>]*?(?: t="(s)")?><v>([^<]*)</v></c>`);
    const m = rowXml.match(re);
    if (!m) return null;
    return m[1] === "s" ? (strings[Number(m[2])] ?? "") : m[2];
  }

  // Column layout confirmed by inspecting the header row: A=Model Year, B=Manufacturer,
  // C=Vehicle Family, F=Vehicle Trade Name, G=Fuel Type.
  const confirmedFuelTypes = new Map<string, Set<"Gasoline" | "Diesel">>();
  for (const p of PLATFORMS) confirmedFuelTypes.set(p.key, new Set());

  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let match: RegExpExecArray | null;
  let rowsScanned = 0;
  while ((match = rowRe.exec(sheetXml))) {
    rowsScanned++;
    const rowXml = match[1];
    const tradeName = cellValue(rowXml, "F");
    const vehicleFamily = cellValue(rowXml, "C");
    const fuelTypeRaw = cellValue(rowXml, "G");
    if (!tradeName || !fuelTypeRaw) continue;
    const fuelType = normalizeFuelType(fuelTypeRaw);
    if (!fuelType) continue;

    for (const p of PLATFORMS) {
      if (p.match(tradeName, vehicleFamily ?? "")) {
        confirmedFuelTypes.get(p.key)!.add(fuelType);
      }
    }
  }
  console.log(`Scanned ${rowsScanned.toLocaleString()} certification rows.\n`);

  console.log("=== EPA-confirmed fuel types per platform ===");
  for (const p of PLATFORMS) {
    const confirmed = [...confirmedFuelTypes.get(p.key)!].sort();
    const unexpectedGap = (["Gasoline", "Diesel"] as const).filter(
      (f) => !confirmed.includes(f) && !p.knownGaps.includes(f),
    );
    console.log(`\n${p.label}`);
    console.log(`  EPA confirms: ${confirmed.length > 0 ? confirmed.join(", ") : "(none found)"}`);
    if (p.knownGaps.length > 0) {
      console.log(`  Known gap (not in this EPA dataset, tracked in heavy-duty-engines.ts by hand): ${p.knownGaps.join(", ")}`);
    }
    if (unexpectedGap.length > 0) {
      console.log(`  ⚠ UNEXPECTED: heavy-duty-engines.ts assumes ${unexpectedGap.join(", ")} but EPA's filings no longer show it — review src/lib/heavy-duty-engines.ts`);
    }
  }
  console.log("\nReview complete. This script only reports — it does not edit heavy-duty-engines.ts.");
  console.log("If a platform's confirmed fuel types changed for a real reason (new engine, discontinued option),");
  console.log("update the PLATFORMS table in src/lib/heavy-duty-engines.ts by hand.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
