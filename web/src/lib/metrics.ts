import type { Bcu, Position, RosterEntry, Routing } from "./types";

export interface CocMetrics {
  openPositions: number;
  bcuTotal: number;
  bcusWithOpenings: number;
  rosterSeats: number;
  chairs: number;
  cocInterviews: number;
  staffedCoverage: number; // % of BCUs with >=1 listed member
  routing: { key: Routing; label: string; count: number }[];
  byBcu: { slug: string; name: string; short: string | null; count: number }[];
  byType: { type: string; bcus: number; positions: number }[];
}

const ROUTING_LABEL: Record<Routing, string> = {
  coc_interview: "CoC interviews",
  forward_to_bcu: "Forwarded to BCU",
  external_form: "Apply on BCU site",
  unknown: "Contact to apply",
};

export function computeMetrics(
  positions: Position[],
  bcus: Bcu[],
  roster: RosterEntry[],
): CocMetrics {
  const bcusWithOpenings = new Set(positions.map((p) => p.bcu_slug)).size;
  const staffedSlugs = new Set(roster.map((r) => r.bcu_slug));
  const staffedCoverage = bcus.length
    ? Math.round((100 * [...staffedSlugs].filter((s) => bcus.some((b) => b.slug === s)).length) / bcus.length)
    : 0;

  const routingCounts = new Map<Routing, number>();
  for (const p of positions)
    routingCounts.set(p.routing, (routingCounts.get(p.routing) ?? 0) + 1);
  const routing = (["coc_interview", "forward_to_bcu", "external_form", "unknown"] as Routing[])
    .map((key) => ({ key, label: ROUTING_LABEL[key], count: routingCounts.get(key) ?? 0 }))
    .filter((r) => r.count > 0);

  const byBcuMap = new Map<string, { slug: string; name: string; short: string | null; count: number }>();
  for (const p of positions) {
    const e = byBcuMap.get(p.bcu_slug) ?? {
      slug: p.bcu_slug,
      name: p.bcu_name,
      short: p.bcu_short,
      count: 0,
    };
    e.count++;
    byBcuMap.set(p.bcu_slug, e);
  }
  const byBcu = [...byBcuMap.values()].sort((a, b) => b.count - a.count);

  const typeMap = new Map<string, { bcus: Set<string>; positions: number }>();
  for (const b of bcus) {
    const e = typeMap.get(b.type) ?? { bcus: new Set(), positions: 0 };
    e.bcus.add(b.slug);
    typeMap.set(b.type, e);
  }
  for (const p of positions) {
    const e = typeMap.get(p.bcu_type) ?? { bcus: new Set(), positions: 0 };
    e.positions++;
    typeMap.set(p.bcu_type, e);
  }
  const byType = [...typeMap.entries()]
    .map(([type, v]) => ({ type, bcus: v.bcus.size, positions: v.positions }))
    .sort((a, b) => b.positions - a.positions);

  return {
    openPositions: positions.length,
    bcuTotal: bcus.length,
    bcusWithOpenings,
    rosterSeats: roster.length,
    chairs: roster.filter((r) => r.is_chair).length,
    cocInterviews: positions.filter((p) => p.routing === "coc_interview").length,
    staffedCoverage,
    routing,
    byBcu,
    byType,
  };
}
