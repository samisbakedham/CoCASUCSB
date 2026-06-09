# CoC Platform — Build Plan

**A single system for everything the Committee on Committees does, built around accountability, efficiency, and radical transparency.**

Owner: Internal Chair, AS UCSB Committee on Committees
Status: Draft v1 (planning) · Last updated: 2026-06-09

---

## 1. Why

The CoC is, in effect, the **HR + appointments + transparency body** of Associated Students. It recruits, advertises, interviews, and appoints students into positions across ~40+ Boards, Commissions & Units (BCUs), committees, and Academic Senate / Administrative Advisory seats. It also runs its own budget, weekly meetings, and quarterly outreach.

Today all of that runs on **scattered, manual, invisible tooling**:

| Function | How it works today | Problem |
|---|---|---|
| Open positions | WordPress site `coc.as.ucsb.edu`, manually toggled open/"private" | Stale, manual, no audit trail |
| Applications | Students **email** the Vice Chair → hand-copied into a "Candidates" Google Sheet | Slow, error-prone, no applicant visibility |
| Routing logic | Cross-check an "Open AS Positions" sheet to decide: closed / external form / forward to BCU / CoC interviews | Lives in one person's head + a doc |
| Interviews | When2Meet → hand-transcribed into an "Interview Sign-Ups" sheet → individual Gmail invites | Hours of manual work per cycle |
| Decisions | Offer/rejection emails from Gmail "Drafts/templates" | No record, easy to drop candidates |
| Minutes & attendance | Google Doc template copied each week to a shared drive | Not public, not searchable |
| Outreach | "BCU Outreach" sheet + bulk mail-merge to dept listservs | No tracking of what worked |
| Reporting | Pull stats by counting Gmail labels for the quarterly report | Painful, non-reproducible |
| Budget | A single `CoC Budget.xlsx`; AS Senate budget is a giant spreadsheet | Invisible to students |
| Roster | "Board Contact Sheet" + "AS Chairs" mailing list | Nobody outside AS can see who staffs what |

**Nothing a student or the public can see** answers the basic questions: *What positions are open? Who runs AS? Where does the money go? Is CoC actually doing its job?*

This project replaces all of it with **one platform** that makes the answers public by default.

---

## 2. Principles (the bar every feature is held to)

1. **Radical transparency by default.** If it can be public, it is public — positions, rosters, budgets, minutes, and CoC's own performance metrics. Privacy is the deliberate exception (see §5), not the default.
2. **One source of truth.** A position, a person, a BCU, an application each exist once. No re-typing between a sheet, a doc, and a website.
3. **Self-service over inboxes.** Students apply, check status, and sign up for interviews themselves. Board members manage a pipeline, not a Gmail label.
4. **Accountable by construction.** Every status change is logged with who/when. The quarterly report is a button, not a weekend.
5. **Survives turnover.** A 4th-year can be onboarded in a day. The system encodes the SOPs so they can't be lost in a passdown.

---

## 3. The platform (target state)

One web app, three audiences:

### A. Public site (no login)
- **Open Positions** — browse/filter all open AS positions by BCU, type, deadline; full descriptions + legal code; "Apply" button.
- **Who Runs AS** — full org chart / staffing directory: every BCU, its chairs, its current members, vacancies. ("What AS is staffed with / who.")
- **Budget Transparency** — CoC's budget and the AS Senate budget rendered as readable, filterable dashboards instead of a spreadsheet nobody opens.
- **Open Data / Metrics** — CoC's own scoreboard: # positions open vs. filled, applications received, interviews held, average time-to-fill, vacancy rate by BCU. Accountability made visible.
- **Minutes archive** — searchable public record of every meeting.

### B. Applicant portal (login = @ucsb.edu)
- Apply to one or many positions with one profile.
- See application status live (Received → Under review → Interview → Offer/Closed).
- Self-serve interview sign-up from open slots (replaces When2Meet + the sign-up sheet).

### C. Board / Admin console (login = CoC + BCU staff, role-gated)
- **Positions & BCUs** — create/open/close positions, attach legal code & interview questions, set routing (CoC interviews vs. external form vs. forward-to-BCU).
- **Applicant pipeline** — Kanban board per position; review, score, advance, with one-click templated status emails (closed / external-redirect / offer / rejection — the exact templates from the SOP, automated).
- **Interview scheduler** — collect availability, publish slots, auto-assign interviewers.
- **Meetings** — agenda + minutes from a template, roll-call attendance tracking, motions/action items; publishes to the public archive on adjournment.
- **Outreach CRM** — BCU contact list, weekly outreach log, bulk-mail to dept listservs, chairs-meeting RSVPs.
- **Reports** — quarterly stats auto-generated; export.
- **BCU self-service** — give each BCU chair a login to post their own openings and pull their own applicants, so CoC isn't a bottleneck.

---

## 4. Architecture & stack (proposed)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.
- **Backend:** Supabase — Postgres (data), Auth (UCSB email), Row-Level Security (the public/private boundary enforced in the database), Storage (resumes, logo, minutes PDFs), Edge Functions (sending emails, generating reports).
- **Email:** transactional provider (Resend/Postmark) for status emails + bulk outreach.
- **Hosting:** Vercel (frontend) + Supabase (managed backend). Free/低-cost tiers cover this scale.
- **Why this stack:** fastest path to a real, deployable full-stack app; RLS lets us enforce "public by default, private by exception" at the data layer; a future Internal Chair can keep it running without a server to babysit.

