import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBcuDetail } from "@/lib/data";
import { BCU_TYPE_LABEL, ROUTING } from "@/lib/brand";
import { Badge } from "@/components/Badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { bcu } = await getBcuDetail(slug);
  return { title: bcu ? bcu.name : "Board" };
}

export default async function BcuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { bcu, positions, roster } = await getBcuDetail(slug);
  if (!bcu) notFound();

  const chairs = roster.filter((r) => r.is_chair);
  const members = roster.filter((r) => !r.is_chair);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/directory" className="text-sm font-semibold text-ocean hover:underline">
        ← Who runs AS
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge tone="navy">{BCU_TYPE_LABEL[bcu.type]}</Badge>
        {positions.length > 0 && (
          <Badge tone="kelp">{positions.length} open position(s)</Badge>
        )}
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
        {bcu.name}
      </h1>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
        {bcu.website && (
          <a
            href={bcu.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ocean hover:underline"
          >
            Official site ↗
          </a>
        )}
        {bcu.contact_name && <span>Contact: {bcu.contact_name}</span>}
      </div>

      {/* Open positions */}
      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          Open positions
        </h2>
        {positions.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {positions.map((p) => {
              const r = ROUTING[p.routing];
              return (
                <Link
                  key={p.id}
                  href={`/positions/${p.id}`}
                  className="group rounded-2xl border border-border bg-surface p-4 transition hover:border-ocean/40 hover:shadow-sm"
                >
                  <h3 className="font-bold leading-snug text-navy group-hover:text-ocean">
                    {p.title}
                  </h3>
                  <span className="mt-2 inline-block text-xs font-semibold text-muted">
                    {r.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-muted">
            No open positions listed right now.
          </p>
        )}
      </section>

      {/* People */}
      <section className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          Who serves here
        </h2>
        {roster.length ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
            {[...chairs, ...members].map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {r.full_name}
                  </div>
                  <div className="text-xs text-muted">{r.role_title}</div>
                </div>
                {r.is_chair && <Badge tone="gold">Chair</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-muted">No members listed yet.</p>
        )}
      </section>
    </div>
  );
}
