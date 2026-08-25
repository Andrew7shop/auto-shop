"use server";

import { decodeVin, getVehicleMakes, getVehicleModels } from "@/lib/vpic";
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

// Engine options already on file for this make/model, from vehicles this shop has actually
// serviced — NHTSA's free VIN API has no "engine options for a model" endpoint to draw from.
export async function getKnownEngineTypesAction(make: string, model: string): Promise<string[]> {
  const trimmedMake = make.trim();
  const trimmedModel = model.trim();
  if (!trimmedMake || !trimmedModel) return [];

  const rows = await prisma.vehicle.findMany({
    where: {
      make: { equals: trimmedMake, mode: "insensitive" },
      model: { equals: trimmedModel, mode: "insensitive" },
      engineType: { not: null },
    },
    select: { engineType: true },
    distinct: ["engineType"],
  });

  return rows
    .map((r) => r.engineType)
    .filter((v): v is string => Boolean(v))
    .sort((a, b) => a.localeCompare(b));
}
