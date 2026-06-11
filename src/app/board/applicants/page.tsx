import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/Badge";
import { advanceApplication } from "../../admin/actions";

const NEXT: Record<string, string> = {
  received: "under_review",
  under_review: "interview",
  interview: "offer",
  offer: "accepted",
};
const LABEL: Record<string, string> = {
  received: "New",
  under_review: "Reviewing",
  interview: "Interview",
  offer: "Offered",
  accepted: "Accepted",
  rejected: "Not selected",
  declined: "Declined",
};
const TONE: Record<string, string> = {
  received: "sky",
  under_review: "ocean",
  interview: "gold",
  offer: "kelp",
  accepted: "kelp",
  rejected: "coral",
};

interface AppRow {
  id: string;
  full_name: string;
  ucsb_email: string;
  status: string;
  submitted_at: string;
  answers: { why?: string } | null;
  position: { title: string } | null;
}

export default async function BoardApplicants() {
  const sb = await createServerSupabase();
  // RLS scopes these to the chair's own BCU automatically.
  const { data } = await sb
    .from("application")
    .select("id,full_name,ucsb_email,status,submitted_at,answers,position:position_id(title)")
    .order("submitted_at", { ascending: false });
  const apps = (data ?? []) as unknown as AppRow[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">Applicants</h1>
      <p className="mt-1 text-muted">Everyone who&apos;s applied to your board&apos;s positions.</p>

      {apps.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No applicants yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy">{a.full_name}</span>
                    <Badge tone={TONE[a.status] ?? "muted"}>{LABEL[a.status] ?? a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {a.position?.title} · {a.ucsb_email} · applied{" "}
                    {new Date(a.submitted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {NEXT[a.status] && (
                    <form action={advanceApplication}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="from" value={a.status} />
                      <input type="hidden" name="to" value={NEXT[a.status]} />
                      <button className="rounded-md bg-ocean px-2.5 py-1 text-xs font-bold text-white hover:brightness-110">
                        → {LABEL[NEXT[a.status]]}
                      </button>
                    </form>
                  )}
                  <form action={advanceApplication}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="from" value={a.status} />
                    <input type="hidden" name="to" value="rejected" />
                    <button className="rounded-md bg-background px-2.5 py-1 text-xs font-semibold text-muted ring-1 ring-border hover:text-coral">
                      Decline
                    </button>
                  </form>
                </div>
              </div>
              {a.answers?.why && (
                <p className="mt-2 rounded-lg bg-background p-2.5 text-sm text-foreground/80">
                  &ldquo;{a.answers.why}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
