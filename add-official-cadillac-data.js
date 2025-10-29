const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addOfficialCadillacData() {
    try {
        console.log('📚 Loading official Cadillac Europe data...');
        
        const data = JSON.parse(fs.readFileSync('cadillac-europe-official-data.json', 'utf8'));
        
        // Add comprehensive pricing document
        const pricingDoc = {
            title: 'Cadillac Schweiz Preise 2025 - Offizielle Preisliste',
            content: `# Cadillac Schweiz - Offizielle Preise 2025

## Aktuelle Modelle und Preise

### CADILLAC LYRIQ
**Preis: Ab CHF 90'100** (ca. €95,000)
- **Leasing**: Ab CHF 579 pro Monat mit 0% Leasing
- **Sonderaktion**: Ab CHF 800 pro Monat
- **Verbrauch**: 22.5 kWh/100km (WLTP)
- **Reichweite**: bis zu 483 Kilometer (WLTP)
- **CO₂-Emissionen**: 0 g/km, Klasse A
- **Batterie**: 100 kWh Lithium-Ionen-Batterie

**Ladezeiten:**
- Level 2 (240V Heimladung): ca. 10 Stunden
- Öffentliche DC-Schnellladung: 30 Minuten auf 80%
- DC-Schnellladestationen: 10 Minuten auf 80%

### CADILLAC LYRIQ-V (Performance)
**Preis: Ab CHF 112'771** (ca. €119,000)
- Hochleistungs-Elektro-SUV mit sportlichem Design

### CADILLAC VISTIQ
**Preis: Ab CHF 108'800** (ca. €115,000)
- **Leasing**: 0,99% Leasing verfügbar
- Vollelektrischer 3-Reihen-SUV
- Ideal für Familien

### CADILLAC OPTIQ (NEU)
**Preis: Ab CHF 66'680** (ca. €70,000)
- **Verbrauch**: 22.5 kWh/100km (WLTP)
- **CO₂-Emissionen**: 0 g/km, Klasse A
- Vollelektrischer Kompakt-SUV
- Launch Edition jetzt reservierbar

## Wichtige Informationen

**Alle Preise inkl. MwSt.** Änderungen in Modellvarianten, Konstruktion und Ausstattung bleiben vorbehalten.

**Reichweite**: Die tatsächliche Reichweite kann je nach Fahrstil, Durchschnittsgeschwindigkeit, Wetterbedingungen, Zusatzausstattungen und externen Faktoren variieren.

**Ladezeiten**: Basieren auf Schätzungen und hängen vom Ladezustand der Batterie, Batteriezustand, Ladegerät und Außentemperatur ab.

**CO₂-Durchschnitt 2025**: 113 g/km (alle Neuwagen in der Schweiz)
**CO₂-Zielwert 2025**: 93.6 g/km

## Garantie
- **Batteriegarantie**: 8 Jahre oder 160.000 km
- **Fahrzeuggarantie**: Gemäß Cadillac-Standards`,
            category: 'Preise & Finanzierung',
            tags: ['Preise', 'Schweiz', 'CHF', 'Leasing', 'LYRIQ', 'VISTIQ', 'OPTIQ', '2025', 'offiziell'],
            language: 'de',
            source: 'Cadillac Europe Official Website',
            url: 'https://www.cadillaceurope.com/ch-de',
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: new Date().toISOString()
        };
        
        const pricingRef = await db.collection('knowledgeBase').add(pricingDoc);
        console.log('✅ Added pricing document:', pricingRef.id);
        
        // Add technical specifications document
        const specsDoc = {
            title: 'Cadillac LYRIQ - Technische Daten und Spezifikationen',
            content: `# Cadillac LYRIQ - Technische Daten

## Antrieb und Leistung
- **Antriebsart**: Vollelektrisch
- **Batterie**: 100 kWh Lithium-Ionen-Batterie
- **Reichweite**: bis zu 483 Kilometer (WLTP)
- **Energieverbrauch**: 22.5 kWh/100km (WLTP kombiniert)
- **Energieverbrauch (real)**: ca. 19.5 kWh/100 km

## Ladung
### Heimladung (Level 2, 240V)
- **Ladedauer**: ca. 10 Stunden für volle Ladung
- **Ideal für**: Über-Nacht-Ladung zu Hause

### Öffentliche Ladestationen
- **DC-Schnellladung**: 30 Minuten auf 80%
- **Schnellladestationen (DC)**: 10 Minuten auf 80%
- **Ladeanschluss**: An der Fahrerseite des Fahrzeugs

### Ladevorgang
1. Ladestation finden (Cadillac Mobile App nutzen)
2. Ladekabel an Ladestation und Fahrzeug anschließen
3. Ladevorgang über Station oder App starten
4. Ladekabel nach Abschluss trennen

## Umwelt
- **CO₂-Emissionen**: 0 g/km (im Fahrbetrieb)
- **CO₂-Klasse**: A
- **Emissionen Energieerzeugung**: Nicht in dieser Angabe berücksichtigt

## Faktoren für Reichweite
Die tatsächliche Reichweite wird beeinflusst durch:
- Fahrstil
- Durchschnittsgeschwindigkeit
- Wetterbedingungen (besonders Temperatur)
- Nutzung von Klimaanlage oder Heizung
- Außentemperatur
- Zusatzausstattung und Zubehör (Reifenformat, Anbauteile)
- Verkehrsbedingungen

## Garantie
- **Batteriegarantie**: 8 Jahre oder 160.000 km
- **Herstellergarantie**: Gemäß Cadillac-Standards`,
            category: 'Technische Daten',
            tags: ['LYRIQ', 'Spezifikationen', 'Reichweite', 'Ladung', 'Batterie', 'Technisch', 'WLTP'],
            language: 'de',
            source: 'Cadillac Europe Official Website',
            url: 'https://www.cadillaceurope.com/ch-de',
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: new Date().toISOString()
        };
        
        const specsRef = await db.collection('knowledgeBase').add(specsDoc);
        console.log('✅ Added technical specs document:', specsRef.id);
        
        // Add services document
        const servicesDoc = {
            title: 'Cadillac Services - Laden, App und Kundenservice',
            content: `# Cadillac Services in der Schweiz

## Cadillac Charge - Ladenetzwerk
**Reichweite, die Sie auf der Straße hält**

### Features
- Zugang zu öffentlichen Ladestationen in ganz Europa
- Integration in myCadillac App
- Echtzeit-Verfügbarkeit von Ladestationen
- Intelligente Routenplanung mit Ladestopps
- Transparente Preise

## myCadillac App
**Verfügbar für iOS und Android**

### Funktionen
- **Fahrzeugstatus**: Batteriestan d, Reichweite, Ladestatus überwachen
- **Fernsteuerung**: Fahrzeug ver- und entriegeln
- **Ladestationen finden**: Nächstgelegene Ladestation mit Verfügbarkeit
- **Ladevorgang steuern**: Ladung starten, stoppen, planen
- **Service**: Service-Termine vereinbaren
- **Standorte**: Cadillac-Händler und Service-Center finden

### Download
- **iOS**: App Store
- **Android**: Google Play Store

## Probefahrt
**Erleben Sie Cadillac hautnah**

Buchen Sie Ihre Probefahrt online oder kontaktieren Sie Ihren lokalen Cadillac-Händler.

## Inzahlungnahme
Geben Sie Ihr aktuelles Fahrzeug in Zahlung und profitieren Sie von attraktiven Konditionen beim Kauf eines neuen Cadillac.

## Geschäftskunden und Flotte
**Der LYRIQ als Firmenwagen**

### Vorteile
- Attraktive Leasingraten für Geschäftskunden
- Steuervorteile für Elektrofahrzeuge
- Flottenmanagement-Services
- Spezielle Business-Konditionen

## Hilfe und Support
- **Kundenservice**: Telefonischer Support
- **Online-Hilfe**: Häufig gestellte Fragen (FAQ)
- **Händlersuche**: Service-Center in Ihrer Nähe
- **Technischer Support**: Bei Fragen zur Bedienung

## Connected Services
Moderne Konnektivitätsfunktionen für nahtlose Integration in Ihren digitalen Alltag.`,
            category: 'Services & Support',
            tags: ['Service', 'App', 'myCadillac', 'Laden', 'Probefahrt', 'Support', 'Cadillac Charge'],
            language: 'de',
            source: 'Cadillac Europe Official Website',
            url: 'https://www.cadillaceurope.com/ch-de',
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: new Date().toISOString()
        };
        
        const servicesRef = await db.collection('knowledgeBase').add(servicesDoc);
        console.log('✅ Added services document:', servicesRef.id);
        
        // Add all models overview
        const modelsDoc = {
            title: 'Cadillac Elektrofahrzeug-Lineup 2025 - Alle Modelle',
            content: `# Cadillac Elektrofahrzeug-Lineup 2025

## Unser Fahrzeugangebot
**Entdecken Sie die Vielfalt unserer vollelektrischen Modelle**

### 1. CADILLAC OPTIQ - Kompakt-SUV
**Ab CHF 66'680**
- Vollelektrischer Kompakt-SUV
- Perfekt für die Stadt und darüber hinaus
- Verbrauch: 22.5 kWh/100km
- Launch Edition jetzt reservierbar
- **Neuestes Modell** im Cadillac-Portfolio

### 2. CADILLAC LYRIQ - Mittelklasse-SUV
**Ab CHF 90'100**
- Cadillacs Flaggschiff-Elektro-SUV
- Reichweite: bis zu 483 km
- Batterie: 100 kWh
- Verbrauch: 22.5 kWh/100km
- **Sonderaktion**: Ab CHF 579/Monat mit 0% Leasing
- Technologie, die den Standard setzt

### 3. CADILLAC VISTIQ - 3-Reihen-SUV
**Ab CHF 108'800**
- Vollelektrischer 3-Reihen-SUV
- Platz für die ganze Familie
- Leasing ab 0,99%
- **Ideal für Familien**

### 4. CADILLAC LYRIQ-V - Performance-SUV
**Ab CHF 112'771**
- Hochleistungs-Elektro-SUV
- Sportliches Design
- Noch mehr Leistung
- **Performance-Version** des LYRIQ

## Design-Philosophie
**Seit 1902 schaffen wir Design-Ikonen. Manche Dinge ändern sich nie.**

Cadillac verbindet seit über 120 Jahren amerikanisches Luxus-Design mit modernster Technologie. Unsere vollelektrischen Modelle setzen diese Tradition fort.

## Konfigurator
Für alle Modelle verfügbar:
- Individuell konfigurieren
- Vorkonfigurierte Neufahrzeuge
- Zertifizierte Gebrauchtwagen
- Zubehör

## Cadillac Racing
**Der nächste Schritt von Cadillac Racing**
Cadillac ist zurück in der Formel 1® und setzt neue Maßstäbe im Motorsport.`,
            category: 'Fahrzeuge',
            tags: ['Modelle', 'Lineup', 'OPTIQ', 'LYRIQ', 'VISTIQ', 'LYRIQ-V', 'Elektro', 'SUV', '2025'],
            language: 'de',
            source: 'Cadillac Europe Official Website',
            url: 'https://www.cadillaceurope.com/ch-de',
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: new Date().toISOString()
        };
        
        const modelsRef = await db.collection('knowledgeBase').add(modelsDoc);
        console.log('✅ Added models overview document:', modelsRef.id);
        
        console.log('\n✅ Successfully added all official Cadillac Europe data to Knowledge Base!');
        console.log('\nDocuments added:');
        console.log('1. Pricing and financing information');
        console.log('2. Technical specifications');
        console.log('3. Services and support');
        console.log('4. All models overview');
        
    } catch (error) {
        console.error('❌ Error adding data:', error);
    } finally {
        process.exit(0);
    }
}

addOfficialCadillacData();

