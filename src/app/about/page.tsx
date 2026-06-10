import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "What the Committee on Committees does, and the transparency charter behind this platform.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
        About the Committee on Committees
      </h1>
      <p className="mt-4 text-lg text-muted">
        CoC is the appointments and transparency body of Associated Students. We
        recruit, advertise, interview, and appoint students into seats across
        every AS board, commission, and unit — and we keep the public record of
        who serves where.
      </p>

      <section className="mt-10 space-y-4 text-foreground/85">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          What we do
        </h2>
        <ul className="space-y-2">
          {[
            "Maintain the list of every open position across AS.",
            "Run a fair, tracked application and interview process.",
            "Appoint students and keep the roster of who holds each role.",
            "Connect students to boards through outreach and recruitment.",
            "Keep the record — rosters, minutes, and budgets — open to all.",
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunrise" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="transparency" className="mt-12 scroll-mt-24">
        <h2 className="text-2xl font-extrabold text-navy">Transparency charter</h2>
        <p className="mt-3 text-muted">
          Our rule of thumb: <strong>roles and money are public; people&apos;s
          application data is not.</strong> This boundary is enforced in the
          database itself, not just the interface.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-kelp/30 bg-kelp/5 p-5">
            <h3 className="font-bold text-kelp">Public by default</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              <li>Boards, commissions &amp; units</li>
              <li>Chairs, members &amp; vacancies</li>
              <li>Open positions &amp; descriptions</li>
              <li>CoC &amp; AS budgets</li>
              <li>Meeting minutes &amp; metrics</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-coral/30 bg-coral/5 p-5">
            <h3 className="font-bold text-coral">Private &amp; protected</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              <li>Applicant contact info</li>
              <li>Application contents</li>
              <li>Interview notes &amp; scores</li>
              <li>Deliberations</li>
              <li>Anything FERPA-protected</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="font-semibold text-navy">Ready to get involved?</p>
        <Link
          href="/positions"
          className="mt-3 inline-block rounded-xl bg-sunrise px-5 py-3 text-sm font-bold text-navy transition hover:brightness-95"
        >
          Browse open positions →
        </Link>
      </div>
    </div>
  );
}
