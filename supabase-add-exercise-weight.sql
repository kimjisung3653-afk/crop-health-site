alter table public.workout_logs
add column if not exists exercise_weight integer not null default 0;
