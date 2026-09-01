// fueleconomy.gov's EPA data only covers vehicles subject to CAFE fuel-economy
// testing — trucks over 8,500 lbs GVWR (2500/3500-and-up heavy-duty pickups) are
// exempt and don't appear there at all, confirmed empty for Silverado 2500HD/
// 3500HD, F-250/F-350 Super Duty, and Ram 2500/3500 alike. No free source covers
// this segment with real trim-level displacement data (precise trim/engine specs
// live behind paid catalogs like Edmunds/Chrome Data, same constraint noted
// elsewhere in this app) — EPA's own Heavy-Duty Vehicle GHG certification filings
// confirm *which fuel types* each platform was certified with, but never
// displacement/cylinder count, so that part is unavoidably a hand-maintained list.
// Run `npm run audit:hd-engines` (scripts/audit-heavy-duty-engines.ts) periodically
// to re-check the fuel-type assumptions below against those real EPA filings —
// it flags it if a platform's certified fuel types ever change. Last run
// 2026-09-01: EPA confirms Diesel for Silverado/Sierra HD and Ram HD, and both
// Diesel+Gasoline for Ford Super Duty; GM's and Ram's gas HD engines don't appear
// in EPA's file at all (a known gap in that source, not a discrepancy to fix).
// Not year-exact across every model year/generation — good enough for a shop
// picking "which engine is in this truck," not for EPA reporting.
interface HeavyDutyPlatform {
  make: RegExp;
  model: RegExp;
  engines: string[];
}

const PLATFORMS: HeavyDutyPlatform[] = [
  {
    make: /^(chevrolet|gmc)$/i,
    model: /(silverado|sierra).*(2500|3500)/i,
    engines: ["6.6L V8 Gasoline", "6.6L V8 Turbo Diesel"],
  },
  {
    make: /^ford$/i,
    model: /^f-?(250|350|450|550)/i,
    engines: ["6.2L V8 Gasoline", "7.3L V8 Gasoline", "6.7L V8 Turbo Diesel"],
  },
  {
    make: /^ram$/i,
    model: /^(ram\s*)?(2500|3500|4500|5500)/i,
    engines: ["6.4L V8 Gasoline", "6.7L 6-cyl Turbo Diesel"],
  },
];

export function getHeavyDutyEngineOptions(make: string, model: string): string[] {
  const trimmedMake = make.trim();
  const trimmedModel = model.trim();
  if (!trimmedMake || !trimmedModel) return [];

  const platform = PLATFORMS.find((p) => p.make.test(trimmedMake) && p.model.test(trimmedModel));
  return platform ? platform.engines : [];
}
