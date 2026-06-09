import type { ReactNode } from "react";

const TONES: Record<string, string> = {
  ocean: "bg-ocean/10 text-ocean ring-ocean/20",
  navy: "bg-navy/10 text-navy ring-navy/20",
  gold: "bg-gold/15 text-[#8a6500] ring-gold/30",
  sky: "bg-sky/20 text-[#1f5e85] ring-sky/40",
  kelp: "bg-kelp/10 text-kelp ring-kelp/20",
  coral: "bg-coral/10 text-coral ring-coral/20",
  muted: "bg-muted/10 text-muted ring-muted/20",
};

export function Badge({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES | string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        TONES[tone] ?? TONES.muted
      } ${className}`}
    >
      {children}
    </span>
  );
}
