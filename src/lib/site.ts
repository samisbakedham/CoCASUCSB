/** Canonical site URL — override with NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://co-casucsb.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "AS UCSB · Committee on Committees";
export const SITE_DESCRIPTION =
  "Every open position, the full AS staffing roster, and the budget — public by default. The appointments & transparency body of Associated Students at UC Santa Barbara.";
