-- ============================================================================
-- CoC Platform — initial schema
-- Principle: PUBLIC BY DEFAULT. Roles & money are public; applicant data is not.
-- The public/private boundary is enforced here in Row-Level Security so it
-- cannot be violated by application bugs.
-- ============================================================================

-- ---- Enums ----------------------------------------------------------------
create type bcu_type as enum ('board','commission','unit','committee','office','other');
create type position_status as enum ('draft','open','filled','closed');
create type routing_type as enum ('coc_interview','external_form','forward_to_bcu','unknown');
create type application_status as enum (
  'received','under_review','interview','offer','accepted','declined','rejected','withdrawn'
);
create type board_role as enum ('admin','chair','member','bcu_chair');

-- ---- Core: organizations (BCUs) -------------------------------------------
create table bcu (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  short_name    text,
  type          bcu_type not null default 'committee',
  description   text,
  website       text,
  contact_name  text,
  contact_email text,
  is_active     boolean not null default true,
  sort_order    int not null default 100,
  created_at    timestamptz not null default now()
);
comment on table bcu is 'Boards, Commissions, Units, committees & offices of AS. Public.';

-- ---- People & appointments (the public roster / "who runs AS") -------------
create table person (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  ucsb_email  text,
  as_email    text,
  user_id     uuid references auth.users(id) on delete set null,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
comment on table person is 'Named individuals who hold AS roles. Public roster.';

create table appointment (
  id          uuid primary key default gen_random_uuid(),
  person_id   uuid not null references person(id) on delete cascade,
  bcu_id      uuid references bcu(id) on delete set null,
  role_title  text not null,
  is_chair    boolean not null default false,
  term        text,                       -- e.g. '2025-26'
  is_current  boolean not null default true,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);
comment on table appointment is 'Person <-> BCU <-> role. Drives the org chart.';

-- ---- Positions (open roles to recruit for) --------------------------------
create table position (
  id                  uuid primary key default gen_random_uuid(),
  bcu_id              uuid not null references bcu(id) on delete cascade,
  title               text not null,
  slug                text,
  legal_code          text,
  description         text,
  status              position_status not null default 'draft',
  openings            int default 1,
  deadline            date,
  routing             routing_type not null default 'unknown',
  external_url        text,
  coc_advertises      boolean default false,
  interview_questions jsonb not null default '[]',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table position is 'Recruitable positions. Public when status <> draft.';
create index on position (bcu_id);
create index on position (status);

-- ---- Applications (PRIVATE) -----------------------------------------------
create table application (
  id                uuid primary key default gen_random_uuid(),
  position_id       uuid not null references position(id) on delete cascade,
  applicant_user_id uuid references auth.users(id) on delete set null,
  full_name         text not null,
  ucsb_email        text not null,
  phone             text,
  year              text,
  major             text,
  pronouns          text,
  resume_url        text,
  answers           jsonb not null default '{}',
  status            application_status not null default 'received',
  submitted_at      timestamptz not null default now()
);
comment on table application is 'Applicant submissions. PRIVATE (FERPA). Board + owner only.';
create index on application (position_id);
create index on application (applicant_user_id);

-- audit trail: every status change, who & when (accountability)
create table application_event (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references application(id) on delete cascade,
  from_status    application_status,
  to_status      application_status not null,
  actor_user_id  uuid references auth.users(id) on delete set null,
  note           text,
  created_at     timestamptz not null default now()
);
create index on application_event (application_id);

-- ---- Budget (PUBLIC transparency) -----------------------------------------
create table budget_line (
  id                  uuid primary key default gen_random_uuid(),
  entity              text not null,        -- 'CoC' or AS dept / BCU name
  fiscal_year         text not null,        -- '2025-26', '2026-27'
  category            text,                 -- honoraria / events / account code
  description         text,
  amount              numeric(14,2),
  recommendation_stage text,                -- FC / President / Senate / actual
  is_public           boolean not null default true,
  sort_order          int not null default 100,
  created_at          timestamptz not null default now()
);
comment on table budget_line is 'AS & CoC budget detail. Public.';
create index on budget_line (fiscal_year);
create index on budget_line (entity);

-- ---- Access control: who is on the board ----------------------------------
create table board_member (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  person_id  uuid references person(id) on delete set null,
  role       board_role not null default 'member',
  bcu_id     uuid references bcu(id) on delete set null,   -- scopes bcu_chair
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table board_member is 'Maps an auth user to a CoC/BCU staff role for admin access.';

-- helper: is the current user an active CoC board member / admin?
create or replace function is_board_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from board_member
    where user_id = auth.uid() and is_active
      and role in ('admin','chair','member')
  );
$$;

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table bcu               enable row level security;
alter table person            enable row level security;
alter table appointment       enable row level security;
alter table position          enable row level security;
alter table application       enable row level security;
alter table application_event enable row level security;
alter table budget_line       enable row level security;
alter table board_member      enable row level security;

-- Public read: BCUs, public people, public appointments, non-draft positions, public budget
create policy "public read bcu"          on bcu          for select to anon, authenticated using (true);
create policy "public read person"       on person       for select to anon, authenticated using (is_public);
create policy "public read appointment"  on appointment  for select to anon, authenticated using (is_public);
create policy "public read position"     on position     for select to anon, authenticated using (status <> 'draft');
create policy "public read budget"       on budget_line  for select to anon, authenticated using (is_public);

-- Board members can read & write everything in the public-data tables
create policy "board all bcu"         on bcu         for all to authenticated using (is_board_member()) with check (is_board_member());
create policy "board all person"      on person      for all to authenticated using (is_board_member()) with check (is_board_member());
create policy "board all appointment" on appointment for all to authenticated using (is_board_member()) with check (is_board_member());
create policy "board all position"    on position    for all to authenticated using (is_board_member()) with check (is_board_member());
create policy "board all budget"      on budget_line for all to authenticated using (is_board_member()) with check (is_board_member());

-- Applications: anyone may submit; only owner or board may read; only board may update
create policy "anyone may apply"       on application for insert to anon, authenticated with check (true);
create policy "owner reads own app"    on application for select to authenticated
  using (applicant_user_id = auth.uid() or is_board_member());
create policy "board updates app"      on application for update to authenticated
  using (is_board_member()) with check (is_board_member());

-- Application events: board only
create policy "board reads events"  on application_event for select to authenticated using (is_board_member());
create policy "board writes events" on application_event for insert to authenticated with check (is_board_member());

-- board_member: a user can see their own row; admins manage all
create policy "see own membership" on board_member for select to authenticated
  using (user_id = auth.uid() or is_board_member());

-- ============================================================================
-- Public views (security_invoker so RLS above applies to the caller)
-- ============================================================================
create view v_open_positions
  with (security_invoker = on) as
  select p.id, p.title, p.slug, p.description, p.legal_code, p.status,
         p.openings, p.deadline, p.routing, p.external_url, p.coc_advertises,
         p.interview_questions, p.updated_at,
         b.id as bcu_id, b.name as bcu_name, b.short_name as bcu_short, b.slug as bcu_slug, b.type as bcu_type
  from position p
  join bcu b on b.id = p.bcu_id
  where p.status = 'open';

create view v_roster
  with (security_invoker = on) as
  select a.id, a.role_title, a.is_chair, a.term, a.is_current,
         pr.full_name, pr.as_email,
         b.id as bcu_id, b.name as bcu_name, b.short_name as bcu_short, b.slug as bcu_slug, b.type as bcu_type
  from appointment a
  join person pr on pr.id = a.person_id
  left join bcu b on b.id = a.bcu_id
  where a.is_public and a.is_current and pr.is_public;
