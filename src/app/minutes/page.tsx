import type { Metadata } from "next";
import Link from "next/link";
import { getMeetings } from "@/lib/data";
import { chairsMeetingArchive, minuteArchive } from "@/lib/reference-archive";
import { Badge } from "@/components/Badge";

export const metadata: Metadata = {
  title: "Minutes",
  description: "The public record of every Committee on Committees meeting.",
};

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function MinutesPage() {
  const meetings = await getMeetings();
  const groups = Array.from(new Set(minuteArchive.map((m) => m.group)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase text-ocean">Public record</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Meeting minutes
        </h1>
        <p className="mt-3 text-muted">
          The public record of how the Committee on Committees does its work —
          attendance, reports, and every motion, open to anyone.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat value={meetings.length} label="published in database" />
        <Stat value={minuteArchive.length} label="minute source docs indexed" />
        <Stat value={chairsMeetingArchive.length} label="chairs-meeting files indexed" />
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-navy">Published minutes</h2>
            <p className="mt-1 text-sm text-muted">
              These are fully imported records with public pages.
            </p>
          </div>
          <Badge tone={meetings.length ? "kelp" : "muted"}>{meetings.length} live</Badge>
        </div>

        {meetings.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
            No database-published minutes yet. The source archive below is indexed and ready to import.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {meetings.map((m) => (
              <Link
                key={m.id}
                href={`/minutes/${m.id}`}
                className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 transition hover:border-ocean/40 hover:shadow-sm"
              >
                <div>
                  <div className="font-bold text-navy group-hover:text-ocean">
                    {fmt(m.meeting_date)}
                  </div>
                  {m.summary && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted">{m.summary}</p>
                  )}
                  <div className="mt-1 text-xs text-muted">
                    {m.location}
                    {m.term ? ` · ${m.term}` : ""}
                  </div>
                </div>
                <span className="text-sm font-semibold text-ocean opacity-0 transition group-hover:opacity-100">
                  Read
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-navy">Source archive</h2>
            <p className="mt-1 text-sm text-muted">
              Word/Sheets source files now tracked in the repository. They are listed here so the import backlog is visible.
            </p>
          </div>
          <Badge tone="ocean">{minuteArchive.length + chairsMeetingArchive.length} files</Badge>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-extrabold uppercase text-navy">CoC minutes folder</h3>
            </div>
            <div className="divide-y divide-border">
              {groups.map((group) => (
                <details key={group} className="group">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-navy hover:bg-background">
                    {group}
                    <Badge tone="muted">{minuteArchive.filter((m) => m.group === group).length}</Badge>
                  </summary>
                  <div className="border-t border-border bg-background/60 px-4 py-2">
                    {minuteArchive
                      .filter((m) => m.group === group)
                      .map((m) => (
                        <div key={m.path} className="flex items-start justify-between gap-3 py-2 text-sm">
                          <div>
                            <p className="font-semibold text-foreground">{m.title}</p>
                            <p className="mt-0.5 break-all font-mono text-[11px] text-muted">{m.path}</p>
                          </div>
                          <Badge tone="gold">source</Badge>
                        </div>
                      ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-extrabold uppercase text-navy">Chairs meeting folder</h3>
            </div>
            <div className="divide-y divide-border">
              {chairsMeetingArchive.map((file) => (
                <div key={file.path} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-navy">{file.title}</p>
                    <Badge tone="sky">source</Badge>
                  </div>
                  <p className="mt-1 break-all font-mono text-[11px] text-muted">{file.path}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-3xl font-extrabold tabular-nums text-navy">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase text-muted">{label}</div>
    </div>
  );
}
