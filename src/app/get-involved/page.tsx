import type { Metadata } from "next";
import Link from "next/link";
import { getOpenPositions } from "@/lib/data";
import { GoldRule } from "@/components/decor";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "New to Associated Students? Here's exactly how to find a position, apply, interview, and get appointed.",
};

const STEPS = [
  {
    n: "01",
    c: "var(--ocean)",
    t: "Find a seat that fits",
    d: "Browse every open position across AS. Filter by how you'd apply, search by board, or just scroll. Each listing tells you the role, the board, and exactly how applications are handled.",
    cta: { href: "/positions", label: "Browse open positions" },
  },
  {
    n: "02",
    c: "var(--gold)",
    t: "Apply online",
    d: "Most CoC-run roles take one short application — your name, year, and why you're interested. Apply to as many positions as you like. Some boards collect applications on their own form; the listing links you straight there.",
  },
  {
    n: "03",
    c: "var(--kelp)",
    t: "Interview",
    d: "If you're a fit, you'll be invited to a short interview — usually ~30 minutes over Zoom or in person. It's a conversation, not an interrogation: we want to know that you understand the role, have something to contribute, and are excited to be there.",
  },
  {
    n: "04",
    c: "var(--coral)",
    t: "Get appointed",
    d: "After interviews and deliberation, you'll hear back with an offer or a kind no. Accept your seat, get onboarded, and you're officially part of Associated Students.",
  },
];

const FAQ = [
  {
    q: "Do I need experience?",
    a: "No. Most boards actively want fresh perspectives and first-timers. Enthusiasm and reliability matter more than a résumé.",
  },
  {
    q: "What's a BCU?",
    a: "Boards, Commissions & Units — the many student-run groups inside AS, from the Bike Shop and KCSB to the Food Bank, Program Board, and dozens of commissions and committees. Each one is a place to get involved.",
  },
  {
    q: "How much time does it take?",
    a: "It varies by role — many are a few hours a week. The position listing and your interview are the best places to ask about the real commitment.",
  },
  {
    q: "How should I prepare for the interview?",
    a: "Know the position (read its description and legal code on the listing), think about your relevant experience, and be ready to say what you'd contribute. That's genuinely most of it.",
  },
  {
    q: "What do the application tags mean?",
    a: "“CoC interviews” means we run the search — apply right here. “Applies on BCU site” means that board takes applications on its own form (we link it). “Forwarded to BCU” means you apply here and we route it to the board.",
  },
];

export default async function GetInvolvedPage() {
  const positions = await getOpenPositions();

  return (
    <div>
      {/* Header */}
      <section className="band-ocean text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-gold">
            A student&apos;s guide
          </span>
          <GoldRule className="mt-3" />
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            How to get a seat in AS.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-sky-100/90">
            You don&apos;t need to know anyone or have done this before. There are{" "}
            <strong className="text-white">{positions.length} positions open</strong>{" "}
            right now — here&apos;s exactly how to land one.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <ol className="space-y-10">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-5 sm:gap-7">
              <div className="flex flex-col items-center">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-black text-white"
                  style={{ backgroundColor: s.c }}
                >
                  {s.n}
                </span>
                <span className="mt-2 w-px flex-1 bg-border" />
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-extrabold text-navy">{s.t}</h2>
                <p className="mt-2 leading-relaxed text-muted">{s.d}</p>
                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="mt-3 inline-block rounded-lg bg-gold px-4 py-2 text-sm font-bold text-[#003660] transition hover:brightness-95"
                  >
                    {s.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-2xl font-extrabold text-navy">Common questions</h2>
          <div className="mt-6 divide-y divide-border">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-navy">
                  {f.q}
                  <span className="text-ocean transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--alt-surface)]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-navy">
            Ready when you are.
          </h2>
          <Link
            href="/positions"
            className="mt-6 inline-block rounded-xl bg-gold px-6 py-3.5 text-sm font-extrabold text-[#003660] shadow-md transition hover:brightness-95"
          >
            See all {positions.length} open positions →
          </Link>
        </div>
      </section>
    </div>
  );
}
