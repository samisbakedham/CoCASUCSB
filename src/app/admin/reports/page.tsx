import { createServerSupabase } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const sb = await createServerSupabase();
  const [apps, positions, meetings, attendance, outreach, bcus] = await Promise.all([
    sb.from("application").select("status,submitted_at"),
    sb.from("position").select("status,routing"),
    sb.from("meeting").select("id,is_published"),
    sb.from("meeting_attendance").select("status"),
    sb.from("outreach_log").select("contacted"),
    sb.from("bcu").select("id"),
  ]);

  const a = apps.data ?? [];
  const pos = positions.data ?? [];
  const att = attendance.data ?? [];
  const out = outreach.data ?? [];

  const byStatus = (s: string) => a.filter((x) => x.status === s).length;
  const posBy = (s: string) => pos.filter((x) => x.status === s).length;
  const interviewed = byStatus("interview") + byStatus("offer") + byStatus("accepted") + byStatus("declined");
  const presentCount = att.filter((x) => x.status === "present" || x.status === "late").length;
  const attendanceRate = att.length ? Math.round((100 * presentCount) / att.length) : null;
  const contacted = out.filter((x) => x.contacted).length;
  const cocInterview = pos.filter((x) => x.routing === "coc_interview").length;

  const generated = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

  const lines: [string, string | number][] = [
    ["Applications received", a.length],
    ["— in review", byStatus("under_review")],
    ["— in interview / decided", interviewed],
    ["— offers extended", byStatus("offer") + byStatus("accepted")],
    ["— accepted", byStatus("accepted")],
    ["Open positions", posBy("open")],
    ["Positions filled", posBy("filled")],
    ["CoC-run searches", cocInterview],
    ["BCUs tracked", (bcus.data ?? []).length],
    ["Meetings held (published)", (meetings.data ?? []).filter((m) => m.is_published).length],
    ["Attendance rate", attendanceRate != null ? `${attendanceRate}%` : "—"],
    ["Outreach contacts logged", out.length],
    ["— BCUs reached", contacted],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Quarterly report</h1>
          <p className="mt-1 text-muted">
            Auto-generated from live data — no counting Gmail labels.
          </p>
        </div>
        <span className="text-xs text-muted">Generated {generated}</span>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        {lines.map(([label, value], i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-5 py-3 ${
              label.startsWith("—") ? "pl-9 text-sm text-muted" : "border-t border-border font-semibold text-navy first:border-0"
            }`}
          >
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          Narrative draft
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          This quarter, the Committee on Committees received{" "}
          <strong>{a.length}</strong> applications across{" "}
          <strong>{(bcus.data ?? []).length}</strong> boards, commissions, and
          units. CoC directly ran searches for <strong>{cocInterview}</strong>{" "}
          positions, advanced <strong>{interviewed}</strong> candidates to
          interview or decision, and extended{" "}
          <strong>{byStatus("offer") + byStatus("accepted")}</strong> offers. The
          board held{" "}
          <strong>{(meetings.data ?? []).filter((m) => m.is_published).length}</strong>{" "}
          published meetings
          {attendanceRate != null ? ` with ${attendanceRate}% attendance` : ""}, and
          logged <strong>{out.length}</strong> outreach contacts.
        </p>
      </div>
    </div>
  );
}
