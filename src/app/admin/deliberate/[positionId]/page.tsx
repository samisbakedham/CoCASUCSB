import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/Badge";
import { advanceApplication } from "../../actions";
import { upsertReview } from "../actions";

interface Review {
  id: string;
  reviewer_user_id: string;
  reviewer_name: string | null;
  score: number | null;
  recommendation: string | null;
  notes: string | null;
}
interface AppRow {
  id: string;
  full_name: string;
  ucsb_email: string;
  year: string | null;
  major: string | null;
  status: string;
  answers: { why?: string } | null;
  reviews: Review[];
}

const REC_CLASS: Record<string, string> = {
  advance: "text-kelp",
  hold: "text-[#8a6500]",
  reject: "text-coral",
};

export default async function DeliberatePosition({
  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  const { positionId } = await params;
  const sb = await createServerSupabase();
  const [{ data: position }, { data }, user] = await Promise.all([
    sb.from("position").select("id,title,bcu:bcu_id(name,short_name)").eq("id", positionId).maybeSingle(),
    sb
      .from("application")
      .select(
        "id,full_name,ucsb_email,year,major,status,answers,reviews:application_review(id,reviewer_user_id,reviewer_name,score,recommendation,notes)",
      )
      .eq("position_id", positionId)
      .order("submitted_at"),
    getCurrentUser(),
  ]);
  if (!position) notFound();
  const apps = (data ?? []) as unknown as AppRow[];
  const bcu = (position.bcu ?? null) as unknown as
    | { name: string; short_name: string | null }
    | null;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/deliberate" className="text-sm font-semibold text-ocean hover:underline">
        ← All deliberations
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-navy">{position.title}</h1>
      <p className="text-muted">{bcu?.name} · {apps.length} applicant(s)</p>

      <div className="mt-6 space-y-5">
        {apps.map((a) => {
          const scores = a.reviews.map((r) => r.score).filter((s): s is number => s != null);
          const avg = scores.length ? (scores.reduce((x, y) => x + y, 0) / scores.length).toFixed(1) : "—";
          const mine = a.reviews.find((r) => r.reviewer_user_id === user?.id);
          return (
            <div key={a.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-extrabold text-navy">{a.full_name}</h2>
                  <p className="text-xs text-muted">
                    {[a.year, a.major, a.ucsb_email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="muted">{a.status.replace("_", " ")}</Badge>
                  <span className="rounded-lg bg-ocean/10 px-2.5 py-1 text-sm font-bold text-ocean">
                    avg {avg}
                  </span>
                </div>
              </div>

              {a.answers?.why && (
                <p className="mt-3 rounded-lg bg-background p-3 text-sm text-foreground/80">
                  &ldquo;{a.answers.why}&rdquo;
                </p>
              )}

              {/* Board's reviews */}
              {a.reviews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.reviews.map((r) => (
                    <span
                      key={r.id}
                      className="rounded-full bg-background px-3 py-1 text-xs ring-1 ring-border"
                      title={r.notes ?? ""}
                    >
                      <span className="font-semibold text-navy">{r.reviewer_name?.split("@")[0] ?? "board"}</span>
                      {r.score != null && <span className="ml-1 text-ocean">{r.score}/5</span>}
                      {r.recommendation && (
                        <span className={`ml-1 font-semibold ${REC_CLASS[r.recommendation] ?? "text-muted"}`}>
                          · {r.recommendation}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* My review */}
              <form action={upsertReview} className="mt-4 grid gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center">
                <input type="hidden" name="application_id" value={a.id} />
                <input type="hidden" name="position_id" value={positionId} />
                <select name="score" defaultValue={mine?.score ?? ""} className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" aria-label="Score">
                  <option value="">Score</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                </select>
                <select name="recommendation" defaultValue={mine?.recommendation ?? ""} className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" aria-label="Recommendation">
                  <option value="">Rec…</option>
                  <option value="advance">Advance</option>
                  <option value="hold">Hold</option>
                  <option value="reject">Reject</option>
                </select>
                <input name="notes" defaultValue={mine?.notes ?? ""} placeholder="Your notes…" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
                <button className="rounded-md bg-gold px-3 py-1.5 text-sm font-bold text-navy">
                  {mine ? "Update" : "Save"}
                </button>
              </form>

              {/* Decisions */}
              <div className="mt-3 flex gap-2">
                <form action={advanceApplication}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="from" value={a.status} />
                  <input type="hidden" name="to" value="offer" />
                  <button className="rounded-md bg-kelp px-3 py-1.5 text-xs font-bold text-white hover:brightness-110">
                    Extend offer
                  </button>
                </form>
                <form action={advanceApplication}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="from" value={a.status} />
                  <input type="hidden" name="to" value="rejected" />
                  <button className="rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-border hover:text-coral">
                    Not selected
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {apps.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            No applicants for this position yet.
          </p>
        )}
      </div>
    </div>
  );
}
