// Cadillac EV Assistant - Simplified Version
// Version: 4.1.0 - KNOWLEDGE BASE RESTORED

// API Base URL
const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

// Cache busting version
const APP_VERSION = '4.1.0-KNOWLEDGE-BASE-RESTORED';
console.log('🚀 Cadillac EV Assistant v' + APP_VERSION + ' loaded - KNOWLEDGE BASE RESTORED');

// Test if JavaScript is working
console.log('✅ JavaScript is executing properly');

// Global variables
let currentChatId = null;
let currentThreadId = null;
let isProcessingMessage = false;
let systemSettings = {
    welcomeTitle: 'Cadillac EV Assistant',
    welcomeSubtitle: 'Ihr persoenlicher Assistent fuer Cadillac Elektrofahrzeuge',
    brandText: 'Cadillac EV',
    logo: null
};

// Make systemSettings globally accessible
window.systemSettings = systemSettings;

// Define toggleTheme function early to ensure it's available immediately
window.toggleTheme = async function() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('🎨 Theme toggle clicked! Current:', currentTheme, '→ New:', newTheme);
        
        // Save theme to localStorage FIRST for immediate persistence
        try {
            localStorage.setItem('theme', newTheme);
            console.log('✅ Theme saved to localStorage:', newTheme);
        } catch (e) {
            console.error('❌ Error saving to localStorage:', e);
        }
        
        // Apply theme to html and body
        document.documentElement.setAttribute('data-theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
        
        // Apply theme to all page containers
        const pageContainers = document.querySelectorAll('.page, .dashboard-container, .troubleshooting-container, .settings-page, .chat-container');
        pageContainers.forEach(container => {
            container.setAttribute('data-theme', newTheme);
        });
        
        // Update theme toggle button appearance
        updateThemeToggle(newTheme);
        
        // Save theme to database (non-blocking, don't wait for it)
        (async () => {
            try {
                const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/branding');
                if (response.ok) {
                    const data = await response.json();
                    const settings = data.branding || {};
                    settings.theme = newTheme;
                    
                    // Save updated settings
                    await fetch('https://us-central1-cis-de.cloudfunctions.net/branding', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(settings)
                    });
                    
                    console.log('✅ Theme saved to database:', newTheme);
                }
            } catch (error) {
                console.error('Error saving theme to database:', error);
            }
        })();
        
        console.log('✅ Theme switched to:', newTheme);
    } catch (error) {
        console.error('❌ Error in toggleTheme:', error);
    }
};

// Define updateThemeToggle function early
function updateThemeToggle(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (theme === 'dark') {
            themeToggle.setAttribute('data-theme', 'dark');
        } else {
            themeToggle.setAttribute('data-theme', 'light');
        }
    }
}

// Make updateThemeToggle globally accessible
window.updateThemeToggle = updateThemeToggle;

// Ensure functions are immediately available
console.log('🎨 Theme functions defined:', {
    toggleTheme: typeof window.toggleTheme,
    updateThemeToggle: typeof window.updateThemeToggle
});

// Immediate theme initialization
(function() {
    console.log('🎨 Immediate theme initialization...');
    
    // Initialize theme from localStorage immediately
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    
    // Apply theme to all page containers
    const pageContainers = document.querySelectorAll('.page, .dashboard-container, .troubleshooting-container, .settings-page, .chat-container');
    pageContainers.forEach(container => {
        container.setAttribute('data-theme', savedTheme);
    });
    
    console.log('✅ Theme initialized immediately:', savedTheme);
})();

// Branding functions
function initBrandingSystem() {
    console.log('🎨 Initializing branding system...');
    
    // Load current branding settings
    loadBrandingSettings();
    
    // Setup event listeners with multiple retry attempts
    let retryCount = 0;
    const maxRetries = 15;
    
    function attemptSetup() {
        console.log(`🔧 Setting up branding event listeners (attempt ${retryCount + 1}/${maxRetries})...`);
        
        const logoUpload = document.getElementById('logoUpload');
        const saveBtn = document.getElementById('saveBrandingBtn');
        const brandText = document.getElementById('brandText');
        const welcomeTitle = document.getElementById('welcomeTitle');
        const welcomeSubtitle = document.getElementById('welcomeSubtitle');
        const pageTitle = document.getElementById('pageTitle');
        const primaryColor = document.getElementById('primaryColor');
        const secondaryColor = document.getElementById('secondaryColor');
        const showLogoInNav = document.getElementById('showLogoInNav');
        const showWelcomeMessage = document.getElementById('showWelcomeMessage');
        const enableAnimations = document.getElementById('enableAnimations');
        
        console.log('🔍 Element check:', {
            logoUpload: !!logoUpload,
            saveBtn: !!saveBtn,
            brandText: !!brandText,
            welcomeTitle: !!welcomeTitle,
            welcomeSubtitle: !!welcomeSubtitle,
            pageTitle: !!pageTitle,
            primaryColor: !!primaryColor,
            secondaryColor: !!secondaryColor,
            showLogoInNav: !!showLogoInNav,
            showWelcomeMessage: !!showWelcomeMessage,
            enableAnimations: !!enableAnimations
        });
        
        // Check if we're on the settings page or if we have the required elements
        const isSettingsPage = window.location.pathname.includes('settings.html');
        console.log('📍 Current page:', window.location.pathname, 'Is settings page:', isSettingsPage);
        
        if (logoUpload && (isSettingsPage || brandText)) {
            console.log('✅ Core elements found, setting up listeners...');
            try {
                setupBrandingEventListeners();
                setupAdvancedBrandingEventListeners();
                updateAdvancedBrandingUI();
                updateLogoPreview();
                updateLogoInNavigation();
                console.log('✅ Branding system setup complete');
                return; // Success, exit retry loop
            } catch (error) {
                console.error('❌ Error setting up branding listeners:', error);
            }
        } else {
            retryCount++;
            if (retryCount < maxRetries) {
                console.warn(`⚠️ Some elements not found, retrying in ${retryCount * 150}ms...`);
                setTimeout(attemptSetup, retryCount * 150);
            } else {
                console.error('❌ Failed to setup branding system after', maxRetries, 'attempts');
                console.error('Missing elements:', {
                    logoUpload: !!logoUpload,
                    saveBtn: !!saveBtn,
                    brandText: !!brandText
                });
                
        // Try to setup what we can
        if (logoUpload) {
            console.log('🔧 Setting up partial branding system...');
            try {
                setupBrandingEventListeners();
                // Force update logo preview even if other elements are missing
                updateLogoPreview();
                updateLogoInNavigation();
            } catch (error) {
                console.error('❌ Error setting up partial branding system:', error);
            }
        }
            }
        }
    }
    
    // Start immediately and also after a single delay to catch dynamically loaded elements
    attemptSetup();
    setTimeout(attemptSetup, 500);
}

// Legacy function - redirects to initBrandingSystem
window.initBranding = function() {
    console.log('🎨 Legacy initBranding called...');
    initBrandingSystem();
}

async function loadBrandingSettings() {
    console.log('🔄 Loading branding settings from database...');
    
    // Load from database
    try {
        const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/branding');
        if (response.ok) {
            const result = await response.json();
            const settings = result.branding || {};
            console.log('📦 Loaded settings from database:', settings);
            systemSettings = { ...systemSettings, ...settings };
            console.log('🔧 Updated systemSettings:', systemSettings);
            
            // Update UI
            updateBrandingUI();
            updateAdvancedBrandingUI();
            updateLogoInNavigation();
            
            // Apply branding to entire site
            applyBrandingToEntireSite();
            
            console.log('✅ Branding settings loaded from database');
        } else {
            console.log('ℹ️ No branding settings found in database');
        }
    } catch (error) {
        console.error('❌ Error loading branding settings from database:', error);
    }
    
    // Also try to load from server
    loadSystemSettings();
}

// Apply branding to entire site
function applyBrandingToEntireSite() {
    console.log('🌐 Applying branding to entire site...');
    
    if (!systemSettings) {
        console.log('⚠️ systemSettings not available, skipping branding application');
        return;
    }
    
    // Reset the flag to allow reapplication if needed
    window.brandingApplied = false;
    
    // Update page title
    if (systemSettings.pageTitle) {
        document.title = systemSettings.pageTitle;
        console.log('✅ Page title updated:', systemSettings.pageTitle);
    }
    
    // Update brand text in navigation
    if (systemSettings.brandText) {
        const brandElements = document.querySelectorAll('.nav-brand, .brand-text, .navbar-brand');
        brandElements.forEach(element => {
            element.textContent = systemSettings.brandText;
            console.log('✅ Brand text updated in navigation');
        });
    }
    
    // Update logo in navigation
    if (systemSettings.logo) {
        const navLogoSelectors = [
            '.nav-logo img',
            '.nav-brand img', 
            '#navLogo img',
            '.navbar-brand img',
            'header img'
        ];
        
        navLogoSelectors.forEach(selector => {
            const navLogo = document.querySelector(selector);
            if (navLogo) {
                navLogo.src = systemSettings.logo;
                // Set background transparency based on setting
                const container = navLogo.closest('.nav-brand-icon');
                if (container) {
                    container.style.background = systemSettings.logoBackgroundTransparent ? 'transparent' : '#2d2d2d';
                }
                console.log('✅ Navigation logo updated via', selector);
            }
        });
    }
    
    // Apply color scheme
    if (systemSettings.primaryColor || systemSettings.secondaryColor) {
        applyColorSchemeToSite(systemSettings.primaryColor, systemSettings.secondaryColor);
    }
    
    console.log('✅ Branding applied to entire site');
}

// Apply color scheme to entire site
function applyColorSchemeToSite(primaryColor, secondaryColor) {
    console.log('🎨 Applying color scheme to site...');
    
    if (primaryColor) {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        console.log('✅ Primary color applied:', primaryColor);
    }
    
    if (secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        console.log('✅ Secondary color applied:', secondaryColor);
    }
}

function updateBrandingUI() {
    // Update navigation brand text
    const navBrandText = document.getElementById('navBrandText');
    if (navBrandText && systemSettings.brandText) {
        navBrandText.textContent = systemSettings.brandText;
    }
    
    // Update branding form fields
    const brandTextInput = document.getElementById('brandText');
    const welcomeTitleInput = document.getElementById('welcomeTitle');
    const welcomeSubtitleInput = document.getElementById('welcomeSubtitle');
    
    if (brandTextInput) brandTextInput.value = systemSettings.brandText || 'Cadillac EV';
    if (welcomeTitleInput) welcomeTitleInput.value = systemSettings.welcomeTitle || 'Cadillac EV Assistant';
    if (welcomeSubtitleInput) welcomeSubtitleInput.value = systemSettings.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge';
    
    // Update logo preview
    updateLogoPreview();
}

function updateLogoPreview() {
    const logoPreview = document.getElementById('logoPreview');
    if (logoPreview) {
        console.log('🖼️ Updating logo preview, current logo:', systemSettings.logo ? 'exists' : 'null');
        if (systemSettings.logo) {
            logoPreview.innerHTML = `<img src="${systemSettings.logo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;">`;
            console.log('✅ Logo image set');
        } else {
            logoPreview.innerHTML = systemSettings.brandText ? systemSettings.brandText.charAt(0) : 'C';
            console.log('✅ Logo text set:', systemSettings.brandText ? systemSettings.brandText.charAt(0) : 'C');
        }
    } else {
        console.error('❌ Logo preview element not found');
    }
}

function setupBrandingEventListeners() {
    console.log('🔧 Setting up branding event listeners...');
    
    // Remove existing listeners to prevent duplicates
    const logoUpload = document.getElementById('logoUpload');
    const saveBrandingBtn = document.getElementById('saveBrandingBtn');
    const brandTextInput = document.getElementById('brandText');
    const welcomeTitleInput = document.getElementById('welcomeTitle');
    const welcomeSubtitleInput = document.getElementById('welcomeSubtitle');
    const pageTitleInput = document.getElementById('pageTitle');
    
    // Logo upload
    if (logoUpload) {
        console.log('✅ Logo upload element found');
        // Remove existing listener if any
        logoUpload.removeEventListener('change', handleLogoUpload);
        logoUpload.addEventListener('change', handleLogoUpload);
        console.log('✅ Logo upload listener added');
    } else {
        console.error('❌ Logo upload element not found');
    }
    
    // Save branding button
    if (saveBrandingBtn) {
        console.log('✅ Save button element found');
        // Remove existing listener if any
        saveBrandingBtn.removeEventListener('click', saveBrandingSettings);
        saveBrandingBtn.addEventListener('click', saveBrandingSettings);
        console.log('✅ Save button listener added');
    } else {
        console.error('❌ Save button element not found');
    }
    
    // Real-time updates for text fields
    if (brandTextInput) {
        console.log('✅ Brand text element found');
        brandTextInput.addEventListener('input', function() {
            console.log('📝 Brand text changed:', this.value);
            systemSettings.brandText = this.value;
            updateBrandingUI();
            updateLogoPreview();
            updateLogoInNavigation();
        });
        console.log('✅ Brand text listener added');
    } else {
        console.error('❌ Brand text element not found');
    }
    
    if (welcomeTitleInput) {
        console.log('✅ Welcome title element found');
        welcomeTitleInput.addEventListener('input', function() {
            console.log('📝 Welcome title changed:', this.value);
            systemSettings.welcomeTitle = this.value;
        });
        console.log('✅ Welcome title listener added');
    } else {
        console.error('❌ Welcome title element not found');
    }
    
    if (welcomeSubtitleInput) {
        console.log('✅ Welcome subtitle element found');
        welcomeSubtitleInput.addEventListener('input', function() {
            console.log('📝 Welcome subtitle changed:', this.value);
            systemSettings.welcomeSubtitle = this.value;
        });
        console.log('✅ Welcome subtitle listener added');
    } else {
        console.error('❌ Welcome subtitle element not found');
    }
    
    if (pageTitleInput) {
        console.log('✅ Page title element found');
        pageTitleInput.addEventListener('input', function() {
            console.log('📝 Page title changed:', this.value);
            systemSettings.pageTitle = this.value;
            document.title = this.value;
        });
        console.log('✅ Page title listener added');
    } else {
        console.error('❌ Page title element not found');
    }
    
    console.log('✅ Branding event listeners setup complete');
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        console.log('❌ No file selected');
        return;
    }
    
    console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', file.type);
        showMessage('Bitte wählen Sie eine Bilddatei aus', 'error');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        console.error('❌ File too large:', file.size);
        showMessage('Datei ist zu groß. Maximal 2MB erlaubt.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        console.log('📖 File read successfully, setting logo...');
        systemSettings.logo = e.target.result;
        console.log('💾 Logo set in systemSettings:', systemSettings.logo ? 'exists' : 'null');
        
        // Update UI immediately
        updateLogoPreview();
        updateLogoInNavigation();
        
        // Save to database
        try {
            const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/branding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(systemSettings)
            });
            
            if (response.ok) {
                console.log('💾 Logo saved to database');
                showMessage('Logo erfolgreich hochgeladen', 'success');
            } else {
                throw new Error('Failed to save logo to database');
            }
        } catch (error) {
            console.error('Error saving logo to database:', error);
            showMessage('Fehler beim Speichern des Logos', 'error');
        }
    };
    
    reader.onerror = function(error) {
        console.error('❌ Error reading file:', error);
        showMessage('Fehler beim Lesen der Datei', 'error');
    };
    
    reader.readAsDataURL(file);
}

async function saveBrandingSettings() {
    const saveBtn = document.getElementById('saveBrandingBtn');
    const successMsg = document.getElementById('brandingSuccess');
    
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Speichere...';
    }
    
    try {
        // Save to database
        const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/branding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(systemSettings)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save branding settings to database');
        }
        
        // Update global reference
        window.systemSettings = systemSettings;
        
        // Update UI
        updateBrandingUI();
        
        // Show success message
        if (successMsg) {
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
        
        showMessage('Branding-Einstellungen erfolgreich gespeichert', 'success');
        
        console.log('✅ Branding settings saved:', systemSettings);
        
    } catch (error) {
        console.error('❌ Error saving branding settings:', error);
        showMessage('Fehler beim Speichern der Einstellungen', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Änderungen speichern';
        }
    }
}

// Additional branding functions
function resetLogo() {
    systemSettings.logo = null;
    updateLogoPreview();
    showMessage('Logo zurückgesetzt', 'success');
}

