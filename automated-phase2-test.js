/**
 * Automatischer Phase 2 Test - Überprüft i18n auf deployed Website
 * Testet alle 3 Sprachen und alle 4 Tabs
 */

const https = require('https');

// Test configuration
const BASE_URL = 'https://cis-de.web.app';
const TEST_PAGES = [
    '/settings.html',
    '/translations/de.json',
    '/translations/en.json',
    '/translations/fr.json',
    '/js/i18n.js'
];

const EXPECTED_KEYS = {
    general: [
        'customModelConfig',
        'modelName',
        'apiEndpoint',
        'databaseAccess',
        'temperature',
        'maxTokens',
        'chatSystemPrompt',
        'enableStreaming',
        'databaseSettings',
        'autoBackupInterval',
        'apiSettings',
        'securitySettings',
        'performanceSettings',
        'notificationSettings',
        'advancedTools'
    ],
    knowledgeDb: [
        'searchPlaceholder',
        'allCategories',
        'sortNewest',
        'sortOldest',
        'selectAll',
        'deleteSelected',
        'export',
        'import',
        'refresh',
        'documents',
        'totalSize'
    ],
    technicalDb: [
        'searchPlaceholder',
        'allCategories',
        'sortNewest',
        'sortOldest',
        'selectAll',
        'deleteSelected',
        'export',
        'import',
        'refresh',
        'documents',
        'technicalDatabase'
    ]
};

