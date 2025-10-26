/**
 * Script zum Hinzufügen der i18n-Attribute für Knowledge Database und Technical Database Tabs
 * Phase 2 - Final Step
 */

const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, 'public', 'settings.html');
let content = fs.readFileSync(settingsPath, 'utf8');

// Knowledge Database Tab Translations
const kbTranslations = [
    // Statistics labels
    { old: '<div class="stat-label">Dokumente</div>',
      new: '<div class="stat-label" data-i18n="settings.knowledgeDb.documents">Dokumente</div>' },
    
    { old: '<div class="stat-label">Gesamtgröße</div>',
      new: '<div class="stat-label" data-i18n="settings.knowledgeDb.totalSize">Gesamtgröße</div>' },
    
    { old: '<div class="stat-label">Letzte Aktualisierung</div>',
      new: '<div class="stat-label" data-i18n="settings.knowledgeDb.lastUpdate">Letzte Aktualisierung</div>' },
    
    { old: '<div class="stat-description">Alle Dateien</div>',
      new: '<div class="stat-description" data-i18n="settings.knowledgeDb.allFiles">Alle Dateien</div>' },
    
    // Search and filters
    { old: 'placeholder="Dokumente durchsuchen..."',
      new: 'data-i18n-placeholder="settings.knowledgeDb.searchPlaceholder" placeholder="Dokumente durchsuchen..."' },
    
    { old: '<option value="">Alle Kategorien</option>',
      new: '<option value="" data-i18n="settings.knowledgeDb.allCategories">Alle Kategorien</option>' },
    
    { old: '<option value="newest">Neueste zuerst</option>',
      new: '<option value="newest" data-i18n="settings.knowledgeDb.sortNewest">Neueste zuerst</option>' },
    
    { old: '<option value="oldest">Älteste zuerst</option>',
      new: '<option value="oldest" data-i18n="settings.knowledgeDb.sortOldest">Älteste zuerst</option>' },
    
    { old: '<option value="name">Nach Name</option>',
      new: '<option value="name" data-i18n="settings.knowledgeDb.sortName">Nach Name</option>' },
    
    { old: '<option value="size">Nach Größe</option>',
      new: '<option value="size" data-i18n="settings.knowledgeDb.sortSize">Nach Größe</option>' },
    
    { old: 'onclick="refreshKnowledgeBase()">Aktualisieren</button>',
      new: 'onclick="refreshKnowledgeBase()" data-i18n="settings.knowledgeDb.refresh">Aktualisieren</button>' },
    
    // Bulk actions
    { old: '<label for="selectAllKb">Alle auswählen</label>',
      new: '<label for="selectAllKb" data-i18n="settings.knowledgeDb.selectAll">Alle auswählen</label>' },
    
    { old: 'ausgewählt</span>',
      new: '<span data-i18n="settings.knowledgeDb.selected">ausgewählt</span></span>' },
    
    { old: 'id="bulkDeleteKbBtn" disabled style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;">Ausgewählte löschen</button>',
      new: 'id="bulkDeleteKbBtn" disabled style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;" data-i18n="settings.knowledgeDb.deleteSelected">Ausgewählte löschen</button>' },
    
    { old: 'id="exportKbBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;">Exportieren</button>',
      new: 'id="exportKbBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;" data-i18n="settings.knowledgeDb.export">Exportieren</button>' },
    
    { old: 'id="importKbBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;">Importieren</button>',
      new: 'id="importKbBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;" data-i18n="settings.knowledgeDb.import">Importieren</button>' },
    
    // Empty state
    { old: 'Keine Dokumente gefunden',
      new: '<span data-i18n="settings.knowledgeDb.noDocuments">Keine Dokumente gefunden</span>' }
];

// Technical Database Tab Translations (similar structure)
const techTranslations = [
    // Statistics labels
    { old: '<div class="stat-description">Technische Datenbank</div>',
      new: '<div class="stat-description" data-i18n="settings.technicalDb.technicalDatabase">Technische Datenbank</div>' },
    
    // Search (for technical DB)
    { old: 'placeholder="Technische Dokumente durchsuchen..."',
      new: 'data-i18n-placeholder="settings.technicalDb.searchPlaceholder" placeholder="Technische Dokumente durchsuchen..."' },
    
    // Refresh button for tech DB
    { old: 'onclick="refreshTechnicalDatabase()">Aktualisieren</button>',
      new: 'onclick="refreshTechnicalDatabase()" data-i18n="settings.technicalDb.refresh">Aktualisieren</button>' },
    
    // Select all for tech DB
    { old: '<label for="selectAllTech">Alle auswählen</label>',
      new: '<label for="selectAllTech" data-i18n="settings.technicalDb.selectAll">Alle auswählen</label>' },
    
    // Bulk actions for tech DB
    { old: 'id="bulkDeleteTechBtn" disabled style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;">Ausgewählte löschen</button>',
      new: 'id="bulkDeleteTechBtn" disabled style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;" data-i18n="settings.technicalDb.deleteSelected">Ausgewählte löschen</button>' },
    
    { old: 'id="exportTechBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;">Exportieren</button>',
      new: 'id="exportTechBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;" data-i18n="settings.technicalDb.export">Exportieren</button>' },
    
    { old: 'id="importTechBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;">Importieren</button>',
      new: 'id="importTechBtn" style="height: 44px !important; min-height: 44px !important; padding: 0 20px !important; box-sizing: border-box !important; margin: 0 !important;" data-i18n="settings.technicalDb.import">Importieren</button>' }
];

// Apply all translations
const allTranslations = [...kbTranslations, ...techTranslations];

let changeCount = 0;
let notFoundCount = 0;

allTranslations.forEach(({ old, new: replacement }) => {
    const escapedOld = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const occurrences = (content.match(new RegExp(escapedOld, 'g')) || []).length;
    
    if (occurrences > 0) {
        // Only replace first occurrence to avoid duplicates
        content = content.replace(old, replacement);
        changeCount++;
        console.log(`✅ Replaced: ${old.substring(0, 60)}...`);
    } else {
        notFoundCount++;
        console.log(`⚠️  Not found: ${old.substring(0, 60)}...`);
    }
});

// Write back
fs.writeFileSync(settingsPath, content, 'utf8');

console.log(`\n✅ Done! Made ${changeCount} changes to settings.html`);
console.log(`⚠️  ${notFoundCount} items not found (may already be translated or not exist)`);
console.log('📝 Phase 2 Knowledge & Technical Database Tabs i18n attributes added!');

