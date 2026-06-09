import snapshot from "./seed-data.json";
import { createServerSupabase, isSupabaseConfigured } from "./supabase/server";
import type {
  Attendance,
  Bcu,
  BudgetLine,
  Meeting,
  MinuteItem,
  Position,
  RosterEntry,
} from "./types";

/** Where the page's data came from — surfaced in the UI footer for honesty. */
export const dataSource: "live" | "snapshot" = isSupabaseConfigured()
  ? "live"
  : "snapshot";

const snap = snapshot as unknown as {
  bcus: Bcu[];
  positions: Position[];
  roster: RosterEntry[];
  budget: BudgetLine[];
};

export async function getOpenPositions(): Promise<Position[]> {
  if (isSupabaseConfigured()) {
    const sb = await createServerSupabase();
    const { data } = await sb.from("v_open_positions").select("*");
    if (data) return data.map(rowToPosition);
  }
  return snap.positions.filter((p) => p.status === "open");
}

export async function getPosition(id: string): Promise<Position | null> {
  if (isSupabaseConfigured()) {
    const sb = await createServerSupabase();
    const { data } = await sb
      .from("position")
      .select(
        "id,title,slug,description,legal_code,status,openings,deadline,routing,external_url,coc_advertises,notes,bcu:bcu_id(slug,name,short_name,type)",
      )
      .eq("id", id)
      .maybeSingle();
    if (data) return joinedToPosition(data);
    return null;
  }
  return snap.positions.find((p) => p.id === id) ?? null;
}

export async function getRoster(): Promise<RosterEntry[]> {
  if (isSupabaseConfigured()) {
    const sb = await createServerSupabase();
    const { data } = await sb.from("v_roster").select("*");
    if (data)
      return data.map((r) => ({
        full_name: r.full_name,
        as_email: r.as_email,
        role_title: r.role_title,
        is_chair: r.is_chair,
        term: r.term,
        bcu_slug: r.bcu_slug ?? "",
        bcu_name: r.bcu_name ?? "Unaffiliated",
        bcu_short: r.bcu_short,
        bcu_type: r.bcu_type ?? "committee",
      }));
  }
  return snap.roster;
}

export async function getBcus(): Promise<Bcu[]> {
  if (isSupabaseConfigured()) {
    const sb = await createServerSupabase();
    const { data } = await sb
      .from("bcu")
      .select("slug,name,short_name,type,website,contact_name,contact_email")
      .order("name");
    if (data)
      return data.map((b) => ({
        slug: b.slug,
        name: b.name,
        short: b.short_name,
        type: b.type,
        website: b.website,
        contact_name: b.contact_name,
        contact_email: b.contact_email,
      }));
  }
  return snap.bcus;
}

export async function getBudget(): Promise<BudgetLine[]> {
  if (isSupabaseConfigured()) {
    const sb = await createServerSupabase();
    const { data } = await sb
      .from("budget_line")
      .select("*")
      .eq("is_public", true)
      .order("sort_order");
    if (data) return data as BudgetLine[];
  }
  return snap.budget;
}

export async function getBcuDetail(slug: string): Promise<{
  bcu: Bcu | null;
  positions: Position[];
  roster: RosterEntry[];
}> {
  const [bcus, positions, roster] = await Promise.all([
    getBcus(),
    getOpenPositions(),
    getRoster(),
  ]);
  return {
    bcu: bcus.find((b) => b.slug === slug) ?? null,
    positions: positions.filter((p) => p.bcu_slug === slug),
    roster: roster.filter((r) => r.bcu_slug === slug),
  };
}

export async function getMeetings(): Promise<Meeting[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("meeting")
    .select("*")
    .eq("is_published", true)
    .order("meeting_date", { ascending: false });
  return (data ?? []) as Meeting[];
}

export async function getMeeting(id: string): Promise<{
  meeting: Meeting;
  attendance: Attendance[];
  items: MinuteItem[];
} | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await createServerSupabase();
  const { data: meeting } = await sb
    .from("meeting")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (!meeting) return null;
  const [{ data: attendance }, { data: items }] = await Promise.all([
    sb
      .from("meeting_attendance")
      .select("display_name,role_title,status,note")
      .eq("meeting_id", id),
    sb
      .from("minute_item")
      .select("section,ordinal,heading,body")
      .eq("meeting_id", id)
      .order("ordinal"),
  ]);
  return {
    meeting: meeting as Meeting,
    attendance: (attendance ?? []) as Attendance[],
    items: (items ?? []) as MinuteItem[],
  };
}

/* ── mappers ─────────────────────────────────────────────────────────── */
function rowToPosition(r: Record<string, unknown>): Position {
  return {
    id: String(r.id),
    title: r.title as string,
    status: (r.status as Position["status"]) ?? "open",
    routing: (r.routing as Position["routing"]) ?? "unknown",
    external_url: r.external_url as string | null,
    coc_advertises: r.coc_advertises as boolean | null,
    notes: (r.notes as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    legal_code: (r.legal_code as string | null) ?? null,
    openings: (r.openings as number | null) ?? null,
    deadline: (r.deadline as string | null) ?? null,
    bcu_slug: (r.bcu_slug as string) ?? "",
    bcu_name: (r.bcu_name as string) ?? "",
    bcu_short: (r.bcu_short as string | null) ?? null,
    bcu_type: (r.bcu_type as Position["bcu_type"]) ?? "committee",
  };
}

function joinedToPosition(r: Record<string, unknown>): Position {
  const b = (r.bcu ?? {}) as Record<string, unknown>;
  return {
    id: String(r.id),
    title: r.title as string,
    status: (r.status as Position["status"]) ?? "open",
    routing: (r.routing as Position["routing"]) ?? "unknown",
    external_url: r.external_url as string | null,
    coc_advertises: r.coc_advertises as boolean | null,
    notes: (r.notes as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    legal_code: (r.legal_code as string | null) ?? null,
    openings: (r.openings as number | null) ?? null,
    deadline: (r.deadline as string | null) ?? null,
    bcu_slug: (b.slug as string) ?? "",
    bcu_name: (b.name as string) ?? "",
    bcu_short: (b.short_name as string | null) ?? null,
    bcu_type: (b.type as Position["bcu_type"]) ?? "committee",
  };
}
