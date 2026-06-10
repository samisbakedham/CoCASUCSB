import type { Metadata } from "next";
import { getBudget } from "@/lib/data";
import { currency, currencyExact } from "@/lib/brand";
import { Badge } from "@/components/Badge";
import { Donut, type Segment } from "@/components/Donut";

export const metadata: Metadata = {
  title: "Budget",
  description:
    "Where your AS dollars go — the full $15.5M Associated Students budget, and why nearly half of it is staff salaries.",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Career staff salaries": "#003660", // navy
  "Special & grant projects": "#047c91", // aqua
  "Operating expenses": "#ef5645", // coral
  "Contracts & contractors": "#febc11", // gold
  "Student staff wages": "#9cbebe", // mist
  Grants: "#09847a", // sea green
  "Honoraria & stipends": "#c43424", // dark coral
};

export default async function BudgetPage() {
  const budget = await getBudget();

  // AS full budget — spending by category
  const asTotal =
    budget.find((b) => b.category === "as_total")?.amount ?? null;
  const asCats = budget
    .filter((b) => b.category === "as_category")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const staff = asCats.find((b) => b.description === "Career staff salaries");
  const staffPct =
    staff?.amount && asTotal ? Math.round((staff.amount / asTotal) * 100) : null;
  const segments: Segment[] = asCats.map((b) => ({
    label: b.description ?? "—",
    value: b.amount ?? 0,
    color: CATEGORY_COLORS[b.description ?? ""] ?? "#94a3b8",
  }));

  // per-board staff funding
  const asAlloc = budget
    .filter((b) => b.category === "staff_allocation")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const allocTotal = asAlloc.reduce((s, b) => s + (b.amount ?? 0), 0);
  const allocMax = Math.max(1, ...asAlloc.map((b) => b.amount ?? 0));

  // CoC's own budget
  const coc = budget.filter((b) => b.entity === "CoC");
  const cocTotal = coc.find((b) => b.category === "allocation")?.amount ?? null;
  const cocRemaining = coc.find((b) => b.category === "remaining")?.amount ?? null;
  const cocExpenses = coc
    .filter((b) => b.category === "expense")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const expMax = Math.max(1, ...cocExpenses.map((b) => b.amount ?? 0));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Where your AS dollars go
        </h1>
        <p className="mt-3 text-muted">
          Associated Students runs on student fees. The 2026–27 Senate-recommended
          budget is{" "}
          <span className="font-semibold text-navy">{currency(asTotal)}</span> — and
          this is exactly how it&apos;s split.
        </p>
      </header>

      {/* Headline: staff salaries dominate */}
      {staff && (
        <div className="mt-8 overflow-hidden rounded-3xl border border-navy/15 bg-navy text-white">
          <div className="grid gap-6 p-7 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
            <div>
              <div className="text-4xl font-extrabold text-gold sm:text-5xl">
                {currency(staff.amount)}
              </div>
              <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-sky-200">
                {staffPct}% of all AS spending
              </div>
            </div>
            <p className="text-sky-100/90">
              <strong className="text-white">
                Professional career-staff salaries are the single largest expense
                in the AS budget — nearly half of every dollar
              </strong>
              , before any funding reaches programs, events, or student-run boards.
              The next-largest category is less than half its size.
            </p>
          </div>
        </div>
      )}

      {/* Donut: full budget */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          The whole budget · 2026–27
        </h2>
        <div className="mt-6">
          <Donut segments={segments} centerLabel="AS spending" />
        </div>
      </section>

      {/* Per-board staff funding */}
      <section className="mt-12">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-extrabold text-navy">
            Career-staff funding by board
          </h2>
          <Badge tone="gold">FY 2026–27</Badge>
        </div>
        <p className="mt-2 text-muted">
          How professional staff funding — the budget&apos;s biggest line — is
          allocated across {asAlloc.length} boards, commissions &amp; units, totaling{" "}
          <span className="font-semibold text-navy">{currencyExact(allocTotal)}</span>.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <div className="space-y-2.5">
            {asAlloc.map((b, i) => (
              <BarRow key={i} label={b.entity} value={b.amount ?? 0} max={allocMax} tone="gold" mono />
            ))}
          </div>
        </div>
      </section>

      {/* CoC's own budget */}
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-navy">
            Committee on Committees
          </h2>
          <Badge tone="ocean">FY 2025–26</Badge>
        </div>
        <p className="mt-2 text-muted">
          For comparison — our own committee&apos;s budget, in full.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <BigStat label="Total budget" value={currency(cocTotal)} tone="navy" />
          <BigStat
            label="Spent"
            value={currency(
              cocTotal != null && cocRemaining != null ? cocTotal - cocRemaining : null,
            )}
            tone="ocean"
          />
          <BigStat label="Remaining" value={currency(cocRemaining)} tone="kelp" />
        </div>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ocean">
            Spending breakdown
          </h3>
          <div className="mt-4 space-y-3">
            {cocExpenses.map((b, i) => (
              <BarRow key={i} label={b.description ?? "—"} value={b.amount ?? 0} max={expMax} tone="ocean" />
            ))}
          </div>
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">
        Sourced from the 2026–27 AS Senate budget and CoC&apos;s budget workbook.
        Category totals reflect Senate-recommended figures; a faithful rendering,
        not the official record of account.
      </p>
    </div>
  );
}

function BigStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "navy" | "ocean" | "kelp";
}) {
  const color = tone === "navy" ? "text-navy" : tone === "ocean" ? "text-ocean" : "text-kelp";
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  tone,
  mono = false,
}: {
  label: string;
  value: number;
  max: number;
  tone: "ocean" | "gold";
  mono?: boolean;
}) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  const bar = tone === "ocean" ? "bg-ocean" : "bg-gold";
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-40 shrink-0 truncate text-sm text-foreground/85 ${mono ? "font-mono text-xs" : ""}`}
        title={label}
      >
        {label}
      </div>
      <div className="flex-1">
        <div className="h-5 overflow-hidden rounded-md bg-background">
          <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-navy">
        {currency(value)}
      </div>
    </div>
  );
}
