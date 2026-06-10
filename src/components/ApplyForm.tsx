"use client";
import { useState } from "react";
import { createBrowserSupabase, supabaseConfigured } from "@/lib/supabase/client";
import type { Position } from "@/lib/types";

type Status = "idle" | "submitting" | "done" | "error";

export function ApplyForm({ position }: { position: Position }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      position_id: position.id,
      full_name: String(form.get("full_name") || "").trim(),
      ucsb_email: String(form.get("ucsb_email") || "").trim(),
      year: String(form.get("year") || "") || null,
      major: String(form.get("major") || "") || null,
      pronouns: String(form.get("pronouns") || "") || null,
      phone: String(form.get("phone") || "") || null,
      answers: { why: String(form.get("why") || "") },
    };

    if (!payload.full_name || !payload.ucsb_email) {
      setError("Name and UCSB email are required.");
      return;
    }
    if (!payload.ucsb_email.toLowerCase().endsWith("ucsb.edu")) {
      setError("Please use your @ucsb.edu email.");
      return;
    }

    if (!supabaseConfigured) {
      // Snapshot mode: validate + preview, but no live DB to write to yet.
      setStatus("done");
      return;
    }

    setStatus("submitting");
    try {
      const sb = createBrowserSupabase();
      const { error } = await sb.from("application").insert(payload);
      if (error) throw error;
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-kelp/30 bg-kelp/5 p-6">
        <div className="flex items-center gap-2 font-bold text-kelp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Application received
        </div>
        <p className="mt-2 text-sm text-foreground/80">
          Thanks for applying to <strong>{position.title}</strong>. You&apos;ll get
          updates as your application moves through review.
          {!supabaseConfigured && (
            <span className="mt-2 block text-xs text-muted">
              (Preview mode — connect the CoC database to record submissions.)
            </span>
          )}
        </p>
        {supabaseConfigured && (
          <a
            href="/status"
            className="mt-4 inline-block rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
          >
            Track your application →
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="full_name" label="Full name" required />
        <Field name="ucsb_email" label="UCSB email" type="email" required placeholder="you@ucsb.edu" />
        <Field name="year" label="Year" placeholder="3rd year" />
        <Field name="major" label="Major" />
        <Field name="pronouns" label="Pronouns" />
        <Field name="phone" label="Phone (optional)" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-navy">
          Why are you interested in this role?
        </label>
        <textarea
          name="why"
          rows={4}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
        />
      </div>
      {error && <p className="text-sm font-medium text-coral">{error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-xl bg-sunrise px-5 py-3 text-sm font-bold text-navy shadow-sm transition hover:brightness-95 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
      </button>
      <p className="text-xs text-muted">
        Your application is private. Only the Committee on Committees and the
        relevant board can see it.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-navy">
        {label} {required && <span className="text-coral">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
      />
    </div>
  );
}
