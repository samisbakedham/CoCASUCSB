import type { Metadata } from "next";
import { getBcus, getRoster } from "@/lib/data";
import { DirectoryBrowser, type DirGroup } from "@/components/DirectoryBrowser";

export const metadata: Metadata = {
  title: "Who Runs AS",
  description:
    "The full public roster of Associated Students — every board, commission, and unit and the students who lead it.",
};

export default async function DirectoryPage() {
  const [bcus, roster] = await Promise.all([getBcus(), getRoster()]);

  const map = new Map<string, DirGroup>();
  for (const b of bcus) {
    map.set(b.slug, {
      slug: b.slug,
      name: b.name,
      short: b.short,
      type: b.type,
      website: b.website,
      members: [],
    });
  }
  for (const r of roster) {
    let g = map.get(r.bcu_slug);
    if (!g) {
      g = {
        slug: r.bcu_slug || r.bcu_name,
        name: r.bcu_name,
        short: r.bcu_short,
        type: r.bcu_type,
        members: [],
      };
      map.set(g.slug, g);
    }
    g.members.push({
      full_name: r.full_name,
      role_title: r.role_title,
      is_chair: r.is_chair,
      as_email: r.as_email,
    });
  }

  const groups = [...map.values()].sort((a, b) => {
    // boards with members first, then alphabetical
    if (!!b.members.length !== !!a.members.length)
      return Number(!!b.members.length) - Number(!!a.members.length);
    return a.name.localeCompare(b.name);
  });

  const peopleCount = roster.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Who runs AS
        </h1>
        <p className="mt-3 text-muted">
          The public roster of Associated Students — {peopleCount} listed
          seats across {bcus.length} boards, commissions, and units. This is the
          single source of truth for who holds what role.
        </p>
      </header>
      <div className="mt-8">
        <DirectoryBrowser groups={groups} />
      </div>
    </div>
  );
}
