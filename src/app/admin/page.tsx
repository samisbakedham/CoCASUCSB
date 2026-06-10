import Link from "next/link";
import { Badge } from "@/components/Badge";
import { createServerSupabase } from "@/lib/supabase/server";

const PIPELINE: { status: string; label: string; tone: string }[] = [
  { status: "received", label: "New", tone: "sky" },
  { status: "under_review", label: "Review", tone: "ocean" },
  { status: "interview", label: "Interview", tone: "gold" },
  { status: "offer", label: "Offer", tone: "navy" },
  { status: "accepted", label: "Accepted", tone: "kelp" },
];

interface AppRow {
  id: string;
  full_name: string;
  ucsb_email: string;
  status: string;
  submitted_at: string;
  position: {
    id: string;
    title: string;
    bcu: { name: string; short_name: string | null } | null;
  } | null;
}

interface PositionRow {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  updated_at: string;
  routing: string;
  bcu: { name: string; short_name: string | null } | null;
}

interface MeetingRow {
  id: string;
  meeting_date: string;
  is_published: boolean;
}

export default async function AdminDashboard() {
  const sb = await createServerSupabase();
  const [{ data: appData }, { data: positionData }, { data: meetingData }, { data: outreachData }] =
    await Promise.all([
      sb
        .from("application")
        .select(
          "id,full_name,ucsb_email,status,submitted_at,position:position_id(id,title,bcu:bcu_id(name,short_name))",
        )
        .order("submitted_at", { ascending: false }),
      sb
        .from("position")
        .select("id,title,status,deadline,updated_at,routing,bcu:bcu_id(name,short_name)")
        .order("status")
        .order("updated_at", { ascending: false }),
      sb.from("meeting").select("id,meeting_date,is_published").order("meeting_date", { ascending: false }),
      sb.from("outreach_log").select("id,contacted"),
    ]);

  const apps = (appData ?? []) as unknown as AppRow[];
  const positions = (positionData ?? []) as unknown as PositionRow[];
  const meetings = (meetingData ?? []) as MeetingRow[];
  const outreach = outreachData ?? [];
  const byStatus = new Map<string, number>();
  const appsByPosition = new Map<string, number>();

  for (const app of apps) {
    byStatus.set(app.status, (byStatus.get(app.status) ?? 0) + 1);
    if (app.position?.id) {
      appsByPosition.set(app.position.id, (appsByPosition.get(app.position.id) ?? 0) + 1);
    }
  }

  const openPositions = positions.filter((p) => p.status === "open");
  const draftPositions = positions.filter((p) => p.status === "draft");
  const unpublishedMeetings = meetings.filter((m) => !m.is_published).length;
  const pendingOutreach = outreach.filter((o) => !o.contacted).length;
  const newApps = byStatus.get("received") ?? 0;
  const interviewQueue = byStatus.get("interview") ?? 0;
  const offers = byStatus.get("offer") ?? 0;
  const accepted = byStatus.get("accepted") ?? 0;
  const activeApps = apps.filter((a) =>
    ["received", "under_review", "interview", "offer"].includes(a.status),
  ).length;
  const unstaffedPositions = openPositions.filter((p) => !appsByPosition.has(p.id));
  const dueSoon = openPositions.filter((p) => isDueSoon(p.deadline));

  const priorities = [
    {
      label: "Review new applications",
      value: newApps,
      href: "/admin/applications",
      tone: newApps > 0 ? "ocean" : "muted",
    },
    {
      label: "Schedule interviews",
      value: interviewQueue,
      href: "/admin/applications",
      tone: interviewQueue > 0 ? "gold" : "muted",
    },
    {
      label: "Send offer decisions",
      value: offers,
      href: "/admin/applications",
      tone: offers > 0 ? "navy" : "muted",
    },
    {
      label: "Publish draft seats",
      value: draftPositions.length,
      href: "/admin/positions",
      tone: draftPositions.length > 0 ? "coral" : "muted",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-ocean">Today</p>
          <h1 className="mt-1 text-3xl font-extrabold text-navy">Recruitment command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            See what needs action, keep vacancies visible, and move students from application to appointment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Action href="/admin/applications">Review applications</Action>
          <Action href="/admin/positions">Manage seats</Action>
          <Action href="/positions">View public page</Action>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric value={apps.length} label="total applications" detail={`${activeApps} active`} />
        <Metric value={openPositions.length} label="open positions" detail={`${unstaffedPositions.length} with no apps`} />
        <Metric value={draftPositions.length} label="draft positions" detail="hidden from students" />
        <Metric value={accepted} label="accepted" detail="ready for roster follow-up" />
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        {priorities.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-lg border border-border bg-surface p-4 transition hover:border-ocean/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-navy">{item.label}</p>
              <Badge tone={item.tone}>{item.value}</Badge>
            </div>
            <p className="mt-4 text-xs font-semibold text-ocean">Open workspace</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Priority queue" action={<Link href="/admin/applications">Applications</Link>}>
          <div className="divide-y divide-border">
            <QueueRow
              label="New applications waiting for first review"
              value={newApps}
              href="/admin/applications"
              tone={newApps ? "ocean" : "kelp"}
            />
            <QueueRow
              label="Open seats with no applications yet"
              value={unstaffedPositions.length}
              href="/admin/positions"
              tone={unstaffedPositions.length ? "coral" : "kelp"}
            />
            <QueueRow
              label="Deadlines in the next two weeks"
              value={dueSoon.length}
              href="/admin/positions"
              tone={dueSoon.length ? "gold" : "kelp"}
            />
            <QueueRow
              label="Unpublished meeting drafts"
              value={unpublishedMeetings}
              href="/admin/minutes"
              tone={unpublishedMeetings ? "ocean" : "kelp"}
            />
            <QueueRow
              label="Outreach logs still marked pending"
              value={pendingOutreach}
              href="/admin/outreach"
              tone={pendingOutreach ? "gold" : "kelp"}
            />
          </div>
        </Panel>

        <Panel title="Pipeline" action={<Link href="/admin/applications">Kanban</Link>}>
          <div className="space-y-3">
            {PIPELINE.map((step) => {
              const count = byStatus.get(step.status) ?? 0;
              const pct = apps.length ? Math.round((count / apps.length) * 100) : 0;
              return (
                <div key={step.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-navy">{step.label}</span>
                    <span className="tabular-nums text-muted">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background ring-1 ring-border">
                    <div className={`h-full ${barTone(step.tone)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Recent applications" action={<Link href="/admin/applications">View all</Link>}>
          {apps.slice(0, 6).length ? (
            <div className="divide-y divide-border">
              {apps.slice(0, 6).map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy">{app.full_name}</p>
                    <p className="truncate text-xs text-muted">
                      {app.position?.title ?? "Unknown position"} · {formatDate(app.submitted_at)}
                    </p>
                  </div>
                  <Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>Applications will appear here as soon as students submit them.</EmptyState>
          )}
        </Panel>

        <Panel title="Position health" action={<Link href="/admin/positions">Manage</Link>}>
          {openPositions.slice(0, 8).length ? (
            <div className="divide-y divide-border">
              {openPositions.slice(0, 8).map((position) => (
                <div key={position.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-navy">{position.title}</p>
                    <p className="truncate text-xs text-muted">
                      {position.bcu?.short_name ?? position.bcu?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted">
                    {appsByPosition.get(position.id) ?? 0} apps
                  </span>
                  <Badge tone={appsByPosition.has(position.id) ? "kelp" : "coral"}>
                    {appsByPosition.has(position.id) ? "active" : "needs reach"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No open positions are currently public.</EmptyState>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Metric({ value, label, detail }: { value: number; label: string; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-3xl font-extrabold tabular-nums text-navy">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase text-muted">{label}</div>
      <div className="mt-3 text-sm font-semibold text-ocean">{detail}</div>
    </div>
  );
}

function Action({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md bg-navy px-3 py-2 text-sm font-bold text-white transition hover:brightness-110"
    >
      {children}
    </Link>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-sm font-extrabold uppercase text-navy">{title}</h2>
        {action && <div className="text-sm font-bold text-ocean hover:underline">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function QueueRow({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: string;
}) {
  return (
    <Link href={href} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 hover:bg-background/70">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </Link>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted">
      {children}
    </div>
  );
}

function isDueSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  const days = (new Date(`${deadline}T00:00:00`).getTime() - Date.now()) / 86_400_000;
  return days >= 0 && days <= 14;
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

function barTone(tone: string): string {
  const tones: Record<string, string> = {
    sky: "bg-sky",
    ocean: "bg-ocean",
    gold: "bg-gold",
    navy: "bg-navy",
    kelp: "bg-kelp",
  };
  return tones[tone] ?? "bg-muted";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
