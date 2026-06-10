"use client";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

export function createBrowserSupabase() {
  if (!supabaseConfigured) {
    throw new Error("Supabase is not configured (set NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).");
  }
  return createBrowserClient(url!, anon!);
}
