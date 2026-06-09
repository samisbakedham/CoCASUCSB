/** AS UCSB "sunrise over the wave" mark, redrawn as crisp inline SVG. */
export function SunWave({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g stroke="var(--gold)" strokeWidth="2.4" strokeLinecap="round">
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (Math.PI * (i / 10)) - Math.PI;
          const x = 32 + Math.cos(a) * 22;
          const y = 30 + Math.sin(a) * 22;
          const x2 = 32 + Math.cos(a) * 28;
          const y2 = 30 + Math.sin(a) * 28;
          return <line key={i} x1={x} y1={y} x2={x2} y2={y2} />;
        })}
      </g>
      <circle cx="32" cy="30" r="13" fill="var(--sunrise)" />
      <path
        d="M2 40 q10 -8 18 0 t18 0 t18 0 v10 q-10 8 -18 0 t-18 0 t-18 0 Z"
        fill="var(--ocean)"
      />
      <path
        d="M2 46 q10 -7 18 0 t18 0 t18 0 v6 H2 Z"
        fill="var(--navy)"
        opacity="0.92"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <SunWave />
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-navy">
          Committee on Committees
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ocean">
          Associated Students · UCSB
        </div>
      </div>
    </div>
  );
}