async function resetAllBranding() {
    if (await showConfirmation('Möchten Sie wirklich alle Branding-Einstellungen zurücksetzen?')) {
        systemSettings = {
            welcomeTitle: 'Cadillac EV Assistant',
            welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
            brandText: 'Cadillac EV',
            logo: null,
            pageTitle: 'Cadillac EV Assistant',
            primaryColor: '#3b82f6',
            secondaryColor: '#6b7280',
            showLogoInNav: true,
            showWelcomeMessage: true,
            enableAnimations: true
        };
        
        updateBrandingUI();
        updateAdvancedBrandingUI();
        showMessage('Alle Branding-Einstellungen zurückgesetzt', 'success');
    }
}

function exportBranding() {
    const brandingData = {
        ...systemSettings,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(brandingData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `branding-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Branding-Einstellungen exportiert', 'success');
}

function importBranding(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate imported data
            if (importedData.version && importedData.brandText) {
                systemSettings = { ...systemSettings, ...importedData };
                updateBrandingUI();
                updateAdvancedBrandingUI();
                showMessage('Branding-Einstellungen erfolgreich importiert', 'success');
            } else {
                showMessage('Ungültige Branding-Datei', 'error');
            }
        } catch (error) {
            console.error('Error importing branding:', error);
            showMessage('Fehler beim Importieren der Datei', 'error');
        }
    };
    reader.readAsText(file);
}

function updateAdvancedBrandingUI() {
    // Update page title
    const pageTitleInput = document.getElementById('pageTitle');
    if (pageTitleInput) {
        pageTitleInput.value = systemSettings.pageTitle || 'Cadillac EV Assistant';
    }
    
    // Update color inputs
    const primaryColorInput = document.getElementById('primaryColor');
    const primaryColorTextInput = document.getElementById('primaryColorText');
    const secondaryColorInput = document.getElementById('secondaryColor');
    const secondaryColorTextInput = document.getElementById('secondaryColorText');
    
    if (primaryColorInput) primaryColorInput.value = systemSettings.primaryColor || '#3b82f6';
    if (primaryColorTextInput) primaryColorTextInput.value = systemSettings.primaryColor || '#3b82f6';
    if (secondaryColorInput) secondaryColorInput.value = systemSettings.secondaryColor || '#6b7280';
    if (secondaryColorTextInput) secondaryColorTextInput.value = systemSettings.secondaryColor || '#6b7280';
    
    // Update checkboxes
    const showLogoInNavCheckbox = document.getElementById('showLogoInNav');
    const showWelcomeMessageCheckbox = document.getElementById('showWelcomeMessage');
    const enableAnimationsCheckbox = document.getElementById('enableAnimations');
    
    if (showLogoInNavCheckbox) showLogoInNavCheckbox.checked = systemSettings.showLogoInNav !== false;
    if (showWelcomeMessageCheckbox) showWelcomeMessageCheckbox.checked = systemSettings.showWelcomeMessage !== false;
    if (enableAnimationsCheckbox) enableAnimationsCheckbox.checked = systemSettings.enableAnimations !== false;
}

function setupAdvancedBrandingEventListeners() {
    console.log('🔧 Setting up advanced branding event listeners...');
    
    // Page title
    const pageTitleInput = document.getElementById('pageTitle');
    if (pageTitleInput) {
        console.log('✅ Page title listener added');
        pageTitleInput.addEventListener('input', function() {
            systemSettings.pageTitle = this.value;
            document.title = this.value;
        });
    } else {
        console.error('❌ Page title element not found');
    }
    
    // Color inputs
    const primaryColorInput = document.getElementById('primaryColor');
    const primaryColorTextInput = document.getElementById('primaryColorText');
    const secondaryColorInput = document.getElementById('secondaryColor');
    const secondaryColorTextInput = document.getElementById('secondaryColorText');
    
    if (primaryColorInput && primaryColorTextInput) {
        console.log('✅ Primary color listeners added');
        primaryColorInput.addEventListener('input', function() {
            primaryColorTextInput.value = this.value;
            systemSettings.primaryColor = this.value;
            applyColorScheme();
        });
        
        primaryColorTextInput.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                primaryColorInput.value = this.value;
                systemSettings.primaryColor = this.value;
                applyColorScheme();
            }
        });
    } else {
        console.error('❌ Primary color elements not found');
    }
    
    if (secondaryColorInput && secondaryColorTextInput) {
        console.log('✅ Secondary color listeners added');
        secondaryColorInput.addEventListener('input', function() {
            secondaryColorTextInput.value = this.value;
            systemSettings.secondaryColor = this.value;
            applyColorScheme();
        });
        
        secondaryColorTextInput.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                secondaryColorInput.value = this.value;
                systemSettings.secondaryColor = this.value;
                applyColorScheme();
            }
        });
    } else {
        console.error('❌ Secondary color elements not found');
    }
    
    // Checkboxes
    const showLogoInNavCheckbox = document.getElementById('showLogoInNav');
    const showWelcomeMessageCheckbox = document.getElementById('showWelcomeMessage');
    const enableAnimationsCheckbox = document.getElementById('enableAnimations');
    
    if (showLogoInNavCheckbox) {
        console.log('✅ Show logo in nav checkbox listener added');
        showLogoInNavCheckbox.addEventListener('change', function() {
            systemSettings.showLogoInNav = this.checked;
            updateLogoInNavigation();
        });
    } else {
        console.error('❌ Show logo in nav checkbox not found');
    }
    
    if (showWelcomeMessageCheckbox) {
        console.log('✅ Show welcome message checkbox listener added');
        showWelcomeMessageCheckbox.addEventListener('change', function() {
            systemSettings.showWelcomeMessage = this.checked;
        });
    } else {
        console.error('❌ Show welcome message checkbox not found');
    }
    
    if (enableAnimationsCheckbox) {
        console.log('✅ Enable animations checkbox listener added');
        enableAnimationsCheckbox.addEventListener('change', function() {
            systemSettings.enableAnimations = this.checked;
            document.body.style.transition = this.checked ? 'all 0.3s ease' : 'none';
        });
    } else {
        console.error('❌ Enable animations checkbox not found');
    }
    
    // Import functionality
    const importBrandingInput = document.getElementById('importBranding');
    if (importBrandingInput) {
        console.log('✅ Import branding listener added');
        importBrandingInput.addEventListener('change', importBranding);
    } else {
        console.error('❌ Import branding input not found');
    }
    
    console.log('✅ Advanced branding event listeners setup complete');
}

function applyColorScheme() {
    if (systemSettings.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', systemSettings.primaryColor);
    }
    if (systemSettings.secondaryColor) {
        document.documentElement.style.setProperty('--secondary-color', systemSettings.secondaryColor);
    }
}

function updateLogoInNavigation() {
    const navLogo = document.getElementById('navLogo');
    const navBrandText = document.getElementById('navBrandText');
    
    if (systemSettings.showLogoInNav && systemSettings.logo) {
        if (navLogo) {
            navLogo.innerHTML = `<img src="${systemSettings.logo}" alt="Logo" style="width: 32px; height: 32px; object-fit: contain;">`;
            navLogo.style.background = systemSettings.logoBackgroundTransparent ? 'transparent' : '#2d2d2d';
        }
    } else {
        if (navLogo) {
            navLogo.textContent = systemSettings.brandText ? systemSettings.brandText.charAt(0) : 'C';
            navLogo.style.background = '#2d2d2d';
        }
    }
}

// Debug function for logo issues
function debugLogo() {
    console.log('🔍 Logo Debug Information:');
    console.log('systemSettings.logo:', systemSettings.logo ? 'exists' : 'null');
    console.log('logoPreview element:', document.getElementById('logoPreview'));
    console.log('navLogo element:', document.getElementById('navLogo'));
    
    const logoPreview = document.getElementById('logoPreview');
    if (logoPreview) {
        console.log('logoPreview.innerHTML:', logoPreview.innerHTML);
    }
}

// Debug function for all branding elements
function debugBranding() {
    console.log('🔍 Branding Debug Information:');
    console.log('=== Elements Check ===');
    console.log('logoUpload:', document.getElementById('logoUpload') ? '✅' : '❌');
    console.log('saveBrandingBtn:', document.getElementById('saveBrandingBtn') ? '✅' : '❌');
    console.log('brandText:', document.getElementById('brandText') ? '✅' : '❌');
    console.log('welcomeTitle:', document.getElementById('welcomeTitle') ? '✅' : '❌');
    console.log('welcomeSubtitle:', document.getElementById('welcomeSubtitle') ? '✅' : '❌');
    console.log('pageTitle:', document.getElementById('pageTitle') ? '✅' : '❌');
    console.log('primaryColor:', document.getElementById('primaryColor') ? '✅' : '❌');
    console.log('secondaryColor:', document.getElementById('secondaryColor') ? '✅' : '❌');
    console.log('showLogoInNav:', document.getElementById('showLogoInNav') ? '✅' : '❌');
    console.log('showWelcomeMessage:', document.getElementById('showWelcomeMessage') ? '✅' : '❌');
    console.log('enableAnimations:', document.getElementById('enableAnimations') ? '✅' : '❌');
    console.log('importBranding:', document.getElementById('importBranding') ? '✅' : '❌');
    
    console.log('=== Current Settings ===');
    console.log('systemSettings:', systemSettings);
    
    console.log('=== Event Listeners Test ===');
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        console.log('Logo upload has listeners:', logoUpload.onchange ? '✅' : '❌');
    }
}

// Test function to simulate all branding functions
function testBrandingFunctions() {
    console.log('🧪 Testing all branding functions...');
    
    // Test 1: Change brand text
    const brandTextInput = document.getElementById('brandText');
    if (brandTextInput) {
        brandTextInput.value = 'Test Brand ' + Date.now();
        brandTextInput.dispatchEvent(new Event('input'));
        console.log('✅ Brand text test completed');
    } else {
        console.error('❌ Brand text input not found');
    }
    
    // Test 2: Change welcome title
    const welcomeTitleInput = document.getElementById('welcomeTitle');
    if (welcomeTitleInput) {
        welcomeTitleInput.value = 'Test Welcome Title ' + Date.now();
        welcomeTitleInput.dispatchEvent(new Event('input'));
        console.log('✅ Welcome title test completed');
    } else {
        console.error('❌ Welcome title input not found');
    }
    
    // Test 3: Change primary color
    const primaryColorInput = document.getElementById('primaryColor');
    if (primaryColorInput) {
        primaryColorInput.value = '#ff0000';
        primaryColorInput.dispatchEvent(new Event('input'));
        console.log('✅ Primary color test completed');
    } else {
        console.error('❌ Primary color input not found');
    }
    
    // Test 4: Toggle checkboxes
    const showLogoInNavCheckbox = document.getElementById('showLogoInNav');
    if (showLogoInNavCheckbox) {
        showLogoInNavCheckbox.checked = !showLogoInNavCheckbox.checked;
        showLogoInNavCheckbox.dispatchEvent(new Event('change'));
        console.log('✅ Show logo in nav test completed');
    } else {
        console.error('❌ Show logo in nav checkbox not found');
    }
    
    // Test 5: Test logo upload (simulate file selection)
    const logoUpload = document.getElementById('logoUpload');
    if (logoUpload) {
        console.log('✅ Logo upload element found for testing');
        // Note: We can't actually simulate file upload in this context
    } else {
        console.error('❌ Logo upload element not found');
    }
    
    // Test 6: Save settings
    setTimeout(() => {
        try {
            saveBrandingSettings();
            console.log('✅ Save settings test completed');
        } catch (error) {
            console.error('❌ Save settings test failed:', error);
        }
    }, 1000);
    
    console.log('✅ All branding function tests completed');
}

// Simple test function to verify branding system
function testBrandingSystem() {
    console.log('🧪 Testing branding system...');
    
    // Check if all elements exist
    const elements = {
        logoUpload: document.getElementById('logoUpload'),
        saveBrandingBtn: document.getElementById('saveBrandingBtn'),
        brandText: document.getElementById('brandText'),
        welcomeTitle: document.getElementById('welcomeTitle'),
        welcomeSubtitle: document.getElementById('welcomeSubtitle'),
        pageTitle: document.getElementById('pageTitle'),
        primaryColor: document.getElementById('primaryColor'),
        secondaryColor: document.getElementById('secondaryColor'),
        showLogoInNav: document.getElementById('showLogoInNav'),
        showWelcomeMessage: document.getElementById('showWelcomeMessage'),
        enableAnimations: document.getElementById('enableAnimations')
    };
    
    console.log('🔍 Element availability:', elements);
    
    // Test basic functionality
    if (elements.brandText) {
        elements.brandText.value = 'Test Brand ' + Date.now();
        elements.brandText.dispatchEvent(new Event('input'));
        console.log('✅ Brand text test passed');
    }
    
    if (elements.welcomeTitle) {
        elements.welcomeTitle.value = 'Test Welcome ' + Date.now();
        elements.welcomeTitle.dispatchEvent(new Event('input'));
        console.log('✅ Welcome title test passed');
    }
    
    // Test save functionality
    if (elements.saveBrandingBtn) {
        try {
            saveBrandingSettings();
            console.log('✅ Save functionality test passed');
        } catch (error) {
            console.error('❌ Save functionality test failed:', error);
        }
    }
    
    console.log('✅ Branding system test completed');
}

// Reset branding state function
function resetBrandingState() {
    console.log('🔄 Resetting branding state...');
    window.brandingApplied = false;
    if (typeof applyBrandingToEntireSite === 'function') {
        applyBrandingToEntireSite();
    }
}

// Debug branding state function
function debugBrandingState() {
    console.log('🔍 Debugging branding state...');
    console.log('systemSettings:', systemSettings);
    console.log('brandingApplied flag:', window.brandingApplied);
    console.log('Current page title:', document.title);
    console.log('Brand text elements:', document.querySelectorAll('.nav-brand, .brand-text, .navbar-brand'));
    console.log('Logo elements:', document.querySelectorAll('.nav-logo img, .nav-brand img, #navLogo img, .navbar-brand img, header img'));
}

// Make branding functions globally accessible
window.initBranding = initBranding;
window.initBrandingSystem = initBrandingSystem;
window.handleLogoUpload = handleLogoUpload;
window.saveBrandingSettings = saveBrandingSettings;
window.resetLogo = resetLogo;
window.resetAllBranding = resetAllBranding;
window.exportBranding = exportBranding;
window.importBranding = importBranding;
window.debugLogo = debugLogo;
window.debugBranding = debugBranding;
window.testBrandingFunctions = testBrandingFunctions;
window.testBrandingSystem = testBrandingSystem;
window.applyBrandingToEntireSite = applyBrandingToEntireSite;
window.applyColorSchemeToSite = applyColorSchemeToSite;
window.resetBrandingState = resetBrandingState;
window.debugBrandingState = debugBrandingState;

// Simple test function for immediate testing
function quickBrandingTest() {
    console.log('🧪 Quick Branding Test Starting...');
    
    // Test element availability
    const elements = {
        logoUpload: document.getElementById('logoUpload'),
        saveBrandingBtn: document.getElementById('saveBrandingBtn'),
        brandText: document.getElementById('brandText'),
        welcomeTitle: document.getElementById('welcomeTitle'),
        logoPreview: document.getElementById('logoPreview')
    };
    
    console.log('📋 Element Status:', elements);
    
    // Test basic functionality
    if (elements.brandText) {
        elements.brandText.value = 'Test Brand ' + Date.now();
        elements.brandText.dispatchEvent(new Event('input'));
        console.log('✅ Brand text test passed');
    }
    
    if (elements.welcomeTitle) {
        elements.welcomeTitle.value = 'Test Welcome ' + Date.now();
        elements.welcomeTitle.dispatchEvent(new Event('input'));
        console.log('✅ Welcome title test passed');
    }
    
    // Test save
    if (elements.saveBrandingBtn) {
        try {
            saveBrandingSettings();
            console.log('✅ Save test passed');
        } catch (error) {
            console.error('❌ Save test failed:', error);
        }
    }
    
    console.log('✅ Quick test completed');
}

window.quickBrandingTest = quickBrandingTest;

// Direct logo upload test function
async function testLogoUploadDirect() {
    console.log('🧪 Testing logo upload directly...');
    
    // Create a test logo using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test logo
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, 100, 100);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', 50, 40);
    
    ctx.font = '12px Arial';
    ctx.fillText('TEST', 50, 60);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    
    // Set logo in systemSettings
    if (typeof systemSettings !== 'undefined') {
        systemSettings.logo = dataURL;
        console.log('✅ Logo set in systemSettings');
        
        // Update UI
        updateLogoPreview();
        updateLogoInNavigation();
        
        // Save to database
        try {
            const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/branding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(systemSettings)
            });
            
            if (response.ok) {
                console.log('✅ Logo saved to database');
                showMessage('Test logo uploaded successfully!', 'success');
            } else {
                throw new Error('Failed to save test logo to database');
            }
        } catch (error) {
            console.error('Error saving test logo to database:', error);
            showMessage('Error saving test logo', 'error');
        }
        console.log('✅ Logo upload test completed successfully');
    } else {
        console.error('❌ systemSettings not available');
    }
}

window.testLogoUploadDirect = testLogoUploadDirect;

// Force initialize branding system
function forceInitBranding() {
    console.log('🔧 Force initializing branding system...');
    
    // Load settings
    loadBrandingSettings();
    
    // Setup event listeners
    setupBrandingEventListeners();
    setupAdvancedBrandingEventListeners();
    
    // Update UI
    updateAdvancedBrandingUI();
    updateLogoPreview();
    updateLogoInNavigation();
    
    console.log('✅ Branding system force initialized');
}

window.forceInitBranding = forceInitBranding;

// Knowledge base data
let knowledgeBase = [];
let technicalDatabase = [];

// Global error handler to prevent reloads
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    // Don't prevent default, just log the error
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // Don't prevent default, just log the error
});

// Utility functions for formatting
function formatDate(dateInput) {
    if (!dateInput) return '-';
    
    let date;
    
    try {
        // Handle Date objects
        if (dateInput instanceof Date) {
            date = dateInput;
        }
        // Handle Firestore Timestamp objects
        else if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
            // Firestore Timestamp with _seconds
            date = new Date(dateInput._seconds * 1000);
        } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
            // Firestore Timestamp with seconds
            date = new Date(dateInput.seconds * 1000);
        } else if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
            // Firestore Timestamp with toDate method
            date = dateInput.toDate();
        } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
            // Regular string or timestamp
            date = new Date(dateInput);
        } else {
            console.warn('Unknown date format:', dateInput);
            return '-';
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateInput);
            return '-';
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Heute';
        if (diffDays === 1) return 'Gestern';
        if (diffDays < 7) return `Vor ${diffDays} Tagen`;
        
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
        
    } catch (error) {
        console.error('Error formatting date:', error, 'Input:', dateInput);
        return '-';
    }
}

function formatSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Knowledge Base Functions
function displayKnowledgeBase(documents) {
    console.log('📚 Displaying knowledge base documents:', documents.length);
    console.log('📄 First few documents:', documents.slice(0, 3).map(d => ({ filename: d.filename, fileType: d.fileType, isActive: d.isActive })));
    
    // Initialize pagination state if on settings page
    const isSettingsPage = window.location.pathname.includes('settings.html');
    if (isSettingsPage) {
        if (!window.kbPaginationState) {
            window.kbPaginationState = {
                currentPage: 1,
                itemsPerPage: 10
            };
        }
        // Store full documents list in multiple locations for compatibility
        window.kbAllDocuments = documents;
        window.knowledgeBase = documents;
        
        // Also update kbState if it exists
        if (window.kbState) {
            window.kbState.allDocuments = documents;
        }
        
        // Call loadKbDocuments if it exists to sync the kb-functions.js state
        if (typeof window.loadKbDocuments === 'function') {
            window.loadKbDocuments(documents);
        }
    }
    
    // Update stats with all documents
    const totalDocs = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    
    const kbList = document.getElementById('kbList');
    
    // Handle last updated date properly
    let lastUpdated = null;
    if (documents.length > 0) {
        const timestamps = documents.map(doc => {
            if (!doc.uploadedAt) return Date.now();
            
            // Handle Firestore Timestamp
            if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt._seconds) {
                return doc.uploadedAt._seconds * 1000;
            } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.seconds) {
                return doc.uploadedAt.seconds * 1000;
            } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.toDate) {
                return doc.uploadedAt.toDate().getTime();
            } else {
                return new Date(doc.uploadedAt).getTime();
            }
        });
        lastUpdated = Math.max(...timestamps);
    }
    
    const kbDocCountEl = document.getElementById('kbDocCount');
    const kbTotalSizeEl = document.getElementById('kbTotalSize');
    const kbLastUpdateEl = document.getElementById('kbLastUpdate');
    const kbResultsCountEl = document.getElementById('kbResultsCount');
    
    if (kbDocCountEl) kbDocCountEl.textContent = totalDocs;
    if (kbTotalSizeEl) kbTotalSizeEl.textContent = formatSize(totalSize);
    if (kbLastUpdateEl) kbLastUpdateEl.textContent = lastUpdated 
        ? formatDate(new Date(lastUpdated))
        : '-';
    if (kbResultsCountEl) kbResultsCountEl.textContent = documents.length;
    
    // If kbList doesn't exist, stats are updated but we can't render the list
    if (!kbList) {
        console.log('⚠️ kbList element not found, stats updated but list not rendered');
        return;
    }
    
    if (documents.length === 0) {
        kbList.innerHTML = `
            <div class="kb-empty">
                <svg class="kb-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div>Keine Einträge gefunden</div>
            </div>
        `;
        return;
    }
    
    console.log('🔧 Rendering knowledge base documents with buttons...');
    console.log('📄 Documents count:', documents.length);
    
    // Apply pagination if on settings page
    let documentsToDisplay = documents;
    if (isSettingsPage && window.kbPaginationState) {
        const state = window.kbPaginationState;
        const startIdx = (state.currentPage - 1) * state.itemsPerPage;
        const endIdx = startIdx + state.itemsPerPage;
        documentsToDisplay = documents.slice(startIdx, endIdx);
        
        console.log('📄 KB Pagination applied:', {
            total: documents.length,
            displayed: documentsToDisplay.length,
            startIdx,
            endIdx,
            currentPage: state.currentPage
        });
    }
    
    kbList.innerHTML = documentsToDisplay.map((doc, index) => {
        console.log(`🔧 Rendering document ${index}:`, doc.filename);
        return `
        <div class="kb-item" data-file-index="${index}" data-doc-id="${doc.id}">
            <div class="kb-item-header">
                <div style="display: flex; align-items: center; flex: 1;">
                    <input type="checkbox" class="kb-checkbox" data-doc-id="${doc.id}">
                    <div class="kb-item-title">${doc.filename || doc.name || 'Unbekannt'}</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div class="kb-item-date">${formatDate(doc.uploadedAt)}</div>
                    <div class="kb-tools">
                        <button class="kb-tool-btn primary" data-doc-id="${doc.id}" title="Vorschau">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14L20.5,19.79L19.79,20.5L14,14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                        </button>
                        <button class="kb-tool-btn" data-doc-id="${doc.id}" title="Download">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04M14,13V17H10V13H7L12,8L17,13H14Z"/>
                            </svg>
                        </button>
                        <button class="kb-tool-btn danger" data-doc-id="${doc.id}" data-doc-name="${doc.filename || doc.name || 'Unbekannt'}" title="Löschen">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9V17H10V9H8M14,9V17H16V9H14Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="kb-item-meta">
                <span class="file-type-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                    </svg>
                    ${doc.fileType ? doc.fileType.toUpperCase() : 'UNKNOWN'}
                </span>
                <span class="file-size-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
                    </svg>
                    ${formatSize(doc.size)}
                </span>
                ${doc.category ? `<span class="kb-item-category">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
                        <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/>
                    </svg>
                    ${doc.category ? doc.category.toUpperCase() : ''}
                </span>` : ''}
            </div>
        </div>
        `;
    }).join('');
    
    // Render pagination if on settings page
    if (isSettingsPage && window.kbPaginationState && documents.length > window.kbPaginationState.itemsPerPage) {
        renderKBPagination(documents.length);
    }
    
    // Add event listeners for enhanced functionality
    setupKnowledgeBaseEventListeners();
}

// Render knowledge base pagination
function renderKBPagination(totalDocs) {
    const paginationContainer = document.getElementById('kbPagination');
    if (!paginationContainer || !window.kbPaginationState) return;

    const state = window.kbPaginationState;
    const totalPages = Math.ceil(totalDocs / state.itemsPerPage);
    const currentPage = state.currentPage;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    paginationContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; margin-top: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); width: 100%;">
            <button onclick="window.goToKBPage(1)" ${currentPage === 1 ? 'disabled' : ''}
                style="padding: 8px 16px; background: ${currentPage === 1 ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === 1 ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === 1 ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Erste
            </button>
            <button onclick="window.goToKBPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
                style="padding: 8px 16px; background: ${currentPage === 1 ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === 1 ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === 1 ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Zurück
            </button>
            <span style="padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 14px; color: #475569;">
                Seite ${currentPage} von ${totalPages}
            </span>
            <button onclick="window.goToKBPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
                style="padding: 8px 16px; background: ${currentPage === totalPages ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === totalPages ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === totalPages ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Weiter
            </button>
            <button onclick="window.goToKBPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}
                style="padding: 8px 16px; background: ${currentPage === totalPages ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === totalPages ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === totalPages ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Letzte
            </button>
        </div>
    `;
}

// Go to knowledge base page
window.goToKBPage = function(page) {
    if (!window.kbPaginationState || !window.kbAllDocuments) return;

    const state = window.kbPaginationState;
    const totalPages = Math.ceil(window.kbAllDocuments.length / state.itemsPerPage);

    if (page < 1 || page > totalPages) return;

    state.currentPage = page;
    displayKnowledgeBase(window.kbAllDocuments);
};

// Load knowledge base data
async function loadKnowledgeBase() {
    // Show loading state
    showKnowledgeBaseLoading();
    
    // Add a small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        console.log('📚 Loading knowledge base...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        knowledgeBase = data.documents || [];
        console.log('✅ Knowledge base loaded:', knowledgeBase.length, 'documents');
        
        // Update display if on settings page
        if (document.getElementById('kbList')) {
            displayKnowledgeBase(knowledgeBase);
        }
        
        return knowledgeBase;
    } catch (error) {
        console.error('❌ Error loading knowledge base:', error);
        showKnowledgeBaseError(error.message);
        return [];
    }
}

// Delete knowledge base document
async function deleteKnowledgeDocument(docId) {
    try {
        console.log('🗑️ Deleting document:', docId);
        const response = await fetch(`${API_BASE}/deleteDocument`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ docId: docId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Document deleted successfully:', result);
        
        // Reload knowledge base to update display
        await loadKnowledgeBase();
        
    } catch (error) {
        console.error('❌ Error deleting document:', error);
        if (typeof showMessage === 'function') {
            showMessage('Fehler beim Löschen des Dokuments. Bitte versuchen Sie es erneut.', 'error');
        }
    }
}

// Initialize knowledge base search and filter
function initKnowledgeBase() {
    const searchInput = document.getElementById('kbSearch');
    const filterSelect = document.getElementById('kbFilter');
    const refreshBtn = document.getElementById('refreshKbBtn');
    
    console.log('🔍 Initializing knowledge base search and filter...');
    console.log('Search input found:', !!searchInput);
    console.log('Filter select found:', !!filterSelect);
    console.log('Refresh button found:', !!refreshBtn);
    
    if (searchInput) {
        searchInput.addEventListener('input', filterKnowledgeBase);
        console.log('✅ Search input event listener added');
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterKnowledgeBase);
        console.log('✅ Filter select event listener added');
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshKnowledgeBase);
        console.log('✅ Refresh button event listener added');
    }
}

