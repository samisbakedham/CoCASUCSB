import type { Metadata } from "next";
import Link from "next/link";
import { getBcus, getOpenPositions, getRoster } from "@/lib/data";
import { computeMetrics } from "@/lib/metrics";
import { dataSource } from "@/lib/data";

export const metadata: Metadata = {
  title: "Metrics",
  description:
    "CoC's own scoreboard — how many seats are open, how AS is staffed, and how the committee routes recruitment. Accountability, made visible.",
};

export default async function MetricsPage() {
  const [positions, bcus, roster] = await Promise.all([
    getOpenPositions(),
    getBcus(),
    getRoster(),
  ]);
  const m = computeMetrics(positions, bcus, roster);
  const routingMax = Math.max(1, ...m.routing.map((r) => r.count));
  const topBcu = m.byBcu.slice(0, 12);
  const bcuMax = Math.max(1, ...topBcu.map((b) => b.count));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          The scoreboard
        </h1>
        <p className="mt-3 text-muted">
          Accountability means putting our own numbers in public. Here&apos;s the
          state of recruitment across Associated Students, live from the same
          data that powers this site.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric value={m.openPositions} label="Open positions" />
        <Metric value={m.bcusWithOpenings} label="BCUs hiring now" sub={`of ${m.bcuTotal}`} />
        <Metric value={m.cocInterviews} label="CoC-run searches" />
        <Metric value={`${m.staffedCoverage}%`} label="BCUs with listed leadership" />
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <Card title="How students apply">
          <div className="space-y-3">
            {m.routing.map((r) => (
              <Bar key={r.key} label={r.label} value={r.count} max={routingMax} tone="ocean" />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            CoC runs the interview for {m.cocInterviews} of {m.openPositions} open
            seats; the rest are routed to their boards or external forms.
          </p>
        </Card>

        <Card title="Roster at a glance">
          <dl className="grid grid-cols-2 gap-4">
            <Figure n={m.rosterSeats} label="Listed seats" />
            <Figure n={m.chairs} label="Chairs" />
            <Figure n={m.bcuTotal} label="BCUs tracked" />
            <Figure n={m.byType.length} label="Org types" />
          </dl>
          <div className="mt-5 space-y-1.5">
            {m.byType.map((t) => (
              <div key={t.type} className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground/80">{t.type}</span>
                <span className="font-semibold text-navy">
                  {t.positions} open · {t.bcus} {t.bcus === 1 ? "body" : "bodies"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <Card title="Where the openings are">
          <div className="space-y-2.5">
            {topBcu.map((b) => (
              <Bar
                key={b.slug}
                label={b.short || b.name}
                href={`/bcu/${b.slug}`}
                value={b.count}
                max={bcuMax}
                tone="gold"
                suffix=" open"
              />
            ))}
          </div>
        </Card>
      </section>

      <p className="mt-8 text-xs text-muted">
        Source: {dataSource === "live" ? "live database" : "spreadsheet snapshot"}.
        Application-volume and time-to-fill metrics activate once the database is
        connected and applications start flowing through the platform.
      </p>
    </div>
  );
}

function Metric({ value, label, sub }: { value: number | string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-3xl font-extrabold text-ocean">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {sub && <span className="ml-1 normal-case text-muted/70">{sub}</span>}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Figure({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-navy">{n}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
  href,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  tone: "ocean" | "gold";
  href?: string;
  suffix?: string;
}) {
  const pct = Math.max(4, Math.round((value / max) * 100));
  const bar = tone === "ocean" ? "bg-ocean" : "bg-gold";
  const labelEl = href ? (
    <Link href={href} className="truncate hover:text-ocean hover:underline">
      {label}
    </Link>
  ) : (
    <span className="truncate">{label}</span>
  );
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 shrink-0 text-sm text-foreground/85">{labelEl}</div>
      <div className="h-5 flex-1 overflow-hidden rounded-md bg-background">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-navy">
        {value}
        {suffix}
      </div>
    </div>
  );
}
