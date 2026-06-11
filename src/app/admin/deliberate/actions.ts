"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function upsertReview(formData: FormData) {
  const application_id = String(formData.get("application_id"));
  const position_id = String(formData.get("position_id"));
  const scoreRaw = Number(formData.get("score"));
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await sb.from("application_review").upsert(
    {
      application_id,
      reviewer_user_id: user.id,
      reviewer_name: user.email ?? null,
      score: Number.isFinite(scoreRaw) && scoreRaw > 0 ? scoreRaw : null,
      recommendation: String(formData.get("recommendation") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "application_id,reviewer_user_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/deliberate/${position_id}`);
}
