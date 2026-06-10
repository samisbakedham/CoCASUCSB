import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { createAppointment, removeAppointment } from "../actions";

interface Row {
  id: string;
  role_title: string;
  is_chair: boolean;
  term: string | null;
  person: { full_name: string; ucsb_email: string | null; as_email: string | null } | null;
  bcu: { name: string; short_name: string | null } | null;
}

export default async function AdminRoster() {
  const sb = await createServerSupabase();
  const [{ data: appts }, { data: bcus }] = await Promise.all([
    sb
      .from("appointment")
      .select(
        "id,role_title,is_chair,term,person:person_id(full_name,ucsb_email,as_email),bcu:bcu_id(name,short_name)",
      )
      .eq("is_current", true),
    sb.from("bcu").select("id,name").order("name"),
  ]);
  const rows = ((appts ?? []) as unknown as Row[]).sort((a, b) =>
    (a.bcu?.name ?? "").localeCompare(b.bcu?.name ?? "") ||
    Number(b.is_chair) - Number(a.is_chair),
  );

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Roster</h1>
      <p className="mt-1 text-muted">
        Add or remove appointments. Changes appear instantly on the public
        &ldquo;Who Runs AS&rdquo; directory.
      </p>

      <details className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <summary className="cursor-pointer text-sm font-bold text-ocean">
          + Add an appointment
        </summary>
        <form action={createAppointment} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="full_name" required placeholder="Full name" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <select name="bcu_id" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
            <option value="">— Board / Committee —</option>
            {(bcus ?? []).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input name="role_title" required placeholder="Role (e.g. Vice Chair)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="term" defaultValue="2026-27" placeholder="Term" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="ucsb_email" placeholder="UCSB email (optional)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <input name="as_email" placeholder="AS email (optional)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          <label className="flex items-center gap-2 text-sm font-semibold text-navy">
            <input type="checkbox" name="is_chair" className="h-4 w-4" /> This is a chair role
          </label>
          <button className="justify-self-start rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-navy sm:col-span-2">
            Add appointment
          </button>
        </form>
      </details>

      <p className="mt-6 text-sm text-muted">
        {rows.length} current appointment{rows.length === 1 ? "" : "s"}
      </p>
      <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {r.person?.full_name ?? "—"}
                </span>
                {r.is_chair && <Badge tone="gold">Chair</Badge>}
              </div>
              <div className="truncate text-xs text-muted">
                {r.role_title}
                {r.bcu?.name ? ` · ${r.bcu.name}` : ""}
                {r.term ? ` · ${r.term}` : ""}
              </div>
            </div>
            <form action={removeAppointment}>
              <input type="hidden" name="id" value={r.id} />
              <button className="rounded-md px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-border hover:text-coral hover:ring-coral/40">
                Remove
              </button>
            </form>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No appointments yet.</div>
        )}
      </div>
    </div>
  );
}
