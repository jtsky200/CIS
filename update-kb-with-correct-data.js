const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function updateKnowledgeBase() {
    console.log('🔄 Updating Knowledge Base with correct Cadillac Europe data...\n');

    // Load the correct data
    const data = JSON.parse(fs.readFileSync('./cadillac-europe-official-complete-data.json', 'utf8'));

    try {
        // Update each model with CORRECT specifications
        for (const model of data.models) {
            const docId = `cadillac-${model.name.toLowerCase()}-swiss-2025`;
            
            const documentData = {
                title: `Cadillac ${model.name} - Offizielle Schweizer Spezifikationen 2025`,
                content: generateContent(model),
                fullContent: generateFullContent(model),
                category: 'Technische Daten',
                tags: [model.name, 'Schweiz', 'Preis', 'Spezifikationen', '2025', 'Elektro'],
                source: 'Cadillac Europe Official Website',
                dateAdded: admin.firestore.FieldValue.serverTimestamp(),
                lastModified: admin.firestore.FieldValue.serverTimestamp(),
                fileType: 'Official Data',
                images: getModelImages(model.name)
            };

            await db.collection('knowledge-base').doc(docId).set(documentData, { merge: true });
            console.log(`✅ Updated: ${model.name}`);
        }

        // Add general services document
        const servicesDocId = 'cadillac-swiss-services-2025';
        await db.collection('knowledge-base').doc(servicesDocId).set({
            title: 'Cadillac Schweiz - Services und Dienstleistungen',
            content: generateServicesContent(data.services),
            fullContent: generateServicesFullContent(data.services, data.charging),
            category: 'Services',
            tags: ['Services', 'Schweiz', 'Laden', 'Wartung', 'Garantie'],
            source: 'Cadillac Europe Official Website',
            dateAdded: admin.firestore.FieldValue.serverTimestamp(),
            lastModified: admin.firestore.FieldValue.serverTimestamp(),
            fileType: 'Official Data'
        }, { merge: true });
        console.log(`✅ Updated: Services`);

        console.log('\n✅ Knowledge Base successfully updated with CORRECT data!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Knowledge Base:', error);
        process.exit(1);
    }
}

function generateContent(model) {
    return `${model.tagline || model.type}

**Preis:** ${model.basePrice}

**Wichtigste Spezifikationen:**
- Reichweite: ${model.specifications.range}
- Leistung: ${model.specifications.power}
- Beschleunigung: ${model.specifications.acceleration}
- Schnellladen: ${model.specifications.fastCharging}
- Verbrauch: ${model.specifications.energyConsumption}
${model.specifications.seating ? `- Sitze: ${model.specifications.seating}` : ''}

${model.specialOffers ? `**Aktuelle Angebote:** ${model.specialOffers.join(', ')}` : ''}`;
}

function generateFullContent(model) {
    let content = `# Cadillac ${model.name}
## ${model.type}

**Basispreis:** ${model.basePrice}
**Version:** ${model.version}
${model.tagline ? `\n*${model.tagline}*\n` : ''}

## Technische Spezifikationen

${model.specifications.seating ? `- **Sitze:** ${model.specifications.seating}\n` : ''}- **Reichweite:** ${model.specifications.range}
- **Leistung:** ${model.specifications.power}
${model.specifications.torque ? `- **Drehmoment:** ${model.specifications.torque}\n` : ''}- **Beschleunigung (0-100 km/h):** ${model.specifications.acceleration}
- **Schnellladen:** ${model.specifications.fastCharging}
${model.specifications.chargingCapacity ? `- **Ladekapazität:** ${model.specifications.chargingCapacity}\n` : ''}${model.specifications.cargoVolume ? `- **Kofferraumvolumen:** ${model.specifications.cargoVolume}\n` : ''}- **Energieverbrauch:** ${model.specifications.energyConsumption}
- **CO₂-Emissionen:** ${model.specifications.co2Emissions}
- **Benzinäquivalent:** ${model.specifications.fuelEquivalent}
- **Antrieb:** ${model.specifications.drivetrain}

## Ausstattung und Technologie

${model.features.map(f => `- ${f}`).join('\n')}

${model.awards ? `\n## Auszeichnungen\n${model.awards}\n` : ''}
${model.specialOffers ? `\n## Aktuelle Angebote\n${model.specialOffers.map(o => `- ${o}`).join('\n')}\n` : ''}
${model.variants ? `\n## Varianten\n${model.variants.map(v => `- ${v}`).join('\n')}\n` : ''}

---
*Quelle: Cadillac Europe Official Website (https://www.cadillaceurope.com/ch-de)*
*Alle Preise inkl. MWST*`;

    return content;
}

function generateServicesContent(services) {
    return `**Cadillac Services in der Schweiz:**

- Probefahrten buchbar
- Online-Konfigurator
- Vorkonfigurierte Neufahrzeuge
- Zertifizierte Gebrauchtwagen
- Zubehör und Accessoires
- Umfassende Wartungs- und Serviceleistungen
- myCadillac App (iOS und Android)
- Connected Vehicle Services
- Geschäftskunden und Flottenservice`;
}

function generateServicesFullContent(services, charging) {
    return `# Cadillac Services Schweiz

## Verfügbare Services

### Fahrzeugkauf
- **Probefahrten:** ${services.testDrive}
- **Online-Konfigurator:** ${services.configurator}
- **Neufahrzeuge:** ${services.inventory}
- **Gebrauchtwagen:** ${services.usedCars}

### Wartung & Service
- **Garantie:** ${services.warranty}
- **Zubehör:** ${services.accessories}

### Digital & Connected
- **myCadillac App:** ${services.myCadillacApp}
- **Connected Services:** ${services.connectedServices}

### Business
- **Geschäftskunden:** ${services.businessFleet}

## Laden

### Ladelösungen
- **Zuhause:** ${charging.homeSolutions}
- **Öffentlich:** ${charging.publicCharging}

### Wichtige Hinweise
${charging.notes}

---
*Quelle: Cadillac Europe Official Website*`;
}

function getModelImages(modelName) {
    const baseUrl = 'https://www.cadillaceurope.com/content/dam/cadillac/eu/ch-de/';
    
    switch(modelName) {
        case 'LYRIQ':
            return [
                `${baseUrl}lyriq/2024/exterior/front-view.jpg`,
                `${baseUrl}lyriq/2024/interior/dashboard.jpg`
            ];
        case 'LYRIQ-V':
            return [
                `${baseUrl}lyriq-v/2024/exterior/front-view.jpg`,
                `${baseUrl}lyriq-v/2024/interior/dashboard.jpg`
            ];
        case 'VISTIQ':
            return [
                `${baseUrl}vistiq/2025/exterior/front-view.jpg`,
                `${baseUrl}vistiq/2025/interior/dashboard.jpg`
            ];
        case 'OPTIQ':
            return [
                `${baseUrl}optiq/2025/exterior/front-view.jpg`,
                `${baseUrl}optiq/2025/interior/dashboard.jpg`
            ];
        default:
            return [];
    }
}

// Run the update
updateKnowledgeBase();

