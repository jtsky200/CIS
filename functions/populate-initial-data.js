const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function populateInitialData() {
    console.log('🚀 Starting initial data population...');

    try {
        // 1. Create app settings
        console.log('📝 Creating app settings...');
        await db.collection('app_settings').doc('branding').set({
            logo: '',
            brandText: 'Cadillac EV',
            welcomeTitle: 'Cadillac EV Assistant',
            welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
            quickActions: [
                'Was kostet der Cadillac LYRIQ?',
                'Wie hoch ist die Reichweite?',
                'Lieferzeiten & Bestellung',
                'Garantie & Service'
            ],
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ App settings created');

        // 2. Create sample knowledge base documents
        console.log('📚 Creating sample knowledge base documents...');
        const knowledgeBaseDocs = [
            {
                filename: 'cadillac-lyriq-specs.txt',
                content: `Cadillac LYRIQ 2025 Specifications:

Preis: Ab CHF 68,500
Reichweite: Bis zu 494 km (WLTP)
Batterie: 102 kWh Lithium-Ionen
Ladezeit: DC-Schnellladen bis 190 kW (10-80% in 30 Minuten)
Leistung: 340 PS / 440 Nm Drehmoment
Beschleunigung: 0-100 km/h in 5.5 Sekunden
Ladeanschlüsse: CCS Combo
Garantie: 8 Jahre / 160,000 km auf Batterie und Antriebsstrang

Der LYRIQ ist das erste vollelektrische Fahrzeug von Cadillac und setzt neue Standards in Sachen Luxus und Nachhaltigkeit.`,
                fileType: 'text',
                size: 1247,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                uploadedBy: 'system'
            },
            {
                filename: 'charging-guide.md',
                content: `# Cadillac EV Ladeanleitung

## Schnellladen (DC)
- **Geschwindigkeit**: Bis zu 190 kW
- **Ladezeit**: 10-80% in ca. 30 Minuten
- **Empfohlene Ladestationen**: Ionity, Fastned, Tesla Supercharger (mit Adapter)

## Heimladen (AC)
- **Wallbox**: 11 kW (empfohlen)
- **Ladezeit**: 8-10 Stunden für volle Ladung
- **Steckdose**: Notladung möglich (langsamer)

## Ladeetiketten verstehen
- **Level 1**: 120V AC (nicht empfohlen für EV)
- **Level 2**: 240V AC (Standard für Heimladen)
- **Level 3**: DC-Schnellladen (Geschäftsladen)

## Tipps für optimale Batterielebensdauer
- Laden Sie zwischen 20-80% für täglichen Gebrauch
- Vermeiden Sie extremes Laden bei sehr hohen oder niedrigen Temperaturen
- Verwenden Sie vorgeladene Routen für lange Fahrten`,
                fileType: 'markdown',
                size: 2156,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                uploadedBy: 'system'
            },
            {
                filename: 'warranty-information.txt',
                content: `Cadillac LYRIQ Garantie-Informationen:

🎯 HAUPTGARANTIE
- Fahrzeug: 4 Jahre / 80,000 km
- Batterie: 8 Jahre / 160,000 km
- Antriebsstrang: 8 Jahre / 160,000 km
- Durchrostung: 6 Jahre / unbegrenzte km

🔧 INKLUSIVE LEISTUNGEN
- 24/7 roadside assistance
- Kostenlose Wartung für 4 Jahre / 80,000 km
- Software-Updates über die Luft (OTA)
- Mobiler Service verfügbar

🚨 NICHT ABGEDECKT
- Reifen und Verschleißteile
- Schäden durch Unfall oder Missbrauch
- Modifikationen durch Drittanbieter

Für detaillierte Informationen konsultieren Sie Ihr Cadillac Service Center.`,
                fileType: 'text',
                size: 1834,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                uploadedBy: 'system'
            }
        ];

        for (const doc of knowledgeBaseDocs) {
            await db.collection('knowledgebase').add(doc);
        }
        console.log(`✅ Created ${knowledgeBaseDocs.length} knowledge base documents`);

        // 3. Create sample technical database documents
        console.log('🔧 Creating sample technical database documents...');
        const technicalDocs = [
            {
                filename: 'battery-maintenance.pdf',
                content: `BATTERIE WARTUNGSANLEITUNG - CADILLAC LYRIQ

WARTUNGSINTERVALLE:
- Sichtprüfung: Monatlich
- Professionelle Inspektion: Jährlich oder alle 20,000 km
- Software-Update: Automatisch über OTA

TEMPERATURMANAGEMENT:
- Optimaler Betriebstemperaturbereich: 15°C - 35°C
- Kälteschutz: Automatische Beheizung bei < -10°C
- Hitzeschutz: Aktive Kühlung bei > 40°C

LADEEMPFEHLUNGEN:
- DC-Schnellladen: Max. 2x pro Woche für Batterielebensdauer
- AC-Laden: Täglich möglich, fördert Batteriebalance
- Tiefentladung vermeiden: Nicht unter 10% entladen

FEHLERBEHEBUNG:
- Fehlercode P0Axx: Batteriemanagement-System
- Fehlercode P1Axx: Hochvolt-System
- Fehlercode U1xxx: Kommunikationsfehler`,
                fileType: 'pdf',
                category: 'Battery',
                subcategory: 'Maintenance',
                description: 'Comprehensive battery maintenance and troubleshooting guide',
                size: 3241,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                isActive: true
            },
            {
                filename: 'charging-system-diagnostics.txt',
                content: `LADESYSTEM DIAGNOSTIK - CADILLAC EV

KOMPONENTENÜBERPRÜFUNG:
1. Ladeanschluss prüfen auf Verschmutzung
2. Ladekabel auf Beschädigung untersuchen
3. Fehlercodes mit OBD-II auslesen
4. Kommunikation zwischen Fahrzeug und Ladestation testen

TYPISCHE FEHLER:
- Fehler 11: Unvollständige Verbindung
- Fehler 12: Überspannung erkannt
- Fehler 13: Unterspannung erkannt
- Fehler 14: Kommunikationsfehler

LÖSUNGSANSÄTZE:
- Ladestation wechseln
- Kabel und Stecker reinigen
- Software-Reset durchführen
- Fachwerkstatt aufsuchen wenn Problem bestehen bleibt`,
                fileType: 'text',
                category: 'Charging',
                subcategory: 'Diagnostics',
                description: 'Charging system diagnostics and troubleshooting',
                size: 2156,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                isActive: true
            },
            {
                filename: 'software-update-procedures.md',
                content: `# SOFTWARE UPDATE VERFAHREN

## OTA UPDATES (Over-The-Air)
- Automatische Installation während Ruhezeiten
- Benötigt stabile Internetverbindung
- Dauer: 15-45 Minuten
- Fahrzeug muss während Update nicht in Nutzung sein

## MANUELLE UPDATES
- Bei Konnektivitätsproblemen
- Durchführung über USB-Stick
- Update-Datei von Cadillac Website herunterladen
- Installation durch zertifizierte Werkstatt

## UPDATE VORBEREITUNG
1. Fahrzeug vollständig laden (>50%)
2. Stabile Stromversorgung sicherstellen
3. Ausreichend Zeit einplanen (1-2 Stunden)
4. Bei Problemen Cadillac Support kontaktieren

## NACH UPDATE
- Systemneustart automatisch
- Alle Systeme werden getestet
- Bestätigung über Infotainment-Display`,
                fileType: 'markdown',
                category: 'Software',
                subcategory: 'Updates',
                description: 'Software update procedures and best practices',
                size: 1876,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                isActive: true
            }
        ];

        for (const doc of technicalDocs) {
            await db.collection('technicalDatabase').add(doc);
        }
        console.log(`✅ Created ${technicalDocs.length} technical database documents`);

        console.log('🎉 Initial data population completed successfully!');
        console.log('📊 Summary:');
        console.log(`   - App settings: ✅`);
        console.log(`   - Knowledge base: ${knowledgeBaseDocs.length} documents ✅`);
        console.log(`   - Technical database: ${technicalDocs.length} documents ✅`);

    } catch (error) {
        console.error('❌ Error populating initial data:', error);
        throw error;
    }
}

// Run the population script
populateInitialData()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
