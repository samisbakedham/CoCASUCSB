import { Badge } from "@/components/Badge";
import { createServerSupabase } from "@/lib/supabase/server";
import { createPosition, setPositionStatus } from "../actions";

const STATUS_TONE: Record<string, string> = {
  open: "kelp",
  draft: "muted",
  closed: "coral",
  filled: "ocean",
};

const ROUTING_LABEL: Record<string, string> = {
  coc_interview: "CoC interview",
  forward_to_bcu: "Forward to BCU",
  external_form: "External form",
  unknown: "Contact to apply",
};

interface Row {
  id: string;
  title: string;
  status: string;
  routing: string;
  openings: number | null;
  deadline: string | null;
  coc_advertises: boolean | null;
  updated_at: string;
  bcu: { id: string; name: string; short_name: string | null } | null;
  application: { id: string; status: string }[];
}

export default async function AdminPositions({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params?.status ?? "active";
  const sb = await createServerSupabase();
  const [{ data: positions }, { data: bcus }] = await Promise.all([
    sb
      .from("position")
      .select(
        "id,title,status,routing,openings,deadline,coc_advertises,updated_at,bcu:bcu_id(id,name,short_name),application(id,status)",
      )
      .order("status")
      .order("updated_at", { ascending: false }),
    sb.from("bcu").select("id,name,short_name").order("name"),
  ]);
  const rows = (positions ?? []) as unknown as Row[];
  const visibleRows = rows.filter((row) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return ["open", "draft"].includes(row.status);
    return row.status === statusFilter;
  });
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-ocean">Seat inventory</p>
          <h1 className="mt-1 text-3xl font-extrabold text-navy">Positions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Publish recruitable seats, close filled searches, and spot openings that need more outreach.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          <span className="font-extrabold tabular-nums text-navy">{counts.get("open") ?? 0}</span>{" "}
          <span className="font-semibold text-muted">open now</span>
        </div>
      </div>

      <details className="rounded-lg border border-border bg-surface p-4">
        <summary className="cursor-pointer text-sm font-extrabold text-ocean">Create a position</summary>
        <form action={createPosition} className="mt-4 grid gap-3 lg:grid-cols-4">
          <select
            name="bcu_id"
            required
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"
          >
            <option value="">Select board, commission, or unit</option>
            {(bcus ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.short_name ? `${b.short_name} · ${b.name}` : b.name}
              </option>
            ))}
          </select>
          <input
            name="title"
            required
            placeholder="Position title"
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"
          />
          <select name="routing" className="rounded-md border border-border bg-background px-3 py-2.5 text-sm">
            <option value="coc_interview">CoC interviews</option>
            <option value="forward_to_bcu">Forward to BCU</option>
            <option value="external_form">External form</option>
            <option value="unknown">Contact to apply</option>
          </select>
          <select name="status" className="rounded-md border border-border bg-background px-3 py-2.5 text-sm">
            <option value="draft">Draft</option>
            <option value="open">Open immediately</option>
          </select>
          <input
            type="number"
            min="1"
            name="openings"
            defaultValue={1}
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            aria-label="Openings"
          />
          <input
            type="date"
            name="deadline"
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm"
            aria-label="Deadline"
          />
          <input
            name="external_url"
            placeholder="External apply URL"
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"
          />
          <input
            name="legal_code"
            placeholder="Legal code reference"
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Public description"
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"
          />
          <textarea
            name="notes"
            placeholder="Internal notes"
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-navy lg:col-span-2">
            <input type="checkbox" name="coc_advertises" className="h-4 w-4" /> CoC advertises this seat
          </label>
          <button className="justify-self-start rounded-md bg-sunrise px-4 py-2 text-sm font-bold text-navy">
            Save position
          </button>
        </form>
      </details>

      <div className="flex gap-2 overflow-x-auto rounded-lg border border-border bg-surface p-2">
        <Filter href="/admin/positions" active={statusFilter === "active"} label="Active" count={activeCount(rows)} />
        <Filter href="/admin/positions?status=all" active={statusFilter === "all"} label="All" count={rows.length} />
        {["draft", "open", "filled", "closed"].map((status) => (
          <Filter
            key={status}
            href={`/admin/positions?status=${status}`}
            active={statusFilter === status}
            label={status}
            count={counts.get(status) ?? 0}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="grid grid-cols-[1fr_110px_120px_170px] gap-4 border-b border-border bg-background px-4 py-3 text-xs font-extrabold uppercase text-muted max-lg:hidden">
          <span>Position</span>
          <span>Applications</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {visibleRows.map((p) => {
          const applications = p.application?.length ?? 0;
          return (
            <div
              key={p.id}
              className="grid gap-4 border-b border-border px-4 py-4 last:border-0 lg:grid-cols-[1fr_110px_120px_170px] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-extrabold text-navy">{p.title}</h2>
                  {p.status === "open" && applications === 0 && <Badge tone="coral">needs reach</Badge>}
                  {isDueSoon(p.deadline) && <Badge tone="gold">deadline soon</Badge>}
                </div>
                <p className="mt-1 truncate text-xs text-muted">
                  {p.bcu?.short_name ?? p.bcu?.name ?? "Unassigned"} · {ROUTING_LABEL[p.routing] ?? p.routing}
                  {p.deadline ? ` · due ${formatDate(p.deadline)}` : ""}
                </p>
              </div>
              <div className="text-sm font-bold tabular-nums text-navy">
                {applications}
                <span className="ml-1 font-semibold text-muted">apps</span>
              </div>
              <Badge tone={STATUS_TONE[p.status] ?? "muted"}>{p.status}</Badge>
              <div className="flex flex-wrap gap-2">
                {p.status !== "open" && <StatusButton id={p.id} status="open" label="Open" />}
                {p.status !== "filled" && <StatusButton id={p.id} status="filled" label="Fill" />}
                {p.status !== "closed" && <StatusButton id={p.id} status="closed" label="Close" />}
              </div>
            </div>
          );
        })}
        {visibleRows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted">No positions match this view.</div>
        )}
      </div>
    </div>
  );
}

function Filter({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <a
      href={href}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold ${
        active ? "bg-navy text-white" : "text-navy hover:bg-navy/5"
      }`}
    >
      {label} <span className={active ? "text-white/80" : "text-muted"}>{count}</span>
    </a>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setPositionStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-md bg-navy px-2.5 py-1.5 text-xs font-bold text-white hover:brightness-110">
        {label}
      </button>
    </form>
  );
}

function activeCount(rows: Row[]): number {
  return rows.filter((row) => ["open", "draft"].includes(row.status)).length;
}

function isDueSoon(deadline: string | null): boolean {
  if (!deadline) return false;
  const days = (new Date(`${deadline}T00:00:00`).getTime() - Date.now()) / 86_400_000;
  return days >= 0 && days <= 14;
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
