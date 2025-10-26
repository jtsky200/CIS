/**
 * Script zum Hinzufügen der verbleibenden i18n-Attribute in settings.html
 * Führt Phase 2 der i18n-Implementierung fort
 */

const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, 'public', 'settings.html');
let content = fs.readFileSync(settingsPath, 'utf8');

// Datenbank-Einstellungen Section
const dbTranslations = [
    { old: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;">Datenbank-Einstellungen</h3>', 
      new: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;" data-i18n="settings.general.databaseSettings">Datenbank-Einstellungen</h3>' },
    
    { old: '<label>Auto-Backup Intervall</label>', 
      new: '<label data-i18n="settings.general.autoBackupInterval">Auto-Backup Intervall</label>' },
    
    { old: '<label>Maximale Dateigröße (MB)</label>', 
      new: '<label data-i18n="settings.general.maxFileSize">Maximale Dateigröße (MB)</label>' },
    
    { old: '<label>Erlaubte Dateitypen</label>', 
      new: '<label data-i18n="settings.general.allowedFileTypes">Erlaubte Dateitypen</label>' },
    
    { old: 'Duplikat-Erkennung aktivieren',
      new: '<span data-i18n="settings.general.enableDuplicateDetection">Duplikat-Erkennung aktivieren</span>' },
    
    { old: 'Automatische Kategorisierung',
      new: '<span data-i18n="settings.general.autoCategor">Automatische Kategorisierung</span>' },
    
    { old: '>Backup erstellen</button>', 
      new: ' data-i18n="settings.general.createBackup">Backup erstellen</button>' },
    
    { old: '>Backup wiederherstellen</button>', 
      new: ' data-i18n="settings.general.restoreBackup">Backup wiederherstellen</button>' },
    
    { old: '>Cache leeren</button>', 
      new: ' data-i18n="settings.general.clearCache">Cache leeren</button>' },
    
    { old: '>Alle Daten löschen</button>', 
      new: ' data-i18n="settings.general.deleteAllData">Alle Daten löschen</button>' }
];

// API-Einstellungen Section
const apiTranslations = [
    { old: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin: 0;">API-Einstellungen (Mehrere API Keys)</h3>',
      new: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin: 0;" data-i18n="settings.general.apiSettings">API-Einstellungen (Mehrere API Keys)</h3>' },
    
    { old: '<label>API Timeout (Sekunden)</label>',
      new: '<label data-i18n="settings.general.apiTimeout">API Timeout (Sekunden)</label>' },
    
    { old: '<label>Rate Limit (Anfragen pro Minute)</label>',
      new: '<label data-i18n="settings.general.rateLimit">Rate Limit (Anfragen pro Minute)</label>' },
    
    { old: '<label>Retry-Versuche bei Fehler</label>',
      new: '<label data-i18n="settings.general.retryAttempts">Retry-Versuche bei Fehler</label>' }
];

// Sicherheit & Benutzer Section
const securityTranslations = [
    { old: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;">Sicherheit & Benutzer</h3>',
      new: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;" data-i18n="settings.general.securitySettings">Sicherheit & Benutzer</h3>' },
    
    { old: '<label>Sitzungs-Timeout (Minuten)</label>',
      new: '<label data-i18n="settings.general.sessionTimeout">Sitzungs-Timeout (Minuten)</label>' },
    
    { old: 'Zwei-Faktor-Authentifizierung aktivieren',
      new: '<span data-i18n="settings.general.enable2FA">Zwei-Faktor-Authentifizierung aktivieren</span>' },
    
    { old: 'Aktivitäts-Log aktivieren',
      new: '<span data-i18n="settings.general.enableActivityLog">Aktivitäts-Log aktivieren</span>' },
    
    { old: '>Passwort ändern</button>',
      new: ' data-i18n="settings.general.changePassword">Passwort ändern</button>' },
    
    { old: '>Aktivitäts-Log anzeigen</button>',
      new: ' data-i18n="settings.general.viewActivityLog">Aktivitäts-Log anzeigen</button>' }
];

// Performance & Optimierung Section
const perfTranslations = [
    { old: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;">Performance & Optimierung</h3>',
      new: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;" data-i18n="settings.general.performanceSettings">Performance & Optimierung</h3>' },
    
    { old: '<label>Cache-Größe (MB)</label>',
      new: '<label data-i18n="settings.general.cacheSize">Cache-Größe (MB)</label>' },
    
    { old: 'Lazy Loading aktivieren',
      new: '<span data-i18n="settings.general.enableLazyLoading">Lazy Loading aktivieren</span>' },
    
    { old: 'Bildkompression aktivieren',
      new: '<span data-i18n="settings.general.enableImageCompression">Bildkompression aktivieren</span>' },
    
    { old: 'Prefetching aktivieren',
      new: '<span data-i18n="settings.general.enablePrefetching">Prefetching aktivieren</span>' }
];

// Benachrichtigungen Section
const notifTranslations = [
    { old: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;">Benachrichtigungen</h3>',
      new: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;" data-i18n="settings.general.notificationSettings">Benachrichtigungen</h3>' },
    
    { old: '<label>E-Mail-Adresse für Benachrichtigungen</label>',
      new: '<label data-i18n="settings.general.notificationEmail">E-Mail-Adresse für Benachrichtigungen</label>' },
    
    { old: 'E-Mail-Benachrichtigungen aktivieren',
      new: '<span data-i18n="settings.general.enableEmailNotifications">E-Mail-Benachrichtigungen aktivieren</span>' },
    
    { old: 'Push-Benachrichtigungen aktivieren',
      new: '<span data-i18n="settings.general.enablePushNotifications">Push-Benachrichtigungen aktivieren</span>' },
    
    { old: '<label>Benachrichtigungs-Frequenz</label>',
      new: '<label data-i18n="settings.general.notificationFrequency">Benachrichtigungs-Frequenz</label>' }
];

// Erweiterte Tools Section
const toolsTranslations = [
    { old: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;">Erweiterte Tools</h3>',
      new: '<h3 style="font-size: 18px; font-weight: 500; color: #2d2d2d; margin-bottom: 20px;" data-i18n="settings.general.advancedTools">Erweiterte Tools</h3>' },
    
    { old: 'Debug-Modus aktivieren',
      new: '<span data-i18n="settings.general.enableDebugMode">Debug-Modus aktivieren</span>' },
    
    { old: 'Analytics aktivieren',
      new: '<span data-i18n="settings.general.enableAnalytics">Analytics aktivieren</span>' },
    
    { old: 'Webhook-Integration aktivieren',
      new: '<span data-i18n="settings.general.enableWebhook">Webhook-Integration aktivieren</span>' },
    
    { old: '<label>Webhook URL</label>',
      new: '<label data-i18n="settings.general.webhookUrl">Webhook URL</label>' },
    
    { old: '<label>Custom CSS</label>',
      new: '<label data-i18n="settings.general.customCss">Custom CSS</label>' },
    
    { old: '>Logs anzeigen</button>',
      new: ' data-i18n="settings.general.viewLogs">Logs anzeigen</button>' },
    
    { old: '>Einstellungen exportieren</button>',
      new: ' data-i18n="settings.general.exportSettings">Einstellungen exportieren</button>' },
    
    { old: '>Einstellungen importieren</button>',
      new: ' data-i18n="settings.general.importSettings">Einstellungen importieren</button>' },
    
    { old: '>Webhook testen</button>',
      new: ' data-i18n="settings.general.testWebhook">Webhook testen</button>' }
];

// Save Buttons
const saveTranslations = [
    { old: '>Änderungen speichern</button>',
      new: ' data-i18n="settings.general.saveChanges">Änderungen speichern</button>' },
    
    { old: '>Zurücksetzen</button>',
      new: ' data-i18n="settings.general.reset">Zurücksetzen</button>' }
];

// Apply all translations
const allTranslations = [
    ...dbTranslations,
    ...apiTranslations,
    ...securityTranslations,
    ...perfTranslations,
    ...notifTranslations,
    ...toolsTranslations,
    ...saveTranslations
];

let changeCount = 0;
allTranslations.forEach(({ old, new: replacement }) => {
    const occurrences = (content.match(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (occurrences > 0) {
        // Only replace first occurrence to avoid duplicates
        content = content.replace(old, replacement);
        changeCount++;
        console.log(`✅ Replaced: ${old.substring(0, 50)}...`);
    } else {
        console.log(`⚠️  Not found: ${old.substring(0, 50)}...`);
    }
});

// Write back
fs.writeFileSync(settingsPath, content, 'utf8');

console.log(`\n✅ Done! Made ${changeCount} changes to settings.html`);
console.log('📝 Phase 2 General Settings i18n attributes added!');

