import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getBoardMember, getCurrentUser } from "@/lib/auth";
import { signOut } from "./actions";
import { SunWave } from "@/components/Brand";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <Gate title="Admin console — not connected yet">
        The board console activates once the CoC Supabase project is connected.
        Set its URL and key in <code>web/.env.local</code> (see{" "}
        <code>SETUP.md</code>), then sign in with your UCSB email.
      </Gate>
    );
  }

  const member = await getBoardMember();
  if (!member) {
    const user = await getCurrentUser();
    if (!user) redirect("/login?next=/admin");
    return (
      <Gate title="Access pending">
        You&apos;re signed in as <strong>{user.email}</strong>, but you&apos;re not
        yet on the board roster. An admin needs to add you to{" "}
        <code>board_member</code>.
        <form action={signOut} className="mt-4">
          <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            Sign out
          </button>
        </form>
      </Gate>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <SunWave className="h-7 w-7" />
          <span className="font-extrabold text-navy">Board console</span>
          <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-xs font-semibold uppercase text-ocean">
            {member.role}
          </span>
        </div>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link href="/admin" className="rounded-lg px-3 py-1.5 text-navy/80 hover:bg-navy/5">
            Dashboard
          </Link>
          <Link href="/admin/applications" className="rounded-lg px-3 py-1.5 text-navy/80 hover:bg-navy/5">
            Applications
          </Link>
          <Link href="/admin/positions" className="rounded-lg px-3 py-1.5 text-navy/80 hover:bg-navy/5">
            Positions
          </Link>
          <Link href="/admin/minutes" className="rounded-lg px-3 py-1.5 text-navy/80 hover:bg-navy/5">
            Minutes
          </Link>
          <Link href="/admin/outreach" className="rounded-lg px-3 py-1.5 text-navy/80 hover:bg-navy/5">
            Outreach
          </Link>
          <Link href="/admin/reports" className="rounded-lg px-3 py-1.5 text-navy/80 hover:bg-navy/5">
            Reports
          </Link>
          <form action={signOut}>
            <button className="rounded-lg px-3 py-1.5 text-muted hover:text-coral">
              Sign out
            </button>
          </form>
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <SunWave className="mx-auto h-12 w-12" />
      <h1 className="mt-4 text-2xl font-extrabold text-navy">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}
