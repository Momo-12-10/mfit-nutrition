# MFit Performance – installierbarer Web-App-Prototyp

## Was enthalten ist
- responsives dunkles Design für Mobilgeräte
- lokales Ernährungstagebuch mit Kalorien und Makros
- Wasser-/Getränke-Tracking, einschließlich Cola Zero als Vorlage
- einfache Rezeptfilter und Einkaufsliste
- Ziele und Profil-Einstellungen
- PWA-Manifest und Service Worker für Offline-Grundfunktionen

## Auf iPhone installieren
1. Dateien auf einen HTTPS-Webhost hochladen (z. B. GitHub Pages oder einen eigenen Webserver).
2. Die Website in Safari öffnen.
3. Teilen antippen → „Zum Home-Bildschirm“ → „Hinzufügen“.

## Auf Android installieren
1. Website in Chrome über HTTPS öffnen.
2. Menü → „App installieren“ oder „Zum Startbildschirm hinzufügen“.

## Teilen
Teile die HTTPS-Adresse der veröffentlichten Website. Die ZIP-Datei allein ist keine installierbare iPhone-App.

## Wichtige Grenzen dieses Prototyps
- Einträge werden lokal im Browser gespeichert; noch keine Cloud-Synchronisation oder Benutzerkonten.
- Nährwerte müssen aktuell manuell eingetragen werden. Die Vorlagen sind Beispielwerte, keine vollständige Produktdatenbank.
- Kein echter Barcode-Scanner, keine Live-Preise und keine automatische Produktdatenbank.
- Browser-Mitteilungen sind keine zuverlässigen zeitgesteuerten Erinnerungen, wenn die App geschlossen ist. Dafür ist ein Push-Backend mit Nutzerzustimmung nötig.
- Für App Store / Google Play ist ein zusätzlicher nativer Build und die jeweilige Veröffentlichung erforderlich.

Vor einer Veröffentlichung sollten Datenschutz, Datensicherheit, Nährwertquellen und Alters-/Gesundheitshinweise geprüft werden.

## Neue Funktionen in v2
- Barcode manuell eingeben und Produktwerte über Open Food Facts laden.
- Kamera-Barcode-Scan, wenn Browser und Gerät BarcodeDetector unterstützen.
- optionale Mikronährstofffelder und Tages-Summen für Vitamin C/D, Kalzium, Eisen, Magnesium, Kalium, Zink und B12.
- Getränke können mit Kalorien und Getränkemenge eingetragen werden; Cola Zero-Vorlage enthalten.
- Erinnerungszeit-Einstellung mit Browser-Benachrichtigung, solange die App geöffnet ist.

Hinweis: Open Food Facts-Daten können lückenhaft oder fehlerhaft sein. Immer Produktetikett gegenprüfen. Die Kamera-Funktion und Produktabfrage benötigen HTTPS und Internet.
