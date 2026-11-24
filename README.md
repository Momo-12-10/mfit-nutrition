# MFit Performance

Installierbare Fitness- und Ernährungs-Web-App (PWA), gehostet über GitHub Pages.

## Funktionen
- Dashboard, Ernährungstagebuch, Makros, Wasser- und Schrittetracking.
- Barcode-Produktsuche über Open Food Facts sowie Lebensmittelauswahl mit ungefähren österreichischen Durchschnittswerten.
- Rezepte, Mahlzeiten-Favoriten, Wochenmenü und Einkaufsliste.
- Trainingsplanung, Übungsbibliothek, Workout-Logs, Trainingsanalyse und geschätzte Kraftwerte.
- Regenerations-Check-ins mit Wochenübersicht für Schlaf, Energie und Muskelkater.
- Körpermaße, lokale Datenspeicherung, CSV-Export und Backup/Wiederherstellung.
- Supabase-Konto mit bewusst manueller Cloud-Sicherung und Wiederherstellung.
- PWA-Installation und Offline-Grundfunktionen.

## Daten und externe Dienste
Einträge werden lokal im Browser gespeichert. Nach Anmeldung können MFit-Daten auf ausdrückliche Aktion in das private Supabase-Konto gesichert oder von dort wiederhergestellt werden. Es gibt derzeit keine automatische Hintergrund-Synchronisierung.

Bei der Barcode-Produktsuche wird die EAN an Open Food Facts übermittelt. Für den Kamera-Barcode-Scan kann html5-qrcode von unpkg.com geladen werden. Rezeptbilder können von externen Bildservern bezogen werden.

## Grenzen und Veröffentlichung
- Lebensmitteldaten und Nährwerte sind Schätzwerte; Verpackungsangaben haben Vorrang.
- Smart-Coach-Hinweise sind regelbasiert und keine generative KI oder medizinische Beratung.
- Geschätzte 1RM-Werte sind keine tatsächlichen Maximaltests.
- Browser-Erinnerungen und Schrittzählung über Gerätesensoren sind abhängig von Browser und Gerät.
- Vor einer öffentlichen Veröffentlichung müssen Datenschutzinformationen, Impressum, Nutzungsbedingungen, Rechte an Bildern und externen Daten sowie Tests auf iOS und Android geprüft werden.
- MFit ist derzeit eine Web-App/PWA und wurde nicht im App Store oder Google Play Store veröffentlicht.

## Version 110
- Korrigiert: Das bereits vorhandene Pro-Modul wird jetzt tatsächlich in der App geladen.
- Österreichische Lebensmittelauswahl und Wochenreport/CSV-Export sind dadurch verfügbar.
- Neue Regenerationsübersicht mit durchschnittlichem Schlaf, Energie, Muskelkater und Anzahl dokumentierter Check-ins der letzten sieben Tage.
- Service-Worker-Cache und PWA-Version aktualisiert.


## Version 111 — Performance Pro Suite

- Live-Workout mit mehreren Übungen, Sätzen, Gewichten und integriertem Pausentimer; abgeschlossene Einheiten werden in den bestehenden Trainingsverlauf übernommen.
- Personal-Records-Übersicht auf Basis der dokumentierten Trainingsdaten.
- Nutrition Pro mit Tagesübersicht der erfassten Makros, flexiblen Mahlzeitenideen und einer persistenten Einkaufsliste.
- Body Analytics mit Gewichtsverlauf und Verknüpfung zu den gespeicherten Körpermaßen.
- Recovery Pro mit zusätzlichem Stress- und Tagesform-Check-in.
- Personalisierbares Home-Dashboard sowie CSV-Monatsbericht und JSON-Export der Pro-Daten.
- Alle neuen Pro-Daten werden lokal auf dem Gerät gespeichert. Die bestehenden Ernährungs-, Trainings-, Profil- und Cloud-Backup-Daten werden nicht zurückgesetzt.

Hinweis: Mahlzeitenideen und Coach-Hinweise sind regelbasiert und keine generative KI. Die Pro-Erweiterung benötigt keinen zusätzlichen API-Schlüssel.


## Version 112 — weitere Performance-Extras

- Ernährungs-Assistent mit kontextbezogenen Antworten aus den heute gespeicherten Einträgen und flexiblen Mahlzeiten-/Regenerationsideen. Die Antworten sind regelbasiert, keine generative KI und keine medizinische Beratung.
- Muskelgruppen-Balance mit dokumentierten Arbeitssätzen der letzten sieben Tage.
- Lokaler Verlauf der letzten erfolgreichen Barcode-Scans mit schneller Wiederverwendung des Produktnamens.
- Trainings-Meilensteine für dokumentierte Aktivität; keine Belohnungen für Kaloriendefizite oder Gewichtsverlust.
- Theme Studio mit sechs Akzentfarben.
- Der Barcode-Scan nutzt weiterhin Open Food Facts und die bereits vorhandene Kamerafunktion. Produkt- und Nährwertangaben sollten mit der Verpackung abgeglichen werden.


## Version 113 — Sicherheitsverbesserungen

- Cloud-Authentifizierung und Backup-Logik auf eine zentrale Implementierung reduziert.
- Lokale MFit-Daten werden auf diesem Gerät einem Cloud-Konto zugeordnet; Uploads in ein anderes Konto werden blockiert.
- Vor Cloud- und Datei-Wiederherstellungen wird ein lokales Sicherheitsbackup erstellt.
- Wiederhergestellte Daten werden vor dem Ersetzen validiert und nach dem Schreiben überprüft; bei Fehlern wird ein Rollback versucht.
- Ein lokales Sicherheitsbackup kann über den Bereich Datensicherung zurückgespielt werden.
- Die Supabase-RLS-Konfiguration muss weiterhin im Supabase-Projekt überprüft und aktiviert werden; sie kann nicht aus dem Frontend bestätigt werden.


Supabase-RLS-Prüfung und Einrichtung: [SUPABASE_SECURITY_SETUP.md](./SUPABASE_SECURITY_SETUP.md).
