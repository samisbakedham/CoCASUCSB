"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BcuType } from "@/lib/types";
import { BCU_TYPE_LABEL } from "@/lib/brand";
import { Badge } from "./Badge";

export interface DirGroup {
  slug: string;
  name: string;
  short: string | null;
  type: BcuType;
  website?: string | null;
  members: {
    full_name: string;
    role_title: string;
    is_chair: boolean;
    as_email?: string | null;
  }[];
}

export function DirectoryBrowser({ groups }: { groups: DirGroup[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return groups;
    return groups
      .map((g) => {
        const matchGroup =
          g.name.toLowerCase().includes(n) || (g.short ?? "").toLowerCase().includes(n);
        const members = matchGroup
          ? g.members
          : g.members.filter(
              (m) =>
                m.full_name.toLowerCase().includes(n) ||
                m.role_title.toLowerCase().includes(n),
            );
        return { ...g, members, _show: matchGroup || members.length > 0 };
      })
      .filter((g) => g._show);
  }, [groups, q]);

  return (
    <div>
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
          placeholder="Search a person, role, or board…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-ocean/20"
        />
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {filtered.map((g) => (
          <div key={g.slug} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/bcu/${g.slug}`}
                  className="font-extrabold leading-tight text-navy hover:text-ocean hover:underline"
                >
                  {g.name}
                </Link>
                <span className="block text-xs font-medium uppercase tracking-wide text-muted">
                  {BCU_TYPE_LABEL[g.type]}
                </span>
              </div>
              {g.website && (
                <a
                  href={g.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-ocean hover:underline"
                >
                  site ↗
                </a>
              )}
            </div>

            {g.members.length ? (
              <ul className="mt-4 divide-y divide-border">
                {g.members
                  .slice()
                  .sort((a, b) => Number(b.is_chair) - Number(a.is_chair))
                  .map((m, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {m.full_name}
                        </div>
                        <div className="text-xs text-muted">{m.role_title}</div>
                      </div>
                      {m.is_chair && <Badge tone="gold">Chair</Badge>}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm italic text-muted">No members listed yet.</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted">
          No matches.
        </div>
      )}
    </div>
  );
}
