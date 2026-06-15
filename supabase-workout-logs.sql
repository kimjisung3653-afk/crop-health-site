create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null default current_date,
  age integer,
  height integer,
  weight integer,
  sex text not null,
  goal text not null,
  body_part text not null,
  workout_type text not null,
  duration integer not null,
  intensity text not null,
  fatigue text not null,
  workout_load integer not null,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

create policy "Users can read own workout logs"
on public.workout_logs
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own workout logs"
on public.workout_logs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own workout logs"
on public.workout_logs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own workout logs"
on public.workout_logs
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists workout_logs_user_created_idx
on public.workout_logs (user_id, created_at desc);
