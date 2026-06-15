alter table public.workout_logs
add column if not exists exercises jsonb not null default '[]'::jsonb;
