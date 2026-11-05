-- Numerix schema. Run this once in the Supabase SQL editor.
-- Then set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
-- Make yourself an admin:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- Or set ADMIN_EMAILS and SUPABASE_SERVICE_ROLE_KEY so the app can promote that account.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  position integer not null default 0
);

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text not null default '',
  passage text,
  position integer not null default 0,
  published boolean not null default true
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  prompt text not null,
  choices jsonb not null,
  correct_index integer not null,
  explanation text not null default '',
  position integer not null default 0,
  constraint questions_choices_array check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) >= 2),
  constraint questions_correct_index check (correct_index >= 0)
);

create table if not exists public.saved_subjects (
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.saved_subjects enable row level security;

drop policy if exists "read profiles" on public.profiles;
create policy "read profiles" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "read subjects" on public.subjects;
create policy "read subjects" on public.subjects
  for select to anon, authenticated
  using (true);

drop policy if exists "admin writes subjects" on public.subjects;
create policy "admin writes subjects" on public.subjects
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "read tests" on public.tests;
create policy "read tests" on public.tests
  for select to anon, authenticated
  using (published or public.is_admin());

drop policy if exists "admin writes tests" on public.tests;
create policy "admin writes tests" on public.tests
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "read questions" on public.questions;
create policy "read questions" on public.questions
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.tests
      where tests.id = questions.test_id and tests.published
    )
  );

drop policy if exists "admin writes questions" on public.questions;
create policy "admin writes questions" on public.questions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "manage own saves" on public.saved_subjects;
create policy "manage own saves" on public.saved_subjects
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.subjects, public.tests, public.questions to anon;
grant select, insert, update, delete on public.subjects, public.tests, public.questions, public.saved_subjects to authenticated;
grant select on public.profiles to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Seed. Safe to re-run: existing slugs are left as they are.

insert into public.subjects (id, slug, name, description, position)
values
  ('11111111-1111-4111-8111-111111111111', 'nuet', 'NUET', 'Nazarbayev University Entrance Test', 0),
  ('22222222-2222-4222-8222-222222222222', 'ielts', 'IELTS', 'International English Language Testing System', 1)
on conflict (slug) do nothing;

insert into public.tests (id, subject_id, slug, title, description, passage, position, published)
values (
  '33333333-3333-4333-8333-333333333331',
  '11111111-1111-4111-8111-111111111111',
  'nuet-math',
  'NUET Math',
  'A short multiple-choice math set.',
  null,
  0,
  true
)
on conflict (slug) do nothing;

insert into public.tests (id, subject_id, slug, title, description, passage, position, published)
values (
  '33333333-3333-4333-8333-333333333332',
  '11111111-1111-4111-8111-111111111111',
  'nuet-crit',
  'NUET Crit',
  'Arguments, assumptions, and what follows.',
  null,
  1,
  true
)
on conflict (slug) do nothing;

insert into public.tests (id, subject_id, slug, title, description, passage, position, published)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'nuet-full',
  'NUET Full',
  'A short mix of math and critical thinking.',
  null,
  2,
  true
)
on conflict (slug) do nothing;

insert into public.tests (id, subject_id, slug, title, description, passage, position, published)
values (
  '44444444-4444-4444-8444-444444444441',
  '22222222-2222-4222-8222-222222222222',
  'ielts-reading',
  'IELTS Reading',
  'One passage and four questions.',
  'City libraries are changing how they measure success. For most of the last century, a library counted the books it owned and the number of people who walked through the door. Those numbers are still collected, but they miss a large part of the work. A student may download a journal at midnight, a parent may join an online reading group, and a new resident may use a language workstation that never appears in a footfall count.

In 2024, the Eastbridge library network replaced its old monthly report with three measures: visits, digital loans, and completed learning sessions. The third measure counts a person only when they finish a class, a workshop, or a guided research appointment. The change was unpopular with one branch, whose visits had fallen after a nearby metro station closed. Its digital loans, however, had doubled, and its learning sessions had grown by a third. Under the new report, that branch was no longer described as being in decline.

Critics say a finished session is a narrow idea of learning. A reader who spends an afternoon in the stacks and leaves with nothing checked out is invisible. Supporters answer that no single measure is complete, and that the point of publishing three numbers is to stop any one of them from standing in for the whole library.',
  0,
  true
)
on conflict (slug) do nothing;

