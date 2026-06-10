import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { createPosition, setPositionStatus } from "../actions";

const STATUS_TONE: Record<string, string> = {
  open: "kelp",
  draft: "muted",
  closed: "coral",
  filled: "ocean",
};

interface Row {
  id: string;
  title: string;
  status: string;
  routing: string;
  bcu: { id: string; name: string; short_name: string | null } | null;
}

export default async function AdminPositions() {
  const sb = await createServerSupabase();
  const [{ data: positions }, { data: bcus }] = await Promise.all([
    sb
      .from("position")
      .select("id,title,status,routing,bcu:bcu_id(id,name,short_name)")
      .order("status"),
    sb.from("bcu").select("id,name,short_name").order("name"),
  ]);
  const rows = (positions ?? []) as unknown as Row[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Positions</h1>
      <p className="mt-1 text-muted">
        Open or close any seat — public listings update instantly.
      </p>

      {/* New position */}
      <details className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <summary className="cursor-pointer text-sm font-bold text-ocean">
          + New position
        </summary>
        <form action={createPosition} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            name="bcu_id"
            required
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">Select a BCU…</option>
            {(bcus ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            name="title"
            required
            placeholder="Position title"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          />
          <select
            name="routing"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="coc_interview">CoC interviews</option>
            <option value="forward_to_bcu">Forward to BCU</option>
            <option value="external_form">External form</option>
            <option value="unknown">Contact to apply</option>
          </select>
          <select
            name="status"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="draft">Save as draft</option>
            <option value="open">Open immediately</option>
          </select>
          <input
            name="external_url"
            placeholder="External apply URL (optional)"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={2}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2"
          />
          <button className="justify-self-start rounded-xl bg-sunrise px-4 py-2 text-sm font-bold text-navy">
            Create
          </button>
        </form>
      </details>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {p.title}
              </div>
              <div className="text-xs text-muted">
                {p.bcu?.short_name ?? p.bcu?.name ?? "—"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[p.status] ?? "muted"}>{p.status}</Badge>
              {p.status !== "open" ? (
                <StatusButton id={p.id} status="open" label="Open" />
              ) : (
                <StatusButton id={p.id} status="closed" label="Close" />
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No positions yet.</div>
        )}
      </div>
    </div>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setPositionStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-md bg-navy px-2.5 py-1 text-xs font-bold text-white hover:brightness-110">
        {label}
      </button>
    </form>
  );
}
