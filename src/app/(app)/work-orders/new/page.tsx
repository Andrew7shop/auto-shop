import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createWorkOrder, createCustomerForWorkOrder } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { getJobCategories } from "@/lib/job-categories";
import { getMarketingSources } from "@/lib/marketing-sources";
import { VehicleSelectFields } from "@/components/vehicle-select-fields";
import { ConcernLinesFields } from "@/components/concern-lines-fields";

export const dynamic = "force-dynamic";

const ARRIVAL_TYPES = [
  { value: "WAITING", label: "Waiting" },
  { value: "DROP_OFF", label: "Drop-off" },
  { value: "TOWED_IN", label: "Towed in" },
];

export default async function NewWorkOrderPage({ searchParams }: PageProps<"/work-orders/new">) {
  const { customerId, q } = await searchParams;
  const selectedCustomerId = typeof customerId === "string" ? customerId : undefined;
  const searchTerm = typeof q === "string" ? q.trim() : "";

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

        <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Or add a new customer</h2>
          <form action={createCustomerForWorkOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field name="firstName" label="First name" required />
              <Field name="lastName" label="Last name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field name="phone" label="Phone" type="tel" />
              <Field name="email" label="Email" type="email" />
            </div>
            <button type="submit" className={primaryButtonClass}>
              Create customer &amp; continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [customer, jobCategories, laborRates, marketingSources] = await Promise.all([
    prisma.customer.findUnique({ where: { id: selectedCustomerId }, include: { vehicles: true } }),
    getJobCategories({ activeOnly: true }),
    prisma.laborRate.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getMarketingSources({ activeOnly: true }),
  ]);

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="arrivalType" className={labelClass}>
              Arrival
            </label>
            <select id="arrivalType" name="arrivalType" className={inputClass} defaultValue="">
              <option value="" disabled>
                Select arrival type
              </option>
              {ARRIVAL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="laborRateId" className={labelClass}>
              Labor rate
            </label>
            <select id="laborRateId" name="laborRateId" className={inputClass} defaultValue="">
              <option value="">No labor rate</option>
              {laborRates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.name} (${rate.ratePerHour.toString()}/hr)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className={labelClass}>
            Job category
          </label>
          <select id="categoryId" name="categoryId" className={inputClass} defaultValue="">
            <option value="">No category</option>
            {jobCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className={labelClass}>
            Customer states <span className="text-red-500">*</span>
          </h2>
          <p className="mb-2 text-sm text-zinc-500">Problems the customer describes with the vehicle.</p>
          <ConcernLinesFields />
        </div>

        <div>
          <label htmlFor="marketingSourceId" className={labelClass}>
            Marketing source
          </label>
          <select id="marketingSourceId" name="marketingSourceId" className={inputClass} defaultValue="">
            <option value="">Not specified</option>
            {marketingSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={primaryButtonClass}>
          Create work order
        </button>
      </form>
    </div>
  );
}
