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
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SunWave className="h-7 w-7" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-navy">Board console</span>
                <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-xs font-semibold uppercase text-ocean">
                  {member.role}
                </span>
              </div>
              <p className="text-xs font-medium text-muted">
                Recruitment, appointments, minutes, and outreach
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button className="rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-coral/10 hover:text-coral">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto text-sm font-semibold">
          <AdminLink href="/admin">Dashboard</AdminLink>
          <AdminLink href="/admin/applications">Applications</AdminLink>
          <AdminLink href="/admin/positions">Positions</AdminLink>
          <AdminLink href="/admin/minutes">Minutes</AdminLink>
          <AdminLink href="/admin/outreach">Outreach</AdminLink>
          <AdminLink href="/admin/reports">Reports</AdminLink>
          <Link
            href="/positions"
            className="ml-auto hidden rounded-md px-3 py-2 text-ocean hover:bg-ocean/10 lg:block"
          >
            Public listings
          </Link>
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-md px-3 py-2 text-navy/80 hover:bg-navy/5"
    >
      {children}
    </Link>
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
