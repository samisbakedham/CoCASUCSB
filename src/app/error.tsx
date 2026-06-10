"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-coral">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-extrabold text-navy">
        Something went wrong.
      </h1>
      <p className="mt-3 text-muted">
        This one&apos;s on us. Try again, or head back and pick another page.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-[#003660] transition hover:brightness-95"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
