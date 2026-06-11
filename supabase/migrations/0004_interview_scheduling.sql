-- ============================================================================
-- Interview scheduling — replaces the When2Meet + sign-up-sheet + email flow.
-- Board publishes slots; applicants in the "interview" stage book themselves.
-- Open slots are public-readable; a signup is visible to its owner + the board.
-- ============================================================================

create table interview_slot (
  id           uuid primary key default gen_random_uuid(),
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  location     text,                     -- room or Zoom link
  capacity     int not null default 1,
  interviewers text,                     -- board members running it
  notes        text,
  is_open      boolean not null default true,
  created_at   timestamptz not null default now()
);
create index on interview_slot (starts_at);

create table interview_signup (
  id             uuid primary key default gen_random_uuid(),
  slot_id        uuid not null references interview_slot(id) on delete cascade,
  application_id uuid references application(id) on delete set null,
  applicant_name  text,
  applicant_email text not null,
  position_title  text,
  created_at     timestamptz not null default now()
);
create index on interview_signup (slot_id);
-- one booking per person per slot
create unique index interview_signup_slot_email on interview_signup (slot_id, lower(applicant_email));

alter table interview_slot   enable row level security;
alter table interview_signup enable row level security;

create policy "public read open slots" on interview_slot
  for select to anon, authenticated using (is_open);
create policy "board all slots" on interview_slot
  for all to authenticated using (is_board_member()) with check (is_board_member());

create policy "owner or board read signup" on interview_signup
  for select to authenticated
  using (lower(applicant_email) = lower(coalesce(auth.jwt() ->> 'email', '')) or is_board_member());
create policy "applicant books own" on interview_signup
  for insert to authenticated
  with check (lower(applicant_email) = lower(coalesce(auth.jwt() ->> 'email', '')) or is_board_member());
create policy "owner or board cancels" on interview_signup
  for delete to authenticated
  using (lower(applicant_email) = lower(coalesce(auth.jwt() ->> 'email', '')) or is_board_member());
