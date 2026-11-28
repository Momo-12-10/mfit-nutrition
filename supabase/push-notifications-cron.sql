-- MFit v182: schedule the push dispatcher once per minute.
-- Before running: enable pg_cron, pg_net and Supabase Vault in Database > Extensions.
-- Store the SAME random secret as Supabase Edge Function secret PUSH_CRON_SECRET:
-- select vault.create_secret('PASTE_YOUR_RANDOM_SECRET_HERE', 'mfit_push_cron_secret');
-- Do not commit the real secret to GitHub or share it in chat.

select cron.schedule(
  'mfit-push-reminders-every-minute',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://pxakmojxstpkmfuldxlx.supabase.co/functions/v1/push-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-mfit-cron-secret', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'mfit_push_cron_secret'
          limit 1
        )
      ),
      body := '{"action":"dispatch"}'::jsonb,
      timeout_milliseconds := 10000
    ) as request_id;
  $$
);