// Refresh knowledge base function
function refreshKnowledgeBase() {
    console.log('🔄 Refreshing knowledge base...');
    loadKnowledgeBase();
}

// Initialize technical database search and filter
function initTechnicalDatabase() {
    const searchInput = document.getElementById('techSearch');
    const filterSelect = document.getElementById('techFilter');
    
    console.log('🔧 Initializing technical database search and filter...');
    console.log('Tech search input found:', !!searchInput);
    console.log('Tech filter select found:', !!filterSelect);
    
    if (searchInput) {
        searchInput.addEventListener('input', filterTechnicalDatabase);
        console.log('✅ Tech search input event listener added');
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterTechnicalDatabase);
        console.log('✅ Tech filter select event listener added');
    }
}

// Filter technical database based on search and filter criteria
function filterTechnicalDatabase() {
    const searchInput = document.getElementById('techSearch');
    const filterSelect = document.getElementById('techFilter');
    
    if (!searchInput || !filterSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;
    
    let filteredDocs = technicalDatabase;
    
    // Apply search filter
    if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc => {
            const filename = (doc.filename || '').toLowerCase();
            const content = (doc.content || '').toLowerCase();
            return filename.includes(searchTerm) || content.includes(searchTerm);
        });
    }
    
    // Apply type filter
    if (filterType && filterType !== 'all') {
        filteredDocs = filteredDocs.filter(doc => {
            const docType = (doc.fileType || '').toLowerCase();
            return docType === filterType.toLowerCase();
        });
    }
    
    displayTechnicalDatabase(filteredDocs);
}

// Filter knowledge base based on search and filter criteria
function filterKnowledgeBase() {
    const searchInput = document.getElementById('kbSearch');
    const filterSelect = document.getElementById('kbFilter');
    
    if (!searchInput || !filterSelect) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;
    
    let filteredDocs = knowledgeBase;
    
    // Apply search filter
    if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc => {
            const filename = (doc.filename || '').toLowerCase();
            const content = (doc.content || '').toLowerCase();
            return filename.includes(searchTerm) || content.includes(searchTerm);
        });
    }
    
    // Apply type filter
    if (filterType && filterType !== 'all') {
        filteredDocs = filteredDocs.filter(doc => {
            const docType = (doc.fileType || '').toLowerCase();
            return docType === filterType.toLowerCase();
        });
    }
    
    displayKnowledgeBase(filteredDocs);
}

