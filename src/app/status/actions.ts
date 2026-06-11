"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function bookInterview(formData: FormData) {
  const slot_id = String(formData.get("slot_id"));
  const application_id = String(formData.get("application_id") || "") || null;
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.email) throw new Error("Please sign in to book an interview.");

  const { error } = await sb.from("interview_signup").insert({
    slot_id,
    application_id,
    applicant_name: String(formData.get("applicant_name") || "") || null,
    applicant_email: user.email,
    position_title: String(formData.get("position_title") || "") || null,
  });
  // unique index (slot, email) blocks double-booking the same slot
  if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);
  revalidatePath("/status");
}

export async function cancelInterview(formData: FormData) {
  const id = String(formData.get("id"));
  const sb = await createServerSupabase();
  const { error } = await sb.from("interview_signup").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/status");
}
