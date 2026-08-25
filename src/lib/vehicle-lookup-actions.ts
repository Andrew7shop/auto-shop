"use server";

import { decodeVin, getVehicleMakes, getVehicleModels } from "@/lib/vpic";

export async function decodeVinAction(vin: string) {
  return decodeVin(vin);
}

export async function getVehicleMakesAction() {
  return getVehicleMakes();
}

export async function getVehicleModelsAction(make: string, year: number) {
  return getVehicleModels(make, year);
}
