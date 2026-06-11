import { createServerSupabase } from "@/lib/supabase/server";
import { getBoardMember } from "@/lib/auth";
import { Badge } from "@/components/Badge";
import { createPosition, setPositionStatus } from "../admin/actions";

const STATUS_TONE: Record<string, string> = {
  open: "kelp",
  draft: "muted",
  closed: "coral",
  filled: "ocean",
};

export default async function BoardPositions() {
  const member = await getBoardMember();
  if (!member?.bcu_id) return null;
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("position")
    .select("id,title,status,routing")
    .eq("bcu_id", member.bcu_id)
    .order("status");
  const positions = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Your positions</h1>
      <p className="mt-1 text-muted">
        Post openings for your board. Applicants apply right here, and you review
        them under &ldquo;Applicants.&rdquo;
      </p>

      <details className="mt-6 rounded-2xl border border-border bg-surface p-5" open={positions.length === 0}>
        <summary className="cursor-pointer text-sm font-bold text-ocean">+ New position</summary>
        <form action={createPosition} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="bcu_id" value={member.bcu_id} />
          <input type="hidden" name="routing" value="coc_interview" />
          <input name="title" required placeholder="Position title" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <select name="status" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
            <option value="open">Open immediately</option>
            <option value="draft">Save as draft</option>
          </select>
          <textarea name="description" placeholder="Description (optional)" rows={2} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2" />
          <button className="justify-self-start rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-navy sm:col-span-2">
            Create
          </button>
        </form>
      </details>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        {positions.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
            <span className="text-sm font-semibold text-foreground">{p.title}</span>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[p.status] ?? "muted"}>{p.status}</Badge>
              <form action={setPositionStatus}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value={p.status === "open" ? "closed" : "open"} />
                <button className="rounded-md bg-navy px-2.5 py-1 text-xs font-bold text-white">
                  {p.status === "open" ? "Close" : "Open"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {positions.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No positions yet — add one above.</div>
        )}
      </div>
    </div>
  );
}
