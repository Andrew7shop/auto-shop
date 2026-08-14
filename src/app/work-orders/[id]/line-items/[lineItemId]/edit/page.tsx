import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateLineItem } from "../../../../actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function EditLineItemPage({
  params,
}: PageProps<"/work-orders/[id]/line-items/[lineItemId]/edit">) {
  const { id, lineItemId } = await params;

  const lineItem = await prisma.lineItem.findUnique({ where: { id: lineItemId } });
  if (!lineItem || lineItem.workOrderId !== id) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit line item</h1>
      <form action={updateLineItem} className="space-y-4">
        <input type="hidden" name="lineItemId" value={lineItem.id} />
        <input type="hidden" name="workOrderId" value={id} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select id="type" name="type" className={inputClass} defaultValue={lineItem.type}>
              <option value="LABOR">Labor</option>
              <option value="PART">Part</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <input
              id="description"
              name="description"
              required
              defaultValue={lineItem.description}
              className={inputClass}
            />
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
              required
              defaultValue={lineItem.quantity.toString()}
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
              defaultValue={lineItem.unitPrice.toString()}
              className={inputClass}
            />
          </div>
        </div>
        <button type="submit" className={primaryButtonClass}>
          Save changes
        </button>
      </form>
    </div>
  );
}
