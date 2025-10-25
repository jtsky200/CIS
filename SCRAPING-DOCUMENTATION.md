# Cadillac Website Scraping System - Dokumentation

## Übersicht

Das automatische Scraping-System extrahiert täglich die neuesten technischen Daten und Spezifikationen von der offiziellen Cadillac Europe Website und aktualisiert die Wissensdatenbank automatisch.

## Komponenten

### 1. Scraping-Script
**Datei:** `/home/ubuntu/cadillac-ev-app/scrape-cadillac-data.js`

Das Hauptscript, das:
- Die Cadillac-Website scannt
- Technische Daten extrahiert
- Markdown-Dokumente erstellt
- Daten in Firestore hochlädt

### 2. Geplante Aufgabe
**Name:** `cadillac-daily-scraper`
**Zeitplan:** Täglich um 02:00 Uhr (Schweizer Zeit)
**Typ:** Cron-Job

### 3. Output-Verzeichnis
**Pfad:** `/home/ubuntu/cadillac-scraped-data/`

Hier werden alle gescrapten Daten und erstellten Dokumente gespeichert.

## Gescrapte Modelle

Das System scraped folgende Cadillac-Modelle:

1. **LYRIQ** - https://www.cadillaceurope.com/ch-de/lyriq
2. **VISTIQ** - https://www.cadillaceurope.com/ch-de/vistiq
3. **LYRIQ-V** - https://www.cadillaceurope.com/ch-de/lyriq-v
4. **OPTIQ** - https://www.cadillaceurope.com/ch-de/optiq

## Extrahierte Daten

Für jedes Modell werden folgende Informationen extrahiert:

- **Preis** (CHF)
- **Leergewicht** (kg)
- **Reichweite** (km, WLTP)
- **Stromverbrauch** (kWh/100 km)
- **Batterie-Informationen**
- **Ladezeiten**
- **Leistung**

## Manuelle Ausführung

Um das Scraping-Script manuell auszuführen:

```bash
cd /home/ubuntu/cadillac-ev-app
node scrape-cadillac-data.js
```

## Ausgabe-Format

Das Script erstellt für jedes Modell ein Markdown-Dokument mit folgendem Format:

```markdown
# Cadillac [MODELL] - Technische Daten und Spezifikationen

**Letzte Aktualisierung:** [Datum]

## Preisinformationen
- **Preis ab:** CHF [Preis]

## Technische Spezifikationen
- **Leergewicht:** [Gewicht] kg
- **Reichweite (WLTP):** [Reichweite] km
- **Stromverbrauch:** [Verbrauch] kWh/100 km
...

## Zusätzliche Informationen
Für detaillierte und aktuelle Informationen besuchen Sie bitte:
[URL]

---
*Diese Informationen wurden automatisch von der offiziellen Cadillac-Website extrahiert.*
*Quelle: [URL]*
*Scraping-Datum: [ISO-Datum]*
```

## Ablauf

### Phase 1: Scraping
1. Script navigiert zu jeder Modell-URL
2. Verwendet Firecrawl MCP Server für das Scraping
3. Extrahiert Markdown-Content von den Seiten
4. Wartet 2 Sekunden zwischen Anfragen (höflich zum Server)

### Phase 2: Datenextraktion
1. Parst den Markdown-Content
2. Extrahiert technische Spezifikationen mit Regex
3. Erstellt strukturierte Daten-Objekte
4. Generiert Markdown-Dokumente

### Phase 3: Upload
1. Lädt jedes Dokument zu Firestore hoch
2. Verwendet den `/upload` Cloud Functions Endpoint
3. Wartet 1 Sekunde zwischen Uploads
4. Zeigt Erfolgs-/Fehler-Meldungen an

## Fehlerbehandlung

Das Script behandelt folgende Fehler:

