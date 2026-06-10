export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-border" />
      <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-border/70" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
