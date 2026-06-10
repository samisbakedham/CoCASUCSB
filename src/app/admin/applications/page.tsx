import { Badge } from "@/components/Badge";
import { createServerSupabase } from "@/lib/supabase/server";
import { advanceApplication } from "../actions";

const STATUSES = [
  { value: "received", label: "New" },
  { value: "under_review", label: "Reviewing" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offered" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const NEXT: Record<string, string> = {
  received: "under_review",
  under_review: "interview",
  interview: "offer",
  offer: "accepted",
};

interface AppRow {
  id: string;
  full_name: string;
  ucsb_email: string;
  phone: string | null;
  year: string | null;
  major: string | null;
  pronouns: string | null;
  answers: Record<string, unknown>;
  status: string;
  submitted_at: string;
  position: { title: string; bcu: { short_name: string | null; name: string } | null } | null;
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params?.status ?? "active";
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("application")
    .select(
      "id,full_name,ucsb_email,phone,year,major,pronouns,answers,status,submitted_at,position:position_id(title,bcu:bcu_id(short_name,name))",
    )
    .order("submitted_at", { ascending: false });
  const apps = (data ?? []) as unknown as AppRow[];
  const visibleApps = apps.filter((app) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") {
      return !["accepted", "rejected", "declined", "withdrawn"].includes(app.status);
    }
    return app.status === statusFilter;
  });

  const counts = new Map<string, number>();
  for (const app of apps) counts.set(app.status, (counts.get(app.status) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-ocean">Candidate pipeline</p>
          <h1 className="mt-1 text-3xl font-extrabold text-navy">Applications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Review applicant context, move people through decisions, and keep the status history accountable.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          <span className="font-extrabold tabular-nums text-navy">{visibleApps.length}</span>{" "}
          <span className="font-semibold text-muted">shown</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-lg border border-border bg-surface p-2">
        <Filter href="/admin/applications" active={statusFilter === "active"} label="Active" count={activeCount(apps)} />
        <Filter href="/admin/applications?status=all" active={statusFilter === "all"} label="All" count={apps.length} />
        {STATUSES.map((status) => (
          <Filter
            key={status.value}
            href={`/admin/applications?status=${status.value}`}
            active={statusFilter === status.value}
            label={status.label}
            count={counts.get(status.value) ?? 0}
          />
        ))}
      </div>

      {visibleApps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No applications match this view.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleApps.map((app) => (
            <article key={app.id} className="rounded-lg border border-border bg-surface">
              <div className="grid gap-4 border-b border-border p-4 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-navy">{app.full_name}</h2>
                    <Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {app.position?.title ?? "Unknown position"}
                  </p>
                  <p className="text-xs text-muted">
                    {app.position?.bcu?.short_name ?? app.position?.bcu?.name ?? "Unassigned"} · Submitted{" "}
                    {formatDate(app.submitted_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  {NEXT[app.status] && (
                    <StatusForm app={app} to={NEXT[app.status]} label={`Move to ${statusLabel(NEXT[app.status])}`} primary />
                  )}
                  <StatusForm app={app} to="rejected" label="Reject" />
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
                <dl className="grid gap-2 text-sm">
                  <Info label="Email" value={app.ucsb_email} />
                  <Info label="Phone" value={app.phone} />
                  <Info label="Year" value={app.year} />
                  <Info label="Major" value={app.major} />
                  <Info label="Pronouns" value={app.pronouns} />
                </dl>

                <div className="rounded-lg bg-background p-4">
                  <h3 className="text-xs font-extrabold uppercase text-navy">Application answers</h3>
                  {answerEntries(app.answers).length ? (
                    <div className="mt-3 space-y-3">
                      {answerEntries(app.answers).map(([question, answer]) => (
                        <div key={question}>
                          <p className="text-xs font-bold text-muted">{question}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {String(answer)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted">No written answers were captured for this application.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Filter({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <a
      href={href}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold ${
        active ? "bg-navy text-white" : "text-navy hover:bg-navy/5"
      }`}
    >
      {label} <span className={active ? "text-white/80" : "text-muted"}>{count}</span>
    </a>
  );
}

function StatusForm({
  app,
  to,
  label,
  primary = false,
}: {
  app: AppRow;
  to: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={advanceApplication}>
      <input type="hidden" name="id" value={app.id} />
      <input type="hidden" name="from" value={app.status} />
      <input type="hidden" name="to" value={to} />
      <button
        className={`rounded-md px-3 py-2 text-sm font-bold ${
          primary
            ? "bg-ocean text-white hover:brightness-95"
            : "bg-background text-muted ring-1 ring-border hover:text-coral"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[72px_1fr] gap-3">
      <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
      <dd className="min-w-0 break-words font-semibold text-navy">{value || "—"}</dd>
    </div>
  );
}

function activeCount(apps: AppRow[]): number {
  return apps.filter((app) => !["accepted", "rejected", "declined", "withdrawn"].includes(app.status)).length;
}

function answerEntries(answers: Record<string, unknown>): [string, unknown][] {
  return Object.entries(answers ?? {}).filter(([, value]) => value != null && String(value).trim() !== "");
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function statusTone(status: string): string {
  if (status === "accepted") return "kelp";
  if (status === "rejected" || status === "declined" || status === "withdrawn") return "coral";
  if (status === "interview" || status === "offer") return "gold";
  if (status === "under_review") return "ocean";
  return "sky";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
}
