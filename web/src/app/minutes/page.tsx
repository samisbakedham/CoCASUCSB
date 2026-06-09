import type { Metadata } from "next";
import Link from "next/link";
import { getMeetings } from "@/lib/data";

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
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Meeting minutes
        </h1>
        <p className="mt-3 text-muted">
          The public record of how the Committee on Committees does its work —
          attendance, reports, and every motion, open to anyone.
        </p>
      </header>

      {meetings.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted">
          No published minutes yet.
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {meetings.map((m) => (
            <Link
              key={m.id}
              href={`/minutes/${m.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-ocean/40 hover:shadow-sm"
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
                Read →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
