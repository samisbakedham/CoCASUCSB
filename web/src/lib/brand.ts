import type { BcuType, Routing } from "./types";

export const BCU_TYPE_LABEL: Record<BcuType, string> = {
  board: "Board",
  commission: "Commission",
  unit: "Unit",
  committee: "Committee",
  office: "Office",
  other: "Group",
};

/** How an applicant actually applies — drives the apply button copy. */
export const ROUTING: Record<
  Routing,
  { label: string; blurb: string; tone: "ocean" | "gold" | "sky" | "muted" }
> = {
  coc_interview: {
    label: "CoC interviews",
    blurb: "Apply here — the Committee on Committees reviews and interviews for this role.",
    tone: "ocean",
  },
  external_form: {
    label: "Applies on BCU site",
    blurb: "This board takes applications through its own form.",
    tone: "gold",
  },
  forward_to_bcu: {
    label: "Forwarded to BCU",
    blurb: "Apply here and CoC routes your application to the board.",
    tone: "sky",
  },
  unknown: {
    label: "Contact to apply",
    blurb: "Reach out to the board contact for how to apply.",
    tone: "muted",
  },
};

export function currency(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function currencyExact(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}
