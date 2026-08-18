import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/badge";
import { formatCurrency, computeLineItemTotal, sumLineItems } from "@/lib/money";
import {
  updateWorkOrderStatus,
  assignTechnician,
  addLineItem,
  removeLineItem,
  generateInvoice,
} from "../actions";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/components/form";
import { ActionPanel } from "@/components/action-panel";
import { JOB_CATEGORIES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

const STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_PARTS",
  "WAITING_ON_APPROVAL",
  "COMPLETED",
  "CANCELLED",
] as const;

const ERROR_MESSAGES: Record<string, string> = {
  invoiced:
    "Line items are locked because an invoice has already been generated for this work order.",
};

export default async function WorkOrderDetailPage({ params, searchParams }: PageProps<"/work-orders/[id]">) {
  const { id } = await params;
  const { error } = await searchParams;

  const [workOrder, technicians, parts] = await Promise.all([
    prisma.workOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        lineItems: { orderBy: { createdAt: "asc" }, include: { part: true } },
        invoice: true,
        assignedTo: true,
      },
    }),
    prisma.employee.findMany({
      where: { role: "TECHNICIAN", active: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!workOrder) notFound();

  const subtotal = sumLineItems(workOrder.lineItems);
  const errorMessage = typeof error === "string" ? ERROR_MESSAGES[error] : undefined;
  const categoryLabel = JOB_CATEGORIES.find((c) => c.value === workOrder.category)?.label ?? workOrder.category;

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

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8">
          <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs uppercase text-zinc-500">{categoryLabel}</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{workOrder.description}</p>
            {workOrder.odometer && (
              <p className="mt-1 text-xs text-zinc-500">Odometer: {workOrder.odometer} mi</p>
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
                    {!workOrder.invoice && <th className="px-4 py-2" />}
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
                      <td className="px-4 py-2 text-zinc-900 dark:text-zinc-50">
                        {item.description}
                        {item.part && <p className="text-xs text-zinc-500">Linked: {item.part.name}</p>}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                        {item.quantity.toString()}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(computeLineItemTotal(item.quantity, item.unitPrice))}
                      </td>
                      {!workOrder.invoice && (
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

            {workOrder.invoice ? (
              <p className="mt-4 text-sm text-zinc-500">
                Line items are locked because{" "}
                <Link href={`/invoices/${workOrder.invoice.id}`} className="underline">
                  an invoice
                </Link>{" "}
                has been generated for this work order.
              </p>
            ) : (
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
                        <option value="FEE">Fee</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="description" className={labelClass}>
                        Description
                      </label>
                      <input id="description" name="description" required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="partId" className={labelClass}>
                      Link inventory part (optional)
                    </label>
                    <select id="partId" name="partId" className={inputClass} defaultValue="">
                      <option value="">None</option>
                      {parts.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.name}
                        </option>
                      ))}
                    </select>
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
            )}
          </section>
        </div>

        <ActionPanel>
          <form action={updateWorkOrderStatus} className="space-y-2">
            <input type="hidden" name="workOrderId" value={workOrder.id} />
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={workOrder.status}
              className={`${inputClass} w-full`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <button type="submit" className={`${secondaryButtonClass} w-full`}>
              Update status
            </button>
          </form>

          <form
            action={assignTechnician}
            className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800"
          >
            <input type="hidden" name="workOrderId" value={workOrder.id} />
            <label htmlFor="assignedToId" className={labelClass}>
              Assigned technician
            </label>
            <select
              id="assignedToId"
              name="assignedToId"
              defaultValue={workOrder.assignedToId ?? ""}
              className={`${inputClass} w-full`}
            >
              <option value="">Unassigned</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.firstName} {tech.lastName}
                </option>
              ))}
            </select>
            <button type="submit" className={`${secondaryButtonClass} w-full`}>
              Update assignment
            </button>
          </form>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {workOrder.invoice ? (
              <Link
                href={`/invoices/${workOrder.invoice.id}`}
                className={`${secondaryButtonClass} block w-full text-center`}
              >
                View invoice
              </Link>
            ) : (
              <form action={generateInvoice}>
                <input type="hidden" name="workOrderId" value={workOrder.id} />
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  Generate invoice
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Link
              href={`/work-orders/${workOrder.id}/edit`}
              className="text-sm text-zinc-500 hover:underline"
            >
              Edit description &amp; odometer
            </Link>
          </div>
        </ActionPanel>
      </div>
    </div>
  );
}
