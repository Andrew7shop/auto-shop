const COLORS: Record<string, string> = {
  // work order / appointment
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  WAITING_ON_PARTS: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  WAITING_ON_APPROVAL: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  CANCELLED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  // invoice
  UNPAID: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  VOID: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  // appointment
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  NO_SHOW: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  // purchase order
  DRAFT: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  ORDERED: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  RECEIVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export function Badge({ status }: { status: string }) {
  const classes = COLORS[status] ?? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