insert into public.tests (id, subject_id, slug, title, description, passage, position, published)
values (
  '44444444-4444-4444-8444-444444444442',
  '22222222-2222-4222-8222-222222222222',
  'ielts-full',
  'IELTS Full',
  'A short mixed English paper.',
  null,
  1,
  true
)
on conflict (slug) do nothing;

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333331', 'If 3x + 7 = 22, what is the value of x?', '["3","4","5","15"]'::jsonb, 2, 'Subtract 7 from both sides to get 3x = 15, then divide by 3.', 0
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333331' and position = 0
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333331', 'A line passes through (1, 2) and (4, 11). What is its slope?', '["2","3","9/5","13/5"]'::jsonb, 1, 'Slope is the change in y divided by the change in x: (11 - 2) / (4 - 1) = 3.', 1
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333331' and position = 1
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333331', 'A square has area 49. What is its perimeter?', '["14","21","28","49"]'::jsonb, 2, 'The side is the square root of 49, which is 7. The perimeter is 4 times 7, so 28.', 2
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333331' and position = 2
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333331', 'Which expression is equal to 2^5 times 2^3?', '["2^8","2^15","4^8","2^2"]'::jsonb, 0, 'When multiplying powers with the same base, add the exponents: 5 + 3 = 8.', 3
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333331' and position = 3
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333331', 'A price increases by 20%, then decreases by 20%. The final price is what percent of the original price?', '["96%","100%","104%","80%"]'::jsonb, 0, '1.20 times 0.80 is 0.96, so the price ends at 96% of the original.', 4
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333331' and position = 4
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333332', 'All first-year students live on campus. Dana lives on campus. Therefore Dana is a first-year student. What is the best judgment of this argument?', '["Valid, because Dana lives on campus","Invalid, because people who are not first-years can also live on campus","Valid, because every campus resident is a first-year","Invalid, because Dana might live off campus"]'::jsonb, 1, 'All first-year students live on campus, but other people can live on campus too. Living there does not prove Dana is a first-year.', 0
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333332' and position = 0
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333332', 'A library will extend evening hours only if more students request it. A survey of 40 students found that 30 wanted later hours. Someone concludes the library should extend evening hours. Which assumption does that conclusion rely on?', '["Those 40 students are enough to represent the student body","Students never use the library in the evening now","The library is closed every morning","Most students prefer to study at home"]'::jsonb, 0, 'The argument treats 40 students as if they stand for the whole university. That is assumed, not stated.', 1
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333332' and position = 1
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333332', 'If it rains, the match is cancelled. The match was not cancelled. What follows?', '["It rained","It did not rain","The match was played at night","Nothing follows"]'::jsonb, 1, 'If rain always cancels the match, then a match that went ahead means it did not rain.', 2
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333332' and position = 2
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333332', 'Every player who skipped practice failed the fitness test. Amir passed the fitness test. What must be true?', '["Amir skipped practice","Amir did not skip practice","Amir is the strongest player","Nobody passed the fitness test"]'::jsonb, 1, 'Anyone who skipped practice failed. Amir passed, so he cannot be in the group that skipped.', 3
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333332' and position = 3
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333333', 'Solve 2(x - 3) = 10. What is x?', '["5","8","4","7"]'::jsonb, 1, 'Divide both sides by 2 to get x - 3 = 5, then add 3.', 0
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333333' and position = 0
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333333', 'A rectangle is 6 by 4. What is the length of its diagonal?', '["10","the square root of 52","24","5"]'::jsonb, 1, 'The diagonal is the square root of 6 squared plus 4 squared, which is 36 + 16 = 52.', 1
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333333' and position = 1
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333333', 'Some athletes are students. All students are readers. Which statement must be true?', '["All athletes are readers","Some athletes are readers","No athletes are readers","All readers are athletes"]'::jsonb, 1, 'At least one athlete is a student, and every student is a reader, so at least one athlete is a reader.', 2
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333333' and position = 2
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '33333333-3333-4333-8333-333333333333', 'A school says its new workshop raised scores because the class average moved from 70 to 78. Which finding weakens that claim?', '["The national average rose by the same amount that month","Students said they enjoyed the workshop","The workshop lasted three hours","The school has a library"]'::jsonb, 0, 'If scores rose everywhere, the workshop is not the only explanation.', 3
where not exists (
  select 1 from public.questions
  where test_id = '33333333-3333-4333-8333-333333333333' and position = 3
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444441', 'According to the passage, why were the older library measures incomplete?', '["They ignored books published before 2010","They missed remote use and learning activity","They counted only digital loans","They were used by a single branch"]'::jsonb, 1, 'The first paragraph says door counts miss downloads, online groups, and learning workstations.', 0
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444441' and position = 0
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444441', 'What happened at the branch near the closed metro station?', '["Visits fell, while digital loans and learning sessions rose","Every measure fell","The branch was closed","It stopped offering workshops"]'::jsonb, 0, 'Visits fell after the station closed, while digital loans doubled and learning sessions grew by a third.', 1
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444441' and position = 1
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444441', 'In the last paragraph, the word narrow is closest in meaning to', '["limited","popular","expensive","temporary"]'::jsonb, 0, 'Here narrow means limited: a finished session does not include every kind of learning.', 2
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444441' and position = 2
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444441', 'Which statement would the supporters agree with?', '["One number can describe a library completely","Publishing several measures is better than relying on one","Footfall should be the only public statistic","Digital loans should be discontinued"]'::jsonb, 1, 'Supporters say three numbers stop any one number from standing in for the whole library.', 3
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444441' and position = 3
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444442', 'Although the lecture began late, most students stayed until the end. The word Although signals', '["a contrast","a cause","a sequence of equal steps","a comparison of size"]'::jsonb, 0, 'Although introduces a contrast between the late start and students staying.', 0
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444442' and position = 0
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444442', 'Which sentence is correct?', '["The results was announced yesterday.","The results were announced yesterday.","The results were announce yesterday.","The results is announced yesterday."]'::jsonb, 1, 'Results is plural, so the verb is were, and the past participle is announced.', 1
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444442' and position = 1
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444442', 'The experiment was called off because the sample was contaminated. Called off means', '["started","cancelled","repeated","published"]'::jsonb, 1, 'Called off means cancelled.', 2
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444442' and position = 2
);

insert into public.questions (test_id, prompt, choices, correct_index, explanation, position)
select '44444444-4444-4444-8444-444444444442', 'Which sentence is the most formal?', '["We wanna get the data soon.","The committee requests the data by Friday.","Give us the data, yeah?","The data is gonna be late."]'::jsonb, 1, 'The committee sentence is formal. The others use conversation or slang.', 3
where not exists (
  select 1 from public.questions
  where test_id = '44444444-4444-4444-8444-444444444442' and position = 3
);

