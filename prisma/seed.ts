import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const jane = await prisma.customer.create({
    data: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "555-010-1234",
      vehicles: {
        create: [
          {
            make: "Honda",
            model: "Civic",
            year: 2018,
            vin: "1HGCM82633A004352",
            licensePlate: "ABC-1234",
            mileage: 62000,
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  const vehicle = jane.vehicles[0];

  const workOrder = await prisma.workOrder.create({
    data: {
      customerId: jane.id,
      vehicleId: vehicle.id,
      description: "Front brake pads and rotor replacement",
      status: "COMPLETED",
      completedAt: new Date(),
      lineItems: {
        create: [
          { type: "LABOR", description: "Brake job labor", quantity: 2, unitPrice: 95 },
          { type: "PART", description: "Front brake pads", quantity: 1, unitPrice: 65 },
          { type: "PART", description: "Front rotors (pair)", quantity: 1, unitPrice: 140 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      workOrderId: workOrder.id,
      customerId: jane.id,
      taxRate: 0.0825,
      status: "UNPAID",
    },
  });

  const oilChange = await prisma.appointmentType.create({
    data: { name: "Oil Change", defaultDurationMinutes: 60, color: "blue" },
  });

  await prisma.appointment.create({
    data: {
      customerId: jane.id,
      vehicleId: vehicle.id,
      appointmentTypeId: oilChange.id,
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 25),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
