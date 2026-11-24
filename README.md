# MFit Performance

Installierbare Fitness- und Ernährungs-Web-App (PWA), gehostet über GitHub Pages.

## Aktueller Stand
- Responsives Interface mit Home, Tracking, Rezepten, Einkaufsliste, Fitness, Profil und Einstellungen.
- Ernährungstagebuch, Makros, Wasser, Schritte (Device-Motion, nur solange die App aktiv ist), Barcode-Suche über Open Food Facts.
- Trainingspläne, Übungsbibliothek, Workout-Logs, Regeneration, Körpermaße und CSV-Export.
- Lokale Datenspeicherung, Backup/Restore und Service Worker mit Offline-Grundfunktionen.
- Installierbar über Safari (Zum Home-Bildschirm) beziehungsweise unterstützte Android-Browser.

## Lokale Daten und externe Dienste
MFit verwendet derzeit keinen eigenen Server, kein Benutzerkonto und keine Cloud-Synchronisierung. Einträge bleiben im Browser-Speicher des jeweiligen Geräts. Nutzer können Daten exportieren und lokal löschen.

Bei der Barcode-Produktsuche wird die EAN an Open Food Facts übermittelt. Für den Kamera-Barcode-Scan wird bei Bedarf die Bibliothek html5-qrcode von unpkg.com geladen. Rezeptbilder werden teilweise von externen Bildservern bezogen. Diese Dienste haben eigene Datenschutz- und Verfügbarkeitsbedingungen.

## Was vor einer öffentlichen Veröffentlichung noch erforderlich ist
- Vollständige und geprüfte Datenschutzerklärung, Impressum und Nutzungsbedingungen mit den tatsächlichen Anbieter- und Kontaktdaten.
- Manuelle Tests auf realen iOS- und Android-Geräten sowie automatisierte Tests zentraler Abläufe.
- Prüfung von Barrierefreiheit, Datenlöschung, Backup/Restore und Offline-Verhalten.
- Falls Nutzerkonten, Synchronisierung oder zuverlässige Push-Mitteilungen gewünscht sind: Backend, Authentifizierung, Datenbank, Zugriffskontrollen, Datenschutzprozesse und Push-Infrastruktur auswählen und sicher konfigurieren.
- Externe Datenquellen, Bildrechte, Lizenzen und rechtliche Anforderungen prüfen.

## Wichtige Grenzen
- Es gibt noch keine eigene MFit-API, kein Backend, keine Nutzerkonten und keine Cloud-Synchronisierung.
- Browser-Erinnerungen sind nicht garantiert, wenn die App geschlossen ist.
- Schrittzählung über Device Motion ist nur eine Näherung und kein Ersatz für Apple Health oder Google Fit.
- Open Food Facts-Daten können unvollständig sein und sollten mit der Produktverpackung abgeglichen werden.
- Die GitHub-Pages-Version ist eine Web-App/PWA, keine native App-Store-/Play-Store-Veröffentlichung.


## Supabase Cloud (Version 106)
- Supabase Authentication for email/password sign-up, sign-in, sign-out and password reset.
- Explicit manual cloud backup and restore through the private `mfit_user_data` row protected by user-scoped RLS policies.
- No automatic/background sync: users must explicitly upload or restore. Restoring replaces local `mfit_*` keys after confirmation.
- Browser frontend uses the Supabase publishable key; never place a secret/service-role key in client code.
- Supabase project must have the `mfit_user_data` table and the documented RLS policies created before cloud backup works.


## MFit Performance v108

- Smart Coach mit Hinweisen aus den letzten sieben Tagen.
- Wochenreport für dokumentierte Trainings- und Ernährungstage.
- Kraftentwicklungsübersicht mit geschätzten 1RM-Werten aus dokumentierten Sätzen.
- Responsive Pro-Karten und aktualisierte PWA-/Service-Worker-Version.
- Supabase-Konto mit manuellem Cloud-Backup und Wiederherstellung bleibt erhalten.

Die Auswertungen beruhen ausschließlich auf lokal dokumentierten Daten; nicht erfasste Tage werden nicht als Nullwerte interpretiert. Geschätzte Kraftwerte sind keine Maximaltests oder medizinischen Empfehlungen.
