create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  birth_date date,
  western_zodiac_label text,
  lunar_year_label text,
  element_label text,
  preferred_theme text not null default 'aether',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  category text not null default 'Công việc',
  priority integer not null default 3 check (priority between 1 and 5),
  due_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  rank integer not null check (rank between 1 and 3),
  completed boolean not null default false,
  planned_on date not null default current_date,
  source_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_priorities_rank_per_day unique (user_id, planned_on, rank)
);

create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'saving')),
  category text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  occurred_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  sleep_hours numeric(4, 1) not null default 0 check (sleep_hours between 0 and 16),
  water_liters numeric(4, 1) not null default 0 check (water_liters between 0 and 8),
  steps integer not null default 0 check (steps >= 0),
  workouts_count integer not null default 0 check (workouts_count between 0 and 10),
  energy_score integer not null default 50 check (energy_score between 1 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_logs_one_per_day unique (user_id, logged_on)
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  occurred_on date not null default current_date,
  weekly_target_minutes integer not null default 600 check (weekly_target_minutes >= 30),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  deep_work_minutes integer not null default 0 check (deep_work_minutes >= 0),
  screen_time_minutes integer not null default 0 check (screen_time_minutes >= 0),
  top_priorities text[] not null default '{}',
  planning_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_logs_one_per_day unique (user_id, logged_on)
);

create table public.relationship_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  action_taken text not null,
  completed boolean not null default false,
  occurred_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emotion_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_on date not null default current_date,
  mood_score integer not null check (mood_score between 1 and 10),
  gratitude_text text,
  journal_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint emotion_logs_one_per_day unique (user_id, logged_on)
);

create table public.spiritual_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  birth_date date not null,
  western_zodiac_label text not null,
  lunar_year_label text not null,
  element_label text not null,
  clarity_score integer not null default 70 check (clarity_score between 1 and 100),
  energy_score integer not null default 70 check (energy_score between 1 and 100),
  ritual_text text,
  feng_shui_focus_text text,
  reflection_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spiritual_profiles_user_id_key unique (user_id)
);

create table public.strategy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  life_theme text,
  strongest_leverage text,
  blind_spot text,
  next_90_days_plan text,
  non_negotiables text[] not null default '{}',
  focus_level_score integer not null default 70 check (focus_level_score between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint strategy_profiles_user_id_key unique (user_id)
);

create table public.energy_activity_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in (
    'emotional_release',
    'body_rhythm',
    'imagination_flow',
    'deep_work_calm',
    'skill_drilling',
    'practical_learning'
  )),
  description text,
  sort_order integer not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.energy_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type_id uuid not null references public.energy_activity_types(id) on delete cascade,
  logged_on date not null default current_date,
  completed boolean not null default false,
  duration_minutes integer check (duration_minutes is null or duration_minutes between 0 and 1440),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint energy_activity_logs_one_per_day unique (user_id, activity_type_id, logged_on)
);

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_due_idx on public.tasks (user_id, due_on);
create index daily_priorities_user_day_idx on public.daily_priorities (user_id, planned_on);
create index finance_entries_user_date_idx on public.finance_entries (user_id, occurred_on desc);
create index finance_entries_user_type_idx on public.finance_entries (user_id, type);
create index health_logs_user_date_idx on public.health_logs (user_id, logged_on desc);
create index study_sessions_user_date_idx on public.study_sessions (user_id, occurred_on desc);
create index time_logs_user_date_idx on public.time_logs (user_id, logged_on desc);
create index relationship_logs_user_date_idx on public.relationship_logs (user_id, occurred_on desc);
create index emotion_logs_user_date_idx on public.emotion_logs (user_id, logged_on desc);
create index energy_activity_types_user_category_idx on public.energy_activity_types (user_id, category);
create index energy_activity_logs_user_day_idx on public.energy_activity_logs (user_id, logged_on desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'tasks',
    'daily_priorities',
    'finance_entries',
    'health_logs',
    'study_sessions',
    'time_logs',
    'relationship_logs',
    'emotion_logs',
    'spiritual_profiles',
    'strategy_profiles',
    'energy_activity_types',
    'energy_activity_logs'
  ]
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "%s_select_own_rows" on public.%I for select to authenticated using (auth.uid() = user_id)', table_name, table_name);
    execute format('create policy "%s_insert_own_rows" on public.%I for insert to authenticated with check (auth.uid() = user_id)', table_name, table_name);
    execute format('create policy "%s_update_own_rows" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name, table_name);
    execute format('create policy "%s_delete_own_rows" on public.%I for delete to authenticated using (auth.uid() = user_id)', table_name, table_name);
  end loop;
end;
$$;
