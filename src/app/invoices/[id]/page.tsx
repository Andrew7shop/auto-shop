import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeLineItemTotal, computeInvoiceTotals } from "@/lib/money";
import { recordPayment, updateTaxRate, voidInvoice } from "../actions";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";

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

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Invoice #{invoice.number}
          </h1>
          <p className="text-sm text-zinc-500">
            <Link href={`/customers/${invoice.customer.id}`} className="underline">
              {invoice.customer.firstName} {invoice.customer.lastName}
            </Link>{" "}
            · {invoice.workOrder.vehicle.year} {invoice.workOrder.vehicle.make}{" "}
            {invoice.workOrder.vehicle.model} ·{" "}
            <Link href={`/work-orders/${invoice.workOrder.id}`} className="underline">
              Work order #{invoice.workOrder.number}
            </Link>
          </p>
        </div>
        <Badge status={invoice.status} />
      </div>

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

      {!isSettled && (
        <section className="flex flex-wrap items-start gap-6">
          <form action={updateTaxRate} className="flex items-end gap-2">
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <div>
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
                className={`${inputClass} w-32`}
              />
            </div>
            <button type="submit" className={secondaryButtonClass}>
              Update
            </button>
          </form>

          <form action={voidInvoice}>
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Void invoice
            </button>
          </form>
        </section>
      )}

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
                  {payment.paidAt.toLocaleDateString("en-US")}
                  {payment.reference && ` · Ref: ${payment.reference}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!isSettled && balance > 0 && (
          <form action={recordPayment} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <div className="flex items-end">
              <button type="submit" className={primaryButtonClass}>
                Record payment
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
