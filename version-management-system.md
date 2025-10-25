# Cadillac EV Assistant - Version Management System

## Übersicht

Dieses Dokument beschreibt das Versionsverwaltungssystem für die Wissensdatenbank des Cadillac EV Assistenten. Das System stellt sicher, dass immer die aktuellsten und genauesten Informationen verwendet werden.

---

## Versionierungsschema

### Format
```
YYYY.VERSION.REVISION
```

**Beispiel:** `2025.1.0`
- **YYYY:** Jahr der Veröffentlichung
- **VERSION:** Hauptversion (inkrementiert bei größeren Updates)
- **REVISION:** Kleinere Korrekturen und Anpassungen

---

## Dokumentenmetadaten

Jedes Dokument in der Wissensdatenbank sollte folgende Metadaten enthalten:

```markdown
**Quelle:** [Offizielle Quelle oder Herkunft]
**Stand:** [Monat Jahr]
**Markt:** [Schweiz/Europa/Global]
**Priorität:** [HOCH/MITTEL/NIEDRIG]
**Version:** [Versionsnummer]
**Letzte Aktualisierung:** [Datum]
```

---

## Prioritätsstufen

### HOCH
- Offizielle Preisdaten von Cadillac Europe
- Technische Spezifikationen vom Hersteller
- Garantie- und Serviceinformationen
- Rechtliche Dokumente

### MITTEL
- Bedienungsanleitungen
- FAQ-Dokumente
- Marketingmaterialien
- Händlerinformationen

### NIEDRIG
- Allgemeine Informationen
- Historische Daten
- Archivierte Dokumente

---

## Automatische Versionsprüfung

### Prüfkriterien

1. **Datumsbasiert:**
   - Dokumente älter als 12 Monate werden zur Überprüfung markiert
   - Preisdokumente älter als 6 Monate werden zur Überprüfung markiert

2. **Quellenbasiert:**
   - Offizielle Website-Daten haben höchste Priorität
   - Herstellerdokumente überschreiben Drittquellen
   - Neuere Versionen ersetzen ältere automatisch

3. **Inhaltsbasiert:**
   - Duplikate mit unterschiedlichen Versionen werden verglichen
   - Neueste Version wird bevorzugt
   - Ältere Versionen werden archiviert (nicht gelöscht)

---

## Dokumentenlebenszyklus

### 1. Upload
- Dokument wird hochgeladen
- Metadaten werden extrahiert oder manuell hinzugefügt
- Versionsnummer wird zugewiesen
- Priorität wird festgelegt

### 2. Aktiv
- Dokument ist in der Wissensdatenbank verfügbar
- Wird für Chatbot-Antworten verwendet
- Regelmäßige Aktualitätsprüfung

### 3. Veraltet (Deprecated)
- Neuere Version verfügbar
- Wird nicht mehr für neue Antworten verwendet
- Bleibt zur Referenz verfügbar
- Markierung: `[VERALTET]` im Dateinamen

### 4. Archiviert
- Nicht mehr relevant
- Wird nicht gelöscht, sondern archiviert
- Kann bei Bedarf reaktiviert werden
- Speicherort: `/archive/` Ordner

---

## Manuelle Bearbeitung

### Bearbeitbare Dateiformate
- ✅ TXT (Text)
- ✅ MD (Markdown)
- ✅ CSV (Comma-Separated Values)
- ❌ PDF (nur Ansicht)
- ❌ XLSX (nur Ansicht)

### Bearbeitungsprozess

1. **Datei öffnen:**
   - In Wissensdatenbank auf Datei klicken
   - Editor-Modal öffnet sich

2. **Inhalt bearbeiten:**
   - Text direkt im Editor ändern
   - Markdown-Formatierung verwenden
   - Metadaten aktualisieren

3. **Speichern:**
   - Änderungen speichern
   - Automatische Versionsinkrementierung
   - Timestamp wird aktualisiert

4. **Synchronisation:**
   - Änderungen werden in Firestore gespeichert
   - OpenAI Assistant wird automatisch aktualisiert
   - Neue Version steht sofort zur Verfügung

---

## Automatische Duplikatserkennung

### Erkennungskriterien

1. **Dateiname-Ähnlichkeit:**
   - Gleicher Basisname mit unterschiedlichen Versionen
   - Beispiel: `LYRIQ-2024-SPECS.pdf` vs. `LYRIQ-2025-SPECS.pdf`

2. **Inhaltsvergleich:**
   - Ähnlicher Inhalt (>80% Übereinstimmung)
   - Gleiche Schlüsselwörter und Themen

