import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { addVehicle, updateVehicle, deleteCustomer, deleteVehicle } from "../actions";
import { Field, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { DeleteButton } from "@/components/delete-button";
import { VehicleLookupFields } from "@/components/vehicle-lookup-fields";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  "has-records": "This customer can't be deleted because they have work orders or invoices on file.",
  "vehicle-has-work-orders": "That vehicle can't be deleted because it has work orders on file.",
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: PageProps<"/customers/[id]">) {
  const { id } = await params;
  const { error } = await searchParams;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      workOrders: { include: { vehicle: true }, orderBy: { openedAt: "desc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
      source: true,
    },
  });

  if (!customer) notFound();

  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {customer.firstName} {customer.lastName}
            {customer.customerType === "BUSINESS" && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                {customer.businessName || "Business"}
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500">
            {[customer.phone, customer.email, customer.address].filter(Boolean).join(" · ") ||
              "No contact info on file"}
          </p>
          {(customer.source || customer.birthday) && (
            <p className="text-xs text-zinc-500">
              {[
                customer.source && `Source: ${customer.source.name}`,
                // Birthday is a plain calendar date (no time-of-day), so format in UTC rather than
                // shop-local time to avoid shifting it a day off from what was entered.
                customer.birthday &&
                  `Birthday: ${customer.birthday.toLocaleDateString("en-US", { timeZone: "UTC" })}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/customers/${customer.id}/edit`} className={secondaryButtonClass}>
            Edit customer
          </Link>
          <form action={deleteCustomer}>
            <input type="hidden" name="id" value={customer.id} />
            <DeleteButton
              confirmText={`Delete ${customer.firstName} ${customer.lastName}? This cannot be undone.`}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </DeleteButton>
          </form>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">Vehicles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customer.vehicles.map((vehicle) => (
            <details
              key={vehicle.id}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <summary className="cursor-pointer list-none">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="text-xs text-zinc-500">
                  {[
                    vehicle.engineType,
                    vehicle.driveType,
                    vehicle.licensePlate,
                    vehicle.vin,
                    vehicle.mileage ? `${vehicle.mileage} mi` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No additional details"}
                </p>
              </summary>
              <form action={updateVehicle} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={vehicle.id} />
                <input type="hidden" name="customerId" value={customer.id} />
                <div className="grid grid-cols-3 gap-3">
                  <Field name="year" label="Year" type="number" required defaultValue={vehicle.year} />
                  <Field name="make" label="Make" required defaultValue={vehicle.make} />
                  <Field name="model" label="Model" required defaultValue={vehicle.model} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field name="vin" label="VIN" defaultValue={vehicle.vin ?? undefined} />
                  <Field
                    name="licensePlate"
                    label="License plate"
                    defaultValue={vehicle.licensePlate ?? undefined}
                  />
                  <Field name="driveType" label="Drivetrain" defaultValue={vehicle.driveType ?? undefined} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field name="color" label="Color" defaultValue={vehicle.color ?? undefined} />
                  <Field
                    name="mileage"
                    label="Mileage"
                    type="number"
                    defaultValue={vehicle.mileage ?? undefined}
                  />
                  <Field name="engineType" label="Engine" defaultValue={vehicle.engineType ?? undefined} />
                </div>
                <button type="submit" className={primaryButtonClass}>
                  Save changes
                </button>
              </form>
              <form action={deleteVehicle} className="mt-2">
                <input type="hidden" name="id" value={vehicle.id} />
                <input type="hidden" name="customerId" value={customer.id} />
                <DeleteButton
                  confirmText={`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}? This cannot be undone.`}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete vehicle
                </DeleteButton>
              </form>
            </details>
          ))}

          <details className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 dark:border-zinc-700">
            <summary className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400">
              + Add vehicle
            </summary>
            <form action={addVehicle} className="mt-3 space-y-3">
              <input type="hidden" name="customerId" value={customer.id} />
              <VehicleLookupFields />
              <Field name="mileage" label="Mileage" type="number" />
              <button type="submit" className={primaryButtonClass}>
                Add vehicle
              </button>
            </form>
          </details>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Work orders</h2>
          <Link
            href={`/work-orders/new?customerId=${customer.id}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            New work order
          </Link>
        </div>
        <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {customer.workOrders.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">No work orders yet.</p>
          )}
          {customer.workOrders.map((wo) => (
            <Link
              key={wo.id}
              href={`/work-orders/${wo.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  #{wo.number} — {wo.description}
                </p>
                <p className="text-xs text-zinc-500">
                  {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                </p>
              </div>
              <Badge status={wo.status} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">Invoices</h2>
        <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {customer.invoices.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">No invoices yet.</p>
          )}
          {customer.invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Invoice #{invoice.number}</p>
              <Badge status={invoice.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
