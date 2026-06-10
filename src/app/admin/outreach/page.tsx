import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { createOutreach } from "../actions";

interface Row {
  id: string;
  officer_name: string | null;
  term: string | null;
  week: string | null;
  channel: string | null;
  contacted: boolean;
  result: string | null;
  bcu: { name: string; short_name: string | null } | null;
}

export default async function AdminOutreach() {
  const sb = await createServerSupabase();
  const [{ data: logs }, { data: bcus }] = await Promise.all([
    sb
      .from("outreach_log")
      .select("id,officer_name,term,week,channel,contacted,result,bcu:bcu_id(name,short_name)")
      .order("logged_at", { ascending: false }),
    sb.from("bcu").select("id,name").order("name"),
  ]);
  const rows = (logs ?? []) as unknown as Row[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Outreach</h1>
      <p className="mt-1 text-muted">
        Track O&amp;R contacts with boards — who reached out, how, and what came of it.
      </p>

      <details className="mt-6 rounded-2xl border border-border bg-surface p-5" open>
        <summary className="cursor-pointer text-sm font-bold text-ocean">+ Log a contact</summary>
        <form action={createOutreach} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select name="bcu_id" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
            <option value="">— Board (optional) —</option>
            {(bcus ?? []).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input name="officer_name" placeholder="O&R officer" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="term" placeholder="Term (e.g. 2025-26)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="week" placeholder="Week (e.g. Week 3)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="channel" placeholder="Channel (email / tabling / IG)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <label className="flex items-center gap-2 text-sm font-semibold text-navy">
            <input type="checkbox" name="contacted" className="h-4 w-4" /> Contact made
          </label>
          <textarea name="result" placeholder="Notes / result" rows={2} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2" />
          <button className="justify-self-start rounded-xl bg-sunrise px-4 py-2 text-sm font-bold text-navy">Log</button>
        </form>
      </details>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {r.bcu?.name ?? "—"}
              </div>
              <div className="truncate text-xs text-muted">
                {[r.officer_name, r.week, r.channel].filter(Boolean).join(" · ")}
                {r.result ? ` — ${r.result}` : ""}
              </div>
            </div>
            <Badge tone={r.contacted ? "kelp" : "muted"}>
              {r.contacted ? "contacted" : "pending"}
            </Badge>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No outreach logged yet.</div>
        )}
      </div>
    </div>
  );
}