3. **Metadaten-Vergleich:**
   - Gleiche Quelle
   - Ähnliches Thema
   - Unterschiedliche Daten

### Handhabung von Duplikaten

- **Automatisch:** Neueste Version wird bevorzugt
- **Manuell:** Benutzer kann entscheiden, welche Version behalten wird
- **Archivierung:** Alte Versionen werden archiviert, nicht gelöscht

---

## Synchronisation mit OpenAI Assistant

### Upload-Prozess

1. Dokument wird in Firestore gespeichert
2. Inhalt wird extrahiert
3. Datei wird an OpenAI Assistant hochgeladen
4. Vector Store wird aktualisiert
5. Assistant kann neue Informationen nutzen

### Update-Prozess

1. Dokument wird in Firestore aktualisiert
2. Alte Version wird in OpenAI markiert
3. Neue Version wird hochgeladen
4. Vector Store wird neu indexiert
5. Alte Version wird aus Vector Store entfernt

### Lösch-Prozess

1. Dokument wird in Firestore als archiviert markiert
2. Dokument wird aus OpenAI Vector Store entfernt
3. Dokument bleibt in Firestore zur Referenz
4. Kann bei Bedarf wiederhergestellt werden

---

## Best Practices

### Für Administratoren

1. **Regelmäßige Überprüfung:**
   - Monatliche Prüfung auf veraltete Dokumente
   - Vierteljährliche Aktualisierung von Preisdaten
   - Jährliche Überprüfung aller Dokumente

2. **Qualitätssicherung:**
   - Nur offizielle Quellen verwenden
   - Metadaten vollständig ausfüllen
   - Versionsnummern korrekt vergeben

3. **Dokumentation:**
   - Änderungen dokumentieren
   - Quellen angeben
   - Aktualisierungsgrund notieren

### Für Benutzer

1. **Upload:**
   - Aktuelle Dokumente bevorzugen
   - Metadaten korrekt eingeben
   - Duplikate vermeiden

2. **Bearbeitung:**
   - Nur notwendige Änderungen vornehmen
   - Metadaten aktualisieren
   - Versionsnummer erhöhen

3. **Löschung:**
   - Nur veraltete oder fehlerhafte Dokumente löschen
   - Archivierung bevorzugen
   - Begründung angeben

---

## Implementierungsstatus

### ✅ Implementiert
- Firestore-Datenbank für Dokumentenspeicherung
- Upload-Funktion für PDF, TXT, MD, CSV, XLSX
- Anzeige aller Dokumente in Wissensdatenbank
- Metadaten-Extraktion (Dateiname, Typ, Größe, Datum)
- OpenAI Assistant Integration

### 🚧 In Entwicklung
- Datei-Editor für TXT, MD, CSV
- Automatische Versionsprüfung
- Duplikatserkennung
- Archivierungsfunktion

### 📋 Geplant
- Automatische Aktualisierungsbenachrichtigungen
- Batch-Upload-Funktion
- Erweiterte Suchfunktion mit Versionierung
- Änderungshistorie (Changelog)
- Automatische Synchronisation mit Cadillac Europe Website

---

## Technische Details

### Firestore-Struktur

```javascript
{
  "knowledgebase": {
    "documentId": {
      "filename": "cadillac-pricing-2025-official.md",
      "type": "MD",
      "size": 12345,
      "content": "...",
      "uploadedAt": Timestamp,
      "lastUpdated": Timestamp,
      "version": "2025.1.0",
      "priority": "high",
      "source": "cadillaceurope.com",
      "market": "Switzerland",
      "status": "active", // active, deprecated, archived
      "openaiFileId": "file-abc123",
      "metadata": {
        "year": 2025,
        "model": "LYRIQ",
        "category": "pricing"
      }
    }
  }
}
```

### Cloud Functions Endpoints

- `GET /knowledgebase` - Liste aller Dokumente
- `POST /upload` - Neues Dokument hochladen
- `PUT /knowledgebase/:id` - Dokument aktualisieren
- `DELETE /knowledgebase/:id` - Dokument archivieren
- `POST /knowledgebase/check-versions` - Versionsprüfung durchführen
- `POST /knowledgebase/sync-openai` - Synchronisation mit OpenAI

---

## Kontakt und Support

Bei Fragen zum Versionsverwaltungssystem wenden Sie sich bitte an:
- **Technischer Support:** [E-Mail]
- **Dokumentation:** [Link zur vollständigen Dokumentation]
- **Änderungsanfragen:** [Issue Tracker]

---

**Version:** 1.0  
**Erstellt:** 11. Oktober 2025  
**Letzte Aktualisierung:** 11. Oktober 2025

