-- MFit v190: secure per-device push subscription ownership.
-- Additive and safe for existing subscriptions; legacy rows are claimed by
-- their currently installed device the next time it synchronizes its settings.
alter table public.push_subscriptions
  add column if not exists device_token_hash text;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.push_subscriptions to service_role;
