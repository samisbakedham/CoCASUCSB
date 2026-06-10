-- ============================================================================
-- Let a signed-in student read their OWN applications by matching email,
-- so they can track status — even for applications submitted while anon.
-- (Permissive: OR'd with the existing owner/board read policies.)
-- ============================================================================

create policy "applicant reads own by email" on application
  for select to authenticated
  using (
    lower(ucsb_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