// Load suggestions from knowledge base for autocomplete
async function loadSuggestionsFromKnowledgeBase() {
    try {
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        if (!response.ok) {
            console.log('Failed to load knowledge base for suggestions');
            return;
        }
        
        const data = await response.json();
        if (!data.documents || data.documents.length === 0) {
            console.log('No documents in knowledge base for suggestions');
            return;
        }
        
        // Use Set to avoid duplicates
        const generatedSuggestions = new Set();
        
        // Extract model names from all documents
        const models = new Set();
        
        // Analyze each document
        data.documents.forEach(doc => {
            const filename = doc.filename.toLowerCase();
            const content = (doc.content || '').toLowerCase();
            const combinedText = filename + ' ' + content;
            
            // Extract model names
            if (combinedText.includes('lyriq')) models.add('LYRIQ');
            if (combinedText.includes('vistiq')) models.add('VISTIQ');
            if (combinedText.includes('escalade')) models.add('ESCALADE IQ');
            if (combinedText.includes('optiq')) models.add('OPTIQ');
            
            // Generate questions based on content topics
            
            // Pricing
            if (combinedText.match(/preis|cost|price|chf|€|euro|dollar|\$/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie viel kostet der Cadillac ${model}?`);
                    generatedSuggestions.add(`Was kostet der ${model}?`);
                });
                generatedSuggestions.add("Preisvergleich Cadillac Modelle");
            }
            
            // Range / Reichweite
            if (combinedText.match(/reichweite|range|km|kilometer|miles/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Reichweite hat der ${model}?`);
                    generatedSuggestions.add(`Wie weit fährt der ${model}?`);
                });
            }
            
            // Charging / Laden
            if (combinedText.match(/laden|charging|batterie|battery|akku/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie lädt man den ${model}?`);
                    generatedSuggestions.add(`Ladezeit ${model}`);
                });
                generatedSuggestions.add("Ladestationen finden");
            }
            
            // Features / Ausstattung
            if (combinedText.match(/ausstattung|features|technik|technology/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Ausstattung hat der ${model}?`);
                    generatedSuggestions.add(`${model} Features`);
                });
            }
            
            // Delivery / Lieferung
            if (combinedText.match(/lieferung|delivery|bestellung|order/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Lieferzeit ${model}`);
                    generatedSuggestions.add(`Wann ist der ${model} verfügbar?`);
                });
                generatedSuggestions.add("Bestellprozess Cadillac");
            }
        });
        
        // Convert Set to Array and update global suggestions
        suggestions = Array.from(generatedSuggestions);
        console.log('✅ Generated', suggestions.length, 'suggestions from knowledge base');
        
    } catch (error) {
        console.error('❌ Error loading suggestions from knowledge base:', error);
    }
}

// Prevent multiple initializations - but only if properly initialized
if (window.appInitialized && window.systemSettings && window.systemSettings.welcomeTitle) {
    console.log('⚠️ App already properly initialized, skipping...');
} else {
    console.log('🚀 Starting app initialization...');
}

// Initialize when DOM is loaded - with loop protection
document.addEventListener('DOMContentLoaded', async function() {
    // Prevent multiple DOM event listeners
    if (window.domInitialized) {
        console.log('⚠️ DOM already initialized, skipping...');
        return;
    }
    window.domInitialized = true;

    console.log('📱 DOM loaded, initializing app...');

    try {
        // Simple initialization first
        console.log('🔄 Starting basic setup...');

        // Setup basic functionality
        if (typeof window.initializeTheme === 'function') {
            window.initializeTheme();
        } else {
            console.error('❌ initializeTheme function not available');
        }
        setupNavigation();
        setupThemeToggle();
        setupChatFunctionality();
        
        // Debug available functions after a delay
        setTimeout(() => {
            window.debugFunctions();
        }, 1000);
        
        // Initialize branding system immediately
        console.log('🎨 Initializing branding system...');
        if (typeof initBrandingSystem === 'function') {
            initBrandingSystem();
        } else {
            console.log('⚠️ initBrandingSystem function not available');
        }
        
        // Apply branding to entire site after a short delay to ensure DOM is ready
        setTimeout(() => {
            console.log('🔄 Applying branding to entire site after page load...');
            if (typeof applyBrandingToEntireSite === 'function' && !window.brandingApplied) {
                applyBrandingToEntireSite();
                window.brandingApplied = true;
            }
        }, 1000);

        console.log('✅ Basic app setup completed');

        // Try to load data (but don't block if it fails)
        try {
            await loadSystemSettings();
            console.log('✅ System settings loaded');
        } catch (error) {
            console.warn('⚠️ Could not load system settings:', error.message);
        }

        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Don't let initialization errors break the basic functionality
    }
});

// Also prevent multiple event listeners on window load
window.addEventListener('load', function() {
    if (window.windowLoaded) {
        console.log('⚠️ Window already loaded, skipping...');
        return;
    }
    window.windowLoaded = true;
    console.log('🌐 Window loaded');
});

// Load system settings from backend
async function loadSystemSettings() {
    // Prevent multiple simultaneous calls
    if (window.loadingSystemSettings) {
        console.log('⚠️ System settings already loading, skipping...');
        return;
    }

    window.loadingSystemSettings = true;

    try {
        console.log('🔄 Loading system settings from:', `${API_BASE}/settings`);
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Settings response status:', response.status);
        if (response.ok) {
            const settings = await response.json();
            console.log('Raw settings response:', settings);
            systemSettings = {
                welcomeTitle: settings.welcomeTitle || 'Cadillac EV Assistant',
                welcomeSubtitle: settings.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge'
            };
            // Update global reference
            window.systemSettings = systemSettings;
            console.log('✅ System settings loaded:', systemSettings);
        } else {
            console.error('❌ Settings response not ok:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error loading system settings:', error);
    } finally {
        window.loadingSystemSettings = false;
    }
}

// Load knowledge base
async function loadKnowledgeBase() {
    try {
        console.log('🔄 Loading knowledge base from backend...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Knowledge base response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Raw knowledge base response:', data);
            knowledgeBase = data.documents || [];
            window.knowledgeBase = knowledgeBase;
            console.log('✅ Knowledge base loaded:', knowledgeBase.length, 'documents');
            console.log('📄 Sample documents:', knowledgeBase.slice(0, 3).map(d => ({ filename: d.filename, fileType: d.fileType, isActive: d.isActive })));

            // Update statistics if on settings page
            if (document.getElementById('kbDocCount')) {
                updateKnowledgeBaseStats();
            }

            // Refresh the list if on settings page
            // Always try to display, even if element is hidden
            displayKnowledgeBase(knowledgeBase);
            
            // Also update kbState for export functionality
            if (window.kbState) {
                window.kbState.allDocuments = knowledgeBase;
            }
        } else {
            console.error('❌ Failed to load knowledge base:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error loading knowledge base:', error);
    }
}

// Display technical database documents
function displayTechnicalDatabase(documents) {
    console.log('🔧 Displaying technical database documents:', documents.length);
    console.log('📄 First few documents:', documents.slice(0, 3).map(d => ({ filename: d.filename || d.name, fileType: d.fileType, isActive: d.isActive })));
    
    // Store in global variables for access by other functions
    technicalDatabase = documents;
    window.technicalDatabase = documents;
    
    // Update stats
    const totalDocs = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    
    // Check if we're on troubleshooting page and set up pagination
    const isTroubleshootingPage = window.location.pathname.includes('troubleshooting.html');
    
    // Always initialize pagination state if on troubleshooting page
    if (isTroubleshootingPage) {
        if (!window.techPaginationState) {
            window.techPaginationState = {
                currentPage: 1,
                itemsPerPage: 10
            };
        }
    }
    
    const techList = document.getElementById('techList');
    
    // Handle last updated date properly
    let lastUpdated = null;
    if (documents.length > 0) {
        console.log('🔧 Processing timestamps for technical database...');
        const timestamps = documents.map(doc => {
            if (!doc.uploadedAt) {
                console.log('⚠️ No uploadedAt for doc:', doc.filename);
                return Date.now();
            }
            
            let timestamp;
            
            // Handle Firestore Timestamp
            if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt._seconds) {
                timestamp = doc.uploadedAt._seconds * 1000;
                console.log('✅ Processed timestamp for', doc.filename, ':', new Date(timestamp), '(raw:', doc.uploadedAt._seconds, ')');
            } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.seconds) {
                timestamp = doc.uploadedAt.seconds * 1000;
                console.log('✅ Processed timestamp for', doc.filename, ':', new Date(timestamp), '(raw:', doc.uploadedAt.seconds, ')');
            } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.toDate) {
                timestamp = doc.uploadedAt.toDate().getTime();
                console.log('✅ Processed timestamp for', doc.filename, ':', new Date(timestamp));
            } else {
                timestamp = new Date(doc.uploadedAt).getTime();
                console.log('✅ Processed timestamp for', doc.filename, ':', new Date(timestamp));
            }
            
            // Validate timestamp
            if (isNaN(timestamp) || timestamp <= 0) {
                console.error('❌ Invalid timestamp for', doc.filename, ':', timestamp);
                return Date.now();
            }
            
            return timestamp;
        });
        lastUpdated = Math.max(...timestamps);
        console.log('🔧 Last updated timestamp:', lastUpdated, 'Date:', new Date(lastUpdated));
    }
    
    const techDocCountEl = document.getElementById('techDocCount');
    const techTotalSizeEl = document.getElementById('techTotalSize');
    const techLastUpdateEl = document.getElementById('techLastUpdate');
    const techResultsCountEl = document.getElementById('techResultsCount');
    
    if (techDocCountEl) {
        techDocCountEl.textContent = totalDocs;
        // Add descriptive text like in knowledge base
        const techDocCountParent = techDocCountEl.parentElement;
        if (techDocCountParent && !techDocCountParent.querySelector('.stat-description')) {
            const description = document.createElement('div');
            description.className = 'stat-description';
            description.textContent = 'In technischer Datenbank';
            techDocCountParent.appendChild(description);
        }
    }
    if (techTotalSizeEl) {
        techTotalSizeEl.textContent = formatSize(totalSize);
        // Add descriptive text like in knowledge base
        const techTotalSizeParent = techTotalSizeEl.parentElement;
        if (techTotalSizeParent && !techTotalSizeParent.querySelector('.stat-description')) {
            const description = document.createElement('div');
            description.className = 'stat-description';
            description.textContent = 'Alle technischen Dateien';
            techTotalSizeParent.appendChild(description);
        }
    }
    if (techResultsCountEl) techResultsCountEl.textContent = documents.length;
    if (techLastUpdateEl) {
        if (lastUpdated && lastUpdated > 0) {
            const formattedDate = formatDate(new Date(lastUpdated));
            console.log('🔧 Setting last update to:', formattedDate, 'from timestamp:', lastUpdated);
            techLastUpdateEl.textContent = formattedDate;
        } else {
            console.log('⚠️ No valid last updated timestamp found, lastUpdated:', lastUpdated);
            // Try to get most recent upload date from documents
            if (documents.length > 0) {
                const latestDoc = documents.reduce((latest, doc) => {
                    if (!doc.uploadedAt) return latest;
                    if (!latest) return doc;
                    
                    const docTime = doc.uploadedAt._seconds || doc.uploadedAt.seconds || 0;
                    const latestTime = latest.uploadedAt._seconds || latest.uploadedAt.seconds || 0;
                    
                    return docTime > latestTime ? doc : latest;
                }, null);
                
                if (latestDoc && latestDoc.uploadedAt) {
                    const formattedDate = formatDate(latestDoc.uploadedAt);
                    console.log('🔧 Using fallback date from latest document:', formattedDate);
                    techLastUpdateEl.textContent = formattedDate;
                } else {
                    techLastUpdateEl.textContent = '-';
                }
            } else {
                techLastUpdateEl.textContent = '-';
            }
        }
        // Add descriptive text like in knowledge base
        const techLastUpdateParent = techLastUpdateEl.parentElement;
        if (techLastUpdateParent && !techLastUpdateParent.querySelector('.stat-description')) {
            const description = document.createElement('div');
            description.className = 'stat-description';
            description.textContent = 'Technische Datenbank';
            techLastUpdateParent.appendChild(description);
        }
    }
    
    // If techList doesn't exist, stats are updated but we can't render the list
    if (!techList) {
        console.log('⚠️ techList element not found, stats updated but list not rendered');
        return;
    }
    
    if (documents.length === 0) {
        techList.innerHTML = `
            <div class="kb-empty">
                <svg class="kb-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
                <div>Keine technischen Dokumente gefunden</div>
            </div>
        `;
        return;
    }
    
    // Apply pagination if on troubleshooting page
    let documentsToDisplay = documents;
    if (isTroubleshootingPage && window.techPaginationState) {
        const state = window.techPaginationState;
        const startIdx = (state.currentPage - 1) * state.itemsPerPage;
        const endIdx = startIdx + state.itemsPerPage;
        documentsToDisplay = documents.slice(startIdx, endIdx);
        
        // Store full documents list for pagination
        window.techAllDocuments = documents;
        
        console.log('📄 Pagination applied:', {
            total: documents.length,
            displayed: documentsToDisplay.length,
            startIdx,
            endIdx,
            currentPage: state.currentPage
        });
    }
    
    techList.innerHTML = documentsToDisplay.map((doc, index) => `
        <div class="kb-item" data-file-index="${index}" data-doc-id="${doc.id}">
            <div class="kb-item-header">
                <div style="display: flex; align-items: center; flex: 1;">
                    <input type="checkbox" class="kb-checkbox" data-doc-id="${doc.id}">
                    <div class="kb-item-title">${doc.filename || doc.name || 'Unbekannt'}</div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div class="kb-item-date">${formatDate(doc.uploadedAt)}</div>
                    <div class="kb-tools">
                        <button class="kb-tool-btn primary" data-doc-id="${doc.id}" title="Vorschau">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14L20.5,19.79L19.79,20.5L14,14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                            </svg>
                        </button>
                        <button class="kb-tool-btn" data-doc-id="${doc.id}" title="Download">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04M14,13V17H10V13H7L12,8L17,13H14Z"/>
                            </svg>
                        </button>
                        <button class="kb-tool-btn danger" data-doc-id="${doc.id}" data-doc-name="${doc.filename || doc.name || 'Unbekannt'}" title="Löschen">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9V17H10V9H8M14,9V17H16V9H14Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="kb-item-meta">
                <span class="file-type-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                    </svg>
                    ${doc.fileType ? doc.fileType.toUpperCase() : 'UNKNOWN'}
                </span>
                <span class="file-size-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 6px;">
                        <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
                    </svg>
                    ${formatSize(doc.size)}
                </span>
                ${doc.category ? `<span class="kb-item-category">
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style="margin-right: 4px;">
                        <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/>
                    </svg>
                    ${doc.category ? doc.category.toUpperCase() : ''}
                </span>` : ''}
            </div>
        </div>
    `).join('');
    
    // Add event listeners for enhanced functionality
    setupTechnicalDatabaseEventListeners();
    
    // Render pagination if on troubleshooting page
    if (isTroubleshootingPage && window.techPaginationState && documents.length > window.techPaginationState.itemsPerPage) {
        renderTechnicalPagination(documents.length);
    }
}

// Render pagination for troubleshooting page
function renderTechnicalPagination(totalDocs) {
    const paginationContainer = document.getElementById('techPagination');
    if (!paginationContainer || !window.techPaginationState) return;
    
    const state = window.techPaginationState;
    const totalPages = Math.ceil(totalDocs / state.itemsPerPage);
    const currentPage = state.currentPage;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    paginationContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; margin-top: 24px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); width: 100%;">
            <button onclick="window.goToTechnicalPage(1)" ${currentPage === 1 ? 'disabled' : ''} 
                style="padding: 8px 16px; background: ${currentPage === 1 ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === 1 ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === 1 ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Erste
            </button>
            <button onclick="window.goToTechnicalPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                style="padding: 8px 16px; background: ${currentPage === 1 ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === 1 ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === 1 ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Zurück
            </button>
            <span style="padding: 8px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 14px; color: #475569;">
                Seite ${currentPage} von ${totalPages}
            </span>
            <button onclick="window.goToTechnicalPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
                style="padding: 8px 16px; background: ${currentPage === totalPages ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === totalPages ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === totalPages ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Weiter
            </button>
            <button onclick="window.goToTechnicalPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''} 
                style="padding: 8px 16px; background: ${currentPage === totalPages ? '#f3f4f6' : '#ffffff'}; color: ${currentPage === totalPages ? '#9ca3af' : '#374151'}; border: 1px solid ${currentPage === totalPages ? '#e5e7eb' : '#d1d5db'}; border-radius: 8px; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-weight: 500; font-size: 14px; transition: all 0.2s;">
                Letzte
            </button>
        </div>
    `;
}

// Navigate to specific page
window.goToTechnicalPage = function(page) {
    if (!window.techPaginationState || !window.techAllDocuments) return;
    
    const state = window.techPaginationState;
    const totalPages = Math.ceil(window.techAllDocuments.length / state.itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    state.currentPage = page;
    displayTechnicalDatabase(window.techAllDocuments);
};

// Delete technical database document
async function deleteTechnicalDocument(docId) {
    try {
        console.log('🗑️ Deleting technical document:', docId);
        const response = await fetch(`${API_BASE}/deleteTechnicalDocument`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ docId })
        });

        if (response.ok) {
            console.log('✅ Technical document deleted successfully');
            // Reload technical database
            await loadTechnicalDatabase();
        } else {
            console.error('❌ Failed to delete technical document:', response.status);
        }
    } catch (error) {
        console.error('❌ Error deleting technical document:', error);
    }
}

