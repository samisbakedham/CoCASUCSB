import type { Metadata } from "next";
import { getBudget } from "@/lib/data";
import { currency, currencyExact } from "@/lib/brand";
import { Badge } from "@/components/Badge";
import { Donut, type Segment } from "@/components/Donut";

export const metadata: Metadata = {
  title: "Budget",
  description:
    "Readable AS UCSB and Committee on Committees budget transparency dashboard.",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Career staff salaries": "#003660",
  "Special & grant projects": "#047c91",
  "Operating expenses": "#ef5645",
  "Contracts & contractors": "#febc11",
  "Student staff wages": "#9cbebe",
  Grants: "#09847a",
  "Honoraria & stipends": "#c43424",
};

const ROLLUP_ROWS = new Set(["Lock-In Total", "Grand Total"]);
const AGGREGATE_ROWS = new Set(["AS Non-Lock-In BCUs"]);

export default async function BudgetPage() {
  const budget = await getBudget();

  const asTotal = budget.find((b) => b.category === "as_total")?.amount ?? null;
  const asCategories = budget
    .filter((b) => b.category === "as_category")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const staffCategory = asCategories.find((b) => b.description === "Career staff salaries");
  const staffPct =
    staffCategory?.amount && asTotal ? Math.round((staffCategory.amount / asTotal) * 100) : null;

  const segments: Segment[] = asCategories.map((b) => ({
    label: b.description ?? "Uncategorized",
    value: b.amount ?? 0,
    color: CATEGORY_COLORS[b.description ?? ""] ?? "#94a3b8",
  }));

  const staffRowsRaw = budget
    .filter((b) => b.category === "staff_allocation")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const staffRollups = staffRowsRaw.filter((b) => ROLLUP_ROWS.has(b.entity));
  const staffAggregates = staffRowsRaw.filter((b) => AGGREGATE_ROWS.has(b.entity));
  const staffAllocations = staffRowsRaw.filter(
    (b) => !ROLLUP_ROWS.has(b.entity) && !AGGREGATE_ROWS.has(b.entity),
  );
  const namedStaffTotal = staffAllocations.reduce((s, b) => s + (b.amount ?? 0), 0);
  const aggregateStaffTotal = staffAggregates.reduce((s, b) => s + (b.amount ?? 0), 0);
  const shownStaffTotal = namedStaffTotal + aggregateStaffTotal;
  const staffMax = Math.max(1, ...staffAllocations.map((b) => b.amount ?? 0));
  const largestStaff = staffAllocations[0];

  const coc = budget.filter((b) => b.entity === "CoC");
  const cocTotal = coc.find((b) => b.category === "allocation")?.amount ?? null;
  const cocRemaining = coc.find((b) => b.category === "remaining")?.amount ?? null;
  const cocSpent = cocTotal != null && cocRemaining != null ? cocTotal - cocRemaining : null;
  const cocExpenses = coc
    .filter((b) => b.category === "expense")
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const expMax = Math.max(1, ...cocExpenses.map((b) => b.amount ?? 0));

  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-ocean">Budget transparency</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
                Student fees, translated into plain English.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
                The AS Senate-recommended budget is{" "}
                <strong className="text-navy">{currency(asTotal)}</strong>. This page separates the whole AS
                budget from CoC&apos;s own budget and from staff-allocation rollups, so totals do not get counted twice.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroStat label="AS budget" value={currency(asTotal)} detail="FY 2026-27 Senate recommendation" />
              <HeroStat
                label="Career staff category"
                value={currency(staffCategory?.amount)}
                detail={staffPct != null ? `${staffPct}% of total AS spending` : "Largest spending category"}
              />
              <HeroStat label="CoC budget" value={currency(cocTotal)} detail="FY 2025-26 committee budget" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-navy">Whole AS budget</h2>
                <p className="mt-1 text-sm text-muted">One distribution; category rows add exactly to the total.</p>
              </div>
              <Badge tone="ocean">FY 2026-27</Badge>
            </div>
            <div className="mt-6">
              <Donut segments={segments} centerLabel="AS spending" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-navy/20 bg-navy p-6 text-white">
              <p className="text-sm font-bold uppercase text-sky-200">Main finding</p>
              <div className="mt-3 text-4xl font-extrabold text-gold">
                {currency(staffCategory?.amount)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-sky-100/90">
                Career staff salaries are the largest AS spending category. The section below breaks out the subset
                of that staff category that is allocated to named boards, commissions, and units.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="text-sm font-extrabold uppercase text-navy">How to read the staff section</h3>
              <div className="mt-4 space-y-3 text-sm text-muted">
                <Explanation label="Rollups removed">
                  `Lock-In Total` and `Grand Total` are summary rows from the spreadsheet. They are not included in
                  the bar chart, which fixes the double-counting.
                </Explanation>
                <Explanation label="Aggregate separated">
                  `AS Non-Lock-In BCUs` is shown as a separate aggregate instead of being treated like a single board.
                </Explanation>
                <Explanation label="Named BCUs">
                  The ranked list shows only named BCU allocations, so KCSB, Bike Shop, ASPB, and others compare
                  cleanly.
                </Explanation>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold text-navy">Career-staff allocation by BCU</h2>
                <Badge tone="gold">corrected</Badge>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
                Named BCU rows total <strong className="text-navy">{currencyExact(namedStaffTotal)}</strong>.
                The additional non-lock-in aggregate is{" "}
                <strong className="text-navy">{currencyExact(aggregateStaffTotal)}</strong>, for a displayed staff
                allocation subtotal of <strong className="text-navy">{currencyExact(shownStaffTotal)}</strong>.
              </p>
            </div>
            {largestStaff && (
              <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
                <span className="font-bold text-muted">Largest named allocation</span>
                <div className="font-extrabold text-navy">
                  {largestStaff.entity} · {currency(largestStaff.amount)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-border bg-surface">
              <div className="grid grid-cols-[160px_1fr_120px] gap-3 border-b border-border bg-background px-4 py-3 text-xs font-extrabold uppercase text-muted max-sm:hidden">
                <span>BCU</span>
                <span>Relative size</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="divide-y divide-border">
                {staffAllocations.map((b, i) => (
                  <BarRow
                    key={`${b.entity}-${i}`}
                    label={b.entity}
                    value={b.amount ?? 0}
                    max={staffMax}
                    pctOfTotal={shownStaffTotal ? ((b.amount ?? 0) / shownStaffTotal) * 100 : 0}
                  />
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <SummaryBox title="Spreadsheet rollups excluded">
                {staffRollups.map((row) => (
                  <div key={row.entity} className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-muted">{row.entity}</span>
                    <span className="font-bold tabular-nums text-navy">{currency(row.amount)}</span>
                  </div>
                ))}
              </SummaryBox>
              <SummaryBox title="Aggregate row shown separately">
                {staffAggregates.map((row) => (
                  <div key={row.entity} className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-muted">{row.entity}</span>
                    <span className="font-bold tabular-nums text-navy">{currency(row.amount)}</span>
                  </div>
                ))}
              </SummaryBox>
              <details className="rounded-lg border border-border bg-surface p-4">
                <summary className="cursor-pointer text-sm font-extrabold text-ocean">
                  Why the old page looked too high
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  It added `Lock-In Total`, `Grand Total`, and each individual BCU together. Since those total rows
                  already summarize other rows, the visible staff-allocation total was inflated by roughly $5.55M.
                </p>
              </details>
            </aside>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold text-navy">Committee on Committees budget</h2>
            <Badge tone="ocean">FY 2025-26</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            CoC&apos;s own operating budget is separate from the full AS budget above.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <SmallStat label="Total budget" value={currency(cocTotal)} tone="navy" />
            <SmallStat label="Spent" value={currency(cocSpent)} tone="ocean" />
            <SmallStat label="Remaining" value={currency(cocRemaining)} tone="kelp" />
          </div>

          <div className="mt-5 rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-extrabold uppercase text-navy">Spending detail</h3>
            </div>
            <div className="divide-y divide-border">
              {cocExpenses.map((b, i) => (
                <CoCRow key={`${b.description}-${i}`} label={b.description ?? "Uncategorized"} value={b.amount ?? 0} max={expMax} />
              ))}
            </div>
          </div>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Sources: `reference/26-27 AS UCSB Senate Budget Final.xlsx` and `reference/2025-26 CoC Budget.xlsx`.
          Figures are presented for transparency and context; official account records remain with AS and UCSB systems.
        </p>
      </div>
    </div>
  );
}

function HeroStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-2xl font-extrabold text-navy">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase text-muted">{label}</div>
      <p className="mt-2 text-xs font-semibold text-ocean">{detail}</p>
    </div>
  );
}

function Explanation({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-bold text-navy">{label}</div>
      <p className="mt-0.5 leading-relaxed">{children}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  pctOfTotal,
}: {
  label: string;
  value: number;
  max: number;
  pctOfTotal: number;
}) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="grid gap-2 px-4 py-3 sm:grid-cols-[160px_1fr_120px] sm:items-center">
      <div className="min-w-0">
        <div className="truncate font-mono text-xs font-bold text-navy" title={label}>
          {label}
        </div>
        <div className="text-[11px] font-semibold text-muted sm:hidden">{pctOfTotal.toFixed(1)}% of displayed subtotal</div>
      </div>
      <div>
        <div className="h-5 overflow-hidden rounded-md bg-background ring-1 ring-border">
          <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 hidden text-[11px] font-semibold text-muted sm:block">
          {pctOfTotal.toFixed(1)}% of displayed subtotal
        </div>
      </div>
      <div className="text-right text-sm font-extrabold tabular-nums text-navy">{currency(value)}</div>
    </div>
  );
}

function SummaryBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-extrabold uppercase text-navy">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SmallStat({
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
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="mt-1 text-xs font-bold uppercase text-muted">{label}</div>
    </div>
  );
}

function CoCRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="grid gap-2 px-4 py-3 sm:grid-cols-[220px_1fr_120px] sm:items-center">
      <div className="text-sm font-bold text-navy">{label}</div>
      <div className="h-4 overflow-hidden rounded-md bg-background ring-1 ring-border">
        <div className="h-full bg-ocean" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-right text-sm font-extrabold tabular-nums text-navy">{currency(value)}</div>
    </div>
  );
}
