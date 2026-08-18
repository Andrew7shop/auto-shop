import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { formatDateTime } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [openWorkOrders, upcomingAppointments, unpaidInvoices] = await Promise.all([
    prisma.workOrder.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_ON_PARTS", "WAITING_ON_APPROVAL"] } },
      include: { customer: true, vehicle: true },
      orderBy: { openedAt: "asc" },
      take: 8,
    }),
    prisma.appointment.findMany({
      where: { startsAt: { gte: new Date() }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
      include: { customer: true, vehicle: true },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIALLY_PAID"] } },
      include: { customer: true, workOrder: { include: { lineItems: true } }, payments: true },
      orderBy: { issuedAt: "asc" },
    }),
  ]);

  const totalOutstanding = unpaidInvoices.reduce((sum, invoice) => {
    const { balance } = computeInvoiceTotals(invoice.workOrder.lineItems, invoice, invoice.payments);
    return sum + balance;
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-500">Shop overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open work orders" value={String(openWorkOrders.length)} />
        <StatCard label="Upcoming appointments" value={String(upcomingAppointments.length)} />
        <StatCard label="Outstanding balance" value={formatCurrency(totalOutstanding)} />
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Open work orders</h2>
            <Link href="/job-board" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {openWorkOrders.length === 0 && <EmptyRow text="No open work orders." />}
            {openWorkOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    #{wo.number} — {wo.customer.firstName} {wo.customer.lastName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {wo.vehicle.year} {wo.vehicle.make} {wo.vehicle.model}
                  </p>
                </div>
                <Badge status={wo.status} />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Upcoming appointments</h2>
            <Link href="/appointments" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {upcomingAppointments.length === 0 && <EmptyRow text="No upcoming appointments." />}
            {upcomingAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {appt.customer.firstName} {appt.customer.lastName} — {appt.reason}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDateTime(appt.startsAt, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge status={appt.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-4 py-6 text-center text-sm text-zinc-500">{text}</p>;
}
