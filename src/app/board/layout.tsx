import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, createServerSupabase } from "@/lib/supabase/server";
import { getBoardMember, getCurrentUser } from "@/lib/auth";
import { signOut } from "../admin/actions";
import { SunWave } from "@/components/Brand";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return <Gate>The BCU console activates once the database is connected.</Gate>;
  }
  const member = await getBoardMember();
  if (!member) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/board");
    return (
      <Gate>
        You&apos;re signed in as <strong>{user.email}</strong>, but you&apos;re not
        set up as a board chair yet. Ask a CoC admin to grant you BCU-chair access.
      </Gate>
    );
  }
  // Full CoC board members belong in the main console.
  if (member.role !== "bcu_chair" || !member.bcu_id) redirect("/admin");

  const sb = await createServerSupabase();
  const { data: bcu } = await sb
    .from("bcu")
    .select("name,short_name")
    .eq("id", member.bcu_id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <SunWave className="h-7 w-7" />
          <div>
            <span className="font-extrabold text-navy">{bcu?.name ?? "Your board"}</span>
            <p className="text-xs font-medium text-muted">Chair console · recruiting for your board</p>
          </div>
        </div>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link href="/board" className="rounded-md px-3 py-2 text-navy/80 hover:bg-navy/5">Positions</Link>
          <Link href="/board/applicants" className="rounded-md px-3 py-2 text-navy/80 hover:bg-navy/5">Applicants</Link>
          <form action={signOut}>
            <button className="rounded-md px-3 py-2 text-muted hover:text-coral">Sign out</button>
          </form>
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <SunWave className="mx-auto h-12 w-12" />
      <h1 className="mt-4 text-2xl font-extrabold text-navy">BCU chair console</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}
