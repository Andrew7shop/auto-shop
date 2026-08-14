import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeLineItemTotal, sumLineItems } from "@/lib/money";
import {
  updateWorkOrderStatus,
  updateWorkOrderDetails,
  addLineItem,
  removeLineItem,
  generateInvoice,
} from "../actions";

export const dynamic = "force-dynamic";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_PARTS",
  "WAITING_ON_APPROVAL",
  "COMPLETED",
  "CANCELLED",
] as const;

export default async function WorkOrderDetailPage({ params }: PageProps<"/work-orders/[id]">) {
  const { id } = await params;

  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      lineItems: { orderBy: { createdAt: "asc" } },
      invoice: true,
    },
  });

  if (!workOrder) notFound();

  const subtotal = sumLineItems(workOrder.lineItems);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Work order #{workOrder.number}
          </h1>
          <p className="text-sm text-zinc-500">
            <Link href={`/customers/${workOrder.customer.id}`} className="underline">
              {workOrder.customer.firstName} {workOrder.customer.lastName}
            </Link>{" "}
            · {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
          </p>
        </div>
        <Badge status={workOrder.status} />
      </div>

      <details className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <summary className="cursor-pointer list-none">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{workOrder.description}</p>
          {workOrder.odometer && (
            <p className="mt-1 text-xs text-zinc-500">Odometer: {workOrder.odometer} mi</p>
          )}
          <p className="mt-2 text-xs font-medium text-zinc-500 underline">Edit</p>
        </summary>
        <form action={updateWorkOrderDetails} className="mt-3 space-y-3">
          <input type="hidden" name="workOrderId" value={workOrder.id} />
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              defaultValue={workOrder.description}
              className={inputClass}
            />
          </div>
          <div className="max-w-xs">
            <label htmlFor="odometer" className={labelClass}>
              Odometer
            </label>
            <input
              id="odometer"
              name="odometer"
              type="number"
              defaultValue={workOrder.odometer ?? undefined}
              className={inputClass}
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Save changes
          </button>
        </form>
      </details>

      <section className="flex flex-wrap items-center gap-4">
        <form action={updateWorkOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="workOrderId" value={workOrder.id} />
          <label htmlFor="status" className="text-sm text-zinc-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={workOrder.status}
            className={`${inputClass} w-auto`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <button type="submit" className={secondaryButtonClass}>
            Update
          </button>
        </form>

        {workOrder.invoice ? (
          <Link href={`/invoices/${workOrder.invoice.id}`} className={secondaryButtonClass}>
            View invoice
          </Link>
        ) : (
          <form action={generateInvoice}>
            <input type="hidden" name="workOrderId" value={workOrder.id} />
            <button type="submit" className={primaryButtonClass}>
              Generate invoice
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">Line items</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Unit price</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {workOrder.lineItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    No line items yet.
                  </td>
                </tr>
              )}
              {workOrder.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-zinc-500">{item.type}</td>
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
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Link
                      href={`/work-orders/${workOrder.id}/line-items/${item.id}/edit`}
                      className="text-xs text-zinc-500 hover:underline"
                    >
                      Edit
                    </Link>{" "}
                    <form action={removeLineItem} className="inline">
                      <input type="hidden" name="lineItemId" value={item.id} />
                      <input type="hidden" name="workOrderId" value={workOrder.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td colSpan={4} className="px-4 py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
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

        <details className="mt-4 rounded-lg border border-dashed border-zinc-300 px-4 py-3 dark:border-zinc-700">
          <summary className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400">
            + Add line item
          </summary>
          <form action={addLineItem} className="mt-3 space-y-3">
            <input type="hidden" name="workOrderId" value={workOrder.id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="type" className={labelClass}>
                  Type
                </label>
                <select id="type" name="type" className={inputClass} defaultValue="LABOR">
                  <option value="LABOR">Labor</option>
                  <option value="PART">Part</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <input id="description" name="description" required className={inputClass} />
              </div>
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
                  step="0.01"
                  min="0.01"
                  defaultValue="1"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="unitPrice" className={labelClass}>
                  Unit price
                </label>
                <input
                  id="unitPrice"
                  name="unitPrice"
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
      </section>
    </div>
  );
}
