/**
 * Internationalization (i18n) System for CIS-DE
 * Supports: Deutsch (de), English (en), Français (fr)
 */

class I18n {
    constructor() {
        this.currentLanguage = 'de'; // Default language
        this.translations = {};
        this.fallbackLanguage = 'de';
    }

    /**
     * Get language from cookie
     */
    getLanguageFromCookie() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'app_language') {
                return value;
            }
        }
        return this.fallbackLanguage;
    }

    /**
     * Set language cookie
     */
    setLanguageCookie(lang) {
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `app_language=${lang}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }

    /**
     * Load translation file for specified language
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`/translations/${lang}.json?v=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            this.translations = await response.json();
            this.currentLanguage = lang;
            console.log(`✅ Loaded translations for: ${lang}`);
            return true;
        } catch (error) {
            console.error(`❌ Error loading translations for ${lang}:`, error);
            // Fallback to default language if loading fails
            if (lang !== this.fallbackLanguage) {
                console.log(`🔄 Falling back to ${this.fallbackLanguage}...`);
                return await this.loadTranslations(this.fallbackLanguage);
            }
            return false;
        }
    }

    /**
     * Get translation by key path (e.g., "nav.dashboard")
     */
    t(keyPath, defaultValue = '') {
        const keys = keyPath.split('.');
        let value = this.translations;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                console.warn(`Translation key not found: ${keyPath}`);
                return defaultValue || keyPath;
            }
        }
        
        return value;
    }

    /**
     * Initialize i18n system
     */
    async init() {
        const lang = this.getLanguageFromCookie();
        console.log(`🌍 Initializing i18n with language: ${lang}`);
        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateLanguageDropdown();
    }

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        // Translate elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // For input elements, update placeholder
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                }
            } else {
                // For other elements, update text content
                // Use a safer method that preserves child elements
                if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                    // Only one text node - safe to replace
                    element.textContent = translation;
                } else if (element.childNodes.length === 0) {
                    // Empty element - safe to set
                    element.textContent = translation;
                } else {
                    // Has multiple children or complex structure - update only first text node
                    for (let i = 0; i < element.childNodes.length; i++) {
                        if (element.childNodes[i].nodeType === Node.TEXT_NODE) {
                            element.childNodes[i].textContent = translation;
                            break;
                        }
                    }
                }
            }
        });

        // Translate elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Translate elements with data-i18n-title attribute
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Translate elements with data-i18n-value attribute
        const valueElements = document.querySelectorAll('[data-i18n-value]');
        valueElements.forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            element.value = this.t(key);
        });

        console.log(`✅ Applied translations to ${elements.length} elements`);
    }

    /**
     * Update language dropdown to show current language
     */
    updateLanguageDropdown() {
        // Update settings page dropdown
        const settingsDropdown = document.getElementById('languageSetting');
        if (settingsDropdown) {
            settingsDropdown.value = this.currentLanguage;
            console.log(`✅ Updated settings language dropdown to: ${this.currentLanguage}`);
        }
        
        // Update navigation language selector
        const navSelector = document.getElementById('languageSelector');
        if (navSelector) {
            navSelector.value = this.currentLanguage;
            console.log(`✅ Updated nav language selector to: ${this.currentLanguage}`);
        }
    }

    /**
     * Change language and reload page
     */
    async changeLanguage(lang) {
        if (lang === this.currentLanguage) {
            console.log(`Language already set to ${lang}`);
            return;
        }

        console.log(`🔄 Changing language from ${this.currentLanguage} to ${lang}...`);
        
        // Save to cookie
        this.setLanguageCookie(lang);
        
        // Show notification
        const languageNames = {
            'de': 'Deutsch',
            'en': 'English',
            'fr': 'Français'
        };
        
        if (typeof window.showMessage === 'function') {
            window.showMessage(`${this.t('common.loading')} ${languageNames[lang]}...`, 'success');
        }
        
        // Reload page after short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return [
            { code: 'de', name: 'Deutsch' },
            { code: 'en', name: 'English' },
            { code: 'fr', name: 'Français' }
        ];
    }
}

// Create global i18n instance
window.i18n = new I18n();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n.init();
    });
} else {
    // DOM already loaded
    window.i18n.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}

