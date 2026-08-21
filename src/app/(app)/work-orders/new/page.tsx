import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createWorkOrder, createCustomerAndWorkOrder } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { getJobCategories } from "@/lib/job-categories";
import { getMarketingSources } from "@/lib/marketing-sources";
import { VehicleSelectFields } from "@/components/vehicle-select-fields";
import { WorkOrderDetailFields } from "@/components/work-order-detail-fields";
import { CustomerProfileFields } from "@/components/customer-profile-fields";
import { getCustomerSettings } from "@/lib/customer-settings";

export const dynamic = "force-dynamic";

export default async function NewWorkOrderPage({ searchParams }: PageProps<"/work-orders/new">) {
  const { customerId, q } = await searchParams;
  const selectedCustomerId = typeof customerId === "string" ? customerId : undefined;
  const searchTerm = typeof q === "string" ? q.trim() : "";

  const [jobCategories, laborRates, marketingSources, customerSettings] = await Promise.all([
    getJobCategories({ activeOnly: true }),
    prisma.laborRate.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getMarketingSources({ activeOnly: true }),
    getCustomerSettings(),
  ]);

  if (!selectedCustomerId) {
    const customers = searchTerm
      ? await prisma.customer.findMany({
          where: {
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" } },
              { lastName: { contains: searchTerm, mode: "insensitive" } },
              { phone: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          take: 20,
        })
      : [];

    return (
      <div className="max-w-xl space-y-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New work order</h1>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Find a customer</h2>
          <form method="get" className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Name, phone, or email"
              className={inputClass}
            />
            <button type="submit" className={secondaryButtonClass}>
              Search
            </button>
          </form>
          {searchTerm && (
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              {customers.length === 0 && (
                <p className="px-4 py-3 text-sm text-zinc-500">No matching customers.</p>
              )}
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/work-orders/new?customerId=${c.id}`}
                  className="block border-b border-zinc-200 px-4 py-3 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">{c.phone ?? c.email ?? "No contact info on file"}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Or add a new customer</h2>
          <form action={createCustomerAndWorkOrder} className="space-y-6">
            <CustomerProfileFields settings={customerSettings} sources={marketingSources} />
            <div className="grid grid-cols-2 gap-4">
              <Field name="firstName" label="First name" required />
              <Field name="lastName" label="Last name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field name="phone" label="Phone" type="tel" required={customerSettings.requirePhone} />
              <Field name="email" label="Email" type="email" required={customerSettings.requireEmail} />
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div>
                <label htmlFor="vehicleYear" className={labelClass}>
                  Vehicle year <span className="text-red-500">*</span>
                </label>
                <input id="vehicleYear" name="vehicleYear" type="number" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="vehicleMake" className={labelClass}>
                  Make <span className="text-red-500">*</span>
                </label>
                <input id="vehicleMake" name="vehicleMake" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="vehicleModel" className={labelClass}>
                  Model <span className="text-red-500">*</span>
                </label>
                <input id="vehicleModel" name="vehicleModel" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="vehicleVin" className={labelClass}>
                  VIN
                </label>
                <input id="vehicleVin" name="vehicleVin" className={inputClass} />
              </div>
            </div>

            <Field name="odometer" label="Odometer in" type="number" />

            <WorkOrderDetailFields
              jobCategories={jobCategories}
              laborRates={laborRates}
              marketingSources={marketingSources}
            />

            <button type="submit" className={primaryButtonClass}>
              Create customer &amp; work order
            </button>
          </form>
        </div>
      </div>
    );
  }

  const customer = await prisma.customer.findUnique({ where: { id: selectedCustomerId }, include: { vehicles: true } });

  if (!customer) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New work order</h1>
        <p className="text-sm text-zinc-500">
          For {customer.firstName} {customer.lastName} ·{" "}
          <Link href="/work-orders/new" className="underline">
            Change customer
          </Link>
        </p>
      </div>

      <form action={createWorkOrder} className="space-y-6">
        <input type="hidden" name="customerId" value={customer.id} />

        <VehicleSelectFields
          vehicles={customer.vehicles.map((v) => ({ id: v.id, year: v.year, make: v.make, model: v.model }))}
        />

        <Field name="odometer" label="Odometer in" type="number" />

        <WorkOrderDetailFields
          jobCategories={jobCategories}
          laborRates={laborRates}
          marketingSources={marketingSources}
        />

        <button type="submit" className={primaryButtonClass}>
          Create work order
        </button>
      </form>
    </div>
  );
}