// Load technical database
async function loadTechnicalDatabase() {
    // Show loading state
    showTechnicalDatabaseLoading();
    
    // Add a small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        console.log('🔄 Loading technical database from:', `${API_BASE}/technicalDatabase`);
        const response = await fetch(`${API_BASE}/technicalDatabase?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Technical database response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Raw technical database response:', data);
            technicalDatabase = data.documents || [];
            console.log('✅ Technical database loaded:', technicalDatabase.length, 'documents');
            
            // Store in global variable for debugging
            window.technicalDatabase = technicalDatabase;
            
            // Update display if on settings page
            if (document.getElementById('techList')) {
                console.log('🔧 Calling displayTechnicalDatabase with', technicalDatabase.length, 'documents');
                displayTechnicalDatabase(technicalDatabase);
            } else {
                console.log('⚠️ techList element not found, not displaying technical database');
            }
        } else {
            console.error('❌ Failed to load technical database:', response.status, response.statusText);
            showTechnicalDatabaseError(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Error loading technical database:', error);
        showTechnicalDatabaseError(error.message);
    }
}

// Setup navigation
function setupNavigation() {
    console.log('🧭 Setting up navigation...');
    
    // Initialize navigation system
    initNavigation();
    
    console.log('✅ Navigation setup complete');
}

// Core navigation function
function switchPage(page) {
    console.log('🔄 Switching to page:', page);
    
    // Check if we're already on the target page
    const currentPage = getCurrentPage();
    if (currentPage === page) {
        console.log('⚠️ Already on', page, 'page, skipping navigation');
        return;
    }
    
    // Navigate to the appropriate HTML file
    const pageUrls = {
        'dashboard': 'dashboard.html',
        'chat': 'chat.html',
        'troubleshooting': 'troubleshooting.html',
        'settings': 'settings.html'
    };
    
    const targetUrl = pageUrls[page];
    if (targetUrl) {
        // Update the URL without reloading the page
        window.history.pushState({}, '', targetUrl);
        
        // Load the new page content
        loadPageContent(targetUrl, page);
    }
}

// Get current page from URL
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('dashboard.html')) return 'dashboard';
    if (path.includes('chat.html')) return 'chat';
    if (path.includes('troubleshooting.html')) return 'troubleshooting';
    if (path.includes('settings.html')) return 'settings';
    return 'chat'; // default
}

// Load page content dynamically
async function loadPageContent(url, page) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse the HTML and extract the body content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newBody = doc.body;
        
        // Replace the current body content
        document.body.innerHTML = newBody.innerHTML;
        
        // Re-initialize the page
        initializePage(page);
        
        console.log('✅ Page loaded:', page);
    } catch (error) {
        console.error('❌ Error loading page:', error);
        // Fallback to direct navigation
        window.location.href = url;
    }
}

// Initialize page-specific functionality
function initializePage(page) {
    console.log('🔄 Initializing page:', page);
    
    // Only re-run navigation setup if not already done
    if (!window.navigationInitialized) {
        if (typeof setupNavigation === 'function') setupNavigation();
        window.navigationInitialized = true;
    }
    
    // Setup other functionality
    if (typeof setupChatFunctionality === 'function') setupChatFunctionality();
    if (typeof setupSettingsFunctionality === 'function') setupSettingsFunctionality();
    if (typeof setupTechnicalDatabaseSearch === 'function') setupTechnicalDatabaseSearch();
    if (typeof setupThemeToggle === 'function') setupThemeToggle();
    if (typeof setupSidebarFunctionality === 'function') setupSidebarFunctionality();
    if (typeof initializeTheme === 'function') initializeTheme();
    
    // Page-specific initialization
    if (page === 'chat') {
        if (typeof initChat === 'function') initChat();
        if (typeof initChatHistory === 'function') initChatHistory();
    } else if (page === 'settings') {
        if (typeof loadKnowledgeBase === 'function') loadKnowledgeBase();
        if (typeof loadKnowledgeBaseStats === 'function') loadKnowledgeBaseStats();
    } else if (page === 'dashboard') {
        if (typeof loadDashboard === 'function') loadDashboard();
    } else if (page === 'troubleshooting') {
        if (typeof loadTechnicalDatabase === 'function') loadTechnicalDatabase();
    }
    
    console.log('✅ Page initialized:', page);
}

// Initialize navigation system
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .nav-button');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page || item.getAttribute('data-page');
            if (page) {
                switchPage(page);
            }
        });
    });
    
    // Set up suggestion buttons
    const suggestionButtons = document.querySelectorAll('.suggestion-prompt');
    suggestionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.textContent.trim();
            sendSuggestionMessage(message);
        });
    });
    
    // Only switch to chat if we're not already on a specific page
    const currentPage = getCurrentPage();
    if (currentPage === 'chat' || window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // We're on chat page or root, ensure chat is active
        const chatNavItem = document.querySelector('.nav-item[data-page="chat"]');
        if (chatNavItem) chatNavItem.classList.add('active');
    } else {
        // We're on a specific page, don't switch
        console.log('📍 Already on', currentPage, 'page, not switching');
    }
}

// Dashboard functionality
async function loadDashboard() {
    try {
        console.log('📊 Loading dashboard data...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        const data = await response.json();
        const documents = data.documents || [];
        
        // Update dashboard statistics
        const totalDocs = documents.length;
        const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
        const lastUpdated = documents.length > 0 
            ? Math.max(...documents.map(doc => {
                if (!doc.uploadedAt) return Date.now();
                
                // Handle Firestore Timestamp with _seconds
                if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt._seconds) {
                    return doc.uploadedAt._seconds * 1000;
                } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.seconds) {
                    return doc.uploadedAt.seconds * 1000;
                } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.toDate) {
                    return doc.uploadedAt.toDate().getTime();
                } else {
                    return new Date(doc.uploadedAt).getTime();
                }
            }))
            : null;
        
        // Update dashboard stats
        const docCountEl = document.getElementById('dashDocCount');
        const totalSizeEl = document.getElementById('dashTotalSize');
        const lastUpdateEl = document.getElementById('dashLastUpdate');
        
        if (docCountEl) docCountEl.textContent = totalDocs;
        if (totalSizeEl) totalSizeEl.textContent = formatSize(totalSize);
        if (lastUpdateEl) lastUpdateEl.textContent = lastUpdated 
            ? formatDate(new Date(lastUpdated))
            : 'Nie';
        
        // Load recent activity
        const recentActivity = documents
            .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
            .slice(0, 5);
        
        const recentActivityEl = document.getElementById('dashRecentActivity');
        if (recentActivityEl) {
            recentActivityEl.innerHTML = recentActivity.map(doc => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                        </svg>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${doc.filename || 'Unbekannt'}</div>
                        <div class="activity-meta">${formatDate(doc.uploadedAt)} • ${formatSize(doc.size)}</div>
                    </div>
                </div>
            `).join('');
        }
        
        console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

// Load dashboard statistics
async function loadStatistics() {
    try {
        console.log('📊 Loading dashboard statistics...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        const data = await response.json();
        const documents = data.documents || [];
        
        // Update statistics
        const totalDocs = documents.length;
        const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
        const lastUpdated = documents.length > 0 
            ? Math.max(...documents.map(doc => {
                if (!doc.uploadedAt) return Date.now();
                
                // Handle Firestore Timestamp with _seconds
                if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt._seconds) {
                    return doc.uploadedAt._seconds * 1000;
                } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.seconds) {
                    return doc.uploadedAt.seconds * 1000;
                } else if (doc.uploadedAt && typeof doc.uploadedAt === 'object' && doc.uploadedAt.toDate) {
                    return doc.uploadedAt.toDate().getTime();
                } else {
                    return new Date(doc.uploadedAt).getTime();
                }
            }))
            : null;
        
        // Update dashboard stats
        const docCountEl = document.getElementById('dashDocCount');
        const totalSizeEl = document.getElementById('dashTotalSize');
        const lastUpdateEl = document.getElementById('dashLastUpdate');
        
        if (docCountEl) docCountEl.textContent = totalDocs;
        if (totalSizeEl) totalSizeEl.textContent = formatSize(totalSize);
        if (lastUpdateEl) lastUpdateEl.textContent = lastUpdated 
            ? formatDate(new Date(lastUpdated))
            : 'Nie';
        
        console.log('✅ Statistics loaded successfully');
    } catch (error) {
        console.error('❌ Error loading statistics:', error);
    }
}

