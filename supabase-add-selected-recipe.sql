alter table public.workout_logs
add column if not exists selected_crop text,
add column if not exists selected_recipe text,
add column if not exists selected_recipe_nutrition jsonb not null default '{}'::jsonb;
