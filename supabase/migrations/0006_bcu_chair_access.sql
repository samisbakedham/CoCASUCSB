-- ============================================================================
-- BCU chair self-service — a board_member with role 'bcu_chair' + a bcu_id can
-- manage ONLY their own board's positions and applicants. Plus admin tooling
-- to grant board roles by email.
-- ============================================================================

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from board_member
    where user_id = auth.uid() and is_active and role = 'admin'
  );
$$;

-- the bcu a signed-in user chairs (null if they're not an active bcu_chair)
create or replace function my_bcu_id()
returns uuid language sql stable security definer set search_path = public as $$
  select bcu_id from board_member
  where user_id = auth.uid() and is_active and role = 'bcu_chair'
  limit 1;
$$;

-- ---- scoped data access for BCU chairs (OR'd with existing board policies) --
create policy "bcu_chair manages own positions" on position
  for all to authenticated
  using (bcu_id = my_bcu_id()) with check (bcu_id = my_bcu_id());

create policy "bcu_chair reads own apps" on application
  for select to authenticated
  using (position_id in (select id from position where bcu_id = my_bcu_id()));
create policy "bcu_chair updates own apps" on application
  for update to authenticated
  using (position_id in (select id from position where bcu_id = my_bcu_id()))
  with check (position_id in (select id from position where bcu_id = my_bcu_id()));

create policy "bcu_chair reads own events" on application_event
  for select to authenticated
  using (application_id in (
    select a.id from application a join position p on p.id = a.position_id
    where p.bcu_id = my_bcu_id()));
create policy "bcu_chair writes own events" on application_event
  for insert to authenticated
  with check (application_id in (
    select a.id from application a join position p on p.id = a.position_id
    where p.bcu_id = my_bcu_id()));

-- ---- admin manages board membership -----------------------------------------
create policy "admin reads board_member" on board_member
  for select to authenticated using (is_admin());
create policy "admin writes board_member" on board_member
  for all to authenticated using (is_admin()) with check (is_admin());

-- grant/replace a board role by email (admin only). The user must have signed
-- in at least once so an auth.users row exists.
create or replace function grant_board_role(p_email text, p_role text, p_bcu uuid)
returns text language plpgsql security definer set search_path = public, auth as $$
declare uid uuid;
begin
  if not is_admin() then raise exception 'Not authorized'; end if;
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then
    return 'No account for ' || p_email || ' yet — they must sign in once first.';
  end if;
  insert into board_member (user_id, role, bcu_id, is_active)
  values (uid, p_role::board_role, p_bcu, true)
  on conflict (user_id) do update
    set role = excluded.role, bcu_id = excluded.bcu_id, is_active = true;
  return 'Granted ' || p_role || ' to ' || p_email;
end; $$;

revoke all on function grant_board_role(text, text, uuid) from anon;
