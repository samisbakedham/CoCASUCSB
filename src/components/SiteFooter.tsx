import Link from "next/link";
import { dataSource } from "@/lib/data";
import { SunWave } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <SunWave className="h-7 w-7" />
            <span className="font-extrabold text-navy">CoC</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">
            The appointments &amp; transparency body of Associated Students, UC
            Santa Barbara. Public by default.
          </p>
          <div className="mt-4 h-1 w-16 rounded-full bg-gold" />
        </div>
        <FooterCol
          title="Explore"
          links={[
            ["Open Positions", "/positions"],
            ["Who Runs AS", "/directory"],
            ["Budget", "/budget"],
            ["Metrics", "/metrics"],
            ["Minutes", "/minutes"],
          ]}
        />
        <FooterCol
          title="About"
          links={[
            ["Get involved", "/get-involved"],
            ["Track application", "/status"],
            ["Transparency charter", "/about#transparency"],
            ["Board sign-in", "/login"],
          ]}
        />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
            Status
          </h4>
          <p className="mt-3 text-sm text-muted">
            Data source:{" "}
            <span
              className={
                dataSource === "live"
                  ? "font-semibold text-kelp"
                  : "font-semibold text-sunrise"
              }
            >
              {dataSource === "live" ? "live database" : "spreadsheet snapshot"}
            </span>
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-1 px-4 py-4 text-xs text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} AS UCSB Committee on Committees</span>
          <span>
            Built for accountability, efficiency &amp; radical transparency.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-muted hover:text-ocean">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
