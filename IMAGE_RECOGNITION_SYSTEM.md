# 🖼️ Intelligentes Bilderkennungs- und Indexierungssystem

## Übersicht

Ein fortschrittliches System zur automatischen Bilderkennung und Problemlösung für Cadillac EV Fahrzeuge. Das System nutzt OpenAI's Vision API (GPT-4o) zur Bildanalyse und einen intelligenten Matching-Algorithmus, um hochgeladene Bilder mit dokumentierten Problemen und Lösungen zu vergleichen.

## 🎯 Hauptfunktionen

### 1. Automatische Bildanalyse
- **OpenAI Vision API (GPT-4o)**: Analysiert hochgeladene Bilder detailliert
- **Feature-Extraktion**: Erkennt Symbole, Farben, Formen und Text
- **Kontexterkennung**: Identifiziert Dashboard-Elemente, Warnzeichen und Indikatoren

### 2. Intelligente Indexierung
- **Firestore Collection `imageIndex`**: Speichert analysierte Bilder mit Metadaten
- **Feature-Mapping**: Strukturierte Speicherung von:
  - Symbole (z.B. Ausrufezeichen, Batterie, Temperatur)
  - Farben (rot, gelb, orange, grün, blau)
  - Formen (Dreieck, Kreis, Quadrat, Pfeil)
  - Verknüpfung zu Dokumenten und Lösungen

### 3. Ähnlichkeitsvergleich
- **Gewichteter Scoring-Algorithmus**:
  - Symbole: Faktor 3 (höchste Priorität)
  - Farben: Faktor 2 (mittlere Priorität)
  - Formen: Faktor 1 (niedrige Priorität)
- **Similarity Threshold**: 30% Mindestähnlichkeit für Match
- **Top 5 Matches**: Gibt die 5 besten Übereinstimmungen zurück

### 4. Lösungsgenerierung
- **Kontextuelle Analyse**: Kombiniert Bildanalyse mit gefundenen Lösungen
- **Strukturierte Ausgabe**:
  - Identifiziertes Problem
  - Schweregrad (niedrig/mittel/hoch/kritisch)
  - Sicherheitswarnung (falls relevant)
  - Sofortige Maßnahmen
  - Schritt-für-Schritt-Lösung
  - Relevante Dokumente mit Ähnlichkeitsgrad

## 🔧 API Endpoints

### 1. `analyzeUploadedImage`
**Funktion**: Analysiert hochgeladenes Bild und findet passende Lösungen

