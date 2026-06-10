import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getBcus, getMeetings, getOpenPositions } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    "",
    "/positions",
    "/get-involved",
    "/directory",
    "/budget",
    "/metrics",
    "/minutes",
    "/about",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const dynamic: MetadataRoute.Sitemap = [];
  try {
    const [positions, bcus, meetings] = await Promise.all([
      getOpenPositions(),
      getBcus(),
      getMeetings(),
    ]);
    for (const p of positions)
      dynamic.push({ url: `${SITE_URL}/positions/${p.id}`, lastModified: now, priority: 0.6 });
    for (const b of bcus)
      dynamic.push({ url: `${SITE_URL}/bcu/${b.slug}`, lastModified: now, priority: 0.5 });
    for (const m of meetings)
      dynamic.push({ url: `${SITE_URL}/minutes/${m.id}`, lastModified: now, priority: 0.4 });
  } catch {
    /* fall back to static routes only */
  }

  return [...staticRoutes, ...dynamic];
}
