import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosition } from "@/lib/data";
import { ROUTING } from "@/lib/brand";
import { Badge } from "@/components/Badge";
import { ApplyForm } from "@/components/ApplyForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getPosition(id);
  return { title: p ? `${p.title} — ${p.bcu_name}` : "Position" };
}

export default async function PositionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getPosition(id);
  if (!p) notFound();

  const r = ROUTING[p.routing];
  const external = p.routing === "external_form" && p.external_url;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/positions" className="text-sm font-semibold text-ocean hover:underline">
        ← All open positions
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={`/bcu/${p.bcu_slug}`}>
          <Badge tone="navy">{p.bcu_name} ↗</Badge>
        </Link>
        <Badge tone={r.tone}>{r.label}</Badge>
        {p.openings ? <Badge tone="muted">{p.openings} opening(s)</Badge> : null}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
        {p.title}
      </h1>
      <p className="mt-3 text-muted">{r.blurb}</p>

      {p.description && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
            About the role
          </h2>
          <p className="mt-2 whitespace-pre-line text-foreground/85">{p.description}</p>
        </section>
      )}

      {p.legal_code && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
            Legal code
          </h2>
          <p className="mt-2 whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-sm text-foreground/80">
            {p.legal_code}
          </p>
        </section>
      )}

      {p.notes && (
        <p className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          <span className="font-semibold text-navy">Note from CoC: </span>
          {p.notes}
        </p>
      )}

      {/* Apply */}
      <section className="mt-10 rounded-3xl border border-border bg-background p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-navy">Apply</h2>
        {external ? (
          <div className="mt-3">
            <p className="text-muted">
              {p.bcu_name} accepts applications through its own form.
            </p>
            <a
              href={p.external_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sunrise px-5 py-3 text-sm font-bold text-navy shadow-sm transition hover:brightness-95"
            >
              Apply on {p.bcu_short || p.bcu_name}&apos;s site ↗
            </a>
          </div>
        ) : (
          <div className="mt-4">
            <ApplyForm position={p} />
          </div>
        )}
      </section>
    </div>
  );
}
