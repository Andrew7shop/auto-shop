export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">This section hasn&apos;t been built yet.</p>
      </div>
    </div>
  );
}
