import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeLineItemTotal, computeInvoiceTotals } from "@/lib/money";
import { recordPayment, updateTaxRate, voidInvoice } from "../actions";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { formatDate } from "@/lib/datetime";
import { PrintButton } from "@/components/print-button";
import { ActionPanel } from "@/components/action-panel";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: PageProps<"/invoices/[id]">) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      workOrder: { include: { vehicle: true, lineItems: { orderBy: { createdAt: "asc" } } } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const { subtotal, tax, total, paid, balance } = computeInvoiceTotals(
    invoice.workOrder.lineItems,
    invoice.taxRate,
    invoice.payments
  );

  const isSettled = invoice.status === "PAID" || invoice.status === "VOID";

  const vehicle = invoice.workOrder.vehicle;
  const customer = invoice.customer;

  return (
    <div className="space-y-8">
      <div className="hidden print:block">
        <p className="text-lg font-semibold">Wrench &amp; Wheel</p>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Invoice #{invoice.number}
          </h1>
          <p className="text-sm text-zinc-500">
            <Link href={`/customers/${customer.id}`} className="underline">
              {customer.firstName} {customer.lastName}
            </Link>{" "}
            · {vehicle.year} {vehicle.make} {vehicle.model} ·{" "}
            <Link href={`/work-orders/${invoice.workOrder.id}`} className="underline">
              Work order #{invoice.workOrder.number}
            </Link>
          </p>
        </div>
        <Badge status={invoice.status} />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <section className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">Bill to</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {customer.firstName} {customer.lastName}
              </p>
              {customer.address && (
                <p className="text-zinc-600 dark:text-zinc-400">{customer.address}</p>
              )}
              {customer.phone && <p className="text-zinc-600 dark:text-zinc-400">{customer.phone}</p>}
              {customer.email && <p className="text-zinc-600 dark:text-zinc-400">{customer.email}</p>}
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase text-zinc-500">Vehicle</p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              {vehicle.vin && <p className="text-zinc-600 dark:text-zinc-400">VIN: {vehicle.vin}</p>}
              {vehicle.licensePlate && (
                <p className="text-zinc-600 dark:text-zinc-400">Plate: {vehicle.licensePlate}</p>
              )}
              <p className="mt-2 text-xs uppercase text-zinc-500">Issued</p>
              <p className="text-zinc-900 dark:text-zinc-50">
                {formatDate(invoice.issuedAt, { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Unit price</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                {invoice.workOrder.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{item.description}</td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                      {item.quantity.toString()}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(computeLineItemTotal(item.quantity, item.unitPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-zinc-900 dark:text-zinc-50">
                <tr className="border-t border-zinc-200 dark:border-zinc-800">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Subtotal
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Tax ({(Number(invoice.taxRate) * 100).toFixed(2)}%)
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(tax)}</td>
                </tr>
                <tr className="font-medium">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Total
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(total)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Paid
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(paid)}</td>
                </tr>
                <tr className="font-medium">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Balance due
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(balance)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section>
            <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">Payments</h2>
            <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {invoice.payments.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">No payments recorded yet.</p>
              )}
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(payment.amount)} · {payment.method.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(payment.paidAt)}
                      {payment.reference && ` · Ref: ${payment.reference}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <ActionPanel>
          <PrintButton className={`${secondaryButtonClass} block w-full text-center`} />

          {!isSettled && balance > 0 && (
            <form action={recordPayment} className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <p className={labelClass}>Record payment</p>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <div>
                <label htmlFor="amount" className={labelClass}>
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance.toFixed(2)}
                  defaultValue={balance.toFixed(2)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="method" className={labelClass}>
                  Method
                </label>
                <select id="method" name="method" className={inputClass} defaultValue="CARD">
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="CHECK">Check</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="reference" className={labelClass}>
                  Reference
                </label>
                <input id="reference" name="reference" className={inputClass} />
              </div>
              <button type="submit" className={`${primaryButtonClass} w-full`}>
                Record payment
              </button>
            </form>
          )}

          {!isSettled && (
            <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <form action={updateTaxRate} className="space-y-2">
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <label htmlFor="taxRate" className={labelClass}>
                  Tax rate
                </label>
                <input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  defaultValue={invoice.taxRate.toString()}
                  className={inputClass}
                />
                <button type="submit" className={`${secondaryButtonClass} w-full`}>
                  Update tax rate
                </button>
              </form>

              <form action={voidInvoice}>
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Void invoice
                </button>
              </form>
            </div>
          )}
        </ActionPanel>
      </div>
    </div>
  );
}
