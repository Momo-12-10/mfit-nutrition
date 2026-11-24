# Supabase-Sicherheit für MFit Performance

Diese Anleitung prüft die Tabelle \`public.mfit_user_data\`, die MFit für private Cloud-Backups verwendet. Die App-Codeänderungen aktivieren **nicht** automatisch Row Level Security (RLS). RLS muss in Supabase selbst geprüft und eingerichtet werden.

## 1. Vorhandene Tabellenstruktur prüfen

Öffne Supabase → SQL Editor und führe zuerst nur diese lesenden Abfragen aus:

\`\`\`sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'mfit_user_data'
order by ordinal_position;

select c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'mfit_user_data';

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'mfit_user_data'
order by policyname;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'mfit_user_data'
order by grantee, privilege_type;

select tc.constraint_name, tc.constraint_type, kcu.column_name
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
where tc.table_schema = 'public'
  and tc.table_name = 'mfit_user_data';
\`\`\`

Prüfe, dass die Tabelle die von der App verwendeten Spalten \`user_id\`, \`data\` und \`updated_at\` besitzt. Für den aktuellen Upsert-Aufruf muss \`user_id\` eindeutig sein (PRIMARY KEY oder UNIQUE). Der übliche Supabase-Aufbau verwendet \`user_id uuid\`, \`data jsonb\` und \`updated_at timestamptz\`.

## 2. Bestehende Policies prüfen, bevor du etwas änderst

Jede permissive Policy kann Zugriffe erlauben. PostgreSQL kombiniert permissive Policies mit ODER. Eine zusätzliche sichere Policy macht eine bereits vorhandene zu offene Policy daher nicht automatisch unschädlich.

Wenn die Abfrage oben Policies zeigt, prüfe jede einzelne. Entferne oder korrigiere jede Policy, die nicht strikt auf die eigene Benutzer-ID beschränkt ist. Führe keine Änderungen aus, bevor du die vorhandenen Policies verstanden hast.

## 3. Zielregeln für eine Tabelle mit \`user_id uuid\`

Nur wenn du in Schritt 1 bestätigt hast, dass \`user_id\` vom Typ \`uuid\` ist und die Tabelle die erwarteten Spalten enthält, ist dies die vorgesehene Policy-Struktur:

\`\`\`sql
alter table public.mfit_user_data enable row level security;

revoke all on table public.mfit_user_data from anon;
grant select, insert, update on table public.mfit_user_data to authenticated;

drop policy if exists "mfit_user_data_select_own" on public.mfit_user_data;
drop policy if exists "mfit_user_data_insert_own" on public.mfit_user_data;
drop policy if exists "mfit_user_data_update_own" on public.mfit_user_data;

create policy "mfit_user_data_select_own"
on public.mfit_user_data
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "mfit_user_data_insert_own"
on public.mfit_user_data
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "mfit_user_data_update_own"
on public.mfit_user_data
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
\`\`\`

Diese Regeln erlauben angemeldeten Benutzern nur SELECT, INSERT und UPDATE für die eigene Benutzer-ID. Es wird keine DELETE-Policy angelegt. Wenn die Tabelle eine andere Spaltenstruktur oder einen anderen Typ hat, diesen SQL-Block nicht unverändert ausführen.

## 4. Nach dem Einrichten erneut kontrollieren

Führe die Abfragen aus Schritt 1 erneut aus. Anschließend sollten alle drei Policies sichtbar sein, RLS aktiviert sein und keine zusätzliche permissive Policy einen breiteren Zugriff erlauben.

## 5. Funktionstest mit zwei Konten

1. Mit Konto A anmelden und ein Cloud-Backup speichern.
2. Mit Konto B anmelden und versuchen, die Daten von Konto A abzurufen.
3. Konto B darf nur sein eigenes Backup sehen.
4. Versuche mit Konto B, eine Zeile mit der Benutzer-ID von Konto A einzufügen oder zu aktualisieren. Das muss abgewiesen werden.
5. Mit Konto A erneut anmelden und das eigene Backup abrufen.

Führe diese Tests nicht mit echten sensiblen Daten durch. Die App-Änderung allein ersetzt diesen Datenbanktest nicht.

## Wichtige Hinweise

- Der Supabase Publishable Key darf in einer Browser-App verwendet werden; er ist kein Service-Role-Key.
- Einen Service-Role-Key niemals in die App, in GitHub oder in eine öffentlich erreichbare Datei kopieren.
- RLS schützt die Datenbank. Die lokale Kontozuordnung in MFit ist nur ein zusätzlicher Schutz auf diesem Gerät und kein Ersatz für RLS.