// Load recent activities
async function loadRecentActivities() {
    try {
        console.log('📋 Loading recent activities...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        const data = await response.json();
        const documents = data.documents || [];
        
        // Load recent activity
        const recentActivity = documents
            .sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0))
            .slice(0, 5);
        
        const recentActivityEl = document.getElementById('dashRecentActivity');
        if (recentActivityEl) {
            recentActivityEl.innerHTML = recentActivity.map(doc => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                        </svg>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${doc.filename || 'Unbekannt'}</div>
                        <div class="activity-meta">${formatDate(doc.uploadedAt)} • ${formatSize(doc.size)}</div>
                    </div>
                </div>
            `).join('');
        }
        
        console.log('✅ Recent activities loaded successfully');
    } catch (error) {
        console.error('❌ Error loading recent activities:', error);
    }
}

// Setup chat functionality (only on chat page)
function setupChatFunctionality() {
    // Only run on chat page
    if (!document.getElementById('chatMessages')) {
        console.log('⚠️ Chat messages element not found, skipping chat setup');
        return;
    }
    
    console.log('💬 Setting up chat functionality...');
    
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    
    // Auto-resize textarea
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 300) + 'px';
        });
        
        // Send message on Enter
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Send button
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        console.log('✅ Send button event listener attached');
    } else {
        console.log('⚠️ Send button not found');
    }
    
    // New chat button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', initChat);
    }
    
    // Clear all button
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllChats);
    }
    
    // Don't initialize chat here - it clears existing messages
    // initChat();
}

// Setup settings functionality (only on settings page)
function setupSettingsFunctionality() {
    // Only run on settings page
    if (!document.getElementById('settingsPage')) {
        return;
    }
    
    console.log('⚙️ Setting up settings functionality...');
    
    // Setup tab switching
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(tabName + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
    
    // Setup knowledge base management
    setupKnowledgeBaseManagement();
}

// Setup knowledge base management
function setupKnowledgeBaseManagement() {
    const kbList = document.getElementById('kbList');
    
    if (!kbList) return;
    
    // Load and display knowledge base
    loadKnowledgeBaseList();
    
    // Load statistics
    loadKnowledgeBaseStats();
}

// Load knowledge base list
async function loadKnowledgeBaseList() {
    try {
        console.log('🔄 Loading knowledge base list...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        if (response.ok) {
        const data = await response.json();
        const documents = data.documents || [];
            console.log('✅ Knowledge base list loaded:', documents.length, 'documents');
            displayKnowledgeBase(documents);
            
            // Also update the global knowledgeBase variable for stats
            knowledgeBase = documents;
            updateKnowledgeBaseStats();
        } else {
            console.error('❌ Failed to load knowledge base list:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading knowledge base list:', error);
    }
}

// Duplicate function removed - using the one above

// Load knowledge base stats
async function loadKnowledgeBaseStats() {
    try {
        console.log('🔄 Loading knowledge base statistics...');
        const response = await fetch(`${API_BASE}/knowledgebase?t=${Date.now()}`);
        if (response.ok) {
            const data = await response.json();
            knowledgeBase = data.documents || [];
            console.log('✅ Knowledge base stats loaded:', knowledgeBase.length, 'documents');
            updateKnowledgeBaseStats();
    } else {
            console.error('❌ Failed to load knowledge base stats:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading knowledge base stats:', error);
    }
}

// Update knowledge base statistics
function updateKnowledgeBaseStats() {
    try {
        const docCount = document.getElementById('kbDocCount');
        const totalSize = document.getElementById('kbTotalSize');
        const lastUpdate = document.getElementById('kbLastUpdate');
        
        console.log('🔄 Updating KB stats:', {
            docCount: docCount ? 'found' : 'not found',
            totalSize: totalSize ? 'found' : 'not found',
            lastUpdate: lastUpdate ? 'found' : 'not found',
            knowledgeBaseLength: knowledgeBase.length
        });
        
        if (docCount) {
            docCount.textContent = knowledgeBase.length;
            console.log('✅ Updated document count:', knowledgeBase.length);
        }
        
        if (totalSize) {
            const totalSizeBytes = knowledgeBase.reduce((sum, doc) => sum + (doc.size || 0), 0);
            totalSize.textContent = formatSize(totalSizeBytes);
            console.log('✅ Updated total size:', formatSize(totalSizeBytes));
        }
        
        if (lastUpdate) {
            if (knowledgeBase.length > 0) {
                const lastDoc = knowledgeBase.sort((a, b) => {
                    let dateA, dateB;
                    
                    // Handle Firestore Timestamp with _seconds
                    if (a.uploadedAt && typeof a.uploadedAt === 'object' && a.uploadedAt._seconds) {
                        dateA = new Date(a.uploadedAt._seconds * 1000);
                    } else if (a.uploadedAt?.toDate) {
                        dateA = a.uploadedAt.toDate();
                    } else {
                        dateA = new Date(a.uploadedAt);
                    }
                    
                    if (b.uploadedAt && typeof b.uploadedAt === 'object' && b.uploadedAt._seconds) {
                        dateB = new Date(b.uploadedAt._seconds * 1000);
                    } else if (b.uploadedAt?.toDate) {
                        dateB = b.uploadedAt.toDate();
                    } else {
                        dateB = new Date(b.uploadedAt);
                    }
                    
                    return dateB - dateA;
                })[0];
                lastUpdate.textContent = lastDoc ? formatDate(lastDoc.uploadedAt) : 'Nie';
                console.log('✅ Updated last update:', lastUpdate.textContent);
        } else {
                lastUpdate.textContent = 'Nie';
                console.log('✅ No documents, set last update to "Nie"');
            }
        }
        
        console.log('✅ Knowledge base statistics updated successfully');
    } catch (error) {
        console.error('❌ Error updating knowledge base stats:', error);
    }
}

// Initialize chat
function initChat() {
    console.log('🔄 Initializing chat...');
    
    const chatDisplay = document.getElementById('chatMessages');
    
    if (!chatDisplay) return;
    
    // Clear chat display
    chatDisplay.innerHTML = '';
    
    // Show welcome message
    showWelcomeMessage();
    
    // Update classes
    chatDisplay.classList.remove('has-messages');
    chatDisplay.classList.add('empty');
    
    console.log('✅ Chat initialized');
}

// Show welcome message
function showWelcomeMessage() {
    const chatDisplay = document.getElementById('chatMessages');
    if (!chatDisplay) return;
    
    // Clear existing messages
    chatDisplay.innerHTML = '';
    
    // Set classes for empty state
    chatDisplay.classList.remove('has-messages');
    chatDisplay.classList.add('empty');
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <h1 class="welcome-title">${systemSettings?.welcomeTitle || 'Cadillac EV Assistant'}</h1>
        <p class="welcome-subtitle">${systemSettings?.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge'}</p>
        <div class="suggestion-grid">
            <button class="suggestion-prompt" onclick="sendSuggestionMessage('Was kostet der Cadillac LYRIQ in der Schweiz?')">
                <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
            </button>
            <button class="suggestion-prompt" onclick="sendSuggestionMessage('Wie hoch ist die Reichweite des LYRIQ?')">
                <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
            </button>
            <button class="suggestion-prompt" onclick="sendSuggestionMessage('Wie lange dauert die Lieferung?')">
                <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
            </button>
            <button class="suggestion-prompt" onclick="sendSuggestionMessage('Welche Garantie gibt es?')">
                <span class="suggestion-prompt-text">Garantie & Service</span>
            </button>
        </div>
    `;
    
    chatDisplay.appendChild(welcomeDiv);
}

// Send message
async function sendMessage(messageText = null) {
    const messageInput = document.getElementById('messageInput');
    const chatDisplay = document.getElementById('chatMessages');
    
    if (!messageInput || !chatDisplay) return;
    
    const message = messageText || messageInput.value.trim();
    if (!message) return;
    
    // Clear input
    if (!messageText) {
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
    
    // Add user message
    addMessage(message, 'user');
    
    // Process message
    processMessage(message);
}

// Send suggestion message
function sendSuggestionMessage(message) {
    sendMessage(message);
}

// Load chat history
async function loadChatHistory() {
    try {
        console.log('💬 Loading chat history...');
        const chatDisplay = document.getElementById('chatMessages');
        if (!chatDisplay) return;
        
        // Load chat history from database (placeholder - implement proper chat storage)
        const chatHistory = [];
        
        // Clear current messages
        chatDisplay.innerHTML = '';
        
        // Add welcome message if no history
        if (chatHistory.length === 0) {
            showWelcomeMessage();
            return;
        }
        
        // Display chat history
        chatHistory.forEach(entry => {
            addMessage(entry.message, entry.role, false);
        });
        
        console.log('✅ Chat history loaded successfully');
    } catch (error) {
        console.error('❌ Error loading chat history:', error);
    }
}

// Clear chat
function clearChat() {
    try {
        console.log('🗑️ Clearing chat...');
        const chatDisplay = document.getElementById('chatMessages');
        if (chatDisplay) {
            chatDisplay.innerHTML = '';
            showWelcomeMessage();
        }
        
        // Clear chat data (placeholder - implement proper chat storage)
        // Note: Chat data should be cleared from database in a real implementation
        
        // Reset global variables
        currentChatId = null;
        currentThreadId = null;
        
        console.log('✅ Chat cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing chat:', error);
    }
}

// Handle quick question
function handleQuickQuestion(question) {
    try {
        console.log('❓ Handling quick question:', question);
        sendMessage(question);
    } catch (error) {
        console.error('❌ Error handling quick question:', error);
    }
}

// Load suggestions
async function loadSuggestions() {
    try {
        console.log('💡 Loading suggestions...');
        const suggestionsContainer = document.getElementById('quickQuestions');
        if (!suggestionsContainer) return;
        
        // Default suggestions
        const suggestions = [
            'Was kostet der Cadillac LYRIQ?',
            'Wie hoch ist die Reichweite?',
            'Lieferzeiten & Bestellung',
            'Garantie & Service'
        ];
        
        // Update suggestions in the UI
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <button class="quick-question-btn" onclick="handleQuickQuestion('${suggestion}')">
                ${suggestion}
            </button>
        `).join('');
        
        console.log('✅ Suggestions loaded successfully');
    } catch (error) {
        console.error('❌ Error loading suggestions:', error);
    }
}

// Format message content with Markdown rendering
function formatMessage(content) {
    // Use marked.js to render markdown with proper configuration
    if (typeof marked !== 'undefined') {
        try {
            // Preprocess content to ensure tables are properly formatted
            content = content.replace(/:\s*(\|[^\n]+\|)/g, ':\n\n$1');
            content = content.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');
            content = content.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');
            
            // Configure marked.js for ChatGPT-like rendering
            marked.setOptions({
                gfm: true,
                breaks: false,
                headerIds: false,
                mangle: false,
                sanitize: false,
                smartLists: true,
                smartypants: false
            });
            
            // Parse markdown to HTML
            let html = marked.parse(content);
            
            // Add proper classes to tables for styling
            html = html.replace(/<table>/g, '<table class="markdown-table">');
            
            // Ensure paragraphs have proper spacing
            html = html.replace(/<p>/g, '<p style="margin: 10px 0;">');
            
            console.log('Markdown rendered successfully');
            return html;
        } catch (e) {
            console.error('Markdown parsing error:', e);
            console.log('Falling back to basic formatting');
        }
    } else {
        console.warn('marked.js not loaded, using fallback');
    }
    
    // Fallback: basic formatting
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\n/g, '<br>');
    return content;
}

// Add message to chat
function addMessage(content, sender) {
    const chatDisplay = document.getElementById('chatMessages');
    if (!chatDisplay) return;
    
    // Hide welcome message instead of removing it to prevent layout jump
    const welcomeMessage = chatDisplay.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
    
    // Update classes
    chatDisplay.classList.remove('empty');
    chatDisplay.classList.add('has-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="user-question">${content}</div>
            </div>
        `;
    } else {
        // Use formatMessage for AI responses to render Markdown
        const formattedContent = formatMessage(content);
        messageDiv.innerHTML = `
            <div class="message-content">${formattedContent}</div>
        `;
    }
    
    chatDisplay.appendChild(messageDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Process message with AI and knowledge base
async function processMessage(message) {
    if (isProcessingMessage) return;
    
    isProcessingMessage = true;
    
    try {
        const response = await fetch(`${API_BASE}/generateChatResponse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                knowledgeBase: knowledgeBase,
                technicalContext: technicalDatabase,
                conversationHistory: [],
                chatId: currentChatId || 'new'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add AI response
        addMessage(data.response, 'assistant');
        
    } catch (error) {
        console.error('❌ Error processing message:', error);
        
        // Add error message
        addMessage('Entschuldigung, es gab einen Fehler beim Verarbeiten Ihrer Nachricht. Bitte versuchen Sie es erneut.', 'assistant');
    } finally {
        isProcessingMessage = false;
    }
}

// Clear all chats
function clearAllChats() {
    console.log('🗑️ Clearing all chats...');
    
    const chatDisplay = document.getElementById('chatMessages');
    if (!chatDisplay) return;
    
    // Clear chat display
    chatDisplay.innerHTML = '';
    
    // Reset chat state
    currentChatId = null;
    currentThreadId = null;
    
    // Show welcome message
    showWelcomeMessage();
    
    // Update classes
    chatDisplay.classList.remove('has-messages');
    chatDisplay.classList.add('empty');
    
    console.log('✅ All chats cleared');
}

// Initialize theme
async function initializeTheme() {
    try {
        // Load theme from database
        const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/branding');
        if (response.ok) {
            const data = await response.json();
            const savedTheme = data.branding?.theme || 'light';
            
            // Apply theme to html and body
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.body.setAttribute('data-theme', savedTheme);
            
            // Apply theme to all page containers
            const pageContainers = document.querySelectorAll('.page, .dashboard-container, .troubleshooting-container, .settings-page, .chat-container');
            pageContainers.forEach(container => {
                container.setAttribute('data-theme', savedTheme);
            });
            
            // Update theme toggle button
            updateThemeToggle(savedTheme);
            
            console.log('✅ Theme loaded from database:', savedTheme);
        } else {
            throw new Error('Failed to load theme from database');
        }
    } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to light theme
        const savedTheme = 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeToggle(savedTheme);
    }
}

// Update theme toggle button appearance - Already defined above

// Toggle theme - Already defined above

// Initialize theme on page load
function initializeTheme() {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    console.log('🎨 Initializing theme:', savedTheme);
    
    // Apply theme to html and body
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    
    // Apply theme to all page containers
    const pageContainers = document.querySelectorAll('.page, .dashboard-container, .troubleshooting-container, .settings-page, .chat-container');
    pageContainers.forEach(container => {
        container.setAttribute('data-theme', savedTheme);
    });
    
    // Update theme toggle button appearance
    updateThemeToggle(savedTheme);
    
    console.log('✅ Theme initialized:', savedTheme);
}

// Make initializeTheme globally accessible
window.initializeTheme = initializeTheme;

// Debug function to check all available functions
window.debugFunctions = function() {
    const functions = {
        toggleTheme: typeof window.toggleTheme,
        initializeTheme: typeof window.initializeTheme,
        setupThemeToggle: typeof window.setupThemeToggle,
        showTagDocuments: typeof window.showTagDocuments,
        closeTagModal: typeof window.closeTagModal,
        refreshTags: typeof window.refreshTags
    };
    
    console.log('🔍 Available Functions:', functions);
    return functions;
};

// Test all functions
window.testAllFunctions = function() {
    console.log('🧪 Testing all functions...');
    
    // Test theme functions
    if (typeof window.toggleTheme === 'function') {
        console.log('✅ toggleTheme function available');
        try {
            window.toggleTheme();
            console.log('✅ toggleTheme executed successfully');
        } catch (error) {
            console.error('❌ toggleTheme error:', error);
        }
    } else {
        console.error('❌ toggleTheme function not available');
    }
    
    // Test tag functions
    if (typeof window.showTagDocuments === 'function') {
        console.log('✅ showTagDocuments function available');
        try {
            window.showTagDocuments('TEST');
            console.log('✅ showTagDocuments executed successfully');
        } catch (error) {
            console.error('❌ showTagDocuments error:', error);
        }
    } else {
        console.error('❌ showTagDocuments function not available');
    }
    
    return 'Test completed';
};

// Setup theme toggle functionality - Improved
function setupThemeToggle() {
    const attemptSetup = () => {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            // Remove any existing listeners to avoid duplicates
            const newToggle = themeToggle.cloneNode(true);
            themeToggle.parentNode.replaceChild(newToggle, themeToggle);
            
            // Add the click listener with proper event handling
            newToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window.toggleTheme === 'function') {
                    window.toggleTheme();
                } else {
                    console.error('❌ toggleTheme function not available');
                }
            });
            
            // Mark as having listener attached
            newToggle.setAttribute('data-listener-attached', 'true');
            
            console.log('✅ Theme toggle setup complete');
            return true;
        } else {
            // Try to find it by class name
            const themeToggleByClass = document.querySelector('.theme-toggle');
            if (themeToggleByClass) {
                const newToggle = themeToggleByClass.cloneNode(true);
                themeToggleByClass.parentNode.replaceChild(newToggle, themeToggleByClass);
                
                newToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.toggleTheme === 'function') {
                        window.toggleTheme();
                    } else {
                        console.error('❌ toggleTheme function not available');
                    }
                });
                
                newToggle.setAttribute('data-listener-attached', 'true');
                
                console.log('✅ Theme toggle setup by class complete');
                return true;
            }
        }
        return false;
    };
    
    // Try immediately
    if (!attemptSetup()) {
        console.log('⚠️ Theme toggle button not found, will retry...');
        // Retry after a short delay
        setTimeout(() => {
            if (!attemptSetup()) {
                console.error('❌ Theme toggle button not found after retry');
            }
        }, 500);
    }
}

// Setup sidebar functionality
function setupSidebarFunctionality() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const chatSidebar = document.getElementById('chatSidebar');
    
    if (sidebarToggle && chatSidebar) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

// Toggle sidebar
function toggleSidebar() {
    const chatSidebar = document.getElementById('chatSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (chatSidebar && sidebarToggle) {
        chatSidebar.classList.toggle('hidden');
        sidebarToggle.classList.toggle('sidebar-open');
    }
}

// Setup technical database search
function setupTechnicalDatabaseSearch() {
    console.log('Setting up technical database search...');
}

// Initialize delete modal
function initDeleteModal() {
    console.log('Initializing delete modal...');
}

// Initialize file editor
function initFileEditor() {
    console.log('Initializing file editor...');
}

// Initialize chat history
function initChatHistory() {
    console.log('Initializing chat history...');
}

// Delete knowledge document
async function deleteKnowledgeDocument(docId) {
    try {
        const response = await fetch(`${API_BASE}/knowledgebase/${docId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccessMessage('Dokument erfolgreich gelöscht!');
            await loadKnowledgeBase();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        console.error('❌ Error deleting document:', error);
        if (typeof showMessage === 'function') {
            showMessage('Fehler beim Löschen des Dokuments', 'error');
        }
    }
}

// Show confirmation dialog
function showConfirmation(message) {
    // Create a custom confirmation dialog instead of browser alert
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            text-align: center;
        `;
        
        dialog.innerHTML = `
            <p style="margin-bottom: 20px; font-size: 16px;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirmYes" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Ja</button>
                <button id="confirmNo" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Nein</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        document.getElementById('confirmYes').onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        
        document.getElementById('confirmNo').onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
    });
}

// Show success message
function showSuccessMessage(message) {
    // Create or update success message
    let successDiv = document.getElementById('successMessage');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'successMessage';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            font-weight: 200;
        `;
        document.body.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Utility functions
function formatMessage(content) {
    // Use marked.js to render markdown with proper configuration
    if (typeof marked !== 'undefined') {
        try {
            // Preprocess content to ensure tables are properly formatted
            content = content.replace(/:\s*(\|[^\n]+\|)/g, ':\n\n$1');
            content = content.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');
            content = content.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');
            
            // Configure marked.js for ChatGPT-like rendering
            marked.setOptions({
                gfm: true,
                breaks: false,
                headerIds: false,
                mangle: false,
                sanitize: false,
                smartLists: true,
                smartypants: false
            });
            
            // Parse markdown to HTML
            let html = marked.parse(content);
            
            // Add proper classes to tables for styling
            html = html.replace(/<table>/g, '<table class="markdown-table">');
            
            // Ensure paragraphs have proper spacing
            html = html.replace(/<p>/g, '<p style="margin: 10px 0;">');
            
            console.log('Markdown rendered successfully');
            return html;
        } catch (e) {
            console.error('Markdown parsing error:', e);
            console.log('Falling back to basic formatting');
        }
    } else {
        console.warn('marked.js not loaded, using fallback');
    }
    
    // Fallback if marked.js is not loaded or parsing fails
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\n/g, '<br>');
    return content;
}

// formatFileSize function removed - using formatSize instead

// Duplicate formatDate function removed - using the one above

// ===== ENHANCED DATABASE TOOLS =====

// Setup enhanced event listeners for knowledge base
function setupKnowledgeBaseEventListeners() {
    const kbList = document.getElementById('kbList');
    if (!kbList) return;

    // Delete button event listeners
    kbList.querySelectorAll('.kb-tool-btn.danger').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const docId = btn.getAttribute('data-doc-id');
            const docName = btn.getAttribute('data-doc-name');
            
            if (typeof showDeleteModal === 'function') {
                showDeleteModal(docId, docName);
            } else {
                if (await showConfirmation(`Möchten Sie "${docName}" wirklich löschen?`)) {
                    deleteKnowledgeDocument(docId);
                }
            }
        });
    });

    // Preview button event listeners
    kbList.querySelectorAll('.kb-tool-btn.primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const docId = btn.getAttribute('data-doc-id');
            console.log('Preview button clicked for docId:', docId);
            if (typeof previewDocument === 'function') {
                previewDocument(docId, 'knowledge');
            } else {
                console.error('previewDocument function not found');
                if (typeof showMessage === 'function') {
                    showMessage('Preview function not available', 'error');
                }
            }
        });
    });

    // Download button event listeners
    kbList.querySelectorAll('.kb-tool-btn:not(.primary):not(.danger)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const docId = btn.getAttribute('data-doc-id');
            downloadDocument(docId, 'knowledge');
        });
    });

    // Checkbox event listeners
    kbList.querySelectorAll('.kb-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });
}

// Setup enhanced event listeners for technical database
function setupTechnicalDatabaseEventListeners() {
    const techList = document.getElementById('techList');
    if (!techList) return;

    // Delete button event listeners
    techList.querySelectorAll('.kb-tool-btn.danger').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const docId = btn.getAttribute('data-doc-id');
            const docName = btn.getAttribute('data-doc-name');
            
            if (typeof showDeleteModal === 'function') {
                showDeleteModal(docId, docName);
            } else {
                if (await showConfirmation(`Möchten Sie "${docName}" wirklich löschen?`)) {
                    deleteTechnicalDocument(docId);
                }
            }
        });
    });

    // Preview button event listeners
    techList.querySelectorAll('.kb-tool-btn.primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const docId = btn.getAttribute('data-doc-id');
            previewDocument(docId, 'technical');
        });
    });

    // Download button event listeners
    techList.querySelectorAll('.kb-tool-btn:not(.primary):not(.danger)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const docId = btn.getAttribute('data-doc-id');
            downloadDocument(docId, 'technical');
        });
    });

    // Checkbox event listeners
    techList.querySelectorAll('.kb-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });
}

// Update bulk actions based on selected items
function updateBulkActions() {
    const selectedCheckboxes = document.querySelectorAll('.kb-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;
    
    // Update knowledge base bulk actions
    const bulkDeleteKbBtn = document.getElementById('bulkDeleteKbBtn');
    const selectedCountEl = document.getElementById('selectedCount');
    if (bulkDeleteKbBtn) {
        bulkDeleteKbBtn.disabled = selectedCount === 0;
        if (selectedCountEl) selectedCountEl.textContent = selectedCount;
    }
    
    // Update technical database bulk actions
    const bulkDeleteTechBtn = document.getElementById('bulkDeleteTechBtn');
    const selectedTechCountEl = document.getElementById('selectedTechCount');
    if (bulkDeleteTechBtn) {
        bulkDeleteTechBtn.disabled = selectedCount === 0;
        if (selectedTechCountEl) selectedTechCountEl.textContent = selectedCount;
    }
}

// Select all functionality
function setupSelectAll() {
    const selectAllKb = document.getElementById('selectAllKb');
    const selectAllTech = document.getElementById('selectAllTech');
    
    if (selectAllKb) {
        selectAllKb.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#kbList .kb-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkActions();
        });
    }
    
    if (selectAllTech) {
        selectAllTech.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#techList .kb-checkbox');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkActions();
        });
    }
}

// Enhanced sorting functionality
function sortDocuments(documents, sortBy) {
    const sorted = [...documents];
    
    switch (sortBy) {
        case 'newest':
            return sorted.sort((a, b) => {
                const aTime = a.uploadedAt?._seconds || a.uploadedAt?.seconds || 0;
                const bTime = b.uploadedAt?._seconds || b.uploadedAt?.seconds || 0;
                return bTime - aTime;
            });
        case 'oldest':
            return sorted.sort((a, b) => {
                const aTime = a.uploadedAt?._seconds || a.uploadedAt?.seconds || 0;
                const bTime = b.uploadedAt?._seconds || b.uploadedAt?.seconds || 0;
                return aTime - bTime;
            });
        case 'name':
            return sorted.sort((a, b) => {
                const aName = (a.filename || a.name || '').toLowerCase();
                const bName = (b.filename || b.name || '').toLowerCase();
                return aName.localeCompare(bName);
            });
        case 'size':
            return sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
        default:
            return sorted;
    }
}

// Enhanced filtering functionality
function filterDocuments(documents, searchTerm, filterType) {
    return documents.filter(doc => {
        const matchesSearch = !searchTerm || 
            (doc.filename || doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.content || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterType === 'all' || 
            (doc.fileType && doc.fileType.toLowerCase() === filterType) ||
            (doc.category && doc.category.toLowerCase() === filterType);
        
        return matchesSearch && matchesFilter;
    });
}

// Export functionality
async function exportDatabase(type) {
    try {
        const endpoint = type === 'knowledge' ? '/knowledgebase' : '/technicalDatabase';
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();
        
        // Use CIS proprietary format instead of JSON
        const databaseType = type === 'knowledge' ? 'knowledge-base' : 'technical-database';
        const filename = `${databaseType}-export-${new Date().toISOString().split('T')[0]}.cis`;
        
        const success = window.exportToCIS(data.documents || [], databaseType, filename);
        
        if (success) {
            showMessage(`Datenbank erfolgreich als CIS-Datei exportiert`, 'success');
        } else {
            showMessage('Fehler beim Exportieren', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Fehler beim Exportieren', 'error');
    }
}

// Import functionality
async function importDatabase(type) {
    const input = document.getElementById(`import${type === 'knowledge' ? 'Kb' : 'Tech'}FileInput`);
    if (!input) return;
    
    input.click();
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (importData.type !== type) {
                showMessage('Falscher Dateityp für diese Datenbank', 'error');
                return;
            }
            
            // Process import
            const endpoint = type === 'knowledge' ? '/knowledgebase' : '/technicalDatabase';
            for (const doc of importData.documents) {
                await fetch(`${API_BASE}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doc)
                });
            }
            
            showMessage('Datenbank erfolgreich importiert', 'success');
            if (type === 'knowledge') {
                loadKnowledgeBase();
            } else {
                loadTechnicalDatabase();
            }
        } catch (error) {
            console.error('Import error:', error);
            showMessage('Fehler beim Importieren', 'error');
        }
    };
}

