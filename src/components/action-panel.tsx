import type { ReactNode } from "react";

export function ActionPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="print:hidden lg:sticky lg:top-8 lg:w-72 lg:shrink-0 lg:self-start">
      <div className="space-y-5 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Actions</h2>
        {children}
      </div>
    </aside>
  );
}
