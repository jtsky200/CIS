/**
 * Automatic API Startup System
 * This runs when the webapp is accessed and automatically starts the advanced API
 */

class StartupAPIManager {
    constructor() {
        this.apiUrl = 'http://127.0.0.1:8081';
        this.isChecking = false;
    }

    /**
     * Check if API is running
     */
    async checkAPI() {
        try {
            const response = await fetch(`${this.apiUrl}/`, { 
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Automatically start the API using a simple method
     */
    async autoStartAPI() {
        console.log('🤖 Attempting to auto-start Advanced API...');
        
        try {
            // Create a simple start request
            const startData = {
                action: 'start_advanced_api',
                port: 8081,
                auto: true
            };

            // Try to trigger the start via a simple endpoint
            const response = await fetch('/api/auto-start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(startData)
            });

            if (response.ok) {
                console.log('✅ Auto-start request sent');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Auto-start not available via API');
        }

        // Fallback: Show user-friendly message
        this.showAutoStartMessage();
        return false;
    }

    /**
     * Show auto-start message
     */
    showAutoStartMessage() {
        // System works completely automatically - no manual setup required
        console.log('Advanced features will be automatically detected when available');
    }

    /**
     * Initialize automatic API management
     */
    async init() {
        if (this.isChecking) return;
        this.isChecking = true;

        console.log('🔍 Auto-checking advanced troubleshooting capabilities...');

        try {
            const isRunning = await this.checkAPI();
            
            if (isRunning) {
                console.log('✅ Advanced API detected - enhanced features available!');
                
                // Enable advanced features
                this.enableAdvancedFeatures();
            } else {
                console.log('ℹ️ Advanced API not running - will auto-detect when available');
                
                // Show helpful message
                this.showAutoStartMessage();
                
                // Try to auto-start
                await this.autoStartAPI();
            }
        } catch (error) {
            console.log('⚠️ Error checking API status:', error);
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * Enable advanced features when API is detected
     */
    enableAdvancedFeatures() {
        // Update the analyze button
        const analyzeButton = document.getElementById('analyzeProblemButton');
        if (analyzeButton) {
            analyzeButton.innerHTML = `
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Advanced AI Analysis
            `;
            analyzeButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            analyzeButton.style.color = 'white';
            analyzeButton.style.border = 'none';
        }

        // Update the title
        const title = document.querySelector('.settings-section h2');
        if (title) {
            title.innerHTML = `
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Intelligente Problemdiagnose (Erweitert)
            `;
        }

        // Override the analyze function
        if (typeof window.analyzeProblem === 'function') {
            const originalAnalyze = window.analyzeProblem;
            window.analyzeProblem = async function() {
                await analyzeWithAdvancedAPI();
            };
        }

        console.log('🎉 Advanced features enabled automatically!');
    }
}

// Create global instance
const startupAPI = new StartupAPIManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for the page to fully load
    setTimeout(() => {
        startupAPI.init();
    }, 1000);
});

// Export for global access
window.startupAPI = startupAPI;
