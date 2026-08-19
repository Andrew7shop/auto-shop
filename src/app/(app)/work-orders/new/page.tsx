import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createWorkOrder } from "../actions";
import { Field, inputClass, labelClass, primaryButtonClass } from "@/components/form";
import { getJobCategories } from "@/lib/job-categories";

export const dynamic = "force-dynamic";

export default async function NewWorkOrderPage({ searchParams }: PageProps<"/work-orders/new">) {
  const { customerId } = await searchParams;
  const selectedCustomerId = typeof customerId === "string" ? customerId : undefined;

  const [customers, jobCategories] = await Promise.all([
    prisma.customer.findMany({
      include: { vehicles: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    getJobCategories({ activeOnly: true }),
  ]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  if (!selectedCustomer) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New work order</h1>
        <form method="get" className="space-y-4">
          <div>
            <label htmlFor="customerId" className={labelClass}>
              Customer
            </label>
            <select id="customerId" name="customerId" required className={inputClass} defaultValue="">
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={primaryButtonClass}>
            Continue
          </button>
        </form>
        {customers.length === 0 && (
          <p className="text-sm text-zinc-500">
            No customers yet. <Link href="/customers/new" className="underline">Add one first</Link>.
          </p>
        )}
      </div>
    );
  }

  if (selectedCustomer.vehicles.length === 0) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New work order</h1>
        <p className="text-sm text-zinc-500">
          {selectedCustomer.firstName} {selectedCustomer.lastName} has no vehicles on file yet.{" "}
          <Link href={`/customers/${selectedCustomer.id}`} className="underline">
            Add a vehicle first
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New work order</h1>
      <p className="text-sm text-zinc-500">
        For {selectedCustomer.firstName} {selectedCustomer.lastName}
      </p>
      <form action={createWorkOrder} className="space-y-4">
        <input type="hidden" name="customerId" value={selectedCustomer.id} />
        <div>
          <label htmlFor="vehicleId" className={labelClass}>
            Vehicle
          </label>
          <select id="vehicleId" name="vehicleId" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Select a vehicle
            </option>
            {selectedCustomer.vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model}
              </option>
            ))}
          </select>
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
          <label htmlFor="description" className={labelClass}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea id="description" name="description" rows={3} required className={inputClass} />
        </div>
        <Field name="odometer" label="Odometer" type="number" />
        <button type="submit" className={primaryButtonClass}>
          Create work order
        </button>
      </form>
    </div>
  );
}
