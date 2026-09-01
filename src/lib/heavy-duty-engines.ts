// fueleconomy.gov's EPA data only covers vehicles subject to CAFE fuel-economy
// testing — trucks over 8,500 lbs GVWR (2500/3500-and-up heavy-duty pickups) are
// exempt and don't appear there at all, confirmed empty for Silverado 2500HD/
// 3500HD, F-250/F-350 Super Duty, and Ram 2500/3500 alike. No free API covers
// this segment (precise trim/engine data lives behind paid catalogs like
// Edmunds/Chrome Data, same constraint noted elsewhere in this app), so this is
// a small hand-maintained list of the engines each domestic HD platform actually
// ships today. Not year-exact across every model year/generation — good enough
// for a shop picking "which engine is in this truck," not for EPA reporting.
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
