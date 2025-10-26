// Branding Functions
// Handles logo upload, text customization, color scheme, and advanced settings

(function() {
    'use strict';
    
    const FIREBASE_FUNCTIONS_URL = 'https://us-central1-cis-de.cloudfunctions.net';
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBrandingFunctions);
    } else {
        initBrandingFunctions();
    }
    
    function initBrandingFunctions() {
        console.log('🎨 Initializing Branding Functions...');
        setupBrandingEventListeners();
        loadBrandingSettings();
    }
    
    function setupBrandingEventListeners() {
        // Logo upload
        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            logoUpload.addEventListener('change', handleLogoUpload);
        }
        
        // Color inputs - apply colors in real-time
        const primaryColor = document.getElementById('primaryColor');
        if (primaryColor) {
            primaryColor.addEventListener('input', applyColorsRealtime);
        }
        
        const secondaryColor = document.getElementById('secondaryColor');
        if (secondaryColor) {
            secondaryColor.addEventListener('input', applyColorsRealtime);
        }
        
        const buttonColor = document.getElementById('buttonColor');
        if (buttonColor) {
            buttonColor.addEventListener('input', applyColorsRealtime);
        }
        
        console.log('✅ Branding event listeners set up');
    }
    
    // Load branding settings from backend
    async function loadBrandingSettings() {
        try {
            console.log('🔄 Loading branding settings...');
            const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/branding?t=${Date.now()}`);
            
            if (!response.ok) {
                console.warn('⚠️ Branding endpoint returned error, using defaults');
                return;
            }
            
            const data = await response.json();
            console.log('✅ Branding settings loaded:', data);
            
            // Apply logo
            if (data.logoUrl) {
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreview) {
                    logoPreview.innerHTML = `<img src="${data.logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
                }
                
                // Apply to navigation
                const navLogo = document.getElementById('navLogo');
                if (navLogo && data.showLogoInNav !== false) {
                    navLogo.innerHTML = `<img src="${data.logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
                }
            }
            
            // Apply text fields
            if (data.brandText) {
                const brandTextInput = document.getElementById('brandText');
                if (brandTextInput) brandTextInput.value = data.brandText;
                
                const navBrandText = document.getElementById('navBrandText');
                if (navBrandText) navBrandText.textContent = data.brandText;
            }
            
            if (data.welcomeTitle) {
                const welcomeTitleInput = document.getElementById('welcomeTitle');
                if (welcomeTitleInput) welcomeTitleInput.value = data.welcomeTitle;
            }
            
            if (data.welcomeSubtitle) {
                const welcomeSubtitleInput = document.getElementById('welcomeSubtitle');
                if (welcomeSubtitleInput) welcomeSubtitleInput.value = data.welcomeSubtitle;
            }
            
            if (data.pageTitle) {
                const pageTitleInput = document.getElementById('pageTitle');
                if (pageTitleInput) pageTitleInput.value = data.pageTitle;
                document.title = data.pageTitle;
            }
            
            // Apply colors
            if (data.primaryColor) {
                const primaryColorInput = document.getElementById('primaryColor');
                if (primaryColorInput) primaryColorInput.value = data.primaryColor;
            }
            
            if (data.secondaryColor) {
                const secondaryColorInput = document.getElementById('secondaryColor');
                if (secondaryColorInput) secondaryColorInput.value = data.secondaryColor;
            }
            
            if (data.buttonColor) {
                const buttonColorInput = document.getElementById('buttonColor');
                if (buttonColorInput) buttonColorInput.value = data.buttonColor;
            }
            
            // Apply advanced settings
            if (data.showLogoInNav !== undefined) {
                const showLogoInNavInput = document.getElementById('showLogoInNav');
                if (showLogoInNavInput) showLogoInNavInput.checked = data.showLogoInNav;
            }
            
            if (data.showWelcomeMessage !== undefined) {
                const showWelcomeMessageInput = document.getElementById('showWelcomeMessage');
                if (showWelcomeMessageInput) showWelcomeMessageInput.checked = data.showWelcomeMessage;
            }
            
            if (data.enableAnimations !== undefined) {
                const enableAnimationsInput = document.getElementById('enableAnimations');
                if (enableAnimationsInput) enableAnimationsInput.checked = data.enableAnimations;
            }
            
            // Apply colors to page
            applyColorsRealtime();
            
        } catch (error) {
            console.error('❌ Error loading branding settings:', error);
        }
    }
    
    // Handle logo upload
    async function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Bitte wählen Sie eine Bilddatei aus.', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Die Datei ist zu groß. Maximale Größe: 5MB', 'error');
            return;
        }
        
        try {
            showNotification('Logo wird hochgeladen...', 'info');
            
            // Create form data
            const formData = new FormData();
            formData.append('logo', file);
            
            // Upload to backend
            const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/uploadLogo`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload fehlgeschlagen');
            }
            
            const data = await response.json();
            
            // Update preview
            const logoPreview = document.getElementById('logoPreview');
            if (logoPreview && data.logoUrl) {
                logoPreview.innerHTML = `<img src="${data.logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">`;
            }
            
            showNotification('Logo erfolgreich hochgeladen!', 'success');
            
        } catch (error) {
            console.error('❌ Error uploading logo:', error);
            showNotification('Fehler beim Hochladen des Logos.', 'error');
        }
    }
    
    // Reset logo to default
    window.resetBrandingLogo = async function() {
        if (!confirm('Möchten Sie das Logo wirklich zurücksetzen?')) {
            return;
        }
        
        try {
            const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/resetLogo`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Reset fehlgeschlagen');
            }
            
            // Reset preview to default
            const logoPreview = document.getElementById('logoPreview');
            if (logoPreview) {
                logoPreview.innerHTML = 'C';
            }
            
            // Reset navigation logo
            const navLogo = document.getElementById('navLogo');
            if (navLogo) {
                navLogo.innerHTML = 'C';
            }
            
            showNotification('Logo erfolgreich zurückgesetzt!', 'success');
            
        } catch (error) {
            console.error('❌ Error resetting logo:', error);
            showNotification('Fehler beim Zurücksetzen des Logos.', 'error');
        }
    };
    
    // Apply colors in real-time
    function applyColorsRealtime() {
        const primaryColor = document.getElementById('primaryColor')?.value || '#3b82f6';
        const secondaryColor = document.getElementById('secondaryColor')?.value || '#6b7280';
        const buttonColor = document.getElementById('buttonColor')?.value || '#3b82f6';
        
        // Apply to CSS variables
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
        document.documentElement.style.setProperty('--button-color', buttonColor);
        
        // Apply to buttons
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.style.background = buttonColor;
        });
    }
    
    // Save branding settings
    window.saveBrandingSettings = async function() {
        try {
            showNotification('Einstellungen werden gespeichert...', 'info');
            
            const settings = {
                brandText: document.getElementById('brandText')?.value || 'Cadillac EV',
                welcomeTitle: document.getElementById('welcomeTitle')?.value || 'Cadillac EV Assistant',
                welcomeSubtitle: document.getElementById('welcomeSubtitle')?.value || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                pageTitle: document.getElementById('pageTitle')?.value || 'Cadillac EV Assistant',
                primaryColor: document.getElementById('primaryColor')?.value || '#3b82f6',
                secondaryColor: document.getElementById('secondaryColor')?.value || '#6b7280',
                buttonColor: document.getElementById('buttonColor')?.value || '#3b82f6',
                showLogoInNav: document.getElementById('showLogoInNav')?.checked !== false,
                showWelcomeMessage: document.getElementById('showWelcomeMessage')?.checked !== false,
                enableAnimations: document.getElementById('enableAnimations')?.checked !== false
            };
            
            const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/saveBranding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            if (!response.ok) {
                throw new Error('Speichern fehlgeschlagen');
            }
            
            // Apply settings immediately
            const navBrandText = document.getElementById('navBrandText');
            if (navBrandText) navBrandText.textContent = settings.brandText;
            
            document.title = settings.pageTitle;
            
            applyColorsRealtime();
            
            showNotification('Einstellungen erfolgreich gespeichert!', 'success');
            
        } catch (error) {
            console.error('❌ Error saving branding settings:', error);
            showNotification('Fehler beim Speichern der Einstellungen.', 'error');
        }
    };
    
    // Reset all branding settings
    window.resetAllBranding = async function() {
        if (!confirm('Möchten Sie wirklich alle Branding-Einstellungen zurücksetzen?')) {
            return;
        }
        
        try {
            const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/resetBranding`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Reset fehlgeschlagen');
            }
            
            // Reload settings
            await loadBrandingSettings();
            
            showNotification('Alle Einstellungen erfolgreich zurückgesetzt!', 'success');
            
            // Reload page to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error resetting branding:', error);
            showNotification('Fehler beim Zurücksetzen der Einstellungen.', 'error');
        }
    };
    
    // Show notification
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Expose loadBrandingSettings globally
    window.loadBrandingSettings = loadBrandingSettings;
    
    console.log('✅ Branding Functions loaded');
})();

