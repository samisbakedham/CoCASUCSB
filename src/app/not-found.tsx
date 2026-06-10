import Link from "next/link";
import { SunWave } from "@/components/Brand";

export default function NotFound() {
  return (
    <section className="band-ocean text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
        <SunWave className="h-14 w-14" />
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-gold">
          404 — Off the map
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-4 max-w-md text-sky-100/90">
          The link may be old or the page may have moved. Here are a few good
          places to land instead.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/positions"
            className="rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-[#003660] transition hover:brightness-95"
          >
            Open positions
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/25 transition hover:bg-white/15"
          >
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
