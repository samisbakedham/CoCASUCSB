"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function grantRole(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "member");
  const bcu_id = String(formData.get("bcu_id") || "") || null;
  if (!email) return;
  const sb = await createServerSupabase();
  const { error } = await sb.rpc("grant_board_role", {
    p_email: email,
    p_role: role,
    p_bcu: bcu_id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/access");
}

export async function revokeMember(formData: FormData) {
  const user_id = String(formData.get("user_id"));
  const sb = await createServerSupabase();
  const { error } = await sb
    .from("board_member")
    .update({ is_active: false })
    .eq("user_id", user_id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/access");
}
