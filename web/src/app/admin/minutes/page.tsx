import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { createMeeting, setMeetingPublished } from "../actions";

export default async function AdminMinutes() {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("meeting")
    .select("id,meeting_date,location,term,is_published,summary")
    .order("meeting_date", { ascending: false });
  const meetings = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Minutes</h1>
      <p className="mt-1 text-muted">
        Record meetings here. Publishing makes them public on the minutes archive.
      </p>

      <details className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <summary className="cursor-pointer text-sm font-bold text-ocean">
          + New meeting
        </summary>
        <form action={createMeeting} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-navy">
            Date
            <input
              type="date"
              name="meeting_date"
              required
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal"
            />
          </label>
          <input name="location" placeholder="Location" defaultValue="AS Main CoC Room" className="self-end rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="term" placeholder="Term (e.g. 2025-26)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="called_by" placeholder="Called to order by" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="qotw" placeholder="Question of the week" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2" />
          <textarea name="summary" placeholder="Summary" rows={2} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2" />
          <button className="justify-self-start rounded-xl bg-sunrise px-4 py-2 text-sm font-bold text-white">
            Create draft
          </button>
        </form>
      </details>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        {meetings.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {new Date(m.meeting_date + "T00:00:00").toLocaleDateString("en-US", { dateStyle: "medium" })}
              </div>
              <div className="truncate text-xs text-muted">{m.summary || m.location}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={m.is_published ? "kelp" : "muted"}>
                {m.is_published ? "published" : "draft"}
              </Badge>
              {m.is_published && (
                <Link href={`/minutes/${m.id}`} className="text-xs font-semibold text-ocean hover:underline">
                  view
                </Link>
              )}
              <form action={setMeetingPublished}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="is_published" value={(!m.is_published).toString()} />
                <button className="rounded-md bg-navy px-2.5 py-1 text-xs font-bold text-white hover:brightness-110">
                  {m.is_published ? "Unpublish" : "Publish"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {meetings.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No meetings yet.</div>
        )}
      </div>
    </div>
  );
}
