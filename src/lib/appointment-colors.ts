export const APPOINTMENT_TYPE_COLOR_OPTIONS = [
  { value: "blue", label: "Blue", swatch: "bg-blue-500", block: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60" },
  { value: "green", label: "Green", swatch: "bg-green-500", block: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/60" },
  { value: "amber", label: "Amber", swatch: "bg-amber-500", block: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60" },
  { value: "red", label: "Red", swatch: "bg-red-500", block: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/60" },
  { value: "purple", label: "Purple", swatch: "bg-purple-500", block: "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/60" },
  { value: "teal", label: "Teal", swatch: "bg-teal-500", block: "border-teal-300 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/60" },
  { value: "pink", label: "Pink", swatch: "bg-pink-500", block: "border-pink-300 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/60" },
  { value: "slate", label: "Slate", swatch: "bg-slate-500", block: "border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" },
] as const;

const FALLBACK_BLOCK_COLOR = "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900";

export function getAppointmentTypeBlockColor(colorKey: string | null | undefined): string {
  return APPOINTMENT_TYPE_COLOR_OPTIONS.find((c) => c.value === colorKey)?.block ?? FALLBACK_BLOCK_COLOR;
}
