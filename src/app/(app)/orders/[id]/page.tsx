import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeLineItemTotal, sumLineItems } from "@/lib/money";
import { addLineItem, removeLineItem, placeOrder, receiveOrder, cancelOrder } from "../actions";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { ActionPanel } from "@/components/action-panel";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  locked: "Line items can only be changed while the order is still a draft.",
};

export default async function OrderDetailPage({ params, searchParams }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const { error } = await searchParams;

  const [order, parts] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        vendor: true,
        lineItems: { orderBy: { createdAt: "asc" }, include: { part: true } },
      },
    }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!order) notFound();

  const subtotal = sumLineItems(order.lineItems.map((i) => ({ quantity: i.quantity, unitPrice: i.unitCost })));
  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;
  const isDraft = order.status === "DRAFT";

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
            Order #{order.number}
          </h1>
          <p className="text-sm text-zinc-500">
            <Link href={`/vendors/${order.vendor.id}/edit`} className="underline">
              {order.vendor.name}
            </Link>
          </p>
        </div>
        <Badge status={order.status} />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          {order.notes && (
            <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{order.notes}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">Line items</h2>
            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Part</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Unit cost</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    {isDraft && <th className="px-4 py-2" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {order.lineItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                        No line items yet.
                      </td>
                    </tr>
                  )}
                  {order.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">{item.description}</td>
                      <td className="px-4 py-2 text-zinc-500">{item.part?.name ?? "—"}</td>
                      <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(computeLineItemTotal(item.quantity, item.unitCost))}
                      </td>
                      {isDraft && (
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <form action={removeLineItem} className="inline">
                            <input type="hidden" name="lineItemId" value={item.id} />
                            <input type="hidden" name="orderId" value={order.id} />
                            <button type="submit" className="text-xs text-red-600 hover:underline">
                              Remove
                            </button>
                          </form>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-200 dark:border-zinc-800">
                    <td
                      colSpan={4}
                      className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50"
                    >
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(subtotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {isDraft ? (
              <details className="mt-4 rounded-lg border border-dashed border-zinc-300 px-4 py-3 dark:border-zinc-700">
                <summary className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  + Add line item
                </summary>
                <form action={addLineItem} className="mt-3 space-y-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <div>
                    <label htmlFor="partId" className={labelClass}>
                      Part (optional)
                    </label>
                    <select id="partId" name="partId" className={inputClass} defaultValue="">
                      <option value="">None (misc.)</option>
                      {parts.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Description
                    </label>
                    <input id="description" name="description" required className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="quantity" className={labelClass}>
                        Quantity
                      </label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        step="1"
                        min="1"
                        defaultValue="1"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="unitCost" className={labelClass}>
                        Unit cost
                      </label>
                      <input
                        id="unitCost"
                        name="unitCost"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <button type="submit" className={primaryButtonClass}>
                    Add line item
                  </button>
                </form>
              </details>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">
                Line items are locked because this order is no longer a draft.
              </p>
            )}
          </section>
        </div>

        <ActionPanel>
          {order.status === "DRAFT" && (
            <form action={placeOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className={`${primaryButtonClass} w-full`}>
                Place order
              </button>
            </form>
          )}
          {order.status === "ORDERED" && (
            <form action={receiveOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className={`${primaryButtonClass} w-full`}>
                Mark received
              </button>
              <p className="mt-2 text-xs text-zinc-500">
                Adds each line item&apos;s quantity to on-hand inventory for linked parts.
              </p>
            </form>
          )}
          {(order.status === "DRAFT" || order.status === "ORDERED") && (
            <form action={cancelOrder} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className={`${secondaryButtonClass} w-full`}>
                Cancel order
              </button>
            </form>
          )}
          {order.status === "RECEIVED" && (
            <p className="text-sm text-zinc-500">
              Received {order.receivedAt?.toLocaleDateString()}.
            </p>
          )}
          {order.status === "CANCELLED" && <p className="text-sm text-zinc-500">This order was cancelled.</p>}
        </ActionPanel>
      </div>
    </div>
  );
}