- **Scraping-Fehler**: Wenn eine Seite nicht erreichbar ist, wird sie übersprungen
- **Parsing-Fehler**: Fallback-Parsing-Mechanismus für JSON-Daten
- **Upload-Fehler**: Fehler werden geloggt, aber andere Uploads werden fortgesetzt

## Monitoring

### Erfolgreiche Ausführung
```
✅ SCRAPING COMPLETE
📊 Summary:
   - Models scraped: 4/4
   - Documents created: 4
   - Documents uploaded: 4
```

### Fehlerhafte Ausführung
```
❌ Fatal error: [Fehlermeldung]
```

## Wartung

### Logs überprüfen
Die geplante Aufgabe speichert Logs automatisch. Um die neuesten Logs zu sehen:

```bash
# Überprüfen Sie die Output-Dateien
ls -lh /home/ubuntu/cadillac-scraped-data/
```

### Geplante Aufgabe verwalten

**Status überprüfen:**
```bash
# Über Manus-Interface
# Die Aufgabe "cadillac-daily-scraper" erscheint in der Liste der geplanten Aufgaben
```

**Zeitplan ändern:**
- Aktualisieren Sie die Cron-Expression in der Aufgaben-Konfiguration
- Aktueller Zeitplan: `0 0 2 * * *` (täglich um 02:00 Uhr)

### Script aktualisieren

Wenn Sie das Scraping-Script ändern möchten:

1. Bearbeiten Sie `/home/ubuntu/cadillac-ev-app/scrape-cadillac-data.js`
2. Testen Sie die Änderungen manuell
3. Die geplante Aufgabe verwendet automatisch die neueste Version

## Technische Details

### Abhängigkeiten
- **Node.js** (v22.13.0)
- **manus-mcp-cli** - Für Firecrawl-Integration
- **Firecrawl MCP Server** - Für Web-Scraping
- **Firebase Cloud Functions** - Für Firestore-Upload

### Verwendete Tools
- **firecrawl_scrape** - Scraped einzelne Seiten
- **curl** - Lädt Dokumente zu Firestore hoch

### Regex-Patterns für Datenextraktion

```javascript
// Preis: "Ab CHF 90'100"
/Ab CHF ([\d']+)/i

// Gewicht: "2.774 kg"
/(\d+[.,]\d+)\s*kg/i

// Reichweite: "530 km"
/Reichweite[^\d]*(\d+)\s*km/i

// Verbrauch: "22.5 kWh / 100 km"
/(\d+[.,]?\d*)\s*kWh\s*\/\s*100\s*km/i
```

## Zukünftige Verbesserungen

### Geplante Features
1. **Erweiterte Datenextraktion**
   - Mehr technische Spezifikationen
   - Bilder und Medien
   - Ausstattungsvarianten

2. **Benachrichtigungen**
   - E-Mail bei Scraping-Fehlern
   - Benachrichtigung bei Preisänderungen
   - Wöchentliche Zusammenfassungen

3. **Versionierung**
   - Historische Daten speichern
   - Änderungen nachverfolgen
   - Diff-Ansicht für Updates

4. **Erweiterte Fehlerbehandlung**
   - Retry-Mechanismus bei Fehlern
   - Fallback-Datenquellen
   - Automatische Fehlerberichte

## Kontakt & Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Logs im Output-Verzeichnis
2. Führen Sie das Script manuell aus, um Fehler zu identifizieren
3. Überprüfen Sie die Firecrawl MCP Server-Verfügbarkeit
4. Stellen Sie sicher, dass die Cadillac-Website erreichbar ist

## Changelog

### Version 1.0 (12.10.2025)
- ✅ Initiale Implementierung
- ✅ Scraping für alle 4 Modelle
- ✅ Automatischer Upload zu Firestore
- ✅ Tägliche geplante Ausführung
- ✅ Fehlerbehandlung und Logging
- ✅ Dokumentation

---

**Letzte Aktualisierung:** 12. Oktober 2025
**Version:** 1.0
**Status:** ✅ Aktiv und funktionsfähig

