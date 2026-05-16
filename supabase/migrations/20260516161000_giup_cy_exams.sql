create table public.giup_cy_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  subject text not null default 'Hóa học',
  duration_minutes integer not null default 50 check (duration_minutes > 0),
  slug text not null unique,
  source_file_name text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.giup_cy_exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.giup_cy_exams(id) on delete cascade,
  section text not null,
  question_number integer not null,
  question_type text not null check (question_type in ('single_choice', 'true_false', 'short_answer')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  points numeric(6, 2) not null default 1 check (points >= 0),
  explanation text,
  needs_review boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint giup_cy_exam_questions_exam_order_key unique (exam_id, sort_order)
);

create table public.giup_cy_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.giup_cy_exams(id) on delete cascade,
  student_name text not null,
  answers jsonb not null default '{}'::jsonb,
  graded_details jsonb not null default '[]'::jsonb,
  score numeric(8, 2) not null default 0,
  max_score numeric(8, 2) not null default 0,
  correct_count integer not null default 0,
  graded_count integer not null default 0,
  total_count integer not null default 0,
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index giup_cy_exams_user_idx on public.giup_cy_exams (user_id, created_at desc);
create index giup_cy_exams_slug_idx on public.giup_cy_exams (slug);
create index giup_cy_exam_questions_exam_idx on public.giup_cy_exam_questions (exam_id, sort_order);
create index giup_cy_exam_attempts_exam_idx on public.giup_cy_exam_attempts (exam_id, submitted_at desc);

create trigger set_giup_cy_exams_updated_at before update on public.giup_cy_exams
for each row execute function public.set_updated_at();

create trigger set_giup_cy_exam_questions_updated_at before update on public.giup_cy_exam_questions
for each row execute function public.set_updated_at();

alter table public.giup_cy_exams enable row level security;
alter table public.giup_cy_exam_questions enable row level security;
alter table public.giup_cy_exam_attempts enable row level security;

create policy "giup_cy_exams_select_own_rows" on public.giup_cy_exams
for select to authenticated using (auth.uid() = user_id);

create policy "giup_cy_exams_insert_own_rows" on public.giup_cy_exams
for insert to authenticated with check (auth.uid() = user_id);

create policy "giup_cy_exams_update_own_rows" on public.giup_cy_exams
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "giup_cy_exams_delete_own_rows" on public.giup_cy_exams
for delete to authenticated using (auth.uid() = user_id);

create policy "giup_cy_exams_select_active_public" on public.giup_cy_exams
for select to anon using (is_active = true);

create policy "giup_cy_exams_select_active_authenticated" on public.giup_cy_exams
for select to authenticated using (is_active = true);

create policy "giup_cy_exam_questions_select_own_rows" on public.giup_cy_exam_questions
for select to authenticated using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
);

create policy "giup_cy_exam_questions_insert_own_rows" on public.giup_cy_exam_questions
for insert to authenticated with check (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
);

create policy "giup_cy_exam_questions_update_own_rows" on public.giup_cy_exam_questions
for update to authenticated using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
);

create policy "giup_cy_exam_questions_delete_own_rows" on public.giup_cy_exam_questions
for delete to authenticated using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
);

create policy "giup_cy_exam_questions_select_active_public" on public.giup_cy_exam_questions
for select to anon using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.is_active = true
  )
);

create policy "giup_cy_exam_questions_select_active_authenticated" on public.giup_cy_exam_questions
for select to authenticated using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.is_active = true
  )
);

create policy "giup_cy_exam_attempts_select_own_exam_rows" on public.giup_cy_exam_attempts
for select to authenticated using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
);

create policy "giup_cy_exam_attempts_delete_own_exam_rows" on public.giup_cy_exam_attempts
for delete to authenticated using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = auth.uid()
  )
);

create policy "giup_cy_exam_attempts_insert_active_public" on public.giup_cy_exam_attempts
for insert to anon with check (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.is_active = true
  )
);

create policy "giup_cy_exam_attempts_insert_active_authenticated" on public.giup_cy_exam_attempts
for insert to authenticated with check (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.is_active = true
  )
);