**Request**:
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "vehicleModel": "Cadillac LYRIQ",
  "description": "Optionale Beschreibung"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "fullDescription": "Detaillierte Bildanalyse...",
    "features": {
      "symbols": ["ausrufezeichen", "batterie"],
      "colors": ["rot", "gelb"],
      "shapes": ["dreieck"]
    },
    "timestamp": "2025-01-04T10:30:00.000Z"
  },
  "matchedImages": 2,
  "solutions": [
    {
      "documentName": "LYRIQ_Handbuch.pdf",
      "page": 45,
      "solution": "Batterie prüfen und ggf. laden",
      "similarity": 0.85,
      "imageDescription": "Batteriewarnsymbol mit rotem Dreieck"
    }
  ],
  "response": {
    "problemIdentified": "Niedrige Batteriespannung erkannt",
    "severity": "mittel",
    "safetyWarning": null,
    "immediateAction": "Fahrzeug anhalten und Batterie prüfen",
    "stepByStepSolution": "1. Fahrzeug sicher parken...",
    "relevantDocuments": []
  }
}
```

### 2. `indexDocumentImages` (Zukünftige Erweiterung)
**Funktion**: Extrahiert Bilder aus hochgeladenen PDFs und indexiert sie

**Geplante Features**:
- PDF-Bildextraktion mit pdf-lib
- Automatische Analyse aller Bilder
- Verknüpfung mit Seiten und Lösungen
- Batch-Indexierung vorhandener Dokumente

## 📊 Datenbank-Struktur

### Firestore Collection: `imageIndex`

```javascript
{
  id: "auto-generated-id",
  description: "Batteriewarnsymbol mit rotem Dreieck",
  features: {
    symbols: ["batterie", "warndreieck"],
    colors: ["rot", "gelb"],
    shapes: ["dreieck"],
    keywords: ["batterie", "warnung", "spannung"]
  },
  documentId: "doc-id-in-technicalDatabase",
  collection: "technicalDatabase",
  solutionPage: 45,
  solution: "Batterie prüfen und ggf. laden. Werkstatt aufsuchen.",
  imageUrl: "gs://storage-bucket/images/image-id.jpg", // Optional
  createdAt: Timestamp,
  vehicleModel: "Cadillac LYRIQ" // Optional
}
```

## 🔍 Feature-Erkennung

### Erkannte Symbole
- `ausrufezeichen` - Allgemeine Warnung
- `warndreieck` - Sicherheitswarnung
- `batterie` - Batterieprobleme
- `temperatur` - Temperaturwarnung
- `motor` - Motorprobleme
- `öl` - Ölstand
- `bremse` - Bremsensystem
- `airbag` - Airbag-System
- `reifen` - Reifendruck
- `abs` - ABS-System
- `check engine` - Motorkontrollleuchte
- `service` - Wartung erforderlich

### Erkannte Farben
- `rot` - Kritische Warnung
- `gelb/orange` - Vorsicht erforderlich
- `grün` - Normal/OK
- `blau` - Information
- `weiß` - Neutral

### Erkannte Formen
- `dreieck` - Warnsymbol
- `kreis` - Informationssymbol
- `quadrat` - Kontrollsymbol
- `pfeil` - Richtungsanzeige
- `linie` - Trennlinie/Indikator

## 🚀 Workflow

### User Upload Flow:
1. **User lädt Bild hoch** (z.B. Dashboard-Warnung)
2. **Bildanalyse**: OpenAI Vision API analysiert Bild
   - Erkennt: "Rotes Dreieck mit Ausrufezeichen, Batteriesymbol sichtbar"
3. **Feature-Extraktion**: System extrahiert:
   - Symbole: `["ausrufezeichen", "batterie"]`
   - Farben: `["rot"]`
   - Formen: `["dreieck"]`
4. **Index-Suche**: Vergleicht mit gespeicherten Bildern
   - Findet 2 ähnliche Bilder (85% und 72% Ähnlichkeit)
5. **Lösungsabruf**: Holt Lösungen aus verknüpften Dokumenten
6. **Antwort-Generierung**: Erstellt umfassende Diagnose
7. **User erhält**:
   - "Bild erkannt! 2 ähnliche Bilder gefunden"
   - Detaillierte Problemanalyse
   - Schweregrad und Sicherheitshinweise
   - Schritt-für-Schritt-Lösung
   - Links zu relevanten Dokumenten

### Document Indexing Flow (Future):
1. **Admin lädt PDF hoch** (technisches Handbuch)
2. **PDF-Analyse**: System extrahiert alle Bilder
3. **Bild-für-Bild-Analyse**: Jedes Bild wird mit Vision API analysiert
4. **Metadata-Extraktion**: Seite, Kontext, Problem-Lösung
5. **Index-Speicherung**: Alle Bilder werden in `imageIndex` gespeichert
6. **Bereit für Matching**: System kann jetzt diese Bilder erkennen

## 💡 Beispiel-Szenarien

### Szenario 1: Batteriewarnung
**User**: Lädt Foto von rotem Warndreieck mit Batteriesymbol hoch
**System**: 
- Analysiert: "Rotes Warndreieck mit Batteriesymbol"
- Findet: 3 ähnliche Bilder im Handbuch (85%, 78%, 65% Ähnlichkeit)
- Gibt zurück: "Niedrige Batteriespannung - Sofort Werkstatt aufsuchen"

### Szenario 2: Temperaturwarnung
**User**: Lädt Foto von gelbem Thermometer-Symbol hoch
**System**:
- Analysiert: "Gelbes Thermometersymbol, keine weiteren Warnungen"
- Findet: 2 ähnliche Bilder (70%, 60% Ähnlichkeit)
- Gibt zurück: "Erhöhte Systemtemperatur - Fahrstil anpassen, beobachten"

### Szenario 3: Unbekanntes Symbol
**User**: Lädt Foto eines seltenen Warnsymbols hoch
**System**:
- Analysiert: Detaillierte Beschreibung des Symbols
- Findet: Keine genaue Übereinstimmung
- Gibt zurück: Allgemeine Diagnose basierend auf Vision API + Fahrzeughandbuch-Kontext

## 🎨 UI Integration

### Troubleshooting Page Features:
1. **Bild-Upload-Bereich**
   - Drag & Drop oder Click to Upload
   - Live-Vorschau des Bildes
   - Optionale Textbeschreibung

2. **Analyse-Anzeige**
   - Ladezustand während Analyse
   - "Bild erkannt!"-Badge wenn Match gefunden
   - Anzahl gefundener ähnlicher Bilder

3. **Ergebnis-Darstellung**
   - Schweregrad-Indicator (Farbkodiert)
   - Bildanalyse-Sektion (zeigt was erkannt wurde)
   - Schritt-für-Schritt-Lösung
   - Passende Lösungen mit Ähnlichkeitswert
   - Links zu relevanten Dokumenten

## 🔒 Sicherheit & Datenschutz

- **Keine permanente Bildspeicherung**: Hochgeladene Bilder werden nur temporär verarbeitet
- **Firestore Security Rules**: Nur autorisierte Zugriffe auf `imageIndex`
- **API-Authentifizierung**: OpenAI API-Key sicher in Firebase Functions
- **CORS**: Konfiguriert für sichere Cross-Origin-Requests

## 📈 Erweiterungsmöglichkeiten

### Phase 2: PDF-Bildextraktion
- Integration von `pdf-lib` oder `pdf2pic`
- Automatische Extraktion aller Bilder aus hochgeladenen PDFs
- OCR für Text in Bildern
- Automatische Seitenzuordnung

### Phase 3: Erweiterte Formenerkennung
- Integration von Computer Vision APIs (z.B. Google Cloud Vision)
- Exakte Formvergleiche (nicht nur textbasiert)
- Bildähnlichkeit mit PerceptualHash oder SSIM

### Phase 4: Machine Learning
- Custom ML-Modell für Cadillac-spezifische Symbole
- Training mit historischen Daten
- Höhere Genauigkeit bei Symbolerkennung

### Phase 5: Multi-Modal
- Video-Upload und Frame-Analyse
- Audio-Beschreibung von Geräuschen
- Kombination aus Bild + Sound + Text für Diagnose

## 🧪 Testing

### Manuelle Tests:
1. Upload verschiedener Dashboard-Fotos
2. Testen mit/ohne Textbeschreibung
3. Verschiedene Fahrzeugmodelle
4. Verschiedene Schweregrade

### Automatisierte Tests (Future):
- Unit Tests für Feature-Extraktion
- Integration Tests für API Endpoints
- E2E Tests für kompletten Workflow

## 📚 Abhängigkeiten

### Backend (Firebase Functions):
```json
{
  "openai": "^4.x.x",
  "pdf-parse": "^1.x.x",
  "firebase-functions": "^4.x.x",
  "firebase-admin": "^11.x.x"
}
```

### Future Dependencies:
```json
{
  "pdf-lib": "^1.x.x",     // PDF-Bildextraktion
  "sharp": "^0.x.x",       // Bildverarbeitung
  "tesseract.js": "^4.x.x" // OCR
}
```

## 🎓 Verwendete Technologien

- **OpenAI GPT-4o Vision**: Bildanalyse
- **Firebase Firestore**: Datenbank für Index
- **Firebase Cloud Functions**: Serverless Backend
- **JavaScript/Node.js**: Backend-Logik
- **HTML/CSS/JS**: Frontend

## 📝 Lizenz & Credits

Entwickelt für Cadillac EV Assistant
© 2025 - Alle Rechte vorbehalten

