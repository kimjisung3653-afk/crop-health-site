alter table public.workout_logs
add column if not exists calories_burned integer not null default 0;
