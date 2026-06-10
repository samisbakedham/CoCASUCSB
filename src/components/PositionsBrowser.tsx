"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Position } from "@/lib/types";
import { ROUTING } from "@/lib/brand";
import { Badge } from "./Badge";

const ROUTING_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "coc_interview", label: "CoC interviews" },
  { key: "forward_to_bcu", label: "Forwarded to BCU" },
  { key: "external_form", label: "Apply on BCU site" },
];

export function PositionsBrowser({ positions }: { positions: Position[] }) {
  const [q, setQ] = useState("");
  const [routing, setRouting] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return positions
      .filter((p) => (routing === "all" ? true : p.routing === routing))
      .filter(
        (p) =>
          !needle ||
          p.title.toLowerCase().includes(needle) ||
          p.bcu_name.toLowerCase().includes(needle) ||
          (p.bcu_short ?? "").toLowerCase().includes(needle),
      )
      .sort((a, b) => a.bcu_name.localeCompare(b.bcu_name));
  }, [positions, q, routing]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search role or board…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ROUTING_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setRouting(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
                routing === f.key
                  ? "bg-ocean text-white ring-ocean"
                  : "bg-surface text-navy/80 ring-border hover:ring-ocean/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">
        Showing <span className="font-semibold text-navy">{filtered.length}</span>{" "}
        of {positions.length} open positions
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const r = ROUTING[p.routing];
          return (
            <Link
              key={p.id}
              href={`/positions/${p.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-ocean/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone="navy">{p.bcu_short || p.bcu_name}</Badge>
                <Badge tone={r.tone}>{r.label}</Badge>
              </div>
              <h3 className="mt-3 font-bold leading-snug text-navy group-hover:text-ocean">
                {p.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-muted">{p.bcu_name}</p>
              <span className="mt-auto pt-4 text-xs font-semibold text-ocean opacity-0 transition group-hover:opacity-100">
                View &amp; apply →
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted">
          No positions match that search.
        </div>
      )}
    </div>
  );
}
