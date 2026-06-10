import Link from "next/link";
import { getBcus, getBudget, getOpenPositions, getRoster } from "@/lib/data";
import { currency } from "@/lib/brand";
import { SunWave } from "@/components/Brand";
import { WaveDivider, Sunburst, GoldRule } from "@/components/decor";

export default async function Home() {
  const [positions, bcus, roster, budget] = await Promise.all([
    getOpenPositions(),
    getBcus(),
    getRoster(),
    getBudget(),
  ]);
  const asBudget = budget.find((b) => b.category === "as_total")?.amount ?? 0;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="band-ocean relative overflow-hidden text-white">
        <Sunburst className="pointer-events-none absolute -right-16 -top-20 h-[28rem] w-[28rem] opacity-[0.13] sm:opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-16 sm:pt-24">
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.2em] text-gold">
            <SunWave className="h-5 w-5" />
            Associated Students · UC Santa Barbara
          </div>
          <h1 className="mt-6 max-w-4xl text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Every seat in student government —{" "}
            <span className="text-gold">open, named, and yours to take.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sky-100/90">
            The Committee on Committees recruits, interviews, and appoints
            students into every board, commission, and unit at AS — and keeps the
            whole thing in public view.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/positions"
              className="rounded-xl bg-gold px-6 py-3.5 text-sm font-extrabold text-navy shadow-lg transition hover:brightness-95"
            >
              Find an open seat →
            </Link>
            <Link
              href="/get-involved"
              className="rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold ring-1 ring-white/25 backdrop-blur transition hover:bg-white/15"
            >
              How it works
            </Link>
          </div>

          <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6">
            {[
              [String(positions.length), "seats open now"],
              [String(bcus.length), "boards, commissions & units"],
              [currency(asBudget), "student budget in public view"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-3xl font-extrabold text-white sm:text-4xl">{v}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-sky-200/80">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <WaveDivider
          fill="var(--surface)"
          back="var(--ocean)"
          className="absolute inset-x-0 bottom-0"
        />
      </section>

      {/* ── Mandate & mission ────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-ocean">
              Our mandate
            </span>
            <GoldRule className="mt-3" />
            <p className="mt-6 text-2xl font-semibold leading-snug text-navy sm:text-[1.7rem]">
              By AS Legal Code, the Committee on Committees is the body that{" "}
              <span className="underline decoration-gold decoration-4 underline-offset-4">
                staffs student government
              </span>
              . We recruit, advertise, interview, and appoint students into every
              Board, Commission, and Unit — plus student representatives to the
              Academic Senate and administrative committees.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              In plain terms: we decide who gets to help run a{" "}
              <strong className="text-navy">{currency(asBudget)}</strong> student
              government — and we make sure you can see all of it.
            </p>
          </div>
          <aside className="relative rounded-3xl bg-navy p-8 text-white">
            <SunWave className="h-9 w-9" />
            <p className="mt-5 text-xl font-bold leading-snug">
              Our mission: make student government impossible to be shut out
              of — and impossible to hide.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-sky-100/80">
              CoC was rebuilt from years of dormancy. We&apos;re putting every
              open seat, every appointment, and every dollar where students can
              actually find them.
            </p>
          </aside>
        </div>
      </section>

      {/* ── How to get involved (the guide) ──────────────────────────── */}
      <section className="bg-[#f1eeea]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-ocean">
                Get involved
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                From curious to appointed, in four steps.
              </h2>
            </div>
            <Link
              href="/get-involved"
              className="text-sm font-bold text-ocean hover:underline"
            >
              Read the full guide →
            </Link>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", c: "var(--ocean)", t: "Find a seat", d: "Browse every open position across AS — filter by board or by what you care about." },
              { n: "02", c: "var(--gold)", t: "Apply in minutes", d: "One short application. Apply to as many roles as you like; no résumé gymnastics." },
              { n: "03", c: "var(--kelp)", t: "Interview", d: "CoC or the board meets you — usually a friendly 30-minute conversation." },
              { n: "04", c: "var(--coral)", t: "Get appointed", d: "Accept your seat, get onboarded, and start shaping student government." },
            ].map((s) => (
              <li
                key={s.n}
                className="group relative rounded-2xl border-t-4 bg-surface p-6 shadow-sm"
                style={{ borderTopColor: s.c }}
              >
                <span
                  className="text-3xl font-black tabular-nums"
                  style={{ color: s.c }}
                >
                  {s.n}
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-navy">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What we oversee (real BCU names) ─────────────────────────── */}
      <section className="band-ocean relative overflow-hidden text-white">
        <WaveDivider
          fill="#f1eeea"
          className="absolute inset-x-0 top-0 rotate-180"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28">
          <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-gold">
            The breadth of it
          </span>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            One committee, {bcus.length} corners of student life.
          </h2>
          <p className="mt-4 max-w-2xl text-sky-100/85">
            From the Bike Shop to KCSB, the Food Bank to the Senate — these are the
            boards, commissions, and units we help staff. Every one of them needs
            students.
          </p>
          <div className="mt-9 flex flex-wrap gap-2.5">
            {bcus.map((b) => (
              <Link
                key={b.slug}
                href={`/bcu/${b.slug}`}
                className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-gold hover:text-navy hover:ring-gold"
              >
                {b.short || b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three commitments ────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-ocean">
            What we stand for
          </span>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
            {[
              { k: "Accountability", v: "Every appointment, vacancy, and dollar is on the record — not buried in an inbox or a private spreadsheet." },
              { k: "Efficiency", v: "Apply online, track your status, schedule your own interview. No emailing into the void." },
              { k: "Radical transparency", v: "Positions, rosters, budgets, and minutes are public the moment they exist." },
            ].map((c, i) => (
              <div key={c.k} className="bg-surface p-8">
                <span className="text-sm font-black tabular-nums text-gold">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-navy">{c.k}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{c.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="relative bg-[#f1eeea]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <Sunburst className="mx-auto h-16 w-16" />
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-navy sm:text-5xl">
            There&apos;s a seat with your name on it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            {positions.length} positions are open right now. Find one that fits and
            apply in a few minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/positions"
              className="rounded-xl bg-gold px-6 py-3.5 text-sm font-extrabold text-navy shadow-md transition hover:brightness-95"
            >
              Browse open positions →
            </Link>
            <Link
              href="/directory"
              className="rounded-xl bg-navy px-6 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              See who runs AS
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
