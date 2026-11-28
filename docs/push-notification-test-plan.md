# MFit v190 – Push-Benachrichtigungen: manueller Gerätetest

Diese Checkliste ergänzt die automatisierten Syntax- und Browser-Smoke-Tests. Push muss auf echten Geräten geprüft werden; ein Desktop-Browser-Smoke-Test beweist keine Zustellung auf iOS oder Android.

## Voraussetzungen
- SQL-Migration `supabase/migrations/20261128030000_push_subscription_security.sql` wurde im richtigen Supabase-Projekt ausgeführt.
- Edge Function `push-notifications` wurde mit dem v190-Code deployed.
- Cron verwendet weiterhin ausschließlich das Secret aus Supabase Vault.
- MFit v190 ist über HTTPS veröffentlicht.

## iPhone (Safari, zum Home-Bildschirm hinzugefügt)
- [ ] Push aktivieren; genau ein Eintrag in `push_subscriptions`.
- [ ] Eine Test-Erinnerung bei geschlossener Home-Screen-App empfangen.
- [ ] Zwei Cron-Aufrufe während derselben Erinnerungsminute auslösen; nur eine Mitteilung erhalten.
- [ ] Push in MFit ausschalten; Eintrag wird entfernt und danach kommt keine Mitteilung mehr.
- [ ] Push erneut aktivieren, abmelden; das Geräte-Abo wird entfernt.
- [ ] Push erneut aktivieren, „lokale Daten löschen“; Abo wird vor dem Löschen entfernt.
- [ ] Push erneut aktivieren, Konto löschen; Abo auf diesem Gerät wird vor dem Kontolöschaufruf entfernt.
- [ ] Zeitzone Europe/Vienna prüfen; Test im Winter (UTC+1) und Sommer (UTC+2) mit passenden lokalen Uhrzeiten.

## Android (installierte Web-App in Chrome)
- [ ] Push aktivieren; genau ein Eintrag in `push_subscriptions`.
- [ ] App vollständig schließen und eine Test-Erinnerung empfangen.
- [ ] Dieselben Abmelde-, Datenlösch-, Konto-Lösch- und Doppelversandtests wie auf iOS ausführen.
- [ ] Zeitzone und Sommerzeit mit der Geräteeinstellung abgleichen.

## Autorisierung / Fremdgeräte
- [ ] `dispatch` ohne korrektes `x-mfit-cron-secret` muss HTTP 401 liefern.
- [ ] Eine andere Geräteberechtigung darf die Einstellungen eines bestehenden Abos nicht ändern (HTTP 403).
- [ ] Eine andere Geräteberechtigung darf ein bestehendes Abo nicht löschen (HTTP 403).
- [ ] Das Gerät mit passender Berechtigung kann sein Abo aktualisieren und löschen.
- [ ] In Supabase wird nur der SHA-256-Hash der Geräteberechtigung gespeichert, nie der Klartext-Token.

## Hinweise
- Die Geräteberechtigung ist pro Browserprofil/Installation. Ein anderes Gerät muss separat abgemeldet werden.
- Nach Deinstallation kann die App die Abmeldung nicht mehr aktiv ausführen; ungültige Abos werden entfernt, wenn der Push-Anbieter 404/410 meldet.
- Echte iOS- und Android-Geräte sind für die Abnahme erforderlich.