// Bulk delete functionality
async function bulkDelete(type) {
    const selectedCheckboxes = document.querySelectorAll(`#${type === 'knowledge' ? 'kb' : 'tech'}List .kb-checkbox:checked`);
    const docIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-doc-id'));
    
    if (docIds.length === 0) return;
    
    if (!(await showConfirmation(`Möchten Sie ${docIds.length} Einträge wirklich löschen?`))) return;
    
    try {
        const endpoint = type === 'knowledge' ? '/deleteDocument' : '/deleteTechnicalDocument';
        for (const docId of docIds) {
            await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docId })
            });
        }
        
        showMessage(`${docIds.length} Einträge erfolgreich gelöscht`, 'success');
        if (type === 'knowledge') {
            loadKnowledgeBase();
        } else {
            loadTechnicalDatabase();
        }
    } catch (error) {
        console.error('Bulk delete error:', error);
        showMessage('Fehler beim Löschen', 'error');
    }
}

// Document preview functionality - improved modal matching website design
async function previewDocument(docId, type) {
    console.log('🔍 Previewing document:', docId, 'type:', type);
    
    // Find the document in the appropriate array
    let doc = null;
    try {
        if (type === 'knowledge') {
            if (typeof window.knowledgeBase !== 'undefined' && Array.isArray(window.knowledgeBase)) {
                doc = window.knowledgeBase.find(d => d.id === docId);
            } else if (typeof knowledgeBase !== 'undefined' && Array.isArray(knowledgeBase)) {
                doc = knowledgeBase.find(d => d.id === docId);
            }
        } else if (type === 'technical') {
            if (typeof window.technicalDatabase !== 'undefined' && Array.isArray(window.technicalDatabase)) {
                doc = window.technicalDatabase.find(d => d.id === docId);
            } else {
                try {
                    if (typeof technicalDatabase !== 'undefined' && Array.isArray(technicalDatabase)) {
                        doc = technicalDatabase.find(d => d.id === docId);
                    }
                } catch (e) {
                    // Variable might be in temporal dead zone, try window
                    if (typeof window.technicalDatabase !== 'undefined' && Array.isArray(window.technicalDatabase)) {
                        doc = window.technicalDatabase.find(d => d.id === docId);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error accessing database arrays:', error);
        // Try to fetch document directly from API if arrays aren't available
    }
    
    if (!doc) {
        console.error('❌ Document not found in arrays, trying to fetch from API...');
        // Try to fetch document metadata from API
        try {
            const apiBase = window.API_BASE || API_BASE || 'https://us-central1-cis-de.cloudfunctions.net';
            const apiUrl = `${apiBase}/viewDocument?docId=${docId}&type=${type}&format=json`;
            console.log('📡 Fetching from API:', apiUrl);
            const response = await fetch(apiUrl);
            console.log('📡 API response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                doc = { id: docId, ...data };
                console.log('✅ Document fetched from API');
            } else {
                const errorText = await response.text();
                console.error('❌ API error:', response.status, errorText);
                showMessage('Dokument nicht gefunden', 'error');
                return;
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            showMessage('Dokument nicht gefunden', 'error');
            return;
        }
    }
    
    // Fetch full document content if not available locally
    let fullDoc = doc;
    if (!doc.content && !doc.text && !doc.data) {
        try {
            console.log('📥 Fetching document content from API...');
            const apiBase = window.API_BASE || API_BASE || 'https://us-central1-cis-de.cloudfunctions.net';
            const response = await fetch(`${apiBase}/viewDocument?docId=${docId}&type=${type}&format=json`);
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    fullDoc = { ...doc, ...data };
                }
            }
        } catch (error) {
            console.error('Error fetching document content:', error);
        }
    }
    
    // Create modal matching website design
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3 style="margin: 0; font-size: 18px; font-weight: 500;">${escapeHtml(fullDoc.filename || fullDoc.name || 'Unbekannt')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 24px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" fill="#6b7280" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20"/>
                        </svg>
                        <div>
                            <div style="font-size: 12px; color: #6b7280; font-weight: 400;">Dateityp</div>
                            <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${escapeHtml(fullDoc.fileType || 'Unbekannt')}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" fill="#6b7280" viewBox="0 0 24 24">
                            <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
                        </svg>
                        <div>
                            <div style="font-size: 12px; color: #6b7280; font-weight: 400;">Größe</div>
                            <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${formatSize(fullDoc.size || 0)}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" fill="#6b7280" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                        </svg>
                        <div>
                            <div style="font-size: 12px; color: #6b7280; font-weight: 400;">Hochgeladen</div>
                            <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${formatDate(fullDoc.uploadedAt)}</div>
                        </div>
                    </div>
                    ${fullDoc.category ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" fill="#6b7280" viewBox="0 0 24 24">
                            <path d="M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/>
                        </svg>
                        <div>
                            <div style="font-size: 12px; color: #6b7280; font-weight: 400;">Kategorie</div>
                            <div style="font-size: 14px; color: #1f2937; font-weight: 500;">${escapeHtml(fullDoc.category)}</div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div id="previewContent-${docId}" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; background: #ffffff; min-height: 300px; max-height: 500px; overflow-y: auto;">
                    <div style="text-align: center; padding: 40px 20px;">
                        <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
                        <p style="margin: 0; color: #6b7280; font-size: 16px;">Vorschau wird geladen...</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <button onclick="this.closest('.modal').remove()" style="padding: 10px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">
                        Schließen
                    </button>
                    <button onclick="if(typeof downloadDocument === 'function') { downloadDocument('${docId}', '${type}'); } else { const apiBase = window.API_BASE || 'https://us-central1-cis-de.cloudfunctions.net'; window.open(apiBase + '/downloadDocument?docId=${docId}&type=${type}', '_blank'); }" style="padding: 10px 24px; background: #2d2d2d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    modal.style.display = 'flex';
    modal.classList.add('active');
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Generate preview content
    await generatePreviewContent(docId, fullDoc, type);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Generate preview content based on file type - FIXED VERSION
async function generatePreviewContent(docId, doc, type) {
    const previewContent = document.getElementById(`previewContent-${docId}`);
    if (!previewContent) return;
    
    // Better file type detection
    let fileType = 'unknown';
    const filename = doc.filename || doc.name || '';
    const extension = filename.split('.').pop()?.toLowerCase();
    
    // Map extensions to types
    const extensionMap = {
        'pdf': 'pdf',
        'txt': 'text',
        'md': 'text',
        'csv': 'csv',
        'xlsx': 'excel',
        'xls': 'excel',
        'doc': 'word',
        'docx': 'word',
        'rtf': 'text',
        'log': 'text'
    };
    
    fileType = extensionMap[extension] || (doc.fileType ? doc.fileType.toLowerCase() : 'unknown');
    
    console.log('File type detection:', { filename, extension, fileType, docFileType: doc.fileType });
    
    // Fetch content if not available (for text files)
    let textContent = doc.content || doc.text || doc.data || '';
    if (!textContent && (fileType === 'text' || fileType === 'csv')) {
        try {
            console.log('📥 Fetching document content for preview...');
            const apiBase = window.API_BASE || 'https://us-central1-cis-de.cloudfunctions.net';
            const response = await fetch(`${apiBase}/viewDocument?docId=${docId}&type=${type}&format=json`);
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    textContent = data.content || data.text || '';
                } else {
                    // If not JSON, try to get as text
                    textContent = await response.text();
                }
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    }
    
    let content = '';
    
    switch (fileType) {
        case 'pdf':
            // For PDFs, show message and offer download link
            const apiBase = window.API_BASE || 'https://us-central1-cis-de.cloudfunctions.net';
            const pdfUrl = `${apiBase}/viewDocument?docId=${docId}&type=${type}`;
            content = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: #fee2e2; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" fill="#dc2626" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">PDF-Dokument</h3>
                    <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">PDF-Dokumente können nicht direkt in der Vorschau angezeigt werden.</p>
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                            <strong style="color: #1f2937;">Hinweis:</strong> Verwenden Sie die Download-Funktion, um das PDF-Dokument zu öffnen.
                        </p>
                        <button onclick="window.open('${pdfUrl}', '_blank')" style="padding: 10px 20px; background: #2d2d2d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">
                            PDF öffnen
                        </button>
                    </div>
                </div>
            `;
            break;
            
        case 'text':
            // Display text content
            if (!textContent || textContent.trim() === '') {
                textContent = 'Inhalt nicht verfügbar. Bitte laden Sie die Datei herunter, um den Inhalt zu sehen.';
            }
            
            // Limit preview to first 5000 characters
            const displayText = textContent.length > 5000 ? textContent.substring(0, 5000) + '\n\n... (Inhalt gekürzt - Download für vollständige Ansicht)' : textContent;
            
            content = `
                <div>
                    <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                        <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 500;">Text-Inhalt</h3>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; max-height: 400px; overflow-y: auto;">
                        <pre style="margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(displayText)}</pre>
                    </div>
                </div>
            `;
            break;
            
        case 'csv':
            // Try to display CSV as table
            if (textContent) {
                const lines = textContent.split('\n').slice(0, 100); // Limit to first 100 lines
                const rows = lines.map(line => {
                    const cells = line.split(',');
                    return cells.map(cell => `<td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(cell.trim())}</td>`).join('');
                }).filter(row => row.trim() !== '').map(row => `<tr>${row}</tr>`).join('');
                
                content = `
                    <div>
                        <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                            <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 500;">CSV-Daten</h3>
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; max-height: 400px; overflow: auto;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                ${rows}
                            </table>
                            ${lines.length >= 100 ? '<p style="margin-top: 16px; color: #6b7280; font-size: 14px;">... (weitere Zeilen verfügbar - Download für vollständige Ansicht)</p>' : ''}
                        </div>
                    </div>
                `;
            } else {
                content = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <p style="color: #6b7280;">CSV-Inhalt konnte nicht geladen werden. Bitte verwenden Sie die Download-Funktion.</p>
                    </div>
                `;
            }
            break;
            
        case 'excel':
            content = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: #f3e8ff; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" fill="#7c3aed" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">Tabellen-Dokument</h3>
                    <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">Tabellenkalkulation oder CSV-Datei</p>
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <div style="width: 20px; height: 20px; background: #7c3aed; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                                </svg>
                            </div>
                            <div>
                                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">
                                    <strong style="color: #1f2937;">Hinweis:</strong> Für eine vollständige Ansicht der Tabelle verwenden Sie die Download-Funktion.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'word':
            content = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: #dbeafe; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" fill="#2563eb" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">Word-Dokument</h3>
                    <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">Microsoft Word-Dokument</p>
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <div style="width: 20px; height: 20px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                                </svg>
                            </div>
                            <div>
                                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">
                                    <strong style="color: #1f2937;">Hinweis:</strong> Laden Sie die Datei herunter, um sie mit Microsoft Word zu öffnen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        default:
            content = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <svg width="32" height="32" fill="#6b7280" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,11L9,14H11V18H13V14H15L12,11Z"/>
                        </svg>
                    </div>
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">${fileType === 'excel' ? 'Tabellen-Dokument' : fileType === 'word' ? 'Word-Dokument' : 'Unbekannter Dateityp'}</h3>
                    <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">${fileType === 'excel' ? 'Tabellenkalkulation' : fileType === 'word' ? 'Microsoft Word-Dokument' : 'Vorschau für diesen Dateityp ist nicht verfügbar'}.</p>
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <div style="width: 20px; height: 20px; background: #6b7280; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                                <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                                </svg>
                            </div>
                            <div>
                                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">
                                    <strong style="color: #1f2937;">Empfehlung:</strong> Laden Sie die Datei herunter, um sie mit der entsprechenden Anwendung zu öffnen.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }
    
    previewContent.innerHTML = content;
}

// Document download functionality
async function downloadDocument(docId, type) {
    console.log('⬇️ Downloading document:', docId, 'type:', type);
    
    try {
        // Find the document in the appropriate array
        let doc = null;
        if (type === 'knowledge') {
            doc = knowledgeBase.find(d => d.id === docId);
        } else if (type === 'technical') {
            doc = technicalDatabase.find(d => d.id === docId);
        }
        
        if (!doc) {
            showMessage('Dokument nicht gefunden', 'error');
            return;
        }
        
        // Get filename and content
        const filename = doc.filename || doc.name || 'document';
        const content = doc.content || doc.text || doc.data || '';
        const fileType = doc.fileType || 'txt';
        
        // Create blob with content
        let blob;
        let mimeType;
        
        switch (fileType.toLowerCase()) {
            case 'pdf':
                // For PDF, we can't create a proper PDF from text content
                showMessage('PDF-Download nicht verfügbar. Bitte verwenden Sie die Vorschau.', 'error');
                return;
            case 'txt':
            case 'md':
                blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                break;
            case 'csv':
                blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
                break;
            case 'json':
                blob = new Blob([JSON.stringify(JSON.parse(content), null, 2)], { type: 'application/json;charset=utf-8' });
                break;
            default:
                blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename.endsWith(`.${fileType.toLowerCase()}`) ? filename : `${filename}.${fileType.toLowerCase()}`;
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        showMessage('Download gestartet', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showMessage('Download fehlgeschlagen', 'error');
    }
}

// Show message utility
function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 6px;
        color: white;
        z-index: 10000;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    document.body.appendChild(messageEl);
    setTimeout(() => {
        document.body.removeChild(messageEl);
    }, 3000);
}

// Enhanced initialization for both databases
function initEnhancedDatabases() {
    // Setup select all functionality
    setupSelectAll();
    
    // Setup export/import buttons
    const exportKbBtn = document.getElementById('exportKbBtn');
    const importKbBtn = document.getElementById('importKbBtn');
    const exportTechBtn = document.getElementById('exportTechBtn');
    const importTechBtn = document.getElementById('importTechBtn');
    
    if (exportKbBtn) exportKbBtn.addEventListener('click', () => exportDatabase('knowledge'));
    if (importKbBtn) importKbBtn.addEventListener('click', () => importDatabase('knowledge'));
    if (exportTechBtn) exportTechBtn.addEventListener('click', () => exportDatabase('technical'));
    if (importTechBtn) importTechBtn.addEventListener('click', () => importDatabase('technical'));
    
    // Setup bulk delete buttons
    const bulkDeleteKbBtn = document.getElementById('bulkDeleteKbBtn');
    const bulkDeleteTechBtn = document.getElementById('bulkDeleteTechBtn');
    
    if (bulkDeleteKbBtn) bulkDeleteKbBtn.addEventListener('click', () => bulkDelete('knowledge'));
    if (bulkDeleteTechBtn) bulkDeleteTechBtn.addEventListener('click', () => bulkDelete('technical'));
    
    // Setup sorting
    const kbSort = document.getElementById('kbSort');
    const techSort = document.getElementById('techSort');
    
    if (kbSort) {
        kbSort.addEventListener('change', (e) => {
            const filtered = filterKnowledgeBase();
            const sorted = sortDocuments(filtered, e.target.value);
            displayKnowledgeBase(sorted);
        });
    }
    
    if (techSort) {
        techSort.addEventListener('change', (e) => {
            const filtered = filterTechnicalDatabase();
            const sorted = sortDocuments(filtered, e.target.value);
            displayTechnicalDatabase(sorted);
        });
    }
}

// ========================================
// TROUBLESHOOTING PAGE FUNCTIONS
// ========================================

// Setup problem reporting functionality
function setupProblemReporting() {
    console.log('🔧 Setting up problem reporting functionality...');
    
    const newCaseBtn = document.querySelector('.btn-primary');
    if (newCaseBtn && newCaseBtn.textContent.includes('Neuer Fall')) {
        newCaseBtn.addEventListener('click', () => {
            showMessage('Neue Fall-Erstellung wird geöffnet...', 'info');
            // TODO: Implement new case creation modal
        });
    }
}

// Setup support chat functionality
function setupSupportChat() {
    console.log('💬 Setting up support chat functionality...');
    
    const sendBtn = document.querySelector('.support-chat .send-btn');
    const chatInput = document.querySelector('.support-chat input[type="text"]');
    
    if (sendBtn && chatInput) {
        // Send button click
        sendBtn.addEventListener('click', () => {
            sendSupportMessage(chatInput.value);
        });
        
        // Enter key press
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendSupportMessage(chatInput.value);
            }
        });
    }
}

// Send support message
function sendSupportMessage(message) {
    if (!message || !message.trim()) return;
    
    const chatArea = document.querySelector('.support-chat > div:first-child');
    if (!chatArea) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.style.cssText = 'margin: 8px 0; text-align: right;';
    userMessage.innerHTML = `
        <div class="message-content" style="background: #2d2d2d; color: white; border-radius: 8px; padding: 12px; max-width: 80%; display: inline-block; text-align: left;">
            ${message}
        </div>
    `;
    chatArea.appendChild(userMessage);
    
    // Clear input
    const chatInput = document.querySelector('.support-chat input[type="text"]');
    if (chatInput) chatInput.value = '';
    
    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Simulate support response
    setTimeout(() => {
        const supportMessage = document.createElement('div');
        supportMessage.className = 'chat-message support-message';
        supportMessage.style.cssText = 'margin: 8px 0;';
        supportMessage.innerHTML = `
            <div class="message-content" style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px; max-width: 80%;">
                Danke für Ihre Nachricht! Unser Support-Team wird sich in Kürze bei Ihnen melden.
            </div>
        `;
        chatArea.appendChild(supportMessage);
        chatArea.scrollTop = chatArea.scrollHeight;
    }, 1000);
}

// ========================================
// CHAT PAGE FUNCTIONS
// ========================================

// Setup chat page functionality
function setupChatFunctionality() {
    console.log('💬 Setting up chat page functionality...');
    
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    const newChatBtn = document.getElementById('newChatBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const attachBtn = document.getElementById('attachBtn');
    const imageBtn = document.getElementById('imageBtn');
    const micBtn = document.getElementById('micBtn');
    
    // Send message on button click
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            sendMessage();
        });
    }
    
    // Send message on Enter key (without Shift)
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        });
    }
    
    // New chat button
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            startNewChat();
        });
    }
    
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            toggleSidebar();
        });
    }
    
    // Attach file button
    if (attachBtn) {
        attachBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.click();
        });
    }
    
    // File input change handler
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
        console.log('✅ File input event listener added');
    }
    
    // Image upload button
    if (imageBtn) {
        imageBtn.addEventListener('click', () => {
            const imageInput = document.getElementById('imageInput');
            if (imageInput) imageInput.click();
        });
    }
    
    // Image input change handler
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
        console.log('✅ Image input event listener added');
    }
    
    // Microphone button
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            showMessage('Spracheingabe wird bald verfügbar sein', 'info');
        });
    }
    
    console.log('✅ Chat functionality setup complete');
}

