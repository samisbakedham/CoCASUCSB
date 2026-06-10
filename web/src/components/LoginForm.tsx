"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase, supabaseConfigured } from "@/lib/supabase/client";

export function LoginForm({ next = "/admin" }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "sent">("email");
  const [showCode, setShowCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabaseConfigured) {
    return (
      <div className="rounded-2xl border border-sunrise/30 bg-sunrise/5 p-6 text-sm text-foreground/80">
        <p className="font-semibold text-navy">Sign-in isn&apos;t available yet.</p>
        <p className="mt-2">
          Connect the CoC Supabase project in <code>web/.env.local</code> (see{" "}
          <code>SETUP.md</code>) to enable board login.
        </p>
      </div>
    );
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.toLowerCase().endsWith("ucsb.edu")) {
      setError("Use your @ucsb.edu email.");
      return;
    }
    setBusy(true);
    try {
      const sb = createBrowserSupabase();
      const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirect },
      });
      if (error) throw error;
      setStage("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
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
      const { error } = await sb.auth.verifyOtp({ email, token: code.trim(), type: "email" });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "sent") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 font-bold text-kelp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" strokeLinecap="round" />
          </svg>
          Check your email
        </div>
        <p className="mt-2 text-sm text-foreground/80">
          We sent a sign-in link to <strong>{email}</strong>. Open it in this
          browser to finish signing in.
        </p>

        <button
          onClick={() => setShowCode((v) => !v)}
          className="mt-4 text-xs font-semibold text-ocean hover:underline"
        >
          {showCode ? "Hide" : "Got a 6-digit code instead?"}
        </button>
        {showCode && (
          <form onSubmit={verify} className="mt-3 space-y-3">
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            />
            {error && <p className="text-sm font-medium text-coral">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-ocean px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? "Verifying…" : "Verify code"}
            </button>
          </form>
        )}
        <button
          onClick={() => { setStage("email"); setError(null); }}
          className="mt-4 block text-xs font-semibold text-muted hover:text-ocean"
        >
          ← use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <form onSubmit={sendLink} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">UCSB email</label>
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
          {busy ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>
    </div>
  );
}
