import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting } from "@/lib/data";
import { Badge } from "@/components/Badge";
import type { Attendance } from "@/lib/types";

const STATUS_TONE: Record<Attendance["status"], string> = {
  present: "kelp",
  excused: "gold",
  unexcused: "coral",
  late: "sky",
  proxy: "muted",
};

const SECTION_TITLE: Record<string, string> = {
  public_forum: "Public forum",
  report: "Member reports",
  action: "Action items",
  discussion: "Discussion",
  remark: "Remarks",
  other: "Other",
};
const SECTION_ORDER = ["public_forum", "report", "action", "discussion", "remark", "other"];

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = await getMeeting(id);
  return { title: r ? `Minutes — ${fmt(r.meeting.meeting_date)}` : "Minutes" };
}

export default async function MinuteDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getMeeting(id);
  if (!r) notFound();
  const { meeting, attendance, items } = r;
  const present = attendance.filter((a) => a.status === "present" || a.status === "late").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/minutes" className="text-sm font-semibold text-ocean hover:underline">
        ← All minutes
      </Link>

      <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-navy">
        {fmt(meeting.meeting_date)}
      </h1>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {meeting.location && <span>{meeting.location}</span>}
        {meeting.called_to_order && <span>Called to order {meeting.called_to_order}</span>}
        {meeting.adjourned_at && <span>Adjourned {meeting.adjourned_at}</span>}
        {meeting.called_by && <span>By {meeting.called_by}</span>}
      </div>

      {meeting.qotw && (
        <p className="mt-5 rounded-xl border border-border bg-surface p-4 text-sm">
          <span className="font-semibold text-navy">Question of the week: </span>
          <span className="text-foreground/80">{meeting.qotw}</span>
        </p>
      )}

      {/* Roll call */}
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          Roll call · {present}/{attendance.length} present
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {attendance.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2.5"
            >
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {a.display_name}
                </div>
                {a.role_title && (
                  <div className="text-xs text-muted">{a.role_title}</div>
                )}
              </div>
              <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Minute items by section */}
      {SECTION_ORDER.filter((s) => items.some((it) => it.section === s)).map((s) => (
        <section key={s} className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
            {SECTION_TITLE[s]}
          </h2>
          <div className="mt-3 space-y-3">
            {items
              .filter((it) => it.section === s)
              .map((it, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-4">
                  {it.heading && (
                    <div className="font-semibold text-navy">{it.heading}</div>
                  )}
                  {it.body && (
                    <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                      {it.body}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
