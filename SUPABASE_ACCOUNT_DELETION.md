# MFit-Konto sicher löschen (Supabase Edge Function)

Die Browser-App darf niemals den Supabase Service Role Key enthalten. Das Löschen eines Auth-Benutzers benötigt serverseitige Admin-Rechte. Deshalb liegt die Funktion unter `supabase/functions/delete-mfit-account/index.ts`.

## Einmalige Einrichtung in Supabase

1. Öffne dein Supabase-Projekt und gehe zu **Edge Functions**.
2. Erstelle eine Function mit dem Namen `delete-mfit-account`.
3. Übernimm den Inhalt aus `supabase/functions/delete-mfit-account/index.ts`.
4. Veröffentliche/deploye die Function.
5. Die Function benötigt die Supabase-Standard-Secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY`. Supabase stellt diese in der Edge-Function-Umgebung normalerweise bereit. Falls ein Secret fehlt, setze es ausschließlich in den Edge Function Secrets – niemals in GitHub oder im Browsercode.

## Ablauf

- Die App verlangt eine aktive Anmeldung, eine Bestätigungsabfrage und die exakte Eingabe `LÖSCHEN`.
- Die Function validiert das Bearer-Token serverseitig.
- Erst danach löscht sie den Auth-Benutzer und anschließend dessen Zeile in `mfit_user_data`.
- Die lokale MFit-Datensammlung auf dem Gerät bleibt bestehen; nur die Cloud-Kontozuordnung wird entfernt.
- Die Aktion ist dauerhaft und nicht rückgängig zu machen.

## Wichtig

Der Code in GitHub allein aktiviert die Function nicht in Supabase. Der Button funktioniert erst nach dem einmaligen Deploy der Edge Function. Wenn das Löschen des Auth-Benutzers erfolgreich ist, aber die Cloud-Zeile wegen einer Datenbankregel/Verbindung nicht entfernt werden kann, meldet die Function einen Warnhinweis. Prüfe dann die Zeile in Supabase. Gib niemals den Service Role Key weiter.
