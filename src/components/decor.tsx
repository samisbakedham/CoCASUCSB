/* Hand-built Santa Barbara "sunrise over the wave" motifs — used as section
   transitions and accents so the site reads as crafted, not templated. */

/** A layered wave that transitions from one section color into the next. */
export function WaveDivider({
  fill = "var(--background)",
  back,
  className = "",
}: {
  fill?: string;
  back?: string;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="block h-[56px] w-full sm:h-[88px]"
      >
        {back && (
          <path
            d="M0,52 C260,104 460,8 740,44 C1010,78 1230,18 1440,58 L1440,110 L0,110 Z"
            fill={back}
            opacity="0.55"
          />
        )}
        <path
          d="M0,64 C220,104 430,24 720,52 C1010,80 1230,28 1440,66 L1440,110 L0,110 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/** A rising sun with rays — decorative, placed low-opacity behind hero content. */
export function Sunburst({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return {
      x1: 110 + Math.cos(a) * 58,
      y1: 110 + Math.sin(a) * 58,
      x2: 110 + Math.cos(a) * 104,
      y2: 110 + Math.sin(a) * 104,
    };
  });
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden>
      <g stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round">
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
        ))}
      </g>
      <circle cx="110" cy="110" r="46" fill="var(--gold)" />
    </svg>
  );
}

/** A short gold rule used as an editorial accent under kickers/headings. */
export function GoldRule({ className = "" }: { className?: string }) {
  return <span className={`block h-1 w-12 rounded-full bg-gold ${className}`} />;
}
