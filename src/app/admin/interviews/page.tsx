import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { createInterviewSlot, deleteInterviewSlot, setSlotOpen } from "../actions";

interface Signup {
  id: string;
  applicant_name: string | null;
  applicant_email: string;
  position_title: string | null;
}
interface Slot {
  id: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  capacity: number;
  interviewers: string | null;
  notes: string | null;
  is_open: boolean;
  signups: Signup[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminInterviews() {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("interview_slot")
    .select(
      "id,starts_at,ends_at,location,capacity,interviewers,notes,is_open,signups:interview_signup(id,applicant_name,applicant_email,position_title)",
    )
    .order("starts_at");
  const slots = (data ?? []) as unknown as Slot[];
  const now = Date.now();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Interviews</h1>
      <p className="mt-1 text-muted">
        Publish time slots; applicants in the interview stage book themselves —
        no When2Meet, no sign-up sheet.
      </p>

      <details className="mt-6 rounded-2xl border border-border bg-surface p-5" open={slots.length === 0}>
        <summary className="cursor-pointer text-sm font-bold text-ocean">
          + Add interview slots
        </summary>
        <form action={createInterviewSlot} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-navy">
            Date &amp; time
            <input type="datetime-local" name="starts_at" required className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal" />
          </label>
          <label className="text-sm font-semibold text-navy">
            Length
            <select name="duration" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal">
              <option value="20">20 minutes</option>
              <option value="30" defaultChecked>30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </label>
          <input name="location" placeholder="Location or Zoom link" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="interviewers" placeholder="Interviewers (e.g. Sam, Mira)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <label className="text-sm font-semibold text-navy">
            Capacity
            <input type="number" name="capacity" min="1" defaultValue="1" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-normal" />
          </label>
          <input name="notes" placeholder="Notes (optional)" className="self-end rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <button className="justify-self-start rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-navy sm:col-span-2">
            Publish slot
          </button>
        </form>
      </details>

      <div className="mt-6 space-y-3">
        {slots.map((s) => {
          const past = new Date(s.starts_at).getTime() < now;
          const full = s.signups.length >= s.capacity;
          return (
            <div
              key={s.id}
              className={`rounded-2xl border border-border bg-surface p-4 ${past ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy">{fmt(s.starts_at)}</span>
                  {s.location && <span className="text-sm text-muted">· {s.location}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={full ? "coral" : "kelp"}>
                    {s.signups.length}/{s.capacity} booked
                  </Badge>
                  {!s.is_open && <Badge tone="muted">closed</Badge>}
                  <form action={setSlotOpen}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="is_open" value={(!s.is_open).toString()} />
                    <button className="rounded-md px-2 py-1 text-xs font-semibold text-ocean hover:bg-ocean/10">
                      {s.is_open ? "Close" : "Reopen"}
                    </button>
                  </form>
                  <form action={deleteInterviewSlot}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:text-coral">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              {s.interviewers && (
                <p className="mt-1 text-xs text-muted">Interviewers: {s.interviewers}</p>
              )}
              {s.signups.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  {s.signups.map((u) => (
                    <li key={u.id} className="flex justify-between gap-3">
                      <span className="font-medium text-foreground">
                        {u.applicant_name || u.applicant_email}
                      </span>
                      <span className="text-xs text-muted">{u.position_title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {slots.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            No interview slots yet. Add some above.
          </div>
        )}
      </div>
    </div>
  );
}
