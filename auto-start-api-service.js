/**
 * Completely Automatic API Startup Service
 * This runs in the background and automatically starts the advanced API when needed
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class AutomaticAPIService {
    constructor() {
        this.apiProcess = null;
        this.apiUrl = 'http://127.0.0.1:8081';
        this.isRunning = false;
        this.checkInterval = null;
        this.autoStartEnabled = true;
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
     * Automatically start the API server
     */
    async autoStartAPI() {
        if (this.apiProcess || this.isRunning) {
            return true;
        }

        console.log('🤖 Auto-starting Advanced Troubleshooting API...');
        
        const backendPath = path.join(__dirname, 'advanced-troubleshooting-backend');
        const venvPath = path.join(backendPath, '.venv', 'Scripts', 'activate.bat');
        
        if (!fs.existsSync(venvPath)) {
            console.log('❌ Virtual environment not found. Auto-setup required...');
            await this.autoSetup();
        }

        try {
            // Start the API server automatically
            this.apiProcess = spawn('cmd', ['/c', 'uvicorn app:app --host 127.0.0.1 --port 8081'], {
                cwd: backendPath,
                stdio: 'pipe',
                detached: true
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
                
                // Auto-restart if needed
                if (this.autoStartEnabled) {
                    setTimeout(() => this.autoStartAPI(), 5000);
                }
            });

            // Wait a moment for startup
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verify it's running
            const isRunning = await this.checkAPIStatus();
            if (isRunning) {
                this.isRunning = true;
                console.log('✅ Advanced Troubleshooting API auto-started successfully!');
                return true;
            } else {
                console.log('⚠️ API started but not responding yet...');
                return false;
            }
        } catch (error) {
            console.error('❌ Auto-start failed:', error);
            return false;
        }
    }

    /**
     * Auto-setup the system if needed
     */
    async autoSetup() {
        console.log('🔧 Auto-setting up advanced troubleshooting system...');
        
        try {
            // Run the setup script
            const setupProcess = spawn('cmd', ['/c', 'setup-advanced-troubleshooting.bat'], {
                cwd: __dirname,
                stdio: 'pipe'
            });

            return new Promise((resolve, reject) => {
                setupProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Auto-setup completed successfully!');
                        resolve(true);
                    } else {
                        console.log('❌ Auto-setup failed');
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Auto-setup error:', error);
            return false;
        }
    }

    /**
     * Start automatic management
     */
    async startAutomaticManagement() {
        console.log('🚀 Starting automatic advanced troubleshooting management...');
        
        // Check immediately and auto-start if needed
        const isRunning = await this.checkAPIStatus();
        if (!isRunning) {
            console.log('🔍 API not running, auto-starting...');
            await this.autoStartAPI();
        } else {
            console.log('✅ Advanced API already running');
            this.isRunning = true;
        }
        
        // Check every 30 seconds and auto-start if needed
        this.checkInterval = setInterval(async () => {
            const isRunning = await this.checkAPIStatus();
            if (!isRunning && this.autoStartEnabled) {
                console.log('🔄 API not running, auto-restarting...');
                await this.autoStartAPI();
            }
        }, 30000);
    }

    /**
     * Stop automatic management
     */
    stopAutomaticManagement() {
        this.autoStartEnabled = false;
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.apiProcess) {
            this.apiProcess.kill();
            this.apiProcess = null;
        }
        this.isRunning = false;
        console.log('🛑 Automatic API management stopped');
    }
}

// Create global instance
const apiService = new AutomaticAPIService();

// Auto-start when this script is loaded
if (typeof window === 'undefined') {
    // Running in Node.js - start automatic management
    apiService.startAutomaticManagement();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('🛑 Shutting down automatic API service...');
        apiService.stopAutomaticManagement();
        process.exit(0);
    });
} else {
    // Running in browser - just check status
    apiService.checkAPIStatus().then(isRunning => {
        if (isRunning) {
            console.log('✅ Advanced Troubleshooting API is available');
        } else {
            console.log('ℹ️ Advanced Troubleshooting API not running (will auto-start when needed)');
        }
    });
}

module.exports = AutomaticAPIService;
