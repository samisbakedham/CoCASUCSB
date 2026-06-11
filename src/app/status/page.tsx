import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured, createServerSupabase } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { SunWave } from "@/components/Brand";
import { bookInterview, cancelInterview } from "./actions";

interface Slot {
  id: string;
  starts_at: string;
  location: string | null;
  interviewers: string | null;
}
interface Signup {
  id: string;
  slot_id: string;
  application_id: string | null;
  slot: { starts_at: string; location: string | null } | null;
}
function fmtSlot(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const metadata: Metadata = {
  title: "Track your application",
  description: "Sign in with your UCSB email to see the status of your AS applications.",
};

const STAGES = ["received", "under_review", "interview", "decision"] as const;
const STAGE_LABEL: Record<string, string> = {
  received: "Received",
  under_review: "Under review",
  interview: "Interview",
  decision: "Decision",
};
function stageIndex(status: string): number {
  if (status === "received") return 0;
  if (status === "under_review") return 1;
  if (status === "interview") return 2;
  return 3; // offer / accepted / declined / rejected / withdrawn
}
const OUTCOME: Record<string, { label: string; tone: string }> = {
  offer: { label: "Offer extended 🎉", tone: "text-gold" },
  accepted: { label: "Accepted ✓", tone: "text-kelp" },
  declined: { label: "You declined", tone: "text-muted" },
  rejected: { label: "Not selected", tone: "text-coral" },
  withdrawn: { label: "Withdrawn", tone: "text-muted" },
};

interface AppRow {
  id: string;
  full_name: string;
  status: string;
  submitted_at: string;
  position: { title: string; bcu: { name: string; short_name: string | null } | null } | null;
}

export default async function StatusPage() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
        <SunWave className="h-12 w-12" />
        <h1 className="mt-4 text-2xl font-extrabold text-navy">Track your application</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in with the UCSB email you applied with to see where your
          applications stand.
        </p>
        <div className="mt-8 w-full">
          <LoginForm next="/status" />
        </div>
      </div>
    );
  }

  const sb = await createServerSupabase();
  const [{ data }, { data: slotData }, { data: signupData }] = await Promise.all([
    sb
      .from("application")
      .select(
        "id,full_name,status,submitted_at,position:position_id(title,bcu:bcu_id(name,short_name))",
      )
      .order("submitted_at", { ascending: false }),
    sb
      .from("interview_slot")
      .select("id,starts_at,location,interviewers")
      .eq("is_open", true)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at"),
    sb
      .from("interview_signup")
      .select("id,slot_id,application_id,slot:slot_id(starts_at,location)"),
  ]);
  const apps = (data ?? []) as unknown as AppRow[];
  const slots = (slotData ?? []) as unknown as Slot[];
  const signups = (signupData ?? []) as unknown as Signup[];
  const signupByApp = new Map(signups.map((s) => [s.application_id, s]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy">
        Your applications
      </h1>
      <p className="mt-2 text-muted">
        Signed in as <span className="font-semibold text-navy">{user.email}</span>.
      </p>

      {apps.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-muted">No applications found for this email yet.</p>
          <Link
            href="/positions"
            className="mt-4 inline-block rounded-xl bg-gold px-5 py-2.5 text-sm font-extrabold text-navy transition hover:brightness-95"
          >
            Browse open positions →
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {apps.map((a) => {
            const idx = stageIndex(a.status);
            const outcome = OUTCOME[a.status];
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-extrabold text-navy">
                    {a.position?.title ?? "Position"}
                  </h2>
                  <span className="text-xs text-muted">
                    Applied {new Date(a.submitted_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {a.position?.bcu?.name ?? ""}
                </p>

                {/* Progress */}
                <div className="mt-4 flex items-center gap-1.5">
                  {STAGES.map((s, i) => (
                    <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className={`h-1.5 w-full rounded-full ${
                          i <= idx ? "bg-ocean" : "bg-border"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-semibold ${
                          i <= idx ? "text-ocean" : "text-muted"
                        }`}
                      >
                        {STAGE_LABEL[s]}
                      </span>
                    </div>
                  ))}
                </div>

                {outcome && (
                  <p className={`mt-3 text-sm font-bold ${outcome.tone}`}>
                    {outcome.label}
                  </p>
                )}

                {a.status === "interview" && (
                  <InterviewBlock
                    appId={a.id}
                    applicantName={a.full_name}
                    positionTitle={a.position?.title ?? null}
                    slots={slots}
                    signup={signupByApp.get(a.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InterviewBlock({
  appId,
  applicantName,
  positionTitle,
  slots,
  signup,
}: {
  appId: string;
  applicantName: string;
  positionTitle: string | null;
  slots: Slot[];
  signup?: Signup;
}) {
  if (signup) {
    return (
      <div className="mt-4 rounded-xl border border-kelp/30 bg-kelp/5 p-4">
        <p className="text-sm font-bold text-kelp">✓ Interview booked</p>
        <p className="mt-1 text-sm text-foreground/80">
          {signup.slot ? fmtSlot(signup.slot.starts_at) : "Time TBD"}
          {signup.slot?.location ? ` · ${signup.slot.location}` : ""}
        </p>
        <form action={cancelInterview} className="mt-2">
          <input type="hidden" name="id" value={signup.id} />
          <button className="text-xs font-semibold text-muted hover:text-coral">
            Cancel &amp; rebook
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-xl border border-gold/40 bg-gold/5 p-4">
      <p className="text-sm font-bold text-navy">Pick your interview time</p>
      {slots.length === 0 ? (
        <p className="mt-1 text-sm text-muted">
          No times posted yet — check back soon, the board will add slots.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((s) => (
            <form key={s.id} action={bookInterview}>
              <input type="hidden" name="slot_id" value={s.id} />
              <input type="hidden" name="application_id" value={appId} />
              <input type="hidden" name="applicant_name" value={applicantName} />
              <input type="hidden" name="position_title" value={positionTitle ?? ""} />
              <button
                className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm font-semibold text-navy transition hover:border-ocean hover:bg-ocean/5"
                title={s.location ?? ""}
              >
                {fmtSlot(s.starts_at)}
                {s.location ? <span className="block text-[11px] font-normal text-muted">{s.location}</span> : null}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
