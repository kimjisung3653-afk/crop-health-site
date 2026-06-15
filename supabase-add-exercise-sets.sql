alter table public.workout_logs
add column if not exists exercise_sets integer not null default 1;
