import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";

interface AppRow {
  status: string;
  position: { id: string; title: string; bcu: { short_name: string | null } | null } | null;
}

export default async function DeliberateIndex() {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("application")
    .select("status,position:position_id(id,title,bcu:bcu_id(short_name))");
  const apps = (data ?? []) as unknown as AppRow[];

  const byPos = new Map<
    string,
    { id: string; title: string; bcu: string | null; total: number; active: number }
  >();
  for (const a of apps) {
    if (!a.position) continue;
    const e = byPos.get(a.position.id) ?? {
      id: a.position.id,
      title: a.position.title,
      bcu: a.position.bcu?.short_name ?? null,
      total: 0,
      active: 0,
    };
    e.total++;
    if (["under_review", "interview", "offer"].includes(a.status)) e.active++;
    byPos.set(a.position.id, e);
  }
  const positions = [...byPos.values()].sort((a, b) => b.active - a.active || b.total - a.total);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Deliberate</h1>
      <p className="mt-1 text-muted">
        Score candidates and compare the board&apos;s reviews before deciding.
      </p>

      {positions.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No applications to deliberate on yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {positions.map((p) => (
            <Link
              key={p.id}
              href={`/admin/deliberate/${p.id}`}
              className="group rounded-2xl border border-border bg-surface p-5 transition hover:border-ocean/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                {p.bcu && <Badge tone="navy">{p.bcu}</Badge>}
                <Badge tone={p.active ? "kelp" : "muted"}>
                  {p.active} active · {p.total} total
                </Badge>
              </div>
              <h2 className="mt-3 font-bold text-navy group-hover:text-ocean">{p.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
