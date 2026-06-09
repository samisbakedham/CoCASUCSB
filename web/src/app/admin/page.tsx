import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

const PIPE: { status: string; label: string }[] = [
  { status: "received", label: "New" },
  { status: "under_review", label: "Reviewing" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offered" },
  { status: "accepted", label: "Accepted" },
];

export default async function AdminDashboard() {
  const sb = await createServerSupabase();
  const [{ data: apps }, { count: openCount }, { count: draftCount }] = await Promise.all([
    sb.from("application").select("status"),
    sb.from("position").select("*", { count: "exact", head: true }).eq("status", "open"),
    sb.from("position").select("*", { count: "exact", head: true }).eq("status", "draft"),
  ]);

  const byStatus = new Map<string, number>();
  for (const a of apps ?? []) byStatus.set(a.status, (byStatus.get(a.status) ?? 0) + 1);
  const totalApps = apps?.length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
      <p className="mt-1 text-muted">Live operational view of recruitment.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile value={totalApps} label="Applications" />
        <Tile value={openCount ?? 0} label="Open positions" href="/admin/positions" />
        <Tile value={draftCount ?? 0} label="Draft positions" href="/admin/positions" />
        <Tile value={byStatus.get("interview") ?? 0} label="In interview" href="/admin/applications" />
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-ocean">
        Pipeline
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {PIPE.map((s) => (
          <Link
            key={s.status}
            href="/admin/applications"
            className="rounded-2xl border border-border bg-surface p-4 transition hover:border-ocean/40"
          >
            <div className="text-2xl font-extrabold text-navy">
              {byStatus.get(s.status) ?? 0}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      {totalApps === 0 && (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          No applications yet. They&apos;ll appear here the moment students start
          applying through the site.
        </p>
      )}
    </div>
  );
}

function Tile({ value, label, href }: { value: number; label: string; href?: string }) {
  const inner = (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-3xl font-extrabold text-ocean">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
