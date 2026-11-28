-- MFit Performance v182: add per-device push reminder preferences.
-- Safe to run more than once. Existing subscriptions are preserved.
alter table public.push_subscriptions
  add column if not exists settings jsonb not null default '{"waterEnabled":true,"waterTime":"12:30","waterMin":750,"mealEnabled":true,"mealTime":"14:00","mealName":"Mittagessen"}'::jsonb,
  add column if not exists timezone text not null default 'Europe/Vienna',
  add column if not exists last_water_date date,
  add column if not exists last_meal_date date;

create index if not exists push_subscriptions_updated_at_idx
  on public.push_subscriptions (updated_at);

-- The Edge Function uses the server-side service role to manage subscriptions.
-- Grant explicit table access; RLS remains enabled and service_role bypasses it.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.push_subscriptions to service_role;
