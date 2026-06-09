-- Phase 3 seed: one real published meeting (May 26, 2026) + sample outreach.
-- Re-runnable: clears the same meeting_date first.
begin;
delete from meeting where meeting_date = '2026-05-26';

insert into meeting(meeting_date, location, term, called_to_order, adjourned_at, called_by, qotw, summary, is_published)
values ('2026-05-26', 'AS Main CoC Room', '2025-26', '5:00PM', '5:30PM',
  'Lily Strange, Internal Chair',
  'What summer fun are you looking forward to?',
  'New logo selection, tabling in the Arbor (June 5), two interviews scheduled, and department outreach updates.',
  true);

insert into meeting_attendance(meeting_id, person_id, display_name, role_title, status)
select m.id, p.id, x.name, x.role, x.status::attendance_status
from (values
  ('Lily Strange','Internal Chair','present'),
  ('Shuyi Sum','External Chair','present'),
  ('Oliver Ramirez Carrera','Vice Chair','excused'),
  ('Layla Hakim','O&R Careers Coordinator','present'),
  ('Mira Ikladious','O&R Media Coordinator','present'),
  ('Savanah Lizet Aldaba','O&R On-Campus Coordinator','present'),
  ('Adam Orenstein','Commissioner of Community & Climate','present'),
  ('Archish Prakhya','Pearman Fellow','present')
) as x(name, role, status)
cross join (select id from meeting where meeting_date='2026-05-26' limit 1) m
left join person p on p.full_name = x.name;

insert into minute_item(meeting_id, section, ordinal, heading, body)
select m.id, 'report', x.ord, x.heading, x.body
from (values
  (1,'Lily Strange — Internal Chair','Checking in on passdown meetings; picked a new CoC logo for the tablecloth; following up on publicity for CoC and the Office of the Controller; tabling next Friday, June 5, 12–2pm in the Arbor (free drinks for students who view open AS positions).'),
  (2,'Shuyi Sum — External Chair','Scheduled two interviews this week: Tommy Theam (O&R Careers Coordinator) and Desiree Avelar (O&R DEI Coordinator).'),
  (3,'Oliver Ramirez Carrera — Vice Chair','Created Internal Liaison resources; emailed Controller applicants and built their application form; met with advisors about CoC''s role next year; added Queer Commission positions to the website.'),
  (4,'Layla Hakim — O&R Careers','Sent department outreach emails for CoC, LHP, the Office of the Controller, and TQCOMM; responses from History and Sociology so far.'),
  (5,'Mira Ikladious — O&R Media','Posting the CoC and Office of the Controller graphics tonight.'),
  (6,'Savanah Lizet Aldaba — O&R On-Campus','Setting up the new O&R email; interviewing Desiree next week; available to table in the Arbor on Friday.')
) as x(ord, heading, body)
cross join (select id from meeting where meeting_date='2026-05-26' limit 1) m;

insert into minute_item(meeting_id, section, ordinal, heading, body)
select id, 'action', 10, 'Adjournment', 'Motion to adjourn at 5:30pm (Mira/Savanah). Action: Consent.'
from meeting where meeting_date='2026-05-26' limit 1;

commit;
