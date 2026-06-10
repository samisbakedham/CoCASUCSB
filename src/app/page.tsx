import Link from "next/link";
import { getBcus, getBudget, getOpenPositions, getRoster } from "@/lib/data";
import { ROUTING, currency } from "@/lib/brand";
import { Badge } from "@/components/Badge";
import { SunWave } from "@/components/Brand";

export default async function Home() {
  const [positions, bcus, roster, budget] = await Promise.all([
    getOpenPositions(),
    getBcus(),
    getRoster(),
    getBudget(),
  ]);

  const asBudget = budget.find((b) => b.category === "as_total")?.amount ?? 0;

  const featured = positions
    .filter((p) => p.routing === "coc_interview" || p.routing === "forward_to_bcu")
    .slice(0, 6);
  const fallback = positions.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="band-ocean text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/20">
              <SunWave className="h-4 w-4" /> Public by default
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Every open seat in <span className="text-gold">Associated Students</span>, in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-sky-100/90">
              The Committee on Committees recruits and appoints students across
              every AS board, commission, and unit. This is where you see what&apos;s
              open, who runs AS, and where the money goes — and apply in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/positions"
                className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy shadow-lg transition hover:brightness-95"
              >
                Browse {positions.length} open positions →
              </Link>
              <Link
                href="/directory"
                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/25 transition hover:bg-white/15"
              >
                See who runs AS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stat band */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
          <Stat value={String(positions.length)} label="Open positions" />
          <Stat value={String(bcus.length)} label="Boards, commissions & units" />
          <Stat value={String(roster.length)} label="Staffed seats listed" />
          <Stat value={currency(asBudget)} label="AS budget · 2026–27" />
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-ocean">
          Why this exists
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Pillar
            title="Accountability"
            body="Every appointment, vacancy, and dollar is on the record. No more answers buried in someone's inbox or a private spreadsheet."
          />
          <Pillar
            title="Efficiency"
            body="Apply online, track your status, schedule your own interview. No emailing the Vice Chair and waiting in the dark."
          />
          <Pillar
            title="Radical transparency"
            body="Positions, rosters, and budgets are public the moment they exist. Students shouldn't have to ask what AS is doing."
          />
        </div>
      </section>

      {/* Featured positions */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-navy">Apply now</h2>
              <p className="mt-1 text-muted">
                A sample of seats currently open across AS.
              </p>
            </div>
            <Link
              href="/positions"
              className="hidden text-sm font-semibold text-ocean hover:underline sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(featured.length ? featured : fallback).map((p) => {
              const r = ROUTING[p.routing];
              return (
                <Link
                  key={p.id}
                  href={`/positions/${p.id}`}
                  className="group flex flex-col rounded-2xl border border-border bg-background p-5 transition hover:border-ocean/40 hover:shadow-md"
                >
                  <Badge tone="navy">{p.bcu_short || p.bcu_name}</Badge>
                  <h3 className="mt-3 font-bold leading-snug text-navy group-hover:text-ocean">
                    {p.title}
                  </h3>
                  <span className="mt-auto pt-4 text-xs font-semibold text-muted">
                    {r.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface px-5 py-7 text-center ring-1 ring-border">
      <div className="text-3xl font-extrabold text-ocean sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="h-1.5 w-10 rounded-full bg-sunrise" />
      <h3 className="mt-4 text-lg font-extrabold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
