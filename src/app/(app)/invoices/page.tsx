import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeInvoiceTotals } from "@/lib/money";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { INVOICE_STATUSES } from "@/lib/statuses";
import type { InvoiceStatus } from "@/generated/prisma/enums";
import { getRoSettings } from "@/lib/ro-settings";
import { formatInvoiceNumber } from "@/lib/invoice-number";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({ searchParams }: PageProps<"/invoices">) {
  const { q, status } = await searchParams;
  const searchTerm = typeof q === "string" ? q.trim() : "";
  const statusFilter =
    typeof status === "string" && INVOICE_STATUSES.some((s) => s.value === status)
      ? (status as InvoiceStatus)
      : undefined;

  const [invoices, roSettings] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        status: statusFilter,
        ...(searchTerm
          ? {
              customer: {
                OR: [
                  { firstName: { contains: searchTerm, mode: "insensitive" } },
                  { lastName: { contains: searchTerm, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      include: { customer: true, workOrder: { include: { lineItems: true } }, payments: true },
      orderBy: { issuedAt: "desc" },
    }),
    getRoSettings(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Invoices</h1>

      <SearchFilterBar
        q={searchTerm}
        placeholder="Search by customer name"
        statusOptions={INVOICE_STATUSES}
        statusValue={statusFilter}
        basePath="/invoices"
      />

      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {invoices.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-zinc-500">
            {searchTerm || statusFilter
              ? "No invoices match your filters."
              : "No invoices yet. Generate one from a completed work order."}
          </p>
        )}
        {invoices.map((invoice) => {
          const { total, balance } = computeInvoiceTotals(
            invoice.workOrder.lineItems,
            invoice,
            invoice.payments
          );
          return (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Invoice #{formatInvoiceNumber(invoice.number, roSettings)} — {invoice.customer.firstName}{" "}
                  {invoice.customer.lastName}
                </p>
                <p className="text-xs text-zinc-500">
                  Total {formatCurrency(total)}
                  {balance > 0 && ` · Balance ${formatCurrency(balance)}`}
                </p>
              </div>
              <Badge status={invoice.status} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