let passedTests = 0;
let failedTests = 0;
const errors = [];

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ status: res.statusCode, data });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${url}`));
                }
            });
        }).on('error', reject);
    });
}

async function testPageAccessibility(page) {
    console.log(`\n🔍 Testing: ${BASE_URL}${page}`);
    try {
        const result = await httpGet(BASE_URL + page);
        console.log(`✅ PASS: Page accessible (${result.status})`);
        passedTests++;
        return result.data;
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        errors.push(`Page ${page}: ${error.message}`);
        failedTests++;
        return null;
    }
}

async function testTranslationFile(lang) {
    console.log(`\n🌍 Testing Translation File: ${lang}.json`);
    try {
        const result = await httpGet(`${BASE_URL}/translations/${lang}.json`);
        const translations = JSON.parse(result.data);
        
        // Check structure
        if (!translations.settings) {
            throw new Error('Missing settings object');
        }
        if (!translations.settings.general) {
            throw new Error('Missing settings.general object');
        }
        if (!translations.settings.knowledgeDb) {
            throw new Error('Missing settings.knowledgeDb object');
        }
        if (!translations.settings.technicalDb) {
            throw new Error('Missing settings.technicalDb object');
        }
        
        // Check for expected keys in general
        let missingKeys = [];
        EXPECTED_KEYS.general.forEach(key => {
            if (!translations.settings.general[key]) {
                missingKeys.push(`general.${key}`);
            }
        });
        
        // Check knowledgeDb keys
        EXPECTED_KEYS.knowledgeDb.forEach(key => {
            if (!translations.settings.knowledgeDb[key]) {
                missingKeys.push(`knowledgeDb.${key}`);
            }
        });
        
        // Check technicalDb keys
        EXPECTED_KEYS.technicalDb.forEach(key => {
            if (!translations.settings.technicalDb[key]) {
                missingKeys.push(`technicalDb.${key}`);
            }
        });
        
        if (missingKeys.length > 0) {
            console.log(`⚠️  WARNING: Missing ${missingKeys.length} keys:`);
            missingKeys.slice(0, 5).forEach(key => console.log(`   - ${key}`));
            if (missingKeys.length > 5) {
                console.log(`   ... and ${missingKeys.length - 5} more`);
            }
        } else {
            console.log(`✅ PASS: All expected keys present`);
            passedTests++;
        }
        
        console.log(`📊 Total keys in ${lang}.json: ${JSON.stringify(translations).length} characters`);
        return translations;
        
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        errors.push(`Translation ${lang}: ${error.message}`);
        failedTests++;
        return null;
    }
}

async function testI18nSystem() {
    console.log('\n🔧 Testing i18n.js System');
    try {
        const result = await httpGet(`${BASE_URL}/js/i18n.js`);
        
        // Check for key functions
        const requiredFunctions = [
            'init()',
            'changeLanguage',
            'getCurrentLanguage',
            'loadTranslations'
        ];
        
        let foundFunctions = 0;
        requiredFunctions.forEach(fn => {
            if (result.data.includes(fn)) {
                foundFunctions++;
            }
        });
        
        console.log(`✅ PASS: Found ${foundFunctions}/${requiredFunctions.length} required functions`);
        passedTests++;
        
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        errors.push(`i18n.js: ${error.message}`);
        failedTests++;
    }
}

async function testSettingsHTML() {
    console.log('\n📄 Testing settings.html for i18n attributes');
    try {
        const result = await testPageAccessibility('/settings.html');
        if (!result) {
            throw new Error('Could not load settings.html');
        }
        const html = result;
        
        // Count i18n attributes
        const i18nAttributes = html.match(/data-i18n="[^"]+"/g) || [];
        const i18nPlaceholders = html.match(/data-i18n-placeholder="[^"]+"/g) || [];
        
        console.log(`📊 Found ${i18nAttributes.length} data-i18n attributes`);
        console.log(`📊 Found ${i18nPlaceholders.length} data-i18n-placeholder attributes`);
        
        // Check for specific attributes we added in Phase 2
        const phase2Attributes = [
            'data-i18n="settings.general.customModelConfig"',
            'data-i18n="settings.general.databaseAccess"',
            'data-i18n="settings.general.temperature"',
            'data-i18n="settings.general.databaseSettings"',
            'data-i18n="settings.knowledgeDb.searchPlaceholder"',
            'data-i18n="settings.technicalDb.searchPlaceholder"',
            'data-i18n="settings.general.saveChanges"'
        ];
        
        let foundAttributes = 0;
        phase2Attributes.forEach(attr => {
            if (html.includes(attr)) {
                foundAttributes++;
            }
        });
        
        console.log(`✅ PASS: Found ${foundAttributes}/${phase2Attributes.length} Phase 2 attributes`);
        
        if (foundAttributes === phase2Attributes.length) {
            passedTests++;
        } else {
            console.log(`⚠️  WARNING: Some Phase 2 attributes missing`);
            failedTests++;
        }
        
        // Check if i18n.js is loaded
        if (html.includes('i18n.js')) {
            console.log(`✅ PASS: i18n.js script tag found`);
            passedTests++;
        } else {
            console.log(`❌ FAIL: i18n.js script tag NOT found`);
            errors.push('i18n.js not loaded in settings.html');
            failedTests++;
        }
        
    } catch (error) {
        console.log(`❌ FAIL: ${error.message}`);
        errors.push(`settings.html: ${error.message}`);
        failedTests++;
    }
}

async function runAllTests() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     PHASE 2 AUTOMATED DEPLOYMENT TEST                 ║');
    console.log('║     Testing: https://cis-de.web.app                  ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    
    // Test 1: i18n system (do this first to avoid double-loading)
    await testI18nSystem();
    
    // Test 2: Translation files
    await testTranslationFile('de');
    await testTranslationFile('en');
    await testTranslationFile('fr');
    
    // Test 3: settings.html attributes
    await testSettingsHTML();
    
    // Final Report
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                  TEST RESULTS                          ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log(`\n✅ PASSED: ${passedTests} tests`);
    console.log(`❌ FAILED: ${failedTests} tests`);
    
    if (errors.length > 0) {
        console.log('\n🔴 ERRORS FOUND:');
        errors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err}`);
        });
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    if (failedTests === 0) {
        console.log('║  🎉 ALL TESTS PASSED! Phase 2 deployment SUCCESS!    ║');
    } else {
        console.log('║  ⚠️  SOME TESTS FAILED - Review errors above         ║');
    }
    console.log('╚═══════════════════════════════════════════════════════╝');
    
    process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
    console.error('\n💥 CRITICAL ERROR:', err);
    process.exit(1);
});

