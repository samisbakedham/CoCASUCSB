import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPosition } from "@/lib/data";
import { ROUTING } from "@/lib/brand";
import { ApplyForm } from "@/components/ApplyForm";
import { WaveDivider } from "@/components/decor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getPosition(id);
  return {
    title: p ? `${p.title} — ${p.bcu_name}` : "Position",
    description: p
      ? `Apply to be ${p.title} with ${p.bcu_name} at AS UCSB.`
      : undefined,
  };
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
    <div>
      {/* Header band */}
      <section className="band-ocean relative text-white">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10">
          <Link
            href="/positions"
            className="text-sm font-semibold text-sky-200 hover:text-white hover:underline"
          >
            ← All open positions
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={`/bcu/${p.bcu_slug}`}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20 transition hover:bg-gold hover:text-navy"
            >
              {p.bcu_name} ↗
            </Link>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/30">
              {r.label}
            </span>
            {p.openings ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/15">
                {p.openings} opening{p.openings > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {p.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sky-100/90">{r.blurb}</p>
        </div>
        <WaveDivider fill="var(--background)" className="absolute inset-x-0 bottom-0" />
      </section>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        {p.description && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
              About the role
            </h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-foreground/85">
              {p.description}
            </p>
          </section>
        )}

        {p.legal_code && (
          <section className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
              Legal code
            </h2>
            <p className="mt-2 whitespace-pre-line rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground/80">
              {p.legal_code}
            </p>
          </section>
        )}

        {p.notes && (
          <p className="mb-8 rounded-xl border-l-4 border-gold bg-surface p-4 text-sm text-muted">
            <span className="font-semibold text-navy">Note from CoC: </span>
            {p.notes}
          </p>
        )}

        {/* Apply */}
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-kelp" />
            <h2 className="text-xl font-extrabold text-navy">Apply for this seat</h2>
          </div>
          {external ? (
            <div className="mt-3">
              <p className="text-muted">
                {p.bcu_name} accepts applications through its own form.
              </p>
              <a
                href={p.external_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:brightness-95"
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

        <div className="mt-8 text-center">
          <Link
            href={`/bcu/${p.bcu_slug}`}
            className="text-sm font-semibold text-ocean hover:underline"
          >
            See everything {p.bcu_short || p.bcu_name} is hiring for →
          </Link>
        </div>
      </div>
    </div>
  );
}
