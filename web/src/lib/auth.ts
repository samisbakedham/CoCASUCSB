import { createServerSupabase, isSupabaseConfigured } from "./supabase/server";

export interface BoardMember {
  user_id: string;
  person_id: string | null;
  role: "admin" | "chair" | "member" | "bcu_chair";
  bcu_id: string | null;
  is_active: boolean;
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

/** Returns the active board_member row for the signed-in user, or null. */
export async function getBoardMember(): Promise<BoardMember | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb
    .from("board_member")
    .select("user_id,person_id,role,bcu_id,is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  return (data as BoardMember | null) ?? null;
}
