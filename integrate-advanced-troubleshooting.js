/**
 * Integration script to connect advanced troubleshooting system with existing Firebase app
 */

// Advanced troubleshooting API configuration
const ADVANCED_API_URL = 'http://127.0.0.1:8081'; // Auto-detected local API

/**
 * Enhanced image analysis using CLIP + FAISS
 */
async function analyzeImageAdvanced(imageFile) {
    try {
        console.log('🔍 Starting advanced image analysis...');
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Call advanced troubleshooting API
        const response = await fetch(`${ADVANCED_API_URL}/search`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Advanced analysis complete:', result);
        
        return {
            success: true,
            page: result.page,
            score: result.score,
            context: result.context_text,
            vehicle: result.vehicle,
            manual: result.manual,
            matchType: result.match_type,
            confidence: result.score > 0.7 ? 'high' : result.score > 0.5 ? 'medium' : 'low'
        };
        
    } catch (error) {
        console.error('❌ Advanced analysis failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get advanced troubleshooting statistics
 */
async function getAdvancedStats() {
    try {
        const response = await fetch(`${ADVANCED_API_URL}/stats`);
        const stats = await response.json();
        return stats;
    } catch (error) {
        console.error('❌ Failed to get stats:', error);
        return null;
    }
}

/**
 * Enhanced troubleshooting page integration
 */
function integrateAdvancedTroubleshooting() {
    console.log('🔧 Integrating advanced troubleshooting system...');
    
    // Check if we're on the troubleshooting page
    if (!window.location.pathname.includes('troubleshooting')) {
        console.log('ℹ️ Not on troubleshooting page, skipping integration');
        return;
    }
    
    // Add advanced analysis button
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        const advancedButton = document.createElement('button');
        advancedButton.id = 'advancedAnalysisBtn';
        advancedButton.className = 'btn btn-primary';
        advancedButton.innerHTML = '🧠 Advanced AI Analysis';
        advancedButton.style.marginTop = '10px';
        advancedButton.style.display = 'none';
        
        uploadArea.appendChild(advancedButton);
        
        // Show button when image is uploaded
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    advancedButton.style.display = 'block';
                }
            });
        }
        
        // Handle advanced analysis
        advancedButton.addEventListener('click', async () => {
            const imageInput = document.getElementById('imageInput');
            if (!imageInput.files[0]) {
                alert('Please upload an image first');
                return;
            }
            
            advancedButton.disabled = true;
            advancedButton.innerHTML = '🧠 Analyzing...';
            
            try {
                const result = await analyzeImageAdvanced(imageInput.files[0]);
                
                if (result.success) {
                    // Display advanced results
                    displayAdvancedResults(result);
                } else {
                    alert(`Analysis failed: ${result.error}`);
                }
            } catch (error) {
                console.error('Advanced analysis error:', error);
                alert('Advanced analysis failed');
            } finally {
                advancedButton.disabled = false;
                advancedButton.innerHTML = '🧠 Advanced AI Analysis';
            }
        });
    }
    
    console.log('✅ Advanced troubleshooting integration complete');
}

/**
 * Display advanced analysis results
 */
function displayAdvancedResults(result) {
    // Create or update results container
    let resultsContainer = document.getElementById('advancedResults');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'advancedResults';
        resultsContainer.className = 'advanced-results';
        resultsContainer.style.cssText = `
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.parentNode.insertBefore(resultsContainer, uploadArea.nextSibling);
        }
    }
    
    // Update results content
    resultsContainer.innerHTML = `
        <h3>🧠 Advanced AI Analysis Results</h3>
        <div class="result-item">
            <strong>📄 Manual Page:</strong> ${result.page}
        </div>
        <div class="result-item">
            <strong>🚗 Vehicle:</strong> ${result.vehicle}
        </div>
        <div class="result-item">
            <strong>📚 Manual:</strong> ${result.manual}
        </div>
        <div class="result-item">
            <strong>🎯 Match Type:</strong> ${result.matchType}
        </div>
        <div class="result-item">
            <strong>📊 Confidence:</strong> 
            <span class="confidence-${result.confidence}">${result.confidence.toUpperCase()}</span>
            (${(result.score * 100).toFixed(1)}%)
        </div>
        <div class="result-item">
            <strong>📝 Context:</strong>
            <div class="context-text">${result.context}</div>
        </div>
        <style>
            .confidence-high { color: #28a745; font-weight: bold; }
            .confidence-medium { color: #ffc107; font-weight: bold; }
            .confidence-low { color: #dc3545; font-weight: bold; }
            .context-text {
                margin-top: 10px;
                padding: 10px;
                background: white;
                border-radius: 4px;
                border: 1px solid #ddd;
                white-space: pre-wrap;
                max-height: 200px;
                overflow-y: auto;
            }
        </style>
    `;
}

/**
 * Auto-start advanced troubleshooting API
 */
async function autoStartAdvancedAPI() {
    try {
        // Try to start the API server automatically
        console.log('Auto-starting advanced troubleshooting API...');
        
        // Check if API is already running
        const response = await fetch(`${ADVANCED_API_URL}/`, { 
            method: 'GET',
            timeout: 2000 
        });
        
        if (response.ok) {
            console.log('Advanced API already running');
            return true;
        }
    } catch (error) {
        console.log('Advanced API not running, attempting auto-start...');
        
        // Try to start the API server
        try {
            // This would work in a Node.js environment, but in browser we'll show instructions
            console.log('Please run: auto-start-advanced-api.bat');
            return false;
        } catch (startError) {
            console.log('Auto-start failed, manual start required');
            return false;
        }
    }
}

/**
 * Initialize advanced troubleshooting system with auto-start
 */
async function initAdvancedTroubleshooting() {
    console.log('Initializing advanced troubleshooting system...');
    
    // Try to auto-start the API
    const apiStarted = await autoStartAdvancedAPI();
    
    if (apiStarted) {
        // Check if advanced API is available
        fetch(`${ADVANCED_API_URL}/`)
            .then(response => response.json())
            .then(data => {
                console.log('Advanced API connected:', data);
                integrateAdvancedTroubleshooting();
            })
            .catch(error => {
                console.log('Advanced API connection failed:', error.message);
            });
    } else {
        // Show user-friendly message
        console.log('Advanced troubleshooting features will be available when the API server is running');
        console.log('To enable: Run auto-start-advanced-api.bat');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdvancedTroubleshooting);
} else {
    initAdvancedTroubleshooting();
}

// Export functions for manual use
window.analyzeImageAdvanced = analyzeImageAdvanced;
window.getAdvancedStats = getAdvancedStats;
window.integrateAdvancedTroubleshooting = integrateAdvancedTroubleshooting;
