const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║     COMPLETE i18n VERIFICATION                       ║');
console.log('║     Checking all pages for missing i18n              ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

const pages = [
    'public/dashboard.html',
    'public/chat.html',
    'public/troubleshooting.html',
    'public/settings.html'
];

const germanWords = [
    'Einstellungen', 'Wissensdatenbank', 'Technische', 'Datenbank',
    'Branding', 'Anpassung', 'hochladen', 'zurücksetzen', 
    'Speichern', 'Änderungen', 'Exportieren', 'Importieren',
    'Löschen', 'Aktualisieren', 'Durchsuchen', 'Sortieren',
    'Neueste', 'Älteste', 'Größe', 'Alle', 'auswählen',
    'ausgewählt', 'Keine', 'Dokumente', 'gefunden',
    'Statistiken', 'Gesamtgröße', 'Letzte', 'Aktualisierung',
    'Schnellzugriff', 'starten', 'Konversation', 'Datei',
    'erweitern', 'Website', 'besuchen', 'Aktivitäten',
    'vorhanden', 'Willkommen', 'Assistent', 'kostet',
    'Reichweite', 'Lieferzeiten', 'Bestellung', 'Garantie',
    'Service', 'Nachricht', 'Problemdiagnose', 'Bild',
    'Klicken', 'Problem', 'beschreiben', 'Fahrzeugmodell',
    'Modell', 'auswählen', 'analysieren', 'Hilfe',
    'Probleme', 'Lösung'
];

for (const pagePath of pages) {
    console.log(`\n📄 Checking: ${pagePath}`);
    console.log('─'.repeat(60));
    
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Count i18n attributes
    const i18nCount = (content.match(/data-i18n="/g) || []).length;
    const placeholderCount = (content.match(/data-i18n-placeholder="/g) || []).length;
    
    console.log(`✅ Found ${i18nCount} data-i18n attributes`);
    console.log(`✅ Found ${placeholderCount} data-i18n-placeholder attributes`);
    
    // Find German text that might need translation
    const lines = content.split('\n');
    const missingI18n = [];
    
    lines.forEach((line, index) => {
        // Skip script tags, style tags, and comments
        if (line.includes('<script') || line.includes('<style') || line.includes('<!--')) {
            return;
        }
        
        // Check for German words in text nodes
        germanWords.forEach(word => {
            if (line.includes(`>${word}<`) || line.includes(`"${word}"`) || line.includes(`'${word}'`)) {
                // Check if this line already has data-i18n
                if (!line.includes('data-i18n=')) {
                    missingI18n.push({
                        line: index + 1,
                        word: word,
                        context: line.trim().substring(0, 100)
                    });
                }
            }
        });
    });
    
    if (missingI18n.length > 0) {
        console.log(`\n⚠️  Found ${missingI18n.length} potential missing i18n attributes:`);
        
        // Group by word to avoid duplicates
        const uniqueWords = [...new Set(missingI18n.map(m => m.word))];
        uniqueWords.slice(0, 10).forEach(word => {
            const example = missingI18n.find(m => m.word === word);
            console.log(`   Line ${example.line}: "${word}"`);
            console.log(`      ${example.context.substring(0, 80)}...`);
        });
        
        if (uniqueWords.length > 10) {
            console.log(`   ... and ${uniqueWords.length - 10} more`);
        }
    } else {
        console.log('\n✅ No obvious missing translations found');
    }
}

console.log('\n\n╔═══════════════════════════════════════════════════════╗');
console.log('║     VERIFICATION COMPLETE                             ║');
console.log('╚═══════════════════════════════════════════════════════╝');

