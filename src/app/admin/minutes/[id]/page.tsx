import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { setMeetingPublished } from "../../actions";
import {
  addAttendance,
  addMinuteItem,
  loadBoardAttendance,
  removeAttendance,
  removeMinuteItem,
  setAttendanceStatus,
  updateMeeting,
} from "../actions";

const STATUSES = ["present", "excused", "unexcused", "late", "proxy"];
const SECTIONS = ["report", "action", "discussion", "public_forum", "remark", "other"];

export default async function MeetingEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createServerSupabase();
  const { data: meeting } = await sb.from("meeting").select("*").eq("id", id).maybeSingle();
  if (!meeting) notFound();
  const [{ data: attendance }, { data: items }] = await Promise.all([
    sb.from("meeting_attendance").select("*").eq("meeting_id", id),
    sb.from("minute_item").select("*").eq("meeting_id", id).order("ordinal"),
  ]);
  const att = attendance ?? [];
  const its = items ?? [];

  return (
    <div className="max-w-3xl">
      <Link href="/admin/minutes" className="text-sm font-semibold text-ocean hover:underline">
        ← All meetings
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-navy">
          {new Date(meeting.meeting_date + "T00:00:00").toLocaleDateString("en-US", { dateStyle: "long" })}
        </h1>
        <div className="flex items-center gap-2">
          <Badge tone={meeting.is_published ? "kelp" : "muted"}>
            {meeting.is_published ? "published" : "draft"}
          </Badge>
          {meeting.is_published && (
            <Link href={`/minutes/${id}`} className="text-xs font-semibold text-ocean hover:underline">
              view public →
            </Link>
          )}
          <form action={setMeetingPublished}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="is_published" value={(!meeting.is_published).toString()} />
            <button className="rounded-md bg-navy px-2.5 py-1 text-xs font-bold text-white">
              {meeting.is_published ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      {/* Details */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">Details</h2>
        <form action={updateMeeting} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="id" value={id} />
          <label className="text-xs font-semibold text-navy">Date
            <input type="date" name="meeting_date" defaultValue={meeting.meeting_date} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <label className="text-xs font-semibold text-navy">Location
            <input name="location" defaultValue={meeting.location ?? ""} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <label className="text-xs font-semibold text-navy">Called to order
            <input name="called_to_order" defaultValue={meeting.called_to_order ?? ""} placeholder="7:00pm" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <label className="text-xs font-semibold text-navy">Called by
            <input name="called_by" defaultValue={meeting.called_by ?? ""} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <input type="hidden" name="term" value={meeting.term ?? ""} />
          <label className="text-xs font-semibold text-navy sm:col-span-2">Question of the week
            <input name="qotw" defaultValue={meeting.qotw ?? ""} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <label className="text-xs font-semibold text-navy sm:col-span-2">Summary
            <textarea name="summary" defaultValue={meeting.summary ?? ""} rows={2} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal" />
          </label>
          <button className="justify-self-start rounded-lg bg-gold px-4 py-2 text-sm font-bold text-navy">Save details</button>
        </form>
      </section>

      {/* Attendance */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
            Roll call ({att.length})
          </h2>
          {att.length === 0 && (
            <form action={loadBoardAttendance}>
              <input type="hidden" name="meeting_id" value={id} />
              <button className="text-xs font-bold text-ocean hover:underline">Load current CoC board →</button>
            </form>
          )}
        </div>
        <div className="mt-3 divide-y divide-border">
          {att.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 py-2">
              <span className="text-sm font-medium text-foreground">
                {a.display_name}
                {a.role_title ? <span className="ml-1 text-xs text-muted">· {a.role_title}</span> : null}
              </span>
              <div className="flex items-center gap-1">
                <form action={setAttendanceStatus} className="flex items-center">
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="meeting_id" value={id} />
                  <select name="status" defaultValue={a.status} className="rounded-md border border-border bg-background px-2 py-1 text-xs" >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="ml-1 rounded-md px-2 py-1 text-xs font-semibold text-ocean hover:bg-ocean/10">Set</button>
                </form>
                <form action={removeAttendance}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="meeting_id" value={id} />
                  <button className="rounded-md px-2 py-1 text-xs text-muted hover:text-coral">✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>
        <form action={addAttendance} className="mt-3 flex flex-wrap gap-2">
          <input type="hidden" name="meeting_id" value={id} />
          <input name="display_name" required placeholder="Name" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input name="role_title" placeholder="Role" className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select name="status" className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="rounded-lg bg-navy px-3 py-2 text-sm font-bold text-white">Add</button>
        </form>
      </section>

      {/* Minute items */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">
          Reports &amp; items ({its.length})
        </h2>
        <div className="mt-3 space-y-2">
          {its.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-3 rounded-lg bg-background p-3">
              <div>
                <div className="text-xs font-bold uppercase text-muted">{it.section}</div>
                {it.heading && <div className="font-semibold text-navy">{it.heading}</div>}
                {it.body && <p className="text-sm text-foreground/80">{it.body}</p>}
              </div>
              <form action={removeMinuteItem}>
                <input type="hidden" name="id" value={it.id} />
                <input type="hidden" name="meeting_id" value={id} />
                <button className="rounded-md px-2 py-1 text-xs text-muted hover:text-coral">✕</button>
              </form>
            </div>
          ))}
        </div>
        <form action={addMinuteItem} className="mt-3 space-y-2">
          <input type="hidden" name="meeting_id" value={id} />
          <div className="flex flex-wrap gap-2">
            <select name="section" className="rounded-lg border border-border bg-background px-2 py-2 text-sm">
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input name="heading" placeholder="Heading (e.g. Sam — Vice Chair)" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <textarea name="body" rows={2} placeholder="What happened / report notes…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <button className="rounded-lg bg-navy px-3 py-2 text-sm font-bold text-white">Add item</button>
        </form>
      </section>
    </div>
  );
}
