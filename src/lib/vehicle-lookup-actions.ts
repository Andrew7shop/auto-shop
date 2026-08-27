"use server";

import { decodeVin, getVehicleMakes, getVehicleModels } from "@/lib/vpic";
import { getFuelEconomyEngineOptions } from "@/lib/fueleconomy";
import { prisma } from "@/lib/prisma";

export async function decodeVinAction(vin: string) {
  return decodeVin(vin);
}

export async function getVehicleMakesAction() {
  return getVehicleMakes();
}

export async function getVehicleModelsAction(make: string, year: number) {
  return getVehicleModels(make, year);
}

// Engine options for this year/make/model, merging two sources: the real trim/engine
// catalog from fueleconomy.gov (every configuration sold in the US since 1984 — covers
// vehicles this shop has never seen before) and whatever's already on file for this
// make/model from vehicles the shop has actually serviced (covers older/rarer vehicles
// fueleconomy.gov may not carry, and keeps shop-specific manual entries selectable).
export async function getKnownEngineTypesAction(make: string, model: string, year?: number): Promise<string[]> {
  const trimmedMake = make.trim();
  const trimmedModel = model.trim();
  if (!trimmedMake || !trimmedModel) return [];

  const [onFile, fromCatalog] = await Promise.all([
    prisma.vehicle
      .findMany({
        where: {
          make: { equals: trimmedMake, mode: "insensitive" },
          model: { equals: trimmedModel, mode: "insensitive" },
          engineType: { not: null },
        },
        select: { engineType: true },
        distinct: ["engineType"],
      })
      .then((rows) => rows.map((r) => r.engineType).filter((v): v is string => Boolean(v))),
    year ? getFuelEconomyEngineOptions(year, trimmedMake, trimmedModel) : Promise.resolve([]),
  ]);

  const merged = new Set([...onFile, ...fromCatalog]);
  return [...merged].sort((a, b) => a.localeCompare(b));
}
