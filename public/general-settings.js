// General Settings Management System
// Handles all general settings functionality including persistence, validation, and UI updates

(function() {
    'use strict';
    
    // Default settings configuration
    const DEFAULT_SETTINGS = {
        language: 'de',
        timezone: 'Europe/Zurich',
        dateFormat: 'DD.MM.YYYY',
        notifications: false,
        debugMode: false,
        analytics: true,
        aiModel: {
            primary: 'gpt-4o-mini',
            customModel: {
                name: '',
                endpoint: '',
                apiKey: ''
            },
            temperature: 0.7,
            maxTokens: 2000,
            enableStreaming: true,
            saveChatHistory: true,
            unifiedWorkflow: false
        },
        databaseAccess: {
            knowledgeBase: true,
            technicalDatabase: true
        },
        systemPrompts: {
            chat: 'You are a helpful Cadillac EV Assistant. Provide accurate, friendly, and professional assistance about Cadillac electric vehicles.',
            troubleshooting: 'You are a technical support assistant for Cadillac EV vehicles. Help users diagnose and resolve technical issues.'
        },
        databaseSettings: {
            autoBackupInterval: 24, // hours
            maxFileSize: 10, // MB
            allowedFileTypes: ['pdf', 'txt', 'md', 'docx', 'xlsx'],
            enableDuplicateDetection: true,
            autoCategorization: true
        },
        apiSettings: {
            timeout: 30, // seconds
            rateLimit: 60, // requests per minute
            retryAttempts: 3
        },
        security: {
            sessionTimeout: 30, // minutes
            twoFactorAuth: false,
            activityLogging: true
        },
        performance: {
            cacheSize: 100, // MB
            lazyLoading: true,
            imageCompression: true
        }
    };
    
    // Available options for dropdowns
    const SETTINGS_OPTIONS = {
        languages: [
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' }
        ],
        timezones: [
            { value: 'Europe/Zurich', label: 'Europe/Zurich (GMT+1) - Schweiz' },
            { value: 'Europe/Berlin', label: 'Europe/Berlin (GMT+1) - Deutschland' },
            { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1) - Frankreich' },
            { value: 'Europe/London', label: 'Europe/London (GMT+0) - UK' },
            { value: 'America/New_York', label: 'America/New_York (GMT-5) - USA' },
            { value: 'UTC', label: 'UTC (GMT+0) - Universal' }
        ],
        dateFormats: [
            { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (26.10.2025)' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (10/26/2025)' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-10-26)' },
            { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (26-10-2025)' }
        ],
        aiModels: [
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Empfohlen)' },
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
            { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
            { value: 'custom', label: 'Custom Model' }
        ]
    };
    
    // Current settings state
    let currentSettings = { ...DEFAULT_SETTINGS };
    
    /**
     * Initialize the general settings system
     */
    function initGeneralSettings() {
        console.log('🔧 Initializing General Settings System...');
        
        // Load settings from storage
        loadSettings();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update UI with current settings
        updateSettingsUI();
        
        console.log('✅ General Settings System initialized');
    }
    
    /**
     * Load settings from localStorage and server
     */
    async function loadSettings() {
        try {
            // Load from localStorage first (for immediate UI update)
            const localSettings = localStorage.getItem('generalSettings');
            if (localSettings) {
                const parsed = JSON.parse(localSettings);
                currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
                console.log('📦 Loaded settings from localStorage:', currentSettings);
            }
            
            // Try to load from server
            try {
                const response = await fetch(`${window.API_BASE || '/api'}/settings/general`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    const serverSettings = await response.json();
                    currentSettings = { ...DEFAULT_SETTINGS, ...serverSettings };
                    console.log('🌐 Loaded settings from server:', currentSettings);
                    
                    // Save to localStorage for offline access
                    localStorage.setItem('generalSettings', JSON.stringify(currentSettings));
                }
            } catch (error) {
                console.log('⚠️ Could not load settings from server, using localStorage:', error.message);
            }
            
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            currentSettings = { ...DEFAULT_SETTINGS };
        }
    }
    
    /**
     * Save settings to localStorage and server
     */
    async function saveSettings(settings = currentSettings) {
        try {
            // Validate settings
            const validatedSettings = validateSettings(settings);
            
            // Save to localStorage immediately
            localStorage.setItem('generalSettings', JSON.stringify(validatedSettings));
            console.log('💾 Settings saved to localStorage:', validatedSettings);
            
            // Update current settings
            currentSettings = validatedSettings;
            
            // Try to save to server
            try {
                const response = await fetch(`${window.API_BASE || '/api'}/settings/general`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(validatedSettings)
                });
                
                if (response.ok) {
                    console.log('🌐 Settings saved to server successfully');
                } else {
                    console.warn('⚠️ Failed to save settings to server:', response.status);
                }
            } catch (error) {
                console.warn('⚠️ Could not save settings to server:', error.message);
            }
            
            // Apply settings to the application
            applySettings(validatedSettings);
            
            return true;
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            return false;
        }
    }
    
    /**
     * Validate settings object
     */
    function validateSettings(settings) {
        const validated = { ...DEFAULT_SETTINGS };
        
        // Validate language
        if (settings.language && SETTINGS_OPTIONS.languages.find(l => l.value === settings.language)) {
            validated.language = settings.language;
        }
        
        // Validate timezone
        if (settings.timezone && SETTINGS_OPTIONS.timezones.find(t => t.value === settings.timezone)) {
            validated.timezone = settings.timezone;
        }
        
        // Validate date format
        if (settings.dateFormat && SETTINGS_OPTIONS.dateFormats.find(d => d.value === settings.dateFormat)) {
            validated.dateFormat = settings.dateFormat;
        }
        
        // Validate boolean settings
        if (typeof settings.notifications === 'boolean') validated.notifications = settings.notifications;
        if (typeof settings.debugMode === 'boolean') validated.debugMode = settings.debugMode;
        if (typeof settings.analytics === 'boolean') validated.analytics = settings.analytics;
        
        // Validate AI model settings
        if (settings.aiModel) {
            if (settings.aiModel.primary && SETTINGS_OPTIONS.aiModels.find(m => m.value === settings.aiModel.primary)) {
                validated.aiModel.primary = settings.aiModel.primary;
            }
            if (settings.aiModel.customModel) {
                validated.aiModel.customModel = {
                    name: settings.aiModel.customModel.name || '',
                    endpoint: settings.aiModel.customModel.endpoint || '',
                    apiKey: settings.aiModel.customModel.apiKey || ''
                };
            }
            if (typeof settings.aiModel.temperature === 'number' && settings.aiModel.temperature >= 0 && settings.aiModel.temperature <= 2) {
                validated.aiModel.temperature = settings.aiModel.temperature;
            }
            if (typeof settings.aiModel.maxTokens === 'number' && settings.aiModel.maxTokens > 0) {
                validated.aiModel.maxTokens = settings.aiModel.maxTokens;
            }
            if (typeof settings.aiModel.enableStreaming === 'boolean') {
                validated.aiModel.enableStreaming = settings.aiModel.enableStreaming;
            }
            if (typeof settings.aiModel.saveChatHistory === 'boolean') {
                validated.aiModel.saveChatHistory = settings.aiModel.saveChatHistory;
            }
            if (typeof settings.aiModel.unifiedWorkflow === 'boolean') {
                validated.aiModel.unifiedWorkflow = settings.aiModel.unifiedWorkflow;
            }
        }
        
        // Validate database access
        if (settings.databaseAccess) {
            if (typeof settings.databaseAccess.knowledgeBase === 'boolean') {
                validated.databaseAccess.knowledgeBase = settings.databaseAccess.knowledgeBase;
            }
            if (typeof settings.databaseAccess.technicalDatabase === 'boolean') {
                validated.databaseAccess.technicalDatabase = settings.databaseAccess.technicalDatabase;
            }
        }
        
        // Validate system prompts
        if (settings.systemPrompts) {
            if (typeof settings.systemPrompts.chat === 'string') {
                validated.systemPrompts.chat = settings.systemPrompts.chat;
            }
            if (typeof settings.systemPrompts.troubleshooting === 'string') {
                validated.systemPrompts.troubleshooting = settings.systemPrompts.troubleshooting;
            }
        }
        
        return validated;
    }
    
    /**
     * Apply settings to the application
     */
    function applySettings(settings) {
        console.log('🎯 Applying settings to application:', settings);
        
        // Apply language
        if (settings.language !== currentSettings.language) {
            applyLanguage(settings.language);
        }
        
        // Apply timezone
        if (settings.timezone !== currentSettings.timezone) {
            applyTimezone(settings.timezone);
        }
        
        // Apply date format
        if (settings.dateFormat !== currentSettings.dateFormat) {
            applyDateFormat(settings.dateFormat);
        }
        
        // Apply notifications
        applyNotifications(settings.notifications);
        
        // Apply debug mode
        applyDebugMode(settings.debugMode);
        
        // Apply analytics
        applyAnalytics(settings.analytics);
        
        // Apply AI model settings
        applyAIModelSettings(settings.aiModel);
        
        // Apply database access settings
        applyDatabaseAccess(settings.databaseAccess);
        
        // Apply system prompts
        applySystemPrompts(settings.systemPrompts);
        
        // Update global settings reference
        window.generalSettings = settings;
    }
    
    /**
     * Apply language setting
     */
    function applyLanguage(language) {
        console.log('🌍 Applying language:', language);
        
        // Update document language
        document.documentElement.lang = language;
        
        // Trigger i18n update if available
        if (typeof window.updateLanguage === 'function') {
            window.updateLanguage(language);
        }
        
        // Update language dropdown
        const languageSelect = document.getElementById('languageSetting');
        if (languageSelect) {
            languageSelect.value = language;
        }
    }
    
    /**
     * Apply timezone setting
     */
    function applyTimezone(timezone) {
        console.log('🕐 Applying timezone:', timezone);
        
        // Update timezone dropdown
        const timezoneSelect = document.getElementById('timezoneSetting');
        if (timezoneSelect) {
            timezoneSelect.value = timezone;
        }
        
        // Update global timezone
        window.appTimezone = timezone;
    }
    
    /**
     * Apply date format setting
     */
    function applyDateFormat(dateFormat) {
        console.log('📅 Applying date format:', dateFormat);
        
        // Update date format dropdown
        const dateFormatSelect = document.getElementById('dateFormatSetting');
        if (dateFormatSelect) {
            dateFormatSelect.value = dateFormat;
        }
        
        // Update global date format
        window.appDateFormat = dateFormat;
    }
    
    /**
     * Apply notifications setting
     */
    function applyNotifications(enabled) {
        console.log('🔔 Applying notifications:', enabled);
        
        // Update notifications checkbox
        const notificationsCheckbox = document.getElementById('notificationsSetting');
        if (notificationsCheckbox) {
            notificationsCheckbox.checked = enabled;
        }
        
        // Request notification permission if enabled
        if (enabled && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Update global notifications setting
        window.notificationsEnabled = enabled;
    }
    
    /**
     * Apply debug mode setting
     */
    function applyDebugMode(enabled) {
        console.log('🐛 Applying debug mode:', enabled);
        
        // Update debug mode checkbox
        const debugModeCheckbox = document.getElementById('debugModeSetting');
        if (debugModeCheckbox) {
            debugModeCheckbox.checked = enabled;
        }
        
        // Update global debug mode
        window.debugMode = enabled;
        
        // Show/hide debug elements
        const debugElements = document.querySelectorAll('.debug-only');
        debugElements.forEach(el => {
            el.style.display = enabled ? 'block' : 'none';
        });
    }
    
    /**
     * Apply analytics setting
     */
    function applyAnalytics(enabled) {
        console.log('📊 Applying analytics:', enabled);
        
        // Update analytics checkbox
        const analyticsCheckbox = document.getElementById('analyticsSetting');
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = enabled;
        }
        
        // Update global analytics setting
        window.analyticsEnabled = enabled;
    }
    
    /**
     * Apply AI model settings
     */
    function applyAIModelSettings(aiModel) {
        console.log('🤖 Applying AI model settings:', aiModel);
        
        // Update primary model dropdown
        const primaryModelSelect = document.getElementById('primaryModelSetting');
        if (primaryModelSelect) {
            primaryModelSelect.value = aiModel.primary;
        }
        
        // Update custom model fields
        const customModelName = document.getElementById('customModelName');
        const customModelEndpoint = document.getElementById('customModelEndpoint');
        const customModelApiKey = document.getElementById('customModelApiKey');
        
        if (customModelName) customModelName.value = aiModel.customModel.name;
        if (customModelEndpoint) customModelEndpoint.value = aiModel.customModel.endpoint;
        if (customModelApiKey) customModelApiKey.value = aiModel.customModel.apiKey;
        
        // Update temperature slider
        const temperatureSlider = document.getElementById('temperatureSetting');
        if (temperatureSlider) {
            temperatureSlider.value = aiModel.temperature;
        }
        
        // Update max tokens input
        const maxTokensInput = document.getElementById('maxTokensSetting');
        if (maxTokensInput) {
            maxTokensInput.value = aiModel.maxTokens;
        }
        
        // Update checkboxes
        const streamingCheckbox = document.getElementById('streamingSetting');
        const chatHistoryCheckbox = document.getElementById('chatHistorySetting');
        const unifiedWorkflowCheckbox = document.getElementById('unifiedWorkflowSetting');
        
        if (streamingCheckbox) streamingCheckbox.checked = aiModel.enableStreaming;
        if (chatHistoryCheckbox) chatHistoryCheckbox.checked = aiModel.saveChatHistory;
        if (unifiedWorkflowCheckbox) unifiedWorkflowCheckbox.checked = aiModel.unifiedWorkflow;
        
        // Update global AI settings
        window.aiSettings = aiModel;
    }
    
    /**
     * Apply database access settings
     */
    function applyDatabaseAccess(databaseAccess) {
        console.log('🗄️ Applying database access settings:', databaseAccess);
        
        // Update checkboxes
        const kbAccessCheckbox = document.getElementById('kbAccessSetting');
        const tdAccessCheckbox = document.getElementById('tdAccessSetting');
        
        if (kbAccessCheckbox) kbAccessCheckbox.checked = databaseAccess.knowledgeBase;
        if (tdAccessCheckbox) tdAccessCheckbox.checked = databaseAccess.technicalDatabase;
        
        // Update global database access settings
        window.databaseAccess = databaseAccess;
    }
    
    /**
     * Apply system prompts
     */
    function applySystemPrompts(systemPrompts) {
        console.log('💬 Applying system prompts:', systemPrompts);
        
        // Update textareas
        const chatPromptTextarea = document.getElementById('chatSystemPromptSetting');
        const troubleshootingPromptTextarea = document.getElementById('troubleshootingSystemPromptSetting');
        
        if (chatPromptTextarea) chatPromptTextarea.value = systemPrompts.chat;
        if (troubleshootingPromptTextarea) troubleshootingPromptTextarea.value = systemPrompts.troubleshooting;
        
        // Update global system prompts
        window.systemPrompts = systemPrompts;
    }
    
    /**
     * Update the settings UI with current values
     */
    function updateSettingsUI() {
        console.log('🎨 Updating settings UI with current values');
        
        // Update all form elements with current settings
        const elements = {
            'languageSetting': currentSettings.language,
            'timezoneSetting': currentSettings.timezone,
            'dateFormatSetting': currentSettings.dateFormat,
            'notificationsSetting': currentSettings.notifications,
            'debugModeSetting': currentSettings.debugMode,
            'analyticsSetting': currentSettings.analytics,
            'primaryModelSetting': currentSettings.aiModel.primary,
            'customModelName': currentSettings.aiModel.customModel.name,
            'customModelEndpoint': currentSettings.aiModel.customModel.endpoint,
            'customModelApiKey': currentSettings.aiModel.customModel.apiKey,
            'temperatureSetting': currentSettings.aiModel.temperature,
            'maxTokensSetting': currentSettings.aiModel.maxTokens,
            'streamingSetting': currentSettings.aiModel.enableStreaming,
            'chatHistorySetting': currentSettings.aiModel.saveChatHistory,
            'unifiedWorkflowSetting': currentSettings.aiModel.unifiedWorkflow,
            'kbAccessSetting': currentSettings.databaseAccess.knowledgeBase,
            'tdAccessSetting': currentSettings.databaseAccess.technicalDatabase,
            'chatSystemPromptSetting': currentSettings.systemPrompts.chat,
            'troubleshootingSystemPromptSetting': currentSettings.systemPrompts.troubleshooting
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }
    
    /**
     * Set up event listeners for all settings controls
     */
    function setupEventListeners() {
        console.log('👂 Setting up event listeners for settings controls');
        
        // Language change
        const languageSelect = document.getElementById('languageSetting');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                currentSettings.language = e.target.value;
                saveSettings();
            });
        }
        
        // Timezone change
        const timezoneSelect = document.getElementById('timezoneSetting');
        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', (e) => {
                currentSettings.timezone = e.target.value;
                saveSettings();
            });
        }
        
        // Date format change
        const dateFormatSelect = document.getElementById('dateFormatSetting');
        if (dateFormatSelect) {
            dateFormatSelect.addEventListener('change', (e) => {
                currentSettings.dateFormat = e.target.value;
                saveSettings();
            });
        }
        
        // Notifications toggle
        const notificationsCheckbox = document.getElementById('notificationsSetting');
        if (notificationsCheckbox) {
            notificationsCheckbox.addEventListener('change', (e) => {
                currentSettings.notifications = e.target.checked;
                saveSettings();
            });
        }
        
        // Debug mode toggle
        const debugModeCheckbox = document.getElementById('debugModeSetting');
        if (debugModeCheckbox) {
            debugModeCheckbox.addEventListener('change', (e) => {
                currentSettings.debugMode = e.target.checked;
                saveSettings();
            });
        }
        
        // Analytics toggle
        const analyticsCheckbox = document.getElementById('analyticsSetting');
        if (analyticsCheckbox) {
            analyticsCheckbox.addEventListener('change', (e) => {
                currentSettings.analytics = e.target.checked;
                saveSettings();
            });
        }
        
        // AI Model settings
        const primaryModelSelect = document.getElementById('primaryModelSetting');
        if (primaryModelSelect) {
            primaryModelSelect.addEventListener('change', (e) => {
                currentSettings.aiModel.primary = e.target.value;
                saveSettings();
            });
        }
        
        // Custom model fields
        const customModelName = document.getElementById('customModelName');
        const customModelEndpoint = document.getElementById('customModelEndpoint');
        const customModelApiKey = document.getElementById('customModelApiKey');
        
        [customModelName, customModelEndpoint, customModelApiKey].forEach(element => {
            if (element) {
                element.addEventListener('input', () => {
                    if (customModelName) currentSettings.aiModel.customModel.name = customModelName.value;
                    if (customModelEndpoint) currentSettings.aiModel.customModel.endpoint = customModelEndpoint.value;
                    if (customModelApiKey) currentSettings.aiModel.customModel.apiKey = customModelApiKey.value;
                    saveSettings();
                });
            }
        });
        
        // Temperature slider
        const temperatureSlider = document.getElementById('temperatureSetting');
        if (temperatureSlider) {
            temperatureSlider.addEventListener('input', (e) => {
                currentSettings.aiModel.temperature = parseFloat(e.target.value);
                saveSettings();
            });
        }
        
        // Max tokens input
        const maxTokensInput = document.getElementById('maxTokensSetting');
        if (maxTokensInput) {
            maxTokensInput.addEventListener('input', (e) => {
                currentSettings.aiModel.maxTokens = parseInt(e.target.value) || 2000;
                saveSettings();
            });
        }
        
        // AI Model checkboxes
        const streamingCheckbox = document.getElementById('streamingSetting');
        const chatHistoryCheckbox = document.getElementById('chatHistorySetting');
        const unifiedWorkflowCheckbox = document.getElementById('unifiedWorkflowSetting');
        
        [streamingCheckbox, chatHistoryCheckbox, unifiedWorkflowCheckbox].forEach(element => {
            if (element) {
                element.addEventListener('change', (e) => {
                    if (element === streamingCheckbox) currentSettings.aiModel.enableStreaming = e.target.checked;
                    if (element === chatHistoryCheckbox) currentSettings.aiModel.saveChatHistory = e.target.checked;
                    if (element === unifiedWorkflowCheckbox) currentSettings.aiModel.unifiedWorkflow = e.target.checked;
                    saveSettings();
                });
            }
        });
        
        // Database access checkboxes
        const kbAccessCheckbox = document.getElementById('kbAccessSetting');
        const tdAccessCheckbox = document.getElementById('tdAccessSetting');
        
        [kbAccessCheckbox, tdAccessCheckbox].forEach(element => {
            if (element) {
                element.addEventListener('change', (e) => {
                    if (element === kbAccessCheckbox) currentSettings.databaseAccess.knowledgeBase = e.target.checked;
                    if (element === tdAccessCheckbox) currentSettings.databaseAccess.technicalDatabase = e.target.checked;
                    saveSettings();
                });
            }
        });
        
        // System prompts
        const chatPromptTextarea = document.getElementById('chatSystemPromptSetting');
        const troubleshootingPromptTextarea = document.getElementById('troubleshootingSystemPromptSetting');
        
        [chatPromptTextarea, troubleshootingPromptTextarea].forEach(element => {
            if (element) {
                element.addEventListener('input', (e) => {
                    if (element === chatPromptTextarea) currentSettings.systemPrompts.chat = e.target.value;
                    if (element === troubleshootingPromptTextarea) currentSettings.systemPrompts.troubleshooting = e.target.value;
                    saveSettings();
                });
            }
        });
    }
    
    // Global functions for settings management
    window.saveGeneralSettings = function() {
        console.log('💾 Saving general settings...');
        return saveSettings();
    };
    
    window.resetGeneralSettings = function() {
        console.log('🔄 Resetting general settings...');
        if (typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog('Möchten Sie alle Einstellungen zurücksetzen?', () => {
                currentSettings = { ...DEFAULT_SETTINGS };
                saveSettings();
                updateSettingsUI();
                window.showMessage('Einstellungen zurückgesetzt', 'success');
                setTimeout(() => location.reload(), 1000);
            });
        } else {
            currentSettings = { ...DEFAULT_SETTINGS };
            saveSettings();
            updateSettingsUI();
            window.showMessage('Einstellungen zurückgesetzt', 'success');
        }
    };
    
    window.getGeneralSettings = function() {
        return { ...currentSettings };
    };
    
    window.updateGeneralSettings = function(newSettings) {
        currentSettings = { ...currentSettings, ...newSettings };
        return saveSettings();
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGeneralSettings);
    } else {
        initGeneralSettings();
    }
    
    console.log('🔧 General Settings System loaded');
    
})();
