-- ============================================================================
-- Phase 3 — meetings & minutes, attendance, and outreach CRM
-- Minutes & attendance are PUBLIC once a meeting is published (transparency).
-- Outreach is internal working data (board-only).
-- ============================================================================

create type attendance_status as enum ('present','excused','unexcused','late','proxy');
create type minute_section as enum ('public_forum','report','action','discussion','remark','other');

create table meeting (
  id              uuid primary key default gen_random_uuid(),
  meeting_date    date not null,
  location        text,
  term            text,
  called_to_order text,           -- e.g. '5:00PM'
  adjourned_at    text,           -- e.g. '5:30PM'
  called_by       text,
  qotw            text,           -- question of the week
  summary         text,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now()
);
comment on table meeting is 'Weekly CoC meetings. Public once is_published.';
create index on meeting (meeting_date desc);

create table meeting_attendance (
  id           uuid primary key default gen_random_uuid(),
  meeting_id   uuid not null references meeting(id) on delete cascade,
  person_id    uuid references person(id) on delete set null,
  display_name text,
  role_title   text,
  status       attendance_status not null default 'present',
  note         text
);
create index on meeting_attendance (meeting_id);

create table minute_item (
  id         uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meeting(id) on delete cascade,
  section    minute_section not null default 'report',
  ordinal    int not null default 0,
  heading    text,
  body       text,
  person_id  uuid references person(id) on delete set null
);
create index on minute_item (meeting_id);

create table outreach_log (
  id           uuid primary key default gen_random_uuid(),
  bcu_id       uuid references bcu(id) on delete set null,
  officer_name text,
  term         text,
  week         text,
  channel      text,             -- email / tabling / meeting / IG
  contacted    boolean not null default false,
  result       text,
  logged_at    timestamptz not null default now()
);
comment on table outreach_log is 'O&R outreach tracking. Board-only.';
create index on outreach_log (term);

-- ---- RLS ----
alter table meeting            enable row level security;
alter table meeting_attendance enable row level security;
alter table minute_item        enable row level security;
alter table outreach_log       enable row level security;

create policy "public read published meeting" on meeting
  for select to anon, authenticated using (is_published);
create policy "board all meeting" on meeting
  for all to authenticated using (is_board_member()) with check (is_board_member());

create policy "public read attendance" on meeting_attendance
  for select to anon, authenticated
  using (exists (select 1 from meeting m where m.id = meeting_id and m.is_published));
create policy "board all attendance" on meeting_attendance
  for all to authenticated using (is_board_member()) with check (is_board_member());

create policy "public read minute_item" on minute_item
  for select to anon, authenticated
  using (exists (select 1 from meeting m where m.id = meeting_id and m.is_published));
create policy "board all minute_item" on minute_item
  for all to authenticated using (is_board_member()) with check (is_board_member());

create policy "board all outreach" on outreach_log
  for all to authenticated using (is_board_member()) with check (is_board_member());