> Migration note: `coc.as.ucsb.edu` is a university-controlled subdomain. We build a standalone deployable app first (demo-able on its own URL), then pitch AS IT to point the official domain at it. Building does not depend on getting the domain.

---

## 5. Transparency charter — what's public vs. private

| Public by default | Private (access-controlled) |
|---|---|
| BCU directory, chairs, members, vacancies | Applicant PII (phone, non-AS email, resume) |
| Open positions + descriptions + legal code | Application contents & answers |
| CoC & AS budgets (org-level) | Interview notes, scores, deliberations |
| Meeting minutes & attendance | Anything FERPA-protected (student records) |
| CoC performance metrics | Draft positions not yet opened |

Rule of thumb: **roles and money are public; people's application data is not.** Board rosters and chair names are already public (they appear in minutes and on BCU sites), so a public roster is fine. Applicant data is sensitive and stays behind auth. RLS policies encode this so it can't be violated by accident.

---

## 6. Core data model (first cut)

- **bcu** — id, name, short_name, type (board/commission/unit/committee), website, parent, description, budget_ref.
- **person** — id, name, ucsb_email, as_email(s), public profile flag.
- **appointment** — person ↔ bcu ↔ role, term (year), is_chair, is_public. (Drives the roster + org chart.)
- **position** — id, bcu, title, legal_code, description, status (draft/open/filled/closed), openings, deadline, routing (coc_interview | external_form | forward), external_url, interview_questions[].
- **application** — id, position, applicant (person), status, submitted_at, answers, resume_ref. (Private.)
- **status_event** — application, from→to, actor, timestamp. (Audit trail / accountability.)
- **interview_slot** / **interview_signup** — scheduling.
- **meeting** — date, location, called_by, qotw; **attendance** (person ↔ meeting ↔ present/excused/proxy); **minute_item** (reports, motions, action items).
- **outreach_log** — bcu, officer, week, contacted?, result.
- **budget_line** — entity, category, amount, fiscal_year, recommendation_stage (FC/President/Senate). (Public.)

The existing spreadsheets seed this directly: `OPEN AS Positions Recruitment` → positions+routing, `AS Chairs` / `Board Contact Sheet` → person+appointment, `CoC Budget` + `AS Senate Budget` → budget_line, `BCU Outreach` → outreach_log.

---

## 7. Roadmap (phased — ship value early)

### Phase 0 — Foundation (scaffold)
Repo, Next.js app, Supabase project, schema migrations, auth, seed data imported from the spreadsheets. Deployed skeleton live.

### Phase 1 — Transparency + intake MVP *(headline release)*
Public: Open Positions browser, "Who Runs AS" roster/org chart, Budget dashboard. Applicant: online application form (kills the email→spreadsheet pipeline). Admin: create/open/close positions, see applications in a list.
→ *Delivers the transparency promise + removes the worst manual pain in one release.*

### Phase 2 — Pipeline + decisions
Applicant pipeline (Kanban), templated status emails, application status tracking for students, interview scheduler & self sign-up.

### Phase 3 — Internal ops
Meetings (minutes + attendance + public archive), outreach CRM + bulk mail, quarterly report generator, BCU chair self-service logins.

### Phase 4 — Polish & adoption
Public metrics dashboard, accessibility pass, data import of full history, pitch + migration to `coc.as.ucsb.edu`.

---

## 8. Risks & open questions

- **Authority / buy-in:** Does CoC (and AS IT/advisors) green-light replacing the official site, or is this a prototype to pitch first? Affects domain + SSO, not the build.
- **Privacy/FERPA:** Publishing rosters/budgets is fine; applicant data must stay private. Charter in §5 handles this; worth advisor sign-off.
- **Sustainability:** Must be cheap and handoff-able so it outlives this term. Stack chosen with that in mind.
- **Data accuracy:** The roster is already in flux across sheets (e.g., chair assignments differ between the mailing list and the latest minutes) — which is *exactly* the problem a single source of truth fixes.

---

## 9. Build status

**Decisions locked:** Next.js + Supabase · transparency-first (Phase 1) · standalone-first · full green light.

**Done (Phase 0 + Phase 1 frontend):**
- Next.js 15 + Tailwind v4 app in `web/`, AS-branded (sun-and-wave), builds & lints clean.
- Public pages live: **Home** (live stats), **Open Positions** (search/filter), **Position detail + apply form**, **Who Runs AS** (directory/roster), **Budget** (CoC spend + AS FY27 allocations), **About + transparency charter**.
- Full Postgres schema with RLS encoding the public/private boundary (`supabase/migrations/0001_init.sql`) — validated against the real PG parser.
- Real seed parsed from `/reference`: **49 BCUs, 96 open positions, 68 roster seats, 53 budget lines** (`supabase/seed.sql` + bundled JSON snapshot).
- Runs today in "snapshot" mode (no DB needed); flips to live the moment Supabase env is set.

**Next:**
1. **(You)** create the new CoC Supabase project → Claude applies schema + seed, wires env. See `SETUP.md`.
2. Auth (UCSB email) + admin gating (`board_member`).
3. **Phase 2:** admin console — applicant pipeline (Kanban), templated decision emails, interview scheduler.
4. **Phase 3:** meetings/minutes + attendance, outreach CRM, quarterly report generator, BCU self-service.
5. Deploy to Vercel; pitch migration of `coc.as.ucsb.edu`.
