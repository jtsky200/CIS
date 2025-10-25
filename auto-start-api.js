/**
 * Automatic API startup system for advanced troubleshooting
 * This script runs in the background and ensures the API is always available
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AdvancedTroubleshootingAPI {
    constructor() {
        this.apiProcess = null;
        this.apiUrl = 'http://127.0.0.1:8081';
        this.isRunning = false;
        this.checkInterval = null;
    }

    /**
     * Check if the API is running
     */
    async checkAPIStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/`, { 
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Start the API server
     */
    startAPI() {
        if (this.apiProcess) {
            console.log('API server already running');
            return;
        }

        console.log('Starting Advanced Troubleshooting API...');
        
        const backendPath = path.join(__dirname, 'advanced-troubleshooting-backend');
        const venvPath = path.join(backendPath, '.venv', 'Scripts', 'activate.bat');
        
        if (!fs.existsSync(venvPath)) {
            console.log('Virtual environment not found. Please run setup first.');
            return;
        }

        // Start the API server
        this.apiProcess = spawn('cmd', ['/c', 'uvicorn app:app --host 127.0.0.1 --port 8081'], {
            cwd: backendPath,
            stdio: 'pipe'
        });

        this.apiProcess.stdout.on('data', (data) => {
            console.log(`API: ${data}`);
        });

        this.apiProcess.stderr.on('data', (data) => {
            console.error(`API Error: ${data}`);
        });

        this.apiProcess.on('close', (code) => {
            console.log(`API server stopped with code ${code}`);
            this.apiProcess = null;
            this.isRunning = false;
        });

        this.isRunning = true;
        console.log('Advanced Troubleshooting API started on http://127.0.0.1:8081');
    }

    /**
     * Stop the API server
     */
    stopAPI() {
        if (this.apiProcess) {
            this.apiProcess.kill();
            this.apiProcess = null;
            this.isRunning = false;
            console.log('Advanced Troubleshooting API stopped');
        }
    }

    /**
     * Auto-manage the API server
     */
    async autoManage() {
        const isRunning = await this.checkAPIStatus();
        
        if (!isRunning && !this.isRunning) {
            console.log('API not running, starting automatically...');
            this.startAPI();
        } else if (isRunning && !this.isRunning) {
            console.log('API is running externally');
            this.isRunning = true;
        }
    }

    /**
     * Start auto-management
     */
    startAutoManagement() {
        console.log('Starting auto-management of Advanced Troubleshooting API...');
        
        // Check immediately
        this.autoManage();
        
        // Check every 30 seconds
        this.checkInterval = setInterval(() => {
            this.autoManage();
        }, 30000);
    }

    /**
     * Stop auto-management
     */
    stopAutoManagement() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.stopAPI();
    }
}

// Create global instance
const apiManager = new AdvancedTroubleshootingAPI();

// Auto-start when this script is loaded
if (typeof window === 'undefined') {
    // Running in Node.js
    apiManager.startAutoManagement();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Shutting down Advanced Troubleshooting API...');
        apiManager.stopAutoManagement();
        process.exit(0);
    });
} else {
    // Running in browser - just check status
    apiManager.checkAPIStatus().then(isRunning => {
        if (isRunning) {
            console.log('Advanced Troubleshooting API is available');
        } else {
            console.log('Advanced Troubleshooting API not running');
        }
    });
}

module.exports = AdvancedTroubleshootingAPI;
