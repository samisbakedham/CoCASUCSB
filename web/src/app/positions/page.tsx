import type { Metadata } from "next";
import { getOpenPositions } from "@/lib/data";
import { PositionsBrowser } from "@/components/PositionsBrowser";

export const metadata: Metadata = {
  title: "Open Positions",
  description: "Every open position across AS boards, commissions, and units.",
};

export default async function PositionsPage() {
  const positions = await getOpenPositions();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Open positions
        </h1>
        <p className="mt-3 text-muted">
          Every seat currently open across Associated Students — boards,
          commissions, units, and committees. Find a fit, see exactly how to
          apply, and submit in minutes.
        </p>
      </header>
      <div className="mt-8">
        <PositionsBrowser positions={positions} />
      </div>
    </div>
  );
}
