export function PlaceholderPage({ title, level = "h1" }: { title: string; level?: "h1" | "h2" }) {
  const Heading = level;
  return (
    <div className="space-y-4">
      <Heading
        className={
          level === "h1"
            ? "text-2xl font-semibold text-zinc-900 dark:text-zinc-50"
            : "text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        }
      >
        {title}
      </Heading>
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">This section hasn&apos;t been built yet.</p>
      </div>
    </div>
  );
}
