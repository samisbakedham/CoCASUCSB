"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export async function signOut() {
  if (isSupabaseConfigured()) {
    const sb = await createServerSupabase();
    await sb.auth.signOut();
  }
  redirect("/login");
}

export async function advanceApplication(formData: FormData) {
  const id = String(formData.get("id"));
  const to = String(formData.get("to"));
  const from = String(formData.get("from") || "") || null;
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const { error } = await sb.from("application").update({ status: to }).eq("id", id);
  if (error) throw new Error(error.message);

  await sb.from("application_event").insert({
    application_id: id,
    from_status: from,
    to_status: to,
    actor_user_id: user?.id ?? null,
  });
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function setPositionStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const sb = await createServerSupabase();
  const { error } = await sb
    .from("position")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/positions");
  revalidatePath("/positions");
}

export async function createMeeting(formData: FormData) {
  const meeting_date = String(formData.get("meeting_date") || "");
  if (!meeting_date) return;
  const sb = await createServerSupabase();
  const { error } = await sb.from("meeting").insert({
    meeting_date,
    location: String(formData.get("location") || "") || null,
    term: String(formData.get("term") || "") || null,
    called_by: String(formData.get("called_by") || "") || null,
    qotw: String(formData.get("qotw") || "") || null,
    summary: String(formData.get("summary") || "") || null,
    is_published: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/minutes");
}

export async function setMeetingPublished(formData: FormData) {
  const id = String(formData.get("id"));
  const is_published = String(formData.get("is_published")) === "true";
  const sb = await createServerSupabase();
  const { error } = await sb.from("meeting").update({ is_published }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/minutes");
  revalidatePath("/minutes");
}

export async function createOutreach(formData: FormData) {
  const sb = await createServerSupabase();
  const { error } = await sb.from("outreach_log").insert({
    bcu_id: String(formData.get("bcu_id") || "") || null,
    officer_name: String(formData.get("officer_name") || "") || null,
    term: String(formData.get("term") || "") || null,
    week: String(formData.get("week") || "") || null,
    channel: String(formData.get("channel") || "") || null,
    contacted: String(formData.get("contacted")) === "on",
    result: String(formData.get("result") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/outreach");
}

export async function createAppointment(formData: FormData) {
  const full_name = String(formData.get("full_name") || "").trim();
  const ucsb_email = String(formData.get("ucsb_email") || "").trim() || null;
  const as_email = String(formData.get("as_email") || "").trim() || null;
  const bcu_id = String(formData.get("bcu_id") || "") || null;
  const role_title = String(formData.get("role_title") || "").trim();
  const term = String(formData.get("term") || "").trim() || null;
  const is_chair = String(formData.get("is_chair")) === "on";
  if (!full_name || !role_title) return;

  const sb = await createServerSupabase();

  // Find an existing person (by email, then name) or create one.
  let personId: string | null = null;
  if (ucsb_email) {
    const { data } = await sb.from("person").select("id").eq("ucsb_email", ucsb_email).maybeSingle();
    personId = data?.id ?? null;
  }
  if (!personId) {
    const { data } = await sb.from("person").select("id").eq("full_name", full_name).maybeSingle();
    personId = data?.id ?? null;
  }
  if (!personId) {
    const { data, error } = await sb
      .from("person")
      .insert({ full_name, ucsb_email, as_email, is_public: true })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    personId = data.id;
  }

  const { error } = await sb.from("appointment").insert({
    person_id: personId,
    bcu_id,
    role_title,
    term,
    is_chair,
    is_current: true,
    is_public: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/roster");
  revalidatePath("/directory");
}

export async function removeAppointment(formData: FormData) {
  const id = String(formData.get("id"));
  const sb = await createServerSupabase();
  const { error } = await sb.from("appointment").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/roster");
  revalidatePath("/directory");
}

export async function createPosition(formData: FormData) {
  const bcu_id = String(formData.get("bcu_id"));
  const title = String(formData.get("title") || "").trim();
  const routing = String(formData.get("routing") || "coc_interview");
  const description = String(formData.get("description") || "") || null;
  const legal_code = String(formData.get("legal_code") || "") || null;
  const external_url = String(formData.get("external_url") || "") || null;
  const status = String(formData.get("status") || "draft");
  const deadline = String(formData.get("deadline") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  const openingsRaw = Number(formData.get("openings") || 1);
  if (!bcu_id || !title) return;

  const sb = await createServerSupabase();
  const { error } = await sb.from("position").insert({
    bcu_id,
    title,
    routing,
    description,
    legal_code,
    external_url,
    status,
    deadline,
    notes,
    openings: Number.isFinite(openingsRaw) ? openingsRaw : 1,
    coc_advertises: String(formData.get("coc_advertises")) === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/positions");
  revalidatePath("/positions");
}
