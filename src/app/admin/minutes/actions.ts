"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

function rev(id: string) {
  revalidatePath(`/admin/minutes/${id}`);
  revalidatePath("/admin/minutes");
  revalidatePath("/minutes");
  revalidatePath(`/minutes/${id}`);
}

export async function updateMeeting(formData: FormData) {
  const id = String(formData.get("id"));
  const sb = await createServerSupabase();
  const { error } = await sb
    .from("meeting")
    .update({
      meeting_date: String(formData.get("meeting_date") || "") || undefined,
      location: String(formData.get("location") || "") || null,
      term: String(formData.get("term") || "") || null,
      called_to_order: String(formData.get("called_to_order") || "") || null,
      called_by: String(formData.get("called_by") || "") || null,
      qotw: String(formData.get("qotw") || "") || null,
      summary: String(formData.get("summary") || "") || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  rev(id);
}

export async function addAttendance(formData: FormData) {
  const meeting_id = String(formData.get("meeting_id"));
  const display_name = String(formData.get("display_name") || "").trim();
  if (!display_name) return;
  const sb = await createServerSupabase();
  const { data: person } = await sb
    .from("person")
    .select("id")
    .eq("full_name", display_name)
    .maybeSingle();
  const { error } = await sb.from("meeting_attendance").insert({
    meeting_id,
    person_id: person?.id ?? null,
    display_name,
    role_title: String(formData.get("role_title") || "") || null,
    status: String(formData.get("status") || "present"),
  });
  if (error) throw new Error(error.message);
  rev(meeting_id);
}

export async function setAttendanceStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const meeting_id = String(formData.get("meeting_id"));
  const sb = await createServerSupabase();
  const { error } = await sb
    .from("meeting_attendance")
    .update({ status: String(formData.get("status") || "present") })
    .eq("id", id);
  if (error) throw new Error(error.message);
  rev(meeting_id);
}

export async function removeAttendance(formData: FormData) {
  const id = String(formData.get("id"));
  const meeting_id = String(formData.get("meeting_id"));
  const sb = await createServerSupabase();
  const { error } = await sb.from("meeting_attendance").delete().eq("id", id);
  if (error) throw new Error(error.message);
  rev(meeting_id);
}

/** Quick roll-call: add the current CoC board as "present" if not already listed. */
export async function loadBoardAttendance(formData: FormData) {
  const meeting_id = String(formData.get("meeting_id"));
  const sb = await createServerSupabase();
  const { data: coc } = await sb.from("bcu").select("id").eq("slug", "coc").maybeSingle();
  if (!coc) return;
  const { data: appts } = await sb
    .from("appointment")
    .select("role_title,person:person_id(id,full_name)")
    .eq("bcu_id", coc.id)
    .eq("is_current", true);
  const { data: existing } = await sb
    .from("meeting_attendance")
    .select("display_name")
    .eq("meeting_id", meeting_id);
  const have = new Set((existing ?? []).map((e) => e.display_name));
  const rows = (appts ?? [])
    .map((a) => {
      const p = a.person as unknown as { id: string; full_name: string } | null;
      return p ? { person_id: p.id, display_name: p.full_name, role_title: a.role_title, status: "present", meeting_id } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null && !have.has(r.display_name));
  if (rows.length) {
    const { error } = await sb.from("meeting_attendance").insert(rows);
    if (error) throw new Error(error.message);
  }
  rev(meeting_id);
}

export async function addMinuteItem(formData: FormData) {
  const meeting_id = String(formData.get("meeting_id"));
  const body = String(formData.get("body") || "").trim();
  const heading = String(formData.get("heading") || "").trim();
  if (!body && !heading) return;
  const sb = await createServerSupabase();
  const { data: last } = await sb
    .from("minute_item")
    .select("ordinal")
    .eq("meeting_id", meeting_id)
    .order("ordinal", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await sb.from("minute_item").insert({
    meeting_id,
    section: String(formData.get("section") || "report"),
    ordinal: (last?.ordinal ?? 0) + 1,
    heading: heading || null,
    body: body || null,
  });
  if (error) throw new Error(error.message);
  rev(meeting_id);
}

export async function removeMinuteItem(formData: FormData) {
  const id = String(formData.get("id"));
  const meeting_id = String(formData.get("meeting_id"));
  const sb = await createServerSupabase();
  const { error } = await sb.from("minute_item").delete().eq("id", id);
  if (error) throw new Error(error.message);
  rev(meeting_id);
}
