export type BcuType =
  | "board" | "commission" | "unit" | "committee" | "office" | "other";

export type PositionStatus = "draft" | "open" | "filled" | "closed";

export type Routing =
  | "coc_interview" | "external_form" | "forward_to_bcu" | "unknown";

export interface Bcu {
  slug: string;
  name: string;
  short: string | null;
  type: BcuType;
  website?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
}

export interface Position {
  id: string;
  title: string;
  status: PositionStatus;
  routing: Routing;
  external_url?: string | null;
  coc_advertises?: boolean | null;
  notes?: string | null;
  description?: string | null;
  legal_code?: string | null;
  openings?: number | null;
  deadline?: string | null;
  bcu_slug: string;
  bcu_name: string;
  bcu_short: string | null;
  bcu_type: BcuType;
}

export interface RosterEntry {
  full_name: string;
  as_email?: string | null;
  role_title: string;
  is_chair: boolean;
  term?: string | null;
  bcu_slug: string;
  bcu_name: string;
  bcu_short: string | null;
  bcu_type: BcuType;
}

export interface Meeting {
  id: string;
  meeting_date: string;
  location?: string | null;
  term?: string | null;
  called_to_order?: string | null;
  adjourned_at?: string | null;
  called_by?: string | null;
  qotw?: string | null;
  summary?: string | null;
  is_published: boolean;
}

export interface Attendance {
  display_name: string | null;
  role_title: string | null;
  status: "present" | "excused" | "unexcused" | "late" | "proxy";
  note?: string | null;
}

export interface MinuteItem {
  section: "public_forum" | "report" | "action" | "discussion" | "remark" | "other";
  ordinal: number;
  heading: string | null;
  body: string | null;
}

export interface BudgetLine {
  entity: string;
  fiscal_year: string;
  category?: string | null;
  description?: string | null;
  amount: number | null;
  recommendation_stage?: string | null;
  sort_order?: number;
}
