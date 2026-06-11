import { createServerSupabase } from "@/lib/supabase/server";
import { getBoardMember } from "@/lib/auth";
import { Badge } from "@/components/Badge";
import { grantRole, revokeMember } from "./actions";

interface MemberRow {
  user_id: string;
  role: string;
  is_active: boolean;
  person: { full_name: string } | null;
  bcu: { name: string; short_name: string | null } | null;
}

export default async function AdminAccess() {
  const me = await getBoardMember();
  const isAdmin = me?.role === "admin";
  const sb = await createServerSupabase();
  const [{ data: members }, { data: bcus }] = await Promise.all([
    sb
      .from("board_member")
      .select("user_id,role,is_active,person:person_id(full_name),bcu:bcu_id(name,short_name)")
      .eq("is_active", true),
    sb.from("bcu").select("id,name").order("name"),
  ]);
  const rows = (members ?? []) as unknown as MemberRow[];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-navy">Board access</h1>
      <p className="mt-1 text-muted">
        Grant CoC roles, or make a BCU chair who can manage just their own board.
      </p>

      {!isAdmin && (
        <p className="mt-4 rounded-xl border border-gold/40 bg-gold/5 p-3 text-sm text-muted">
          Only admins can change access. You can view your own membership here.
        </p>
      )}

      {isAdmin && (
        <form action={grantRole} className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ocean">Grant a role</h2>
          <p className="mt-1 text-xs text-muted">
            The person must sign in once first so an account exists.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input name="email" type="email" required placeholder="person@ucsb.edu" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <select name="role" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
              <option value="admin">Admin (full board)</option>
              <option value="chair">Chair (full board)</option>
              <option value="member">Member (full board)</option>
              <option value="bcu_chair">BCU chair (their board only)</option>
            </select>
            <select name="bcu_id" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2">
              <option value="">BCU (required for BCU chair)</option>
              {(bcus ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button className="justify-self-start rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-navy sm:col-span-2">
              Grant access
            </button>
          </div>
        </form>
      )}

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-ocean">
        Current members
      </h2>
      <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.map((m) => (
          <div key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {m.person?.full_name ?? m.user_id.slice(0, 8) + "…"}
              </span>
              <Badge tone={m.role === "admin" ? "gold" : m.role === "bcu_chair" ? "sky" : "ocean"}>
                {m.role}
              </Badge>
              {m.bcu && <span className="text-xs text-muted">· {m.bcu.short_name ?? m.bcu.name}</span>}
            </div>
            {isAdmin && (
              <form action={revokeMember}>
                <input type="hidden" name="user_id" value={m.user_id} />
                <button className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:text-coral">
                  Revoke
                </button>
              </form>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No active members.</div>
        )}
      </div>
    </div>
  );
}
