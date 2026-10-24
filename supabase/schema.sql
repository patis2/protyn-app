-- Protyn v1 backend schema (Supabase / Postgres). Run in the SQL editor of a
-- project created in the Mumbai (ap-south-1) region.
--
-- Version one syncs one JSON snapshot per user. Health answers are stripped on
-- the device before upload, so they never reach this table. Row-level security
-- means each signed-in person can read and write only their own row.
-- The normalised tables from the analysis deck (profile, goal, measurement,
-- meal_plan_item, workout_log, habit_log, check_in, consent) are the next step;
-- the app's data layer (src/data) is the only code that would change.

create table if not exists public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "read own state" on public.app_state
  for select using (auth.uid() = user_id);
create policy "insert own state" on public.app_state
  for insert with check (auth.uid() = user_id);
create policy "update own state" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own state" on public.app_state
  for delete using (auth.uid() = user_id);

-- Keep snapshots to a sane size so a bad client can't fill the database.
alter table public.app_state add constraint app_state_size check (pg_column_size(data) < 2000000);
