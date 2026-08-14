import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createAppointment } from "../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function NewAppointmentPage({ searchParams }: PageProps<"/appointments/new">) {
  const { customerId } = await searchParams;
  const selectedCustomerId = typeof customerId === "string" ? customerId : undefined;

  const customers = await prisma.customer.findMany({
    include: { vehicles: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  if (!selectedCustomer) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New appointment</h1>
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

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New appointment</h1>
      <p className="text-sm text-zinc-500">
        For {selectedCustomer.firstName} {selectedCustomer.lastName}
      </p>
      <form action={createAppointment} className="space-y-4">
        <input type="hidden" name="customerId" value={selectedCustomer.id} />
        {selectedCustomer.vehicles.length > 0 && (
          <div>
            <label htmlFor="vehicleId" className={labelClass}>
              Vehicle
            </label>
            <select id="vehicleId" name="vehicleId" className={inputClass} defaultValue="">
              <option value="">None / not specified</option>
              {selectedCustomer.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="reason" className={labelClass}>
            Reason <span className="text-red-500">*</span>
          </label>
          <input id="reason" name="reason" required className={inputClass} placeholder="e.g. Oil change" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className={labelClass}>
              Start time <span className="text-red-500">*</span>
            </label>
            <input id="startsAt" name="startsAt" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="durationMinutes" className={labelClass}>
              Duration (minutes)
            </label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min="15"
              step="15"
              defaultValue="60"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          Schedule appointment
        </button>
      </form>
    </div>
  );
}