// Handle file upload in chat
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        console.log('📁 Files selected:', files.length);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log('📄 File:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            // Add file to chat
            addFileToChat(file);
        }
    }
}

// Handle image upload in chat
function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        console.log('🖼️ Images selected:', files.length);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log('📷 Image:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            // Add image to chat
            addImageToChat(file);
        }
    }
}

// Add file to chat
function addFileToChat(file) {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const fileMessage = document.createElement('div');
        fileMessage.className = 'message user-message';
        fileMessage.innerHTML = `
            <div class="message-content">
                <div class="file-attachment">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                </div>
            </div>
        `;
        chatMessages.appendChild(fileMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Add image to chat
function addImageToChat(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const imageMessage = document.createElement('div');
            imageMessage.className = 'message user-message';
            imageMessage.innerHTML = `
                <div class="message-content">
                    <div class="image-attachment">
                        <img src="${e.target.result}" alt="${file.name}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                        <div class="image-name">${file.name}</div>
                    </div>
                </div>
            `;
            chatMessages.appendChild(imageMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    };
    reader.readAsDataURL(file);
}

// Start new chat
function startNewChat() {
    const chatMessages = document.getElementById('chatMessages');
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    
    // Clear all messages except welcome
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
    
    // Show welcome message
    if (welcomeMessage) {
        welcomeMessage.style.display = 'block';
    }
    
    // Reset chat state
    currentChatId = null;
    currentThreadId = null;
    
    console.log('🆕 New chat started');
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (sidebar && toggleBtn) {
        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
            sidebar.classList.remove('open');
            toggleBtn.classList.remove('sidebar-open');
        } else {
            sidebar.classList.add('open');
            toggleBtn.classList.add('sidebar-open');
        }
    }
}

// Show message notification
function showMessage(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Make functions globally available
window.loadKnowledgeBase = loadKnowledgeBase;
window.loadTechnicalDatabase = loadTechnicalDatabase;
window.displayTechnicalDatabase = displayTechnicalDatabase;
window.showTechnicalDatabaseLoading = showTechnicalDatabaseLoading;
window.showTechnicalDatabaseError = showTechnicalDatabaseError;
window.showKnowledgeBaseLoading = showKnowledgeBaseLoading;
window.showKnowledgeBaseError = showKnowledgeBaseError;
window.displayKnowledgeBase = displayKnowledgeBase;
window.formatMessage = formatMessage;
window.sendMessage = sendMessage;
window.processMessage = processMessage;
window.addMessage = addMessage;
window.loadKnowledgeBaseList = loadKnowledgeBaseList;
window.loadKnowledgeBaseStats = loadKnowledgeBaseStats;
window.updateKnowledgeBaseStats = updateKnowledgeBaseStats;
window.setupKnowledgeBaseManagement = setupKnowledgeBaseManagement;
window.previewDocument = previewDocument;
window.downloadDocument = downloadDocument;
window.toggleSidebar = toggleSidebar;
// window.toggleTheme already defined above
window.setupThemeToggle = setupThemeToggle;
window.initChat = initChat;
window.clearAllChats = clearAllChats;
window.sendSuggestionMessage = sendSuggestionMessage;
window.deleteKnowledgeDocument = deleteKnowledgeDocument;
window.setupChatFunctionality = setupChatFunctionality;
window.switchPage = switchPage;
window.loadPageContent = loadPageContent;
window.initializePage = initializePage;
window.initKnowledgeBase = initKnowledgeBase;
window.filterKnowledgeBase = filterKnowledgeBase;
window.loadSuggestionsFromKnowledgeBase = loadSuggestionsFromKnowledgeBase;
window.getCurrentPage = getCurrentPage;
window.initEnhancedDatabases = initEnhancedDatabases;
window.setupSelectAll = setupSelectAll;
window.setupKnowledgeBaseEventListeners = setupKnowledgeBaseEventListeners;
window.setupTechnicalDatabaseEventListeners = setupTechnicalDatabaseEventListeners;
window.exportDatabase = exportDatabase;
window.importDatabase = importDatabase;
window.bulkDelete = bulkDelete;
window.sortDocuments = sortDocuments;
window.filterDocuments = filterDocuments;
window.showMessage = showMessage;
window.previewDocument = previewDocument;
window.downloadDocument = downloadDocument;
window.setupProblemReporting = setupProblemReporting;
window.setupSupportChat = setupSupportChat;
window.sendSupportMessage = sendSupportMessage;
window.startNewChat = startNewChat;
window.refreshKnowledgeBase = refreshKnowledgeBase;

// Loading animation functions
function showKnowledgeBaseLoading() {
    const kbList = document.getElementById('kbList');
    if (kbList) {
        kbList.innerHTML = `
            <div class="loading-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
            ">
                <div class="loading-spinner" style="
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <div style="
                    font-size: 16px;
                    font-weight: 500;
                    color: #6b7280;
                    margin-bottom: 8px;
                ">Wissensdatenbank wird geladen...</div>
                <div style="
                    font-size: 14px;
                    color: #9ca3af;
                ">Bitte warten Sie einen Moment</div>
            </div>
        `;
    }
}

function showKnowledgeBaseError(message) {
    const kbList = document.getElementById('kbList');
    if (kbList) {
        kbList.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
            ">
                <div style="
                    width: 48px;
                    height: 48px;
                    background: #fef2f2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                ">
                    <svg width="24" height="24" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <div style="
                    font-size: 16px;
                    font-weight: 500;
                    color: #ef4444;
                    margin-bottom: 8px;
                ">Fehler beim Laden</div>
                <div style="
                    font-size: 14px;
                    color: #6b7280;
                ">${message}</div>
            </div>
        `;
    }
}

function showTechnicalDatabaseLoading() {
    const techList = document.getElementById('techList');
    if (techList) {
        techList.innerHTML = `
            <div class="loading-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
            ">
                <div class="loading-spinner" style="
                    width: 48px;
                    height: 48px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                "></div>
                <div style="
                    font-size: 16px;
                    font-weight: 500;
                    color: #6b7280;
                    margin-bottom: 8px;
                ">Technische Datenbank wird geladen...</div>
                <div style="
                    font-size: 14px;
                    color: #9ca3af;
                ">Bitte warten Sie einen Moment</div>
            </div>
        `;
    }
}

function showTechnicalDatabaseError(message) {
    const techList = document.getElementById('techList');
    if (techList) {
        techList.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
            ">
                <div style="
                    width: 48px;
                    height: 48px;
                    background: #fef2f2;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                ">
                    <svg width="24" height="24" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <div style="
                    font-size: 16px;
                    font-weight: 500;
                    color: #ef4444;
                    margin-bottom: 8px;
                ">Fehler beim Laden</div>
                <div style="
                    font-size: 14px;
                    color: #6b7280;
                ">${message}</div>
            </div>
        `;
    }
}

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Autocomplete functionality for search inputs
function setupAutocomplete(searchInput, type) {
    if (!searchInput) return;
    
    // Create autocomplete container
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.id = `${type}Autocomplete`;
    autocompleteContainer.className = 'document-list-hidden-scroll';
    autocompleteContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        max-height: 200px;
        z-index: 1000;
        display: none;
        width: 100%;
        max-width: 100%;
    `;
    
    // Make search container relative for absolute positioning
    const searchContainer = searchInput.parentElement;
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(autocompleteContainer);
    
    // Constrain autocomplete width to match search input exactly
    const updateAutocompleteWidth = () => {
        const inputRect = searchInput.getBoundingClientRect();
        autocompleteContainer.style.width = inputRect.width + 'px';
        autocompleteContainer.style.left = '0px';
        autocompleteContainer.style.right = 'auto';
    };
    
    // Update width initially and on resize
    updateAutocompleteWidth();
    window.addEventListener('resize', updateAutocompleteWidth);
    
    // Generate suggestions based on type
    const generateSuggestions = (query) => {
        if (!query || query.length < 2) return [];
        
        const suggestions = new Set();
        const lowerQuery = query.toLowerCase();
        
        let documents = [];
        if (type === 'knowledge') {
            documents = window.knowledgeBase || [];
        } else if (type === 'technical') {
            documents = window.technicalDatabase || [];
        }
        
        documents.forEach(doc => {
            // Add filename suggestions
            if (doc.filename && doc.filename.toLowerCase().includes(lowerQuery)) {
                suggestions.add(doc.filename);
            }
            
            // Add vehicle type suggestions
            if (doc.vehicleType && doc.vehicleType.toLowerCase().includes(lowerQuery)) {
                suggestions.add(doc.vehicleType);
            }
            
            // Add manual type suggestions
            if (doc.manualType && doc.manualType.toLowerCase().includes(lowerQuery)) {
                suggestions.add(doc.manualType);
            }
            
            // Add category suggestions
            if (doc.category && doc.category.toLowerCase().includes(lowerQuery)) {
                suggestions.add(doc.category);
            }
            
            // Add description keywords
            if (doc.description) {
                const words = doc.description.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3 && word.includes(lowerQuery)) {
                        suggestions.add(word);
                    }
                });
            }
        });
        
        return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
    };
    
    // Display autocomplete suggestions
    const showSuggestions = (suggestions) => {
        if (suggestions.length === 0) {
            autocompleteContainer.style.display = 'none';
            return;
        }
        
        // Update width before showing suggestions
        updateAutocompleteWidth();
        
        const html = suggestions.map(suggestion => {
            // Find the matching part and truncate if too long
            const query = searchInput.value.toLowerCase();
            const suggestionLower = suggestion.toLowerCase();
            const matchIndex = suggestionLower.indexOf(query);
            
            let displayText = suggestion;
            if (matchIndex !== -1) {
                // Show only the matching part + some context (max 30 chars)
                const start = Math.max(0, matchIndex - 5);
                const end = Math.min(suggestion.length, matchIndex + query.length + 15);
                displayText = suggestion.substring(start, end);
                
                // Add ellipsis if truncated
                if (start > 0) displayText = '...' + displayText;
                if (end < suggestion.length) displayText = displayText + '...';
            }
            
            return `
                <div class="suggestion-item" style="
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 14px;
                    color: #374151;
                    transition: background-color 0.2s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                    box-sizing: border-box;
                " onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor='white'" data-suggestion="${suggestion}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; margin-right: 8px; vertical-align: middle; color: #6b7280; flex-shrink: 0;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; max-width: calc(100% - 24px); box-sizing: border-box;">${displayText}</span>
                </div>
            `;
        }).join('');
        
        autocompleteContainer.innerHTML = html;
        autocompleteContainer.style.display = 'block';
        
        // Add click handlers to suggestions
        autocompleteContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                searchInput.value = item.dataset.suggestion;
                autocompleteContainer.style.display = 'none';
                // Trigger search
                if (type === 'knowledge') {
                    filterKnowledgeBase();
                } else if (type === 'technical') {
                    filterTechnicalDatabase();
                }
            });
        });
    };
    
    // Handle input changes
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const suggestions = generateSuggestions(query);
        showSuggestions(suggestions);
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            autocompleteContainer.style.display = 'none';
        }
    });
    
    // Hide suggestions when pressing Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            autocompleteContainer.style.display = 'none';
        }
    });
}

// Initialize autocomplete for both search inputs when page loads
function initAutocomplete() {
    const kbSearch = document.getElementById('kbSearch');
    const techSearch = document.getElementById('techSearch');
    
    if (kbSearch) {
        setupAutocomplete(kbSearch, 'knowledge');
    }
    
    if (techSearch) {
        setupAutocomplete(techSearch, 'technical');
    }
}

// Add to global scope
window.setupAutocomplete = setupAutocomplete;
window.initAutocomplete = initAutocomplete;


// Theme loaded from Firestore on page load
(function() {
    const savedTheme = null;  // Theme loaded from Firestore
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
        console.log('✅ Theme restored from Firestore:', savedTheme);
    }
})();

// Global Custom Modal Dialogs - NO MORE BROWSER WARNINGS!
window.showConfirmDialog = function(message, onConfirm, onCancel) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);';
        
        modal.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 8px;">Bestätigung</div>
                <div style="color: #6b7280; font-size: 15px;">${message}</div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="customCancelBtn" style="padding: 10px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">Abbrechen</button>
                <button id="customConfirmBtn" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">Bestätigen</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const closeModal = () => {
            document.body.removeChild(overlay);
        };
        
        document.getElementById('customCancelBtn').addEventListener('click', () => {
            closeModal();
            resolve(false);
            if (onCancel) onCancel();
        });
        
        document.getElementById('customConfirmBtn').addEventListener('click', () => {
            closeModal();
            resolve(true);
            if (onConfirm) onConfirm();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                resolve(false);
                if (onCancel) onCancel();
            }
        });
    });
};

window.showPromptDialog = function(title, message, defaultValue = '') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);';
        
        modal.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 8px;">${title}</div>
                <div style="color: #6b7280; font-size: 15px; margin-bottom: 16px;">${message}</div>
                <input type="text" id="promptInput" value="${defaultValue}" 
                    style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-weight: 500;"
                    autofocus>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="promptCancelBtn" style="padding: 10px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">Abbrechen</button>
                <button id="promptConfirmBtn" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 14px;">OK</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        const input = document.getElementById('promptInput');
        input.select();
        
        const closeModal = () => {
            document.body.removeChild(overlay);
        };
        
        const submitValue = () => {
            const value = input.value.trim();
            closeModal();
            resolve(value);
        };
        
        document.getElementById('promptCancelBtn').addEventListener('click', () => {
            closeModal();
            resolve(null);
        });
        
        document.getElementById('promptConfirmBtn').addEventListener('click', submitValue);
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                submitValue();
            } else if (e.key === 'Escape') {
                closeModal();
                resolve(null);
            }
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                resolve(null);
            }
        });
    });
};

window.showNotification = function(message, type = 'success') {
    const existing = document.querySelector('.custom-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.opacity = '1', 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

