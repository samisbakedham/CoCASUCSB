import { currency } from "@/lib/brand";

export interface Segment {
  label: string;
  value: number;
  color: string;
}

/** Pure-SVG donut chart with center total + legend. No client JS. */
export function Donut({
  segments,
  centerLabel,
  size = 240,
  thickness = 34,
}: {
  segments: Segment[];
  centerLabel?: string;
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        role="img"
        aria-label="Budget breakdown"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s, i) => {
            const len = (Math.max(0, s.value) / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          className="fill-navy"
          style={{ fontSize: 26, fontWeight: 800 }}
        >
          {currency(total)}
        </text>
        {centerLabel && (
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {centerLabel}
          </text>
        )}
      </svg>

      <ul className="w-full space-y-2">
        {segments.map((s, i) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li key={i} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 text-sm text-foreground/85">{s.label}</span>
              <span className="text-sm font-semibold tabular-nums text-navy">
                {currency(s.value)}
              </span>
              <span className="w-10 text-right text-xs font-medium tabular-nums text-muted">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
