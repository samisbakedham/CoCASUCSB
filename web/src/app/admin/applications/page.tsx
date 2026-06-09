import { createServerSupabase } from "@/lib/supabase/server";
import { advanceApplication } from "../actions";

const COLUMNS: { status: string; label: string; tone: string }[] = [
  { status: "received", label: "New", tone: "border-sky/50" },
  { status: "under_review", label: "Reviewing", tone: "border-ocean/50" },
  { status: "interview", label: "Interview", tone: "border-gold/60" },
  { status: "offer", label: "Offered", tone: "border-sunrise/50" },
  { status: "accepted", label: "Accepted", tone: "border-kelp/50" },
];
const NEXT: Record<string, string> = {
  received: "under_review",
  under_review: "interview",
  interview: "offer",
  offer: "accepted",
};

interface AppRow {
  id: string;
  full_name: string;
  ucsb_email: string;
  status: string;
  submitted_at: string;
  position: { title: string; bcu: { short_name: string | null; name: string } | null } | null;
}

export default async function ApplicationsPage() {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("application")
    .select(
      "id,full_name,ucsb_email,status,submitted_at,position:position_id(title,bcu:bcu_id(short_name,name))",
    )
    .order("submitted_at", { ascending: true });
  const apps = (data ?? []) as unknown as AppRow[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Applications</h1>
      <p className="mt-1 text-muted">
        Move candidates through the pipeline. Every change is logged with who and
        when.
      </p>

      {apps.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No applications yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {COLUMNS.map((col) => {
            const items = apps.filter((a) => a.status === col.status);
            return (
              <div key={col.status} className="min-w-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-navy">{col.label}</span>
                  <span className="rounded-full bg-background px-2 text-xs font-semibold text-muted">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-xl border-l-4 ${col.tone} border-y border-r border-border bg-surface p-3`}
                    >
                      <div className="text-sm font-semibold text-foreground">
                        {a.full_name}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {a.position?.title ?? "—"}
                      </div>
                      <div className="text-[11px] text-muted">
                        {a.position?.bcu?.short_name ?? a.position?.bcu?.name ?? ""}
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        {NEXT[a.status] && (
                          <form action={advanceApplication}>
                            <input type="hidden" name="id" value={a.id} />
                            <input type="hidden" name="from" value={a.status} />
                            <input type="hidden" name="to" value={NEXT[a.status]} />
                            <button className="rounded-md bg-ocean px-2 py-1 text-[11px] font-bold text-white hover:brightness-95">
                              Advance →
                            </button>
                          </form>
                        )}
                        <form action={advanceApplication}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="from" value={a.status} />
                          <input type="hidden" name="to" value="rejected" />
                          <button className="rounded-md bg-background px-2 py-1 text-[11px] font-semibold text-muted ring-1 ring-border hover:text-coral">
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted">
                      empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
