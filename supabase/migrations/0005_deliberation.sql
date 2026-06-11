-- ============================================================================
-- Interview deliberation — each board member scores a candidate once;
-- the board sees everyone's scores + the average to make a decision.
-- ============================================================================

create table application_review (
  id               uuid primary key default gen_random_uuid(),
  application_id   uuid not null references application(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name    text,
  score            int check (score between 1 and 5),
  recommendation   text,           -- 'advance' | 'hold' | 'reject'
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (application_id, reviewer_user_id)
);
create index on application_review (application_id);

alter table application_review enable row level security;

create policy "board reads reviews" on application_review
  for select to authenticated using (is_board_member());
create policy "reviewer inserts own" on application_review
  for insert to authenticated
  with check (is_board_member() and reviewer_user_id = auth.uid());
create policy "reviewer updates own" on application_review
  for update to authenticated
  using (is_board_member() and reviewer_user_id = auth.uid())
  with check (reviewer_user_id = auth.uid());
