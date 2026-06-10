"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/positions", label: "Open Positions" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/directory", label: "Who Runs AS" },
  { href: "/budget", label: "Budget" },
  { href: "/minutes", label: "Minutes" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/88 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-ocean/10 text-ocean ring-1 ring-ocean/20"
                    : "text-navy/80 hover:bg-navy/5"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <ThemeToggle />
          <Link
            href="/positions"
            className="rounded-lg bg-sunrise px-3.5 py-2 text-sm font-bold text-[#003660] shadow-sm transition hover:brightness-95"
          >
            Apply
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="rounded-lg border border-border bg-surface p-2 text-navy"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-surface px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy/90 hover:bg-navy/5"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/positions"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg bg-sunrise px-3 py-2.5 text-sm font-bold text-[#003660]"
          >
            Apply
          </Link>
        </nav>
      )}
    </header>
  );
}
