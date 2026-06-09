"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase, supabaseConfigured } from "@/lib/supabase/client";

export function LoginForm({ next = "/admin" }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabaseConfigured) {
    return (
      <div className="rounded-2xl border border-sunrise/30 bg-sunrise/5 p-6 text-sm text-foreground/80">
        <p className="font-semibold text-navy">Sign-in isn&apos;t available yet.</p>
        <p className="mt-2">
          Connect the CoC Supabase project (set its URL and key in{" "}
          <code className="rounded bg-background px-1">web/.env.local</code>) to
          enable board login. See <code>SETUP.md</code>.
        </p>
      </div>
    );
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.toLowerCase().endsWith("ucsb.edu")) {
      setError("Use your @ucsb.edu email.");
      return;
    }
    setBusy(true);
    try {
      const sb = createBrowserSupabase();
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setStage("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const sb = createBrowserSupabase();
      const { error } = await sb.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {stage === "email" ? (
        <form onSubmit={sendCode} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-navy">
              UCSB email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ucsb.edu"
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            />
          </div>
          {error && <p className="text-sm font-medium text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-sunrise px-5 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {busy ? "Sending…" : "Email me a sign-in code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-muted">
            We sent a 6-digit code to <strong>{email}</strong>.
          </p>
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
          />
          {error && <p className="text-sm font-medium text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-ocean px-5 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {busy ? "Verifying…" : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => setStage("email")}
            className="w-full text-xs font-semibold text-muted hover:text-ocean"
          >
            ← use a different email
          </button>
        </form>
      )}
    </div>
  );
}
