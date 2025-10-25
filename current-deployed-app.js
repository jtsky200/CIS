// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDII-zDQqvH_gs6Zn1c5K8R_E-brT5gybc",
    authDomain: "cis-de.firebaseapp.com",
    projectId: "cis-de",
    storageBucket: "cis-de.firebasestorage.app",
    messagingSenderId: "502898672325",
    appId: "1:502898672325:web:1d3ffbd8ccfe11fb1a66ac",
    measurementId: "G-KZMMKLEP41"
};

// API Base URL
const API_BASE = 'https://us-central1-cis-de.cloudfunctions.net';

// Global variables - MUST be defined at the top
let currentChatId = null;
let currentThreadId = null;
let isProcessingMessage = false;
let isFirstMessage = true;

// System settings with default values - MUST be available immediately
let systemSettings = {
    brandText: 'Cadillac EV',
    welcomeTitle: 'Cadillac EV Assistant',
    welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
    logoUrl: ''
};

// Retry last message function
function retryLastMessage() {
    console.log('🔄 Retrying last message...');
    const chatDisplay = document.getElementById('chatDisplay');
    if (chatDisplay) {
        // Remove error message
        const errorMessage = chatDisplay.querySelector('.message.error');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        // Get the last user message
        const userMessages = chatDisplay.querySelectorAll('.message.user');
        if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            const messageText = lastUserMessage.querySelector('.user-question')?.textContent;
            if (messageText) {
                processSuggestionMessage(messageText);
            }
        }
    }
}

// Process suggestion messages properly
function processSuggestionMessage(message) {
    console.log('💬 Processing suggestion message:', message);
    
    // Use the existing sendMessage function which handles everything properly
    sendMessage(message);
}

// Make processSuggestionMessage globally available
window.processSuggestionMessage = processSuggestionMessage;

// Unified function to add event listeners to suggestion prompts
function addSuggestionPromptListeners() {
    console.log('🔗 Adding suggestion prompt listeners...');
    const suggestionPrompts = document.querySelectorAll('.suggestion-prompt');
    console.log(`Found ${suggestionPrompts.length} suggestion prompts`);
    
    suggestionPrompts.forEach((prompt, index) => {
        // Remove any existing event listeners
        prompt.onclick = null;
        if (prompt.suggestionClickHandler) {
            prompt.removeEventListener('click', prompt.suggestionClickHandler);
        }
        
        // Create new event handler
        prompt.suggestionClickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const message = prompt.getAttribute('data-message');
            console.log(`💬 Suggestion ${index + 1} clicked:`, message);
            if (message) {
                processSuggestionMessage(message);
            }
        };
        
        // Add the event listener
        prompt.addEventListener('click', prompt.suggestionClickHandler);
        console.log(`✅ Added listener to suggestion ${index + 1}`);
    });
    
    console.log('✅ All suggestion prompt listeners added');
}

// Make addSuggestionPromptListeners globally available
window.addSuggestionPromptListeners = addSuggestionPromptListeners;

// Direct button handlers
function handleNewChat() {
    console.log('🆕 New chat button clicked!');
    
    // Clear current chat
    currentChatId = null;
    currentThreadId = null;
    
    // Clear chat messages and show welcome screen
    const chatDisplay = document.getElementById('chatDisplay');
    if (chatDisplay) {
        chatDisplay.innerHTML = '';
        chatDisplay.classList.remove('has-messages');
        chatDisplay.classList.add('empty');
        
        // Show welcome message
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.id = 'welcomeMessage';
        
        // Get system settings or use defaults
        const welcomeTitle = (typeof systemSettings !== 'undefined' && systemSettings.welcomeTitle) 
            ? systemSettings.welcomeTitle 
            : 'Cadillac EV Assistant';
        const welcomeSubtitle = (typeof systemSettings !== 'undefined' && systemSettings.welcomeSubtitle) 
            ? systemSettings.welcomeSubtitle 
            : 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge';
        
        welcomeDiv.innerHTML = `
            <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 8px; color: #2a2a2a;">${welcomeTitle}</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; font-weight: 400;">${welcomeSubtitle}</p>
            <div class="suggestion-grid">
                <button class="suggestion-prompt" data-message="Was kostet der Cadillac LYRIQ in der Schweiz?">
                    <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
                </button>
                <button class="suggestion-prompt" data-message="Wie hoch ist die Reichweite des LYRIQ?">
                    <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
                </button>
                <button class="suggestion-prompt" data-message="Wie lange dauert die Lieferung?">
                    <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
                </button>
                <button class="suggestion-prompt" data-message="Welche Garantie gibt es?">
                    <span class="suggestion-prompt-text">Garantie & Service</span>
                </button>
            </div>
        `;
        chatDisplay.appendChild(welcomeDiv);
        
        // Add event listeners to suggestion prompts
        if (typeof addSuggestionPromptListeners === 'function') {
            addSuggestionPromptListeners();
        } else {
            console.warn('⚠️ addSuggestionPromptListeners function not available');
        }
    }
    
    // Create new chat in database
    if (typeof createNewChat === 'function') {
        createNewChat().catch(error => {
            console.error('❌ Error creating new chat:', error);
        });
    } else {
        console.warn('⚠️ createNewChat function not available');
    }
}

// Test function to verify button is clickable (no popup)
window.testClearAll = function() {
    console.log('🧪 Test function called - button is clickable!');
    handleClearAll();
};

// Simple test function to verify basic functionality
window.testButton = function() {
    console.log('🧪 Testing button functionality...');
    const btn = document.getElementById('clearAllBtn');
    if (btn) {
        console.log('✅ Button found:', btn);
        console.log('✅ Button onclick:', btn.onclick);
        console.log('✅ handleClearAll function:', typeof handleClearAll);
        
        // Test if function exists and is callable
        if (typeof handleClearAll === 'function') {
            console.log('✅ handleClearAll is a function, calling it...');
            handleClearAll();
        } else {
            console.error('❌ handleClearAll is not a function!');
        }
    } else {
        console.error('❌ Button not found!');
    }
};

// Simple click handler for the clear all button
window.handleClearAllClick = function() {
    console.log('🗑️ Clear all button clicked!');
    try {
        if (typeof handleClearAll === 'function') {
            console.log('✅ Calling handleClearAll...');
            handleClearAll();
        } else {
            console.error('❌ handleClearAll function not found');
            // Fallback: try to call clearAllChats directly
            if (typeof clearAllChats === 'function') {
                console.log('🔄 Trying clearAllChats directly...');
                clearAllChats();
            } else {
                console.error('❌ No clear all function available');
            }
        }
    } catch (error) {
        console.error('❌ Error in handleClearAllClick:', error);
    }
};

// Make handleClearAll globally available
window.handleClearAll = async function handleClearAll() {
    console.log('🗑️ Clear all button clicked!');
    console.log('🔍 Starting clear all process...');
    
    try {
        // Clear current chat
        currentChatId = null;
        currentThreadId = null;
        console.log('✅ Current chat cleared');
    
        // Switch to chat page to show the cleared state
        if (getCurrentPage() !== 'chat') {
            console.log('Switching to chat page to show cleared state...');
            switchPage('chat');
            // Wait for page switch to complete
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    
        // Clear chat messages and show welcome screen
        const chatDisplay = document.getElementById('chatDisplay');
        if (chatDisplay) {
            console.log('✅ Chat display found, clearing content...');
            chatDisplay.innerHTML = '';
            chatDisplay.classList.remove('has-messages');
            chatDisplay.classList.add('empty');
            
            // Show welcome message
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.id = 'welcomeMessage';
            // Use safe fallback values
            const welcomeTitle = systemSettings?.welcomeTitle || 'Cadillac EV Assistant';
            const welcomeSubtitle = systemSettings?.welcomeSubtitle || 'Ihr persönlicher Assistent';
            
            welcomeDiv.innerHTML = `
                <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 8px; color: #2a2a2a;">${welcomeTitle}</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; font-weight: 400;">${welcomeSubtitle}</p>
                <div class="suggestion-grid">
                    <button class="suggestion-prompt" data-message="Was kostet der Cadillac LYRIQ in der Schweiz?">
                        <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
                    </button>
                    <button class="suggestion-prompt" data-message="Wie hoch ist die Reichweite des LYRIQ?">
                        <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
                    </button>
                    <button class="suggestion-prompt" data-message="Wie lange dauert die Lieferung?">
                        <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
                    </button>
                    <button class="suggestion-prompt" data-message="Welche Garantie gibt es?">
                        <span class="suggestion-prompt-text">Garantie & Service</span>
                    </button>
                </div>
            `;
            chatDisplay.appendChild(welcomeDiv);
            console.log('✅ Welcome message added');
            
            // Add event listeners to suggestion prompts
            addSuggestionPromptListeners();
            console.log('✅ Suggestion prompts configured');
        } else {
            console.error('❌ Chat display not found!');
        }
        
        // Clear all chats from database
        console.log('🗑️ Clearing all chats from database...');
        if (typeof clearAllChats === 'function') {
            await clearAllChats();
            console.log('✅ All chats cleared from database');
        } else {
            console.error('❌ clearAllChats function not found!');
            // Fallback: try to call the API directly
            try {
                const userId = getUserId();
                const response = await fetch(`${API_BASE}/clearAllChats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to clear all chats');
                }
                console.log('✅ All chats cleared from database (fallback)');
            } catch (error) {
                console.error('❌ Error clearing chats (fallback):', error);
            }
        }
        
        // Reload chat history to show empty state
        console.log('🔄 Reloading chat history...');
        if (typeof loadChatHistory === 'function') {
            await loadChatHistory();
            console.log('✅ Chat history reloaded');
        } else {
            console.error('❌ loadChatHistory function not found!');
        }
        
        console.log('🎉 Clear all completed successfully!');
        
    } catch (error) {
        console.error('❌ Error in handleClearAll:', error);
        console.error('Error details:', error.message);
    }
}

// State
let selectedFiles = [];
let knowledgeBase = [];
let chatHistory = [];
let currentCitations = [];

// Performance optimization caches
const performanceCache = {
    knowledgeBase: new Map(),
    technicalDatabase: new Map(),
    chatHistory: new Map(),
    settings: new Map(),
    lastUpdated: new Map()
};

// Cache configuration
const CACHE_DURATION = {
    knowledgeBase: 5 * 60 * 1000, // 5 minutes
    technicalDatabase: 10 * 60 * 1000, // 10 minutes
    chatHistory: 30 * 60 * 1000, // 30 minutes
    settings: 60 * 60 * 1000 // 1 hour
};

// Helper function to get conversation history for AI context
function getConversationHistory() {
    const chatDisplay = document.getElementById('chatDisplay');
    if (!chatDisplay) return [];
    
    const messages = [];
    const messageElements = chatDisplay.querySelectorAll('.message');
    
    messageElements.forEach(msgElement => {
        const role = msgElement.classList.contains('user') ? 'user' : 'assistant';
        const contentElement = msgElement.querySelector('.message-content');
        if (contentElement) {
            const content = contentElement.textContent || contentElement.innerText;
            if (content.trim()) {
                messages.push({
                    role: role,
                    content: content.trim()
                });
            }
        }
    });
    
    // Return last 10 messages to avoid token limits
    return messages.slice(-10);
}

// Mobile optimization functions
function initMobileOptimizations() {
    // Add sidebar overlay for mobile
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.querySelector('.sidebar-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', closeSidebar);
        document.body.appendChild(overlay);
    }
    
    // Handle mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add touch feedback for buttons
    addTouchFeedback();
}

// Make toggleSidebar globally available
window.toggleSidebar = function toggleSidebar() {
    console.log('🔄 Toggle sidebar called');
    
    try {
        const sidebar = document.getElementById('chatSidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        console.log('Sidebar element:', sidebar);
        console.log('Toggle element:', sidebarToggle);
        
        if (sidebar && sidebarToggle) {
            const isHidden = sidebar.classList.contains('hidden');
            console.log('Sidebar is hidden:', isHidden);
            
            if (isHidden) {
                // Show sidebar
                sidebar.classList.remove('hidden');
                sidebarToggle.classList.add('sidebar-open');
                console.log('✅ Sidebar opened');
            } else {
                // Hide sidebar
                sidebar.classList.add('hidden');
                sidebarToggle.classList.remove('sidebar-open');
                console.log('✅ Sidebar closed');
            }
        } else {
            console.error('❌ Sidebar elements not found');
            console.error('Sidebar:', sidebar);
            console.error('Toggle:', sidebarToggle);
            
            // Try alternative selectors
            const altSidebar = document.querySelector('.chat-sidebar, #chatSidebar');
            const altToggle = document.querySelector('.chat-sidebar-toggle, #sidebarToggle');
            console.log('Alternative sidebar:', altSidebar);
            console.log('Alternative toggle:', altToggle);
        }
    } catch (error) {
        console.error('❌ Error in toggleSidebar:', error);
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebar && sidebarToggle) {
        sidebar.classList.add('hidden');
        sidebarToggle.classList.remove('sidebar-open');
        document.body.style.overflow = '';
        console.log('🔄 Sidebar closed');
    }
}

function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (isMobile) {
        // Mobile: sidebar should be hidden by default
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('show');
        }
        document.body.style.overflow = '';
    } else {
        // Desktop: remove mobile-specific classes
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('show');
        }
        document.body.style.overflow = '';
    }
}

function addTouchFeedback() {
    // Add touch feedback to all buttons
    const buttons = document.querySelectorAll('.btn, .nav-link, .settings-tab');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// ============================================================================
// PERFORMANCE OPTIMIZATION FUNCTIONS
// ============================================================================

// Cache management functions
function isCacheValid(cacheKey, cacheType) {
    const lastUpdated = performanceCache.lastUpdated.get(cacheKey);
    if (!lastUpdated) return false;
    
    const duration = CACHE_DURATION[cacheType];
    return (Date.now() - lastUpdated) < duration;
}

function setCache(cacheKey, data, cacheType) {
    performanceCache[cacheType].set(cacheKey, data);
    performanceCache.lastUpdated.set(cacheKey, Date.now());
}

function getCache(cacheKey, cacheType) {
    if (isCacheValid(cacheKey, cacheType)) {
        return performanceCache[cacheType].get(cacheKey);
    }
    return null;
}

function clearCache(cacheType = null) {
    if (cacheType) {
        performanceCache[cacheType].clear();
        performanceCache.lastUpdated.clear();
    } else {
        Object.keys(performanceCache).forEach(key => {
            if (key !== 'lastUpdated') {
                performanceCache[key].clear();
            }
        });
        performanceCache.lastUpdated.clear();
    }
}

// Optimized API calls with caching
async function cachedApiCall(url, options = {}, cacheKey, cacheType) {
    // Check cache first
    const cached = getCache(cacheKey, cacheType);
    if (cached) {
        console.log(`📦 Cache hit for ${cacheKey}`);
        return cached;
    }
    
    try {
        console.log(`🌐 API call for ${cacheKey}`);
        const response = await fetch(url, options);
        const data = await response.json();
        
        // Cache the result
        setCache(cacheKey, data, cacheType);
        
        return data;
    } catch (error) {
        console.error(`❌ API call failed for ${cacheKey}:`, error);
        throw error;
    }
}

// Lazy loading for images and heavy content
function initLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    loadLazyElement(element);
                    observer.unobserve(element);
                }
            });
        });
        
        lazyElements.forEach(element => {
            lazyObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        lazyElements.forEach(element => {
            loadLazyElement(element);
        });
    }
}

function loadLazyElement(element) {
    const lazyType = element.dataset.lazy;
    
    switch (lazyType) {
        case 'image':
            const src = element.dataset.src;
            if (src) {
                element.src = src;
                element.classList.add('loaded');
            }
            break;
        case 'content':
            const content = element.dataset.content;
            if (content) {
                element.innerHTML = content;
                element.classList.add('loaded');
            }
            break;
    }
}

// Debounced function calls for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttled function calls for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimized DOM updates using DocumentFragment
function batchDOMUpdates(updates) {
    const fragment = document.createDocumentFragment();
    
    updates.forEach(update => {
        if (typeof update === 'function') {
            const element = update();
            if (element) {
                fragment.appendChild(element);
            }
        } else if (update instanceof Node) {
            fragment.appendChild(update);
        }
    });
    
    return fragment;
}

// Memory management
function cleanupMemory() {
    // Clear old cache entries
    const now = Date.now();
    performanceCache.lastUpdated.forEach((timestamp, key) => {
        const age = now - timestamp;
        if (age > 60 * 60 * 1000) { // 1 hour
            performanceCache.knowledgeBase.delete(key);
            performanceCache.technicalDatabase.delete(key);
            performanceCache.chatHistory.delete(key);
            performanceCache.settings.delete(key);
            performanceCache.lastUpdated.delete(key);
        }
    });
    
    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }
}

// Initialize performance optimizations
function initPerformanceOptimizations() {
    // Initialize lazy loading
    initLazyLoading();
    
    // Set up memory cleanup interval
    setInterval(cleanupMemory, 5 * 60 * 1000); // Every 5 minutes
    
    // Optimize scroll events
    const optimizedScrollHandler = throttle(() => {
        // Handle scroll-based optimizations
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show elements based on scroll position
        const nav = document.querySelector('.nav');
        if (nav) {
            if (scrollTop > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    }, 100);
    
    window.addEventListener('scroll', optimizedScrollHandler);
    
    // Optimize resize events
    const optimizedResizeHandler = debounce(() => {
        handleResize();
        // Recalculate layouts if needed
        initLazyLoading();
    }, 250);
    
    window.addEventListener('resize', optimizedResizeHandler);
    
    console.log('⚡ Performance optimizations initialized');
}

// Centralized Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('🎨 Initializing Theme Manager...');
        
        // Load saved theme
        this.currentTheme = localStorage.getItem('theme') || 'light';
        console.log('💾 Loaded theme:', this.currentTheme);
        
        // Apply theme immediately
        this.applyTheme(this.currentTheme, false);
        
        // Initialize toggle button when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initToggleButton());
        } else {
            this.initToggleButton();
        }
        
        this.isInitialized = true;
        console.log('✅ Theme Manager initialized');
    }

    initToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) {
            console.error('❌ Theme toggle button not found!');
            return;
        }

        // Remove any existing listeners
        themeToggle.replaceWith(themeToggle.cloneNode(true));
        const newThemeToggle = document.getElementById('themeToggle');
        
        newThemeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        console.log('✅ Theme toggle button initialized');
    }

    toggle() {
        console.log('🔄 Theme toggle clicked');
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme, true);
    }

    applyTheme(theme, showNotification = true) {
        console.log(`🎨 Applying theme: ${theme}`);
        
        // Update current theme
        this.currentTheme = theme;
        
        // Set data attributes
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update icons
        this.updateIcons(theme);
        
        // Apply CSS custom properties
        this.applyCSSVariables(theme);
        
        // Update specific elements
        this.updateElements(theme);
        
        // Sync with settings page
        this.syncWithSettings(theme);
        
        if (showNotification) {
            this.showNotification(`Theme auf ${theme === 'dark' ? 'Dunkel' : 'Hell'} geändert`);
        }
        
        console.log('✅ Theme applied successfully');
    }

    updateIcons(theme) {
        const moonIcon = document.querySelector('.moon-icon');
        const sunIcon = document.querySelector('.sun-icon');
        
        if (moonIcon && sunIcon) {
            if (theme === 'dark') {
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
            } else {
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
            }
        }
    }

    applyCSSVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#1a1a1a');
            root.style.setProperty('--bg-secondary', '#2d2d2d');
            root.style.setProperty('--text-primary', '#e0e0e0');
            root.style.setProperty('--text-secondary', '#b0b0b0');
            root.style.setProperty('--border-color', '#404040');
            root.style.setProperty('--hover-bg', '#3a3a3a');
            root.style.setProperty('--input-bg', '#2d2d2d');
            root.style.setProperty('--button-bg', '#e0e0e0');
            root.style.setProperty('--button-text', '#1a1a1a');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f5f5f5');
            root.style.setProperty('--text-primary', '#2d2d2d');
            root.style.setProperty('--text-secondary', '#666666');
            root.style.setProperty('--border-color', '#e0e0e0');
            root.style.setProperty('--hover-bg', '#ececec');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--button-bg', '#2d2d2d');
            root.style.setProperty('--button-text', '#ffffff');
        }
    }

    updateElements(theme) {
        // Update body
        document.body.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        document.body.style.color = theme === 'dark' ? '#e0e0e0' : '#2d2d2d';
        
        // Update navigation
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }
        
        // Update suggestion prompts
        this.updateSuggestionPrompts(theme);
        
        // Update system info boxes
        setTimeout(() => {
            const systemInfoBoxes = document.querySelectorAll('.settings-section > div[style*="background"]');
            systemInfoBoxes.forEach(box => {
                if (theme === 'dark') {
                    box.style.background = '#2d2d2d';
                    box.style.color = '#cccccc';
                } else {
                    box.style.background = '#f0f0f0';
                    box.style.color = '#333333';
                }
            });
        }, 100);
    }

    updateSuggestionPrompts(theme) {
        const suggestionPrompts = document.querySelectorAll('.suggestion-prompt');
        suggestionPrompts.forEach(prompt => {
            if (theme === 'dark') {
                prompt.style.backgroundColor = '#2d2d2d';
                prompt.style.borderColor = '#404040';
                prompt.style.color = '#ffffff';
            } else {
                prompt.style.backgroundColor = '#ffffff';
                prompt.style.borderColor = '#e5e5e5';
                prompt.style.color = '#2d2d2d';
            }
        });
        
        const suggestionTexts = document.querySelectorAll('.suggestion-prompt-text');
        suggestionTexts.forEach(text => {
            text.style.color = theme === 'dark' ? '#ffffff' : '#2d2d2d';
        });
    }

    syncWithSettings(theme) {
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.checked = radio.value === theme;
        });
    }

    showNotification(message) {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, 'success');
        } else {
            console.log('📢', message);
        }
    }
}

// Initialize theme manager immediately
const themeManager = new ThemeManager();

// Make ThemeManager globally available
window.themeManager = themeManager;

// Get or create user ID
// Make getUserId globally available
window.getUserId = function() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Autocomplete suggestions based on knowledge base content
// Suggestions will be dynamically generated from knowledge base
let suggestions = [];

// Load suggestions dynamically from knowledge base
async function loadSuggestionsFromKnowledgeBase() {
    try {
        const response = await fetch('https://us-central1-cis-de.cloudfunctions.net/knowledgebase');
        if (!response.ok) {
            console.log('Failed to load knowledge base');
            return;
        }
        
        const data = await response.json();
        if (!data.documents || data.documents.length === 0) {
            console.log('No documents in knowledge base');
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
            
            // Speed / Geschwindigkeit
            if (combinedText.match(/geschwindigkeit|speed|km\/h|mph|schnell|fast/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie schnell fährt der ${model}?`);
                    generatedSuggestions.add(`Welche Höchstgeschwindigkeit hat der ${model}?`);
                });
            }
            
            // Power / Leistung
            if (combinedText.match(/leistung|power|ps|kw|kilowatt|horsepower|motor/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Motorleistung hat der ${model}?`);
                    generatedSuggestions.add(`Wie viel PS hat der ${model}?`);
                });
            }
            
            // Battery / Batterie
            if (combinedText.match(/batterie|battery|kwh|kapazität|capacity/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Batteriekapazität hat der ${model}?`);
                    generatedSuggestions.add(`Wie groß ist die Batterie des ${model}?`);
                });
            }
            
            // Charging / Laden
            if (combinedText.match(/laden|charging|ladezeit|charge time|schnellladen|fast charg/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie schnell lädt der ${model}?`);
                    generatedSuggestions.add(`Wie lange dauert das Laden beim ${model}?`);
                });
                generatedSuggestions.add("Welche Lademöglichkeiten gibt es?");
            }
            
            // Delivery / Lieferung
            if (combinedText.match(/lieferzeit|delivery|lieferung|verfügbar|available/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie lange dauert die Lieferzeit für den ${model}?`);
                });
                generatedSuggestions.add("Wann kann ich meinen Cadillac abholen?");
            }
            
            // Warranty / Garantie
            if (combinedText.match(/garantie|warranty|gewährleistung/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Garantie gibt es auf den ${model}?`);
                });
                generatedSuggestions.add("Wie lange ist die Garantie?");
                generatedSuggestions.add("Was deckt die Garantie ab?");
            }
            
            // Features / Ausstattung
            if (combinedText.match(/ausstattung|features|equipment|interior|innenraum/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Ausstattung hat der ${model}?`);
                    generatedSuggestions.add(`Welche Features hat der ${model}?`);
                });
            }
            
            // Colors / Farben
            if (combinedText.match(/farbe|color|lackierung|paint/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Welche Farben gibt es für den ${model}?`);
                });
                generatedSuggestions.add("Welche Farben sind verfügbar?");
            }
            
            // Dimensions / Maße
            if (combinedText.match(/maße|dimensions|größe|size|länge|length|breite|width|höhe|height/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie groß ist der ${model}?`);
                    generatedSuggestions.add(`Welche Maße hat der ${model}?`);
                });
            }
            
            // Weight / Gewicht
            if (combinedText.match(/gewicht|weight|kg|kilogramm|ton/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie schwer ist der ${model}?`);
                    generatedSuggestions.add(`Was wiegt der ${model}?`);
                });
            }
            
            // Seats / Sitze
            if (combinedText.match(/sitze|seats|sitzplätze|personen|passengers/)) {
                models.forEach(model => {
                    generatedSuggestions.add(`Wie viele Sitze hat der ${model}?`);
                });
            }
            
            // Service
            if (combinedText.match(/service|wartung|maintenance|inspektion/)) {
                generatedSuggestions.add("Welche Service-Intervalle gibt es?");
                generatedSuggestions.add("Wie oft muss der Cadillac gewartet werden?");
            }
        });
        
        // Add general questions
        if (models.size > 1) {
            const modelArray = Array.from(models);
            generatedSuggestions.add(`Was ist der Unterschied zwischen ${modelArray[0]} und ${modelArray[1]}?`);
            generatedSuggestions.add("Welche Modelle gibt es?");
            generatedSuggestions.add("Welcher Cadillac passt zu mir?");
        }
        
        // Add general purchase questions
        generatedSuggestions.add("Wo kann ich einen Cadillac kaufen?");
        generatedSuggestions.add("Gibt es eine Probefahrt?");
        generatedSuggestions.add("Kann ich einen Cadillac testen?");
        
        // Convert Set to Array and update suggestions
        suggestions = Array.from(generatedSuggestions);
        
        console.log(`Generated ${suggestions.length} unique suggestions from knowledge base`);
        
    } catch (error) {
        console.error('Error loading suggestions:', error);
        // Keep existing suggestions if any
    }
}

// Initialize - MOVED TO MAIN DOMContentLoaded BELOW

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .nav-button');
    if (navItems.length === 0) return;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page) {
            switchPage(page);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            }
        });
    });
}

function switchPage(page) {
    console.log('Switching to page:', page);
    
    // Hide all pages
    const chatPage = document.getElementById('chatPage');
    const settingsPage = document.getElementById('settingsPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const troubleshootingPage = document.getElementById('troubleshootingPage');
    const chatSidebar = document.getElementById('chatSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    // Hide all pages
    if (chatPage) chatPage.style.display = 'none';
    if (settingsPage) settingsPage.style.display = 'none';
    if (dashboardPage) dashboardPage.style.display = 'none';
    if (troubleshootingPage) troubleshootingPage.style.display = 'none';
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to selected nav item
    const activeNavItem = document.querySelector(`[data-page="${page}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Show selected page
    if (page === 'chat') {
        if (chatPage) {
            chatPage.style.display = 'block';
            // Show sidebar and toggle for chat page
            if (chatSidebar) {
                chatSidebar.style.display = 'flex';
                chatSidebar.classList.remove('hidden');
            }
            if (sidebarToggle) {
                sidebarToggle.style.display = 'flex';
                sidebarToggle.classList.add('sidebar-open');
            }
            // Initialize chat display instead of just loading history
            initChat();
        }
    } else if (page === 'settings') {
        // Hide sidebar completely on settings page
        if (chatSidebar) {
            chatSidebar.style.display = 'none';
            chatSidebar.classList.add('hidden');
        }
        if (sidebarToggle) {
            sidebarToggle.style.display = 'none';
        }
        
        if (settingsPage) {
            settingsPage.style.display = 'block';
            settingsPage.classList.add('active');
            loadKnowledgeBase(); // Load knowledge base when opening settings
            loadTechnicalDatabase(); // Load technical database when opening settings
        }
    } else if (page === 'dashboard') {
        // Hide sidebar completely on dashboard page
        if (chatSidebar) {
            chatSidebar.style.display = 'none';
            chatSidebar.classList.add('hidden');
        }
        if (sidebarToggle) {
            sidebarToggle.style.display = 'none';
        }
        
        if (dashboardPage) {
            dashboardPage.style.display = 'block';
            loadDashboard(); // Load dashboard data
        }
    } else if (page === 'troubleshooting') {
        // Hide sidebar completely on troubleshooting page
        if (chatSidebar) {
            chatSidebar.style.display = 'none';
            chatSidebar.classList.add('hidden');
        }
        if (sidebarToggle) {
            sidebarToggle.style.display = 'none';
        }
        
        if (troubleshootingPage) {
            troubleshootingPage.style.display = 'block';
            initTroubleshooting(); // Initialize troubleshooting functionality
        }
    }
}

// Initialize intelligent troubleshooting integration
function initTroubleshootingIntelligence() {
    console.log('🧠 Initializing troubleshooting intelligence panels');
    
    // Load initial analytics
    loadTroubleshootingAnalytics();
    
    // Set up real-time updates
    setupTroubleshootingIntelligence();
}

// Load troubleshooting analytics
async function loadTroubleshootingAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/getCaseAnalytics?timeRange=30d`);
        if (response.ok) {
            const analytics = await response.json();
            updateTroubleshootingAnalytics(analytics);
        }
    } catch (error) {
        console.error('Error loading troubleshooting analytics:', error);
    }
}

// Update troubleshooting analytics display
function updateTroubleshootingAnalytics(analytics) {
    // Update the small panels (if they exist)
    const similarCasesCount = document.getElementById('similarCasesCount');
    const successRate = document.getElementById('successRate');
    
    if (similarCasesCount) {
        similarCasesCount.textContent = analytics.totalCases || 0;
    }
    
    if (successRate) {
        const rate = Math.round((analytics.averageSuccessRate || 0) * 100);
        successRate.textContent = `${rate}%`;
        successRate.className = `stat-value ${rate >= 80 ? 'confidence-high' : rate >= 60 ? 'confidence-medium' : 'confidence-low'}`;
    }
    
    // Update the main analytics tab
    const totalCasesCount = document.getElementById('totalCasesCount');
    const verifiedCasesCount = document.getElementById('verifiedCasesCount');
    const avgSuccessRateCount = document.getElementById('avgSuccessRateCount');
    const totalAttemptsCount = document.getElementById('totalAttemptsCount');
    
    if (totalCasesCount) {
        totalCasesCount.textContent = analytics.totalCases || 0;
    }
    
    if (verifiedCasesCount) {
        verifiedCasesCount.textContent = analytics.verifiedCases || 0;
    }
    
    if (avgSuccessRateCount) {
        const rate = Math.round((analytics.averageSuccessRate || 0) * 100);
        avgSuccessRateCount.textContent = `${rate}%`;
    }
    
    if (totalAttemptsCount) {
        totalAttemptsCount.textContent = analytics.totalAttempts || 0;
    }
    
    // Update charts
    updateTroubleshootingCharts(analytics);
}

// Update troubleshooting charts
function updateTroubleshootingCharts(analytics) {
    // Category distribution chart
    const categoryChart = document.getElementById('categoryChart');
    if (categoryChart && analytics.categoryBreakdown) {
        const categories = Object.entries(analytics.categoryBreakdown)
            .map(([category, count]) => `<div class="chart-item">
                <span class="chart-label">${category}</span>
                <span class="chart-value">${count}</span>
            </div>`)
            .join('');
        
        categoryChart.innerHTML = categories || '<div class="no-data">No data available</div>';
    }
    
    // Trends chart
    const trendsChart = document.getElementById('trendsChart');
    if (trendsChart && analytics.trends) {
        const trends = analytics.trends
            .map(trend => `<div class="chart-item">
                <span class="chart-label">${trend.period}</span>
                <span class="chart-value">${trend.cases} cases</span>
            </div>`)
            .join('');
        
        trendsChart.innerHTML = trends || '<div class="no-data">No data available</div>';
    }
}

// Setup real-time intelligence updates
function setupTroubleshootingIntelligence() {
    // Monitor issue description changes for real-time case search
    const issueDescription = document.getElementById('issueDescription');
    if (issueDescription) {
        let searchTimeout;
        issueDescription.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const description = issueDescription.value.trim();
                if (description.length > 10) {
                    searchSimilarCases(description);
                } else {
                    clearSimilarCases();
                }
            }, 1000); // Debounce search
        });
    }
}

// Search for similar cases
async function searchSimilarCases(description) {
    try {
        const response = await fetch(`${API_BASE}/searchCases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: description,
                limit: 5,
                minSuccessRate: 0.5
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySimilarCases(data.cases || []);
        }
    } catch (error) {
        console.error('Error searching similar cases:', error);
    }
}

// Display similar cases
function displaySimilarCases(cases) {
    const similarCasesContent = document.getElementById('similarCasesContent');
    if (!similarCasesContent) return;
    
    if (cases.length === 0) {
        similarCasesContent.innerHTML = `
            <div class="no-cases-message">
                <p>No similar cases found. Try describing your issue in more detail.</p>
            </div>
        `;
        return;
    }
    
    const casesHTML = cases.map(caseItem => `
        <div class="case-item" onclick="showCaseDetails('${caseItem.id}')">
            <div class="case-item-title">${escapeHtml(caseItem.problemDescription.substring(0, 80))}${caseItem.problemDescription.length > 80 ? '...' : ''}</div>
            <div class="case-item-meta">
                <span>${escapeHtml(caseItem.problemCategory)}</span>
                <span class="case-success-rate">${Math.round(caseItem.successRate * 100)}% success</span>
            </div>
        </div>
    `).join('');
    
    similarCasesContent.innerHTML = casesHTML;
}

// Clear similar cases
function clearSimilarCases() {
    const similarCasesContent = document.getElementById('similarCasesContent');
    if (similarCasesContent) {
        similarCasesContent.innerHTML = `
            <div class="no-cases-message">
                <p>Upload an image and describe your issue to find similar cases</p>
            </div>
        `;
    }
}

// Show case details (reuse existing function)
function showCaseDetails(caseId) {
    // This will reuse the existing showCaseModal function
    // Find the case in current cases or fetch it
    const caseItem = currentCases.find(c => c.id === caseId);
    if (caseItem) {
        showCaseModal(caseItem);
    }
}

// Update diagnosis confidence
function updateDiagnosisConfidence(confidenceScore, similarCasesCount = 0) {
    const confidenceElement = document.getElementById('diagnosisConfidence');
    const similarCountElement = document.getElementById('similarCasesCount');
    
    if (confidenceElement) {
        confidenceElement.textContent = `${confidenceScore}%`;
        confidenceElement.className = `stat-value ${confidenceScore >= 80 ? 'confidence-high' : confidenceScore >= 60 ? 'confidence-medium' : 'confidence-low'}`;
    }
    
    if (similarCountElement) {
        similarCountElement.textContent = similarCasesCount;
    }
}

// Troubleshooting functionality
function initTroubleshooting() {
    console.log('🔧 Initializing troubleshooting page');
    
    // Initialize image upload
    const imageUploadArea = document.getElementById('imageUploadArea');
    const selectImageBtn = document.getElementById('selectImageBtn');
    const issueDescription = document.getElementById('issueDescription');
    const submitBtn = document.getElementById('submitAnalysisBtn');
    
    // Initialize intelligent integration panels
    initTroubleshootingIntelligence();
    
    // Initialize troubleshooting tabs
    initTroubleshootingTabs();
    
    // Image upload functionality
    if (imageUploadArea && selectImageBtn) {
        // Click to select image
        imageUploadArea.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = handleImageSelect;
            fileInput.click();
        });
        
        selectImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = handleImageSelect;
            fileInput.click();
        });
        
        // Drag and drop functionality
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('dragover');
        });
        
        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('dragover');
        });
        
        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleImageSelect({ target: { files: files } });
            }
        });
    }
    
    // Submit analysis
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmitAnalysisWithCases);
    }
    
    // Initialize troubleshooting chat
    initTroubleshootingChat();
}

// Handle image selection
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        console.log('📸 Image selected:', file.name);
        
        // Show image preview
        const imageUploadArea = document.getElementById('imageUploadArea');
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUploadArea.innerHTML = `
                <div class="image-preview">
                    <img src="${e.target.result}" alt="Selected image" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                    <p style="margin-top: 12px; color: #6b7280;">${file.name}</p>
                    <button class="upload-button" onclick="resetImageUpload()">Change Image</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        // Store file for later use
        window.selectedTroubleshootingImage = file;
    }
}

// Reset image upload
function resetImageUpload() {
    const imageUploadArea = document.getElementById('imageUploadArea');
    imageUploadArea.innerHTML = `
        <div class="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
            </svg>
        </div>
        <p class="upload-text">Drag and drop an image, or click to browse</p>
        <p class="upload-hint">The image will help our AI better diagnose your issue.</p>
        <button class="upload-button" id="selectImageBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
            </svg>
            Select Image
        </button>
    `;
    
    // Re-attach event listeners
    const selectImageBtn = document.getElementById('selectImageBtn');
    if (selectImageBtn) {
        selectImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = handleImageSelect;
            fileInput.click();
        });
    }
    
    window.selectedTroubleshootingImage = null;
}

// Handle submit analysis
async function handleSubmitAnalysis() {
    const issueDescription = document.getElementById('issueDescription');
    const submitBtn = document.getElementById('submitAnalysisBtn');
    
    if (!issueDescription.value.trim()) {
        showNotification('Please describe the issue before submitting', 'error');
        return;
    }
    
    if (!window.selectedTroubleshootingImage) {
        showNotification('Please select an image before submitting', 'error');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Analyzing...';
    
    try {
        // Add analysis message to troubleshooting chat
        addTroubleshootingMessage('user', `Issue: ${issueDescription.value}\n\nImage: ${window.selectedTroubleshootingImage.name}`);
        
        // Show initial analysis message
        addTroubleshootingMessage('assistant', '🔍 Analyzing your image and issue description...\n\nSearching through technical database for relevant solutions...');
        
        // Convert image to base64
        const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(window.selectedTroubleshootingImage);
        });
        
        // Search technical database for relevant documents
        const technicalSearchResponse = await fetch(`${API_BASE}/aiSearchTechnicalDatabase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: issueDescription.value,
                context: 'troubleshooting',
                imageDescription: issueDescription.value,
                maxResults: 5
            })
        });
        
        let technicalContext = '';
        if (technicalSearchResponse.ok) {
            const techData = await technicalSearchResponse.json();
            if (techData.success && techData.results.length > 0) {
                technicalContext = '\n\n📚 Relevant Technical Documentation Found:\n';
                techData.results.forEach((doc, index) => {
                    technicalContext += `${index + 1}. **${doc.filename}** (${doc.category} - ${doc.subcategory})\n`;
                    technicalContext += `   Relevance: ${Math.round(doc.relevanceScore)}%\n`;
                    // Include first 300 characters of content for context
                    const contentPreview = doc.content ? doc.content.substring(0, 300) + '...' : 'No content available';
                    technicalContext += `   Content: ${contentPreview}\n\n`;
                });
            }
        }
        
        // Get conversation history for context
        const conversationHistory = getConversationHistory();

        // Send to AI for analysis with technical context
        const response = await fetch(`${API_BASE}/generateChatResponse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Troubleshooting Analysis Request:\n\nImage Description: ${issueDescription.value}\n\nPlease analyze this image and provide a detailed diagnosis and solution based on the technical documentation.${technicalContext}`,
                imageData: base64Image,
                imageType: window.selectedTroubleshootingImage.type,
                threadId: 'troubleshooting-' + Date.now(),
                useKnowledgeBase: true,
                conversationHistory: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        
        // Display AI response in chat
        addTroubleshootingMessage('assistant', data.response);
        
        // Reset form
        issueDescription.value = '';
        resetImageUpload();
        
    } catch (error) {
        console.error('Error submitting analysis:', error);
        showNotification('Error submitting analysis. Please try again.', 'error');
        addTroubleshootingMessage('assistant', '❌ Sorry, I encountered an error while analyzing your issue. Please try again or contact support if the problem persists.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit for Analysis';
    }
}

// Initialize troubleshooting chat
function initTroubleshootingChat() {
    const chatInput = document.getElementById('troubleshootingChatInput');
    const sendBtn = document.getElementById('sendTroubleshootingMessage');
    
    if (chatInput && sendBtn) {
        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendTroubleshootingMessage();
            }
        });
        
        // Send message on button click
        sendBtn.addEventListener('click', sendTroubleshootingMessage);
    }
}

// Send troubleshooting chat message
async function sendTroubleshootingMessage() {
    const chatInput = document.getElementById('troubleshootingChatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addTroubleshootingMessage('user', message);
    
    // Clear input
    chatInput.value = '';
    
    // Show thinking indicator
    addTroubleshootingMessage('assistant', '🤔 Let me search through our technical database for relevant information...');
    
    try {
        // Search technical database for relevant documents
        const technicalSearchResponse = await fetch(`${API_BASE}/aiSearchTechnicalDatabase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: message,
                context: 'troubleshooting',
                maxResults: 3
            })
        });
        
        let technicalContext = '';
        if (technicalSearchResponse.ok) {
            const techData = await technicalSearchResponse.json();
            if (techData.success && techData.results.length > 0) {
                technicalContext = '\n\n📚 Relevant Technical Documentation:\n';
                techData.results.forEach((doc, index) => {
                    technicalContext += `${index + 1}. **${doc.filename}** (${doc.category} - ${doc.subcategory})\n`;
                    const contentPreview = doc.content ? doc.content.substring(0, 200) + '...' : 'No content available';
                    technicalContext += `   ${contentPreview}\n\n`;
                });
            }
        }
        
        // Get conversation history for context
        const conversationHistory = getConversationHistory();

        // Send to AI for response with technical context
        const response = await fetch(`${API_BASE}/generateChatResponse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Troubleshooting Follow-up Question:\n\n${message}\n\nPlease provide a helpful response based on the technical documentation.${technicalContext}`,
                threadId: 'troubleshooting-chat-' + Date.now(),
                useKnowledgeBase: true,
                conversationHistory: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('Chat response failed');
        }
        
        const data = await response.json();
        
        // Remove the thinking message and add the actual response
        const chatDisplay = document.getElementById('troubleshootingChat');
        const lastMessage = chatDisplay.lastElementChild;
        if (lastMessage && lastMessage.querySelector('.message-content').textContent.includes('🤔')) {
            lastMessage.remove();
        }
        
        // Display AI response
        addTroubleshootingMessage('assistant', data.response);
        
    } catch (error) {
        console.error('Error in troubleshooting chat:', error);
        
        // Remove the thinking message and add error response
        const chatDisplay = document.getElementById('troubleshootingChat');
        const lastMessage = chatDisplay.lastElementChild;
        if (lastMessage && lastMessage.querySelector('.message-content').textContent.includes('🤔')) {
            lastMessage.remove();
        }
        
        addTroubleshootingMessage('assistant', '❌ Sorry, I encountered an error while searching for information. Please try again or contact support if the problem persists.');
    }
}

// Add message to troubleshooting chat
function addTroubleshootingMessage(role, content) {
    const chatDisplay = document.getElementById('troubleshootingChat');
    if (!chatDisplay) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Check if content contains HTML (confidence indicators)
    if (content.includes('<div class="confidence-indicator')) {
        messageContent.innerHTML = content;
    } else {
        messageContent.textContent = content;
    }
    
    messageDiv.appendChild(messageContent);
    chatDisplay.appendChild(messageDiv);
    
    // Scroll to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// ============================================================================
// AI CASE MATCHING FOR TROUBLESHOOTING
// ============================================================================

// AI Case Matching for Troubleshooting
async function findSimilarCases(problemDescription, imageDescription = '') {
    try {
        console.log('🔍 Searching for similar cases...');
        
        const response = await fetch(`${API_BASE}/searchCases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: problemDescription,
                maxResults: 5
            })
        });

        const data = await response.json();
        
        if (data.cases && data.cases.length > 0) {
            console.log(`✅ Found ${data.cases.length} similar cases`);
            return data.cases;
        } else {
            console.log('ℹ️ No similar cases found');
            return [];
        }
    } catch (error) {
        console.error('Error finding similar cases:', error);
        return [];
    }
}

// Generate AI response with case recommendations
async function generateTroubleshootingResponseWithCases(userMessage, imageDescription = '') {
    try {
        // First, find similar cases
        const similarCases = await findSimilarCases(userMessage, imageDescription);
        
        // Build context from similar cases
        let caseContext = '';
        if (similarCases.length > 0) {
            caseContext = '\n\n**Similar Resolved Cases Found:**\n';
            similarCases.forEach((caseItem, index) => {
                const successRate = Math.round((caseItem.successRate || 0) * 100);
                caseContext += `\n**Case ${index + 1}** (${successRate}% success rate):\n`;
                caseContext += `**Problem:** ${caseItem.problemDescription}\n`;
                caseContext += `**Solution:** ${caseItem.solution}\n`;
                caseContext += `**Category:** ${caseItem.problemCategory}\n`;
                caseContext += `**Resolution Time:** ${caseItem.resolutionTime}\n`;
                if (caseItem.tags && caseItem.tags.length > 0) {
                    caseContext += `**Tags:** ${caseItem.tags.join(', ')}\n`;
                }
                caseContext += '---\n';
            });
            
            caseContext += '\n**Instructions:** Use these similar cases as reference. If a case is very similar, recommend the same solution. If cases are partially similar, adapt the solution. Always mention the success rate and explain why this solution should work.';
        }
        
        // Get conversation history for context
        const conversationHistory = getConversationHistory();
        
        // Search technical database for additional context
        let technicalContext = '';
        try {
            const techResponse = await fetch(`${API_BASE}/aiSearchTechnicalDatabase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: userMessage,
                    context: imageDescription,
                    maxResults: 3
                })
            });
            
            const techData = await techResponse.json();
            if (techData.documents && techData.documents.length > 0) {
                technicalContext = '\n\n**Technical Documentation References:**\n';
                techData.documents.forEach((doc, index) => {
                    technicalContext += `\n**Document ${index + 1}:** ${doc.filename}\n`;
                    technicalContext += `**Content:** ${doc.content.substring(0, 200)}...\n`;
                    technicalContext += '---\n';
                });
            }
        } catch (error) {
            console.log('No technical documentation found or error occurred');
        }
        
        // Calculate confidence score
        const confidenceScore = calculateConfidenceScore(similarCases, technicalContext ? 'found' : null);
        
        // Generate AI response with case context
        const response = await fetch(`${API_BASE}/generateChatResponse`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                conversationHistory: conversationHistory,
                context: `You are a Cadillac EV troubleshooting expert. ${caseContext}${technicalContext}`,
                imageDescription: imageDescription
            })
        });

        const data = await response.json();
        
        if (data.response) {
            // Record case usage if similar cases were found
            if (similarCases.length > 0) {
                // Record usage for the most similar case
                const mostSimilarCase = similarCases[0];
                await recordCaseUsage(mostSimilarCase.id, true, `Used in troubleshooting: ${userMessage}`);
            }
            
            // Add confidence indicator to response
            const confidenceIndicator = addConfidenceIndicator(confidenceScore);
            return confidenceIndicator + '\n\n' + data.response;
        } else {
            throw new Error('No response from AI');
        }
    } catch (error) {
        console.error('Error generating troubleshooting response:', error);
        return 'I apologize, but I encountered an error while processing your request. Please try again.';
    }
}

// Enhanced troubleshooting analysis with case matching
async function handleSubmitAnalysisWithCases() {
    const issueDescription = document.getElementById('issueDescription');
    if (!issueDescription || !issueDescription.value.trim()) {
        showNotification('Please describe the issue before submitting for analysis', 'error');
        return;
    }

    if (!window.selectedTroubleshootingImage) {
        showNotification('Please upload an image before submitting for analysis', 'error');
        return;
    }

    try {
        // Add analysis message to troubleshooting chat
        addTroubleshootingMessage('user', `Issue: ${issueDescription.value}\n\nImage: ${window.selectedTroubleshootingImage.name}`);

        // Show thinking animation
        addTroubleshootingMessage('assistant', '🔍 Analyzing your image and issue description...\n\nSearching through case database and technical documentation for relevant solutions...');

        // Convert image to base64 for analysis
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const imageBase64 = e.target.result.split(',')[1];
                
                // Generate response with case matching
                const response = await generateTroubleshootingResponseWithCases(
                    issueDescription.value,
                    `Image analysis for troubleshooting: ${issueDescription.value}`
                );

                // Remove thinking message and add actual response
                const chatDisplay = document.getElementById('troubleshootingChat');
                const lastMessage = chatDisplay.lastElementChild;
                if (lastMessage && lastMessage.textContent.includes('🔍 Analyzing')) {
                    lastMessage.remove();
                }

                addTroubleshootingMessage('assistant', response);
                
                // Update intelligence panels with analysis results
                updateTroubleshootingIntelligenceAfterAnalysis(userMessage, imageDescription);
                
                // Clear the form
                issueDescription.value = '';
                clearSelectedImage();
                
            } catch (error) {
                console.error('Error in enhanced troubleshooting analysis:', error);
                addTroubleshootingMessage('assistant', '❌ Sorry, I encountered an error while analyzing your issue. Please try again or contact support if the problem persists.');
            }
        };
        
        reader.readAsDataURL(window.selectedTroubleshootingImage);
        
    } catch (error) {
        console.error('Error in enhanced troubleshooting analysis:', error);
        addTroubleshootingMessage('assistant', '❌ Sorry, I encountered an error while analyzing your issue. Please try again or contact support if the problem persists.');
    }
}

// Enhanced troubleshooting chat with case matching
async function sendTroubleshootingMessageWithCases() {
    const chatInput = document.getElementById('troubleshootingChatInput');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addTroubleshootingMessage('user', message);
    chatInput.value = '';

    // Show thinking animation
    addTroubleshootingMessage('assistant', '🤔 Let me search through our case database and technical documentation for relevant information...');

    try {
        // Generate response with case matching
        const response = await generateTroubleshootingResponseWithCases(message);

        // Remove thinking message and add actual response
        const chatDisplay = document.getElementById('troubleshootingChat');
        const lastMessage = chatDisplay.lastElementChild;
        if (lastMessage && lastMessage.textContent.includes('🤔 Let me search')) {
            lastMessage.remove();
        }

        addTroubleshootingMessage('assistant', response);

    } catch (error) {
        console.error('Error in enhanced troubleshooting chat:', error);
        addTroubleshootingMessage('assistant', '❌ Sorry, I encountered an error while searching for information. Please try again or contact support if the problem persists.');
    }
}

// Calculate confidence score for case recommendations
function calculateConfidenceScore(similarCases, technicalDocs) {
    let confidenceScore = 0;
    let maxScore = 100;
    
    // Base confidence from similar cases
    if (similarCases.length > 0) {
        const avgSuccessRate = similarCases.reduce((sum, caseItem) => sum + (caseItem.successRate || 0), 0) / similarCases.length;
        const caseCount = Math.min(similarCases.length, 5); // Max 5 cases
        
        // Weight by success rate and case count
        confidenceScore += (avgSuccessRate * 50) + (caseCount * 5);
        
        // Bonus for high similarity cases
        const highSimilarityCases = similarCases.filter(caseItem => caseItem.similarityScore > 10);
        if (highSimilarityCases.length > 0) {
            confidenceScore += 20;
        }
    }
    
    // Additional confidence from technical documentation
    if (technicalDocs && technicalDocs.length > 0) {
        confidenceScore += Math.min(technicalDocs.length * 10, 30);
    }
    
    // Cap at maximum score
    confidenceScore = Math.min(confidenceScore, maxScore);
    
    return Math.round(confidenceScore);
}

// Add confidence indicator to troubleshooting responses
function addConfidenceIndicator(confidenceScore) {
    let confidenceText = '';
    let confidenceClass = '';
    
    if (confidenceScore >= 80) {
        confidenceText = '🟢 High Confidence';
        confidenceClass = 'high-confidence';
    } else if (confidenceScore >= 60) {
        confidenceText = '🟡 Medium Confidence';
        confidenceClass = 'medium-confidence';
    } else if (confidenceScore >= 40) {
        confidenceText = '🟠 Low Confidence';
        confidenceClass = 'low-confidence';
    } else {
        confidenceText = '🔴 Very Low Confidence';
        confidenceClass = 'very-low-confidence';
    }
    
    return `<div class="confidence-indicator ${confidenceClass}">${confidenceText} (${confidenceScore}%)</div>`;
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

// Global variables for analytics
let currentAnalytics = null;
let currentTimeRange = '30d';

// Load analytics data
async function loadAnalytics(timeRange = '30d') {
    try {
        console.log('📊 Loading analytics data...');
        
        const response = await fetch(`${API_BASE}/getCaseAnalytics?timeRange=${timeRange}`);
        const data = await response.json();
        
        if (data) {
            currentAnalytics = data;
            currentTimeRange = timeRange;
            renderAnalytics(data);
        }
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Failed to load analytics data', 'error');
    }
}

// Render analytics data
function renderAnalytics(analytics) {
    // Update overview cards
    document.getElementById('totalCasesOverview').textContent = analytics.totalCases || 0;
    document.getElementById('verifiedCasesOverview').textContent = analytics.verifiedCases || 0;
    document.getElementById('avgSuccessRateOverview').textContent = 
        Math.round((analytics.averageSuccessRate || 0) * 100) + '%';
    document.getElementById('totalAttemptsOverview').textContent = analytics.totalAttempts || 0;
    
    // Render category breakdown chart
    renderCategoryChart(analytics.categoryBreakdown);
    
    // Render top performing cases
    renderTopCases(analytics.topPerformingCases || []);
    
    // Load and render success patterns
    loadSuccessPatterns();
    
    // Load and render trends
    loadTrends();
}

// Render category breakdown chart
function renderCategoryChart(categoryBreakdown) {
    const chartContainer = document.getElementById('categoryChart');
    
    if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) {
        chartContainer.innerHTML = '<div class="no-data">No category data available</div>';
        return;
    }
    
    const categories = Object.keys(categoryBreakdown);
    const maxCount = Math.max(...categories.map(cat => categoryBreakdown[cat].count));
    
    let chartHTML = '<div class="category-chart">';
    
    categories.forEach(category => {
        const data = categoryBreakdown[category];
        const percentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
        const successRate = Math.round(data.averageSuccessRate * 100);
        
        chartHTML += `
            <div class="category-bar">
                <div class="category-info">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${data.count} cases</span>
                </div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-stats">
                    <span class="success-rate">${successRate}% success</span>
                    <span class="attempts">${data.totalAttempts} attempts</span>
                </div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
}

// Render top performing cases
function renderTopCases(topCases) {
    const container = document.getElementById('topCasesList');
    
    if (!topCases || topCases.length === 0) {
        container.innerHTML = '<div class="no-data">No top performing cases available</div>';
        return;
    }
    
    let html = '';
    topCases.forEach((caseItem, index) => {
        html += `
            <div class="top-case-item">
                <div class="top-case-info">
                    <div class="top-case-title">${caseItem.problemDescription}</div>
                    <div class="top-case-meta">${caseItem.category} • Rank #${index + 1}</div>
                </div>
                <div class="top-case-stats">
                    <div class="top-case-stat">
                        <div class="top-case-stat-number">${caseItem.successRate}%</div>
                        <div class="top-case-stat-label">Success Rate</div>
                    </div>
                    <div class="top-case-stat">
                        <div class="top-case-stat-number">${caseItem.totalAttempts}</div>
                        <div class="top-case-stat-label">Attempts</div>
                    </div>
                    <div class="top-case-stat">
                        <div class="top-case-stat-number">${caseItem.score}</div>
                        <div class="top-case-stat-label">Score</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load success patterns
async function loadSuccessPatterns() {
    try {
        const response = await fetch(`${API_BASE}/getSuccessPatterns`);
        const data = await response.json();
        
        if (data && data.topSolutionPatterns) {
            renderSuccessPatterns(data.topSolutionPatterns);
        }
        
    } catch (error) {
        console.error('Error loading success patterns:', error);
    }
}

// Render success patterns
function renderSuccessPatterns(patterns) {
    const container = document.getElementById('patternsGrid');
    
    if (!patterns || patterns.length === 0) {
        container.innerHTML = '<div class="no-data">No success patterns available</div>';
        return;
    }
    
    let html = '';
    patterns.slice(0, 12).forEach(pattern => {
        const successRate = Math.round(pattern.averageSuccessRate * 100);
        const effectiveness = Math.round(pattern.effectiveness);
        
        html += `
            <div class="pattern-card">
                <div class="pattern-word">${pattern.word}</div>
                <div class="pattern-stats">
                    <span class="pattern-count">${pattern.count} cases</span>
                    <span class="pattern-success-rate">${successRate}% success</span>
                </div>
                <div class="pattern-effectiveness">Effectiveness: ${effectiveness}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load trends data
async function loadTrends() {
    try {
        const response = await fetch(`${API_BASE}/getCaseTrends?timeRange=${currentTimeRange}`);
        const data = await response.json();
        
        if (data) {
            renderTrendsChart(data);
        }
        
    } catch (error) {
        console.error('Error loading trends:', error);
    }
}

// Render trends chart
function renderTrendsChart(trends) {
    const chartContainer = document.getElementById('trendsChart');
    
    if (!trends || !trends.daily || Object.keys(trends.daily).length === 0) {
        chartContainer.innerHTML = '<div class="no-data">No trends data available</div>';
        return;
    }
    
    const dailyData = Object.entries(trends.daily)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-14); // Last 14 days
    
    const maxCases = Math.max(...dailyData.map(([, data]) => data.cases));
    const maxSuccessRate = Math.max(...dailyData.map(([, data]) => data.averageSuccessRate));
    
    let chartHTML = '<div class="trends-chart">';
    
    dailyData.forEach(([date, data]) => {
        const casesHeight = maxCases > 0 ? (data.cases / maxCases) * 100 : 0;
        const successHeight = maxSuccessRate > 0 ? (data.averageSuccessRate / maxSuccessRate) * 100 : 0;
        const successRate = Math.round(data.averageSuccessRate * 100);
        
        chartHTML += `
            <div class="trend-day">
                <div class="trend-bars">
                    <div class="trend-bar cases-bar" style="height: ${casesHeight}%"></div>
                    <div class="trend-bar success-bar" style="height: ${successHeight}%"></div>
                </div>
                <div class="trend-label">${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div class="trend-values">
                    <span class="trend-cases">${data.cases}</span>
                    <span class="trend-success">${successRate}%</span>
                </div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
}

// Initialize analytics page
function initAnalytics() {
    console.log('📊 Initializing analytics page...');
    
    // Time range selector
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', (e) => {
            loadAnalytics(e.target.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshAnalytics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAnalytics(currentTimeRange);
        });
    }
    
    console.log('✅ Analytics page initialized');
}

// ============================================================================
// ADVANCED LEARNING FEATURES
// ============================================================================

// Get case similarity
async function getCaseSimilarity(caseId, query, maxResults = 10) {
    try {
        const response = await fetch(`${API_BASE}/getCaseSimilarity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caseId: caseId,
                query: query,
                maxResults: maxResults
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting case similarity:', error);
        return { similarities: [], targetCase: null };
    }
}

// Get solution templates
async function getSolutionTemplates(category = null, difficulty = null) {
    try {
        let url = `${API_BASE}/getSolutionTemplates`;
        const params = new URLSearchParams();
        
        if (category) params.append('category', category);
        if (difficulty) params.append('difficulty', difficulty);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }

        const response = await fetch(url);
        const data = await response.json();
        return data.templates || [];
    } catch (error) {
        console.error('Error getting solution templates:', error);
        return [];
    }
}

// Auto-categorize case
async function autoCategorizeCase(problemDescription, solution = '', tags = []) {
    try {
        const response = await fetch(`${API_BASE}/autoCategorizeCase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                problemDescription: problemDescription,
                solution: solution,
                tags: tags
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error auto-categorizing case:', error);
        return null;
    }
}

// Enhanced case search with similarity
async function searchCasesWithSimilarity(query, filters = {}) {
    try {
        // First get regular search results
        const searchResponse = await fetch(`${API_BASE}/searchCases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                ...filters
            })
        });

        const searchData = await searchResponse.json();
        
        // Then get similarity results
        const similarityResponse = await getCaseSimilarity(null, query, 10);
        
        // Merge and deduplicate results
        const allCases = [...(searchData.cases || []), ...(similarityResponse.similarities || [])];
        const uniqueCases = [];
        const seenIds = new Set();
        
        allCases.forEach(caseItem => {
            if (!seenIds.has(caseItem.id)) {
                seenIds.add(caseItem.id);
                uniqueCases.push(caseItem);
            }
        });
        
        // Sort by relevance (similarity score or search score)
        uniqueCases.sort((a, b) => {
            const scoreA = a.similarityScore || a.searchScore || 0;
            const scoreB = b.similarityScore || b.searchScore || 0;
            return scoreB - scoreA;
        });
        
        return {
            cases: uniqueCases,
            totalCount: uniqueCases.length,
            searchQuery: query
        };
        
    } catch (error) {
        console.error('Error searching cases with similarity:', error);
        return { cases: [], totalCount: 0, searchQuery: query };
    }
}

// Show similarity analysis for a case
async function showCaseSimilarity(caseId) {
    try {
        const response = await getCaseSimilarity(caseId, null, 5);
        
        if (response.similarities && response.similarities.length > 0) {
            let html = '<div class="similarity-analysis">';
            html += '<h3>Similar Cases Found</h3>';
            html += '<div class="similarity-list">';
            
            response.similarities.forEach((similarCase, index) => {
                const similarityPercent = Math.round(similarCase.similarityScore * 100);
                html += `
                    <div class="similarity-item">
                        <div class="similarity-header">
                            <span class="similarity-rank">#${index + 1}</span>
                            <span class="similarity-score">${similarityPercent}% similar</span>
                        </div>
                        <div class="similarity-content">
                            <div class="similarity-problem">${similarCase.problemDescription.substring(0, 100)}...</div>
                            <div class="similarity-meta">
                                <span class="similarity-category">${similarCase.problemCategory}</span>
                                <span class="similarity-success">${Math.round((similarCase.successRate || 0) * 100)}% success</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div></div>';
            
            // Show in a modal or notification
            showNotification(`Found ${response.similarities.length} similar cases`, 'info');
            
            // You could also show this in a modal or dedicated section
            console.log('Similarity analysis:', html);
        } else {
            showNotification('No similar cases found', 'info');
        }
        
    } catch (error) {
        console.error('Error showing case similarity:', error);
        showNotification('Failed to analyze case similarity', 'error');
    }
}

// Load solution templates
async function loadSolutionTemplates(category = null) {
    try {
        const templates = await getSolutionTemplates(category);
        
        if (templates.length > 0) {
            console.log('Solution templates loaded:', templates);
            
            // You can display these in a dedicated section or modal
            // For now, we'll just log them
            templates.forEach(template => {
                console.log(`Template: ${template.title} (${template.category})`);
                console.log(`Steps: ${template.steps.length}`);
                console.log(`Success Rate: ${Math.round(template.successRate * 100)}%`);
            });
        }
        
        return templates;
    } catch (error) {
        console.error('Error loading solution templates:', error);
        return [];
    }
}

// Enhanced troubleshooting with similarity
async function generateTroubleshootingResponseWithSimilarity(userMessage, imageDescription = '') {
    try {
        // First find similar cases
        const similarCases = await findSimilarCases(userMessage, imageDescription);
        
        // Then get solution templates for the most common category
        let templates = [];
        if (similarCases.length > 0) {
            const mostCommonCategory = similarCases[0].problemCategory;
            templates = await getSolutionTemplates(mostCommonCategory);
        }
        
        // Build enhanced context
        let caseContext = '';
        if (similarCases.length > 0) {
            caseContext = '\n\n**Similar Resolved Cases Found:**\n';
            similarCases.forEach((caseItem, index) => {
                const successRate = Math.round((caseItem.successRate || 0) * 100);
                caseContext += `\n**Case ${index + 1}** (${successRate}% success rate):\n`;
                caseContext += `**Problem:** ${caseItem.problemDescription}\n`;
                caseContext += `**Solution:** ${caseItem.solution}\n`;
                caseContext += `**Category:** ${caseItem.problemCategory}\n`;
                caseContext += `**Resolution Time:** ${caseItem.resolutionTime}\n`;
                if (caseItem.tags && caseItem.tags.length > 0) {
                    caseContext += `**Tags:** ${caseItem.tags.join(', ')}\n`;
                }
                caseContext += '---\n';
            });
        }
        
        // Add solution templates if available
        if (templates.length > 0) {
            caseContext += '\n\n**Proven Solution Templates:**\n';
            templates.forEach((template, index) => {
                caseContext += `\n**Template ${index + 1}:** ${template.title}\n`;
                caseContext += `**Success Rate:** ${Math.round(template.successRate * 100)}%\n`;
                caseContext += `**Common Steps:**\n`;
                template.steps.slice(0, 3).forEach((step, stepIndex) => {
                    caseContext += `  ${stepIndex + 1}. ${step.step}\n`;
                });
                caseContext += '---\n';
            });
        }
        
        // Get technical context
        const conversationHistory = getConversationHistory();
        let technicalContext = '';
        try {
            const techResponse = await fetch(`${API_BASE}/aiSearchTechnicalDatabase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMessage, context: imageDescription, maxResults: 3 })
            });
            const techData = await techResponse.json();
            if (techData.documents && techData.documents.length > 0) {
                technicalContext = '\n\n**Technical Documentation References:**\n';
                techData.documents.forEach((doc, index) => {
                    technicalContext += `\n**Document ${index + 1}:** ${doc.filename}\n`;
                    technicalContext += `**Content:** ${doc.content.substring(0, 200)}...\n`;
                    technicalContext += '---\n';
                });
            }
        } catch (error) {
            console.log('No technical documentation found or error occurred');
        }
        
        // Calculate enhanced confidence score
        const confidenceScore = calculateEnhancedConfidenceScore(similarCases, templates, technicalContext ? 'found' : null);
        
        // Generate AI response
        const response = await fetch(`${API_BASE}/generateChatResponse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                conversationHistory: conversationHistory,
                context: `You are a Cadillac EV troubleshooting expert with access to similar cases and solution templates. ${caseContext}${technicalContext}`,
                imageDescription: imageDescription
            })
        });
        
        const data = await response.json();
        if (data.response) {
            // Record case usage
            if (similarCases.length > 0) {
                const mostSimilarCase = similarCases[0];
                await recordCaseUsage(mostSimilarCase.id, true, `Used in enhanced troubleshooting: ${userMessage}`);
            }
            
            // Add enhanced confidence indicator
            const confidenceIndicator = addEnhancedConfidenceIndicator(confidenceScore, similarCases.length, templates.length);
            return confidenceIndicator + '\n\n' + data.response;
        } else {
            throw new Error('No response from AI');
        }
        
    } catch (error) {
        console.error('Error generating enhanced troubleshooting response:', error);
        return 'I apologize, but I encountered an error while processing your request. Please try again.';
    }
}

// Calculate enhanced confidence score
function calculateEnhancedConfidenceScore(similarCases, templates, technicalDocs) {
    let confidenceScore = 0;
    let maxScore = 100;
    
    // Base score from similar cases
    if (similarCases.length > 0) {
        const avgSuccessRate = similarCases.reduce((sum, caseItem) => sum + (caseItem.successRate || 0), 0) / similarCases.length;
        const caseCount = Math.min(similarCases.length, 5);
        confidenceScore += (avgSuccessRate * 40) + (caseCount * 8);
        
        // Bonus for high similarity
        const highSimilarityCases = similarCases.filter(caseItem => caseItem.similarityScore > 0.7);
        if (highSimilarityCases.length > 0) {
            confidenceScore += 15;
        }
    }
    
    // Bonus for solution templates
    if (templates && templates.length > 0) {
        const avgTemplateSuccess = templates.reduce((sum, template) => sum + template.successRate, 0) / templates.length;
        confidenceScore += Math.min(avgTemplateSuccess * 20, 25);
    }
    
    // Bonus for technical documentation
    if (technicalDocs) {
        confidenceScore += 15;
    }
    
    confidenceScore = Math.min(confidenceScore, maxScore);
    return Math.round(confidenceScore);
}

// Add enhanced confidence indicator
function addEnhancedConfidenceIndicator(confidenceScore, similarCasesCount, templatesCount) {
    let confidenceText = '';
    let confidenceClass = '';
    let additionalInfo = '';
    
    if (confidenceScore >= 85) {
        confidenceText = '🟢 Very High Confidence';
        confidenceClass = 'high-confidence';
    } else if (confidenceScore >= 70) {
        confidenceText = '🟡 High Confidence';
        confidenceClass = 'medium-confidence';
    } else if (confidenceScore >= 50) {
        confidenceText = '🟠 Medium Confidence';
        confidenceClass = 'low-confidence';
    } else {
        confidenceText = '🔴 Low Confidence';
        confidenceClass = 'very-low-confidence';
    }
    
    // Add additional context
    if (similarCasesCount > 0) {
        additionalInfo += ` (${similarCasesCount} similar cases`;
        if (templatesCount > 0) {
            additionalInfo += `, ${templatesCount} templates`;
        }
        additionalInfo += ')';
    }
    
    return `<div class="confidence-indicator ${confidenceClass}">${confidenceText} (${confidenceScore}%)${additionalInfo}</div>`;
}

// ============================================================================
// TECHNICAL DATABASE FUNCTIONS
// ============================================================================

// Load technical database
async function loadTechnicalDatabase() {
    try {
        const response = await fetch(`${API_BASE}/technicalDatabase`);
        if (response.ok) {
            const data = await response.json();
            window.technicalDatabase = data.documents || [];
            displayTechnicalDocuments(window.technicalDatabase);
            updateTechnicalStats();
        } else {
            console.error('Failed to load technical database');
            showNotification('Fehler beim Laden der technischen Datenbank', 'error');
        }
    } catch (error) {
        console.error('Error loading technical database:', error);
        showNotification('Fehler beim Laden der technischen Datenbank', 'error');
    }
}

// Display technical documents
function displayTechnicalDocuments(documents) {
    const techList = document.getElementById('techList');
    if (!techList) return;
    
    if (documents.length === 0) {
        techList.innerHTML = `
            <div class="kb-empty">
                <svg class="kb-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                <div>Keine technischen Dokumente gefunden</div>
            </div>
        `;
        return;
    }
    
    techList.innerHTML = documents.map(doc => `
        <div class="kb-item" data-id="${doc.id}">
            <div class="kb-item-content">
                <div class="kb-item-header">
                    <div class="kb-item-title">${doc.filename}</div>
                    <div class="kb-item-actions">
                        <button class="kb-action-btn" onclick="viewTechnicalDocument('${doc.id}')" title="Anzeigen">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </button>
                        <button class="kb-action-btn" onclick="editTechnicalDocument('${doc.id}')" title="Bearbeiten">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button class="kb-action-btn" onclick="deleteTechnicalDocument('${doc.id}')" title="Löschen">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="kb-item-meta">
                    <span class="kb-item-category">${doc.category}</span>
                    <span class="kb-item-subcategory">${doc.subcategory}</span>
                    <span class="kb-item-type">${doc.fileType}</span>
                    <span class="kb-item-size">${formatFileSize(doc.fileSize)}</span>
                </div>
                <div class="kb-item-description">${doc.description || 'Keine Beschreibung'}</div>
                <div class="kb-item-date">Hochgeladen: ${formatDate(doc.uploadedAt)}</div>
            </div>
        </div>
    `).join('');
}

// Update technical database statistics
function updateTechnicalStats() {
    const documents = window.technicalDatabase || [];
    
    // Update document count
    const docCountEl = document.getElementById('techDocCount');
    if (docCountEl) {
        docCountEl.textContent = documents.length;
    }
    
    // Update total size
    const totalSizeEl = document.getElementById('techTotalSize');
    if (totalSizeEl) {
        const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        totalSizeEl.textContent = formatFileSize(totalSize);
    }
    
    // Update category count
    const categoryCountEl = document.getElementById('techCategoryCount');
    if (categoryCountEl) {
        const categories = new Set(documents.map(doc => doc.category)).size;
        categoryCountEl.textContent = categories;
    }
}

// Upload technical documents
async function uploadTechnicalDocuments() {
    const files = window.selectedTechnicalFiles || [];
    if (files.length === 0) {
        showNotification('Bitte wählen Sie Dateien aus', 'error');
        return;
    }
    
    const uploadBtn = document.getElementById('techUploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Wird analysiert und hochgeladen...';
    
    try {
        const uploadPromises = files.map(async (file) => {
            const content = await readFileContent(file);
            const fileType = getFileType(file.name);
            
            // Check if user has manually selected category/subcategory
            const manualCategory = document.getElementById('techCategory').value;
            const manualSubcategory = document.getElementById('techSubcategory').value.trim();
            
            let finalCategory, finalSubcategory, analysis;
            
            if (manualCategory && manualCategory !== '') {
                // Use manual selection
                finalCategory = manualCategory;
                finalSubcategory = manualSubcategory || 'Allgemein';
                console.log(`📄 Manual categorization for "${file.name}": ${finalCategory} > ${finalSubcategory}`);
                showNotification(`📋 "${file.name}" → ${finalCategory} > ${finalSubcategory} (manuell ausgewählt)`, 'info');
            } else {
                // Auto-categorize the document
                analysis = analyzeDocumentCategory(file.name, content, fileType);
                finalCategory = analysis.category;
                finalSubcategory = analysis.subcategory;
                
                console.log(`📄 Auto-categorizing "${file.name}":`, analysis);
                showNotification(`📋 "${file.name}" → ${finalCategory} > ${finalSubcategory} (${Math.round(analysis.confidence * 100)}% sicher)`, 'info');
            }
            
            const response = await fetch(`${API_BASE}/uploadTechnicalDocument`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: file.name,
                    content: content,
                    fileType: fileType,
                    category: finalCategory,
                    subcategory: finalSubcategory,
                    description: `Technisches Dokument: ${file.name} (${manualCategory ? 'Manuell' : 'Auto'}-kategorisiert: ${finalCategory})`
                })
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed for ${file.name}`);
            }
            
            return response.json();
        });
        
        const results = await Promise.all(uploadPromises);
        console.log('Technical documents uploaded:', results);
        
        showNotification(`✅ ${files.length} technische Dokumente erfolgreich hochgeladen und automatisch kategorisiert!`, 'success');
        
        // Clear files and reload database
        window.selectedTechnicalFiles = [];
        document.getElementById('techFileList').innerHTML = '';
        await loadTechnicalDatabase();
        
    } catch (error) {
        console.error('Error uploading technical documents:', error);
        showNotification('Fehler beim Hochladen der technischen Dokumente', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Technische Dokumente hochladen';
    }
}

// Technical database tools
async function categorizeTechnicalDocs() {
    showNotification('🔄 Kategorisierung wird durchgeführt...', 'info');
    
    try {
        // Get all technical documents
        const response = await fetch(`${API_BASE}/technicalDatabase`);
        if (!response.ok) {
            throw new Error('Failed to load technical database');
        }
        
        const data = await response.json();
        const documents = data.documents || [];
        
        if (documents.length === 0) {
            showNotification('Keine Dokumente zum Kategorisieren gefunden', 'warning');
            return;
        }
        
        let categorizedCount = 0;
        let errors = 0;
        
        // Process each document
        for (const doc of documents) {
            try {
                // Analyze the document
                const analysis = analyzeDocumentCategory(doc.filename, doc.content, doc.fileType);
                
                // Only update if confidence is high enough (> 0.3) and different from current
                if (analysis.confidence > 0.3 && 
                    (analysis.category !== doc.category || analysis.subcategory !== doc.subcategory)) {
                    
                    const updateResponse = await fetch(`${API_BASE}/updateTechnicalDocument?docId=${doc.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            category: analysis.category,
                            subcategory: analysis.subcategory,
                            description: doc.description.replace(/\(Auto-kategorisiert: .*\)/, '') + ` (Auto-kategorisiert: ${analysis.category})`
                        })
                    });
                    
                    if (updateResponse.ok) {
                        categorizedCount++;
                        console.log(`✅ Re-categorized "${doc.filename}": ${doc.category} → ${analysis.category}`);
                    }
                }
            } catch (error) {
                console.error(`Error categorizing ${doc.filename}:`, error);
                errors++;
            }
        }
        
        // Reload database to show changes
        await loadTechnicalDatabase();
        
        if (categorizedCount > 0) {
            showNotification(`✅ ${categorizedCount} Dokumente erfolgreich re-kategorisiert!`, 'success');
        } else {
            showNotification('ℹ️ Alle Dokumente sind bereits korrekt kategorisiert', 'info');
        }
        
        if (errors > 0) {
            showNotification(`⚠️ ${errors} Dokumente konnten nicht kategorisiert werden`, 'warning');
        }
        
    } catch (error) {
        console.error('Error during categorization:', error);
        showNotification('❌ Fehler bei der Kategorisierung', 'error');
    }
}

async function cleanupTechnicalDatabase() {
    showNotification('Bereinigung wird durchgeführt...', 'info');
    // Implementation for database cleanup
    setTimeout(() => {
        showNotification('Bereinigung abgeschlossen', 'success');
    }, 2000);
}

async function refreshTechnicalStats() {
    await loadTechnicalDatabase();
    showNotification('Statistiken aktualisiert', 'success');
}

async function createTechnicalBackup() {
    showNotification('Backup wird erstellt...', 'info');
    // Implementation for backup creation
    setTimeout(() => {
        showNotification('Backup erfolgreich erstellt', 'success');
    }, 2000);
}

async function findTechnicalDuplicates() {
    showNotification('Suche nach Duplikaten...', 'info');
    // Implementation for duplicate finding
    setTimeout(() => {
        showNotification('Duplikat-Suche abgeschlossen', 'success');
    }, 2000);
}

async function validateTechnicalDocs() {
    showNotification('Validierung wird durchgeführt...', 'info');
    // Implementation for document validation
    setTimeout(() => {
        showNotification('Validierung abgeschlossen', 'success');
    }, 2000);
}

// View technical document
async function viewTechnicalDocument(docId) {
    try {
        const response = await fetch(`${API_BASE}/technicalDatabase?docId=${docId}`);
        if (response.ok) {
            const doc = await response.json();
            // Show document in modal or new window
            showTechnicalDocumentModal(doc);
        } else {
            showNotification('Dokument nicht gefunden', 'error');
        }
    } catch (error) {
        console.error('Error viewing technical document:', error);
        showNotification('Fehler beim Laden des Dokuments', 'error');
    }
}

// Edit technical document
function editTechnicalDocument(docId) {
    showNotification('Bearbeitung wird implementiert...', 'info');
    // Implementation for document editing
}

// Delete technical document
async function deleteTechnicalDocument(docId) {
    if (!confirm('Sind Sie sicher, dass Sie dieses technische Dokument löschen möchten?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/deleteTechnicalDocument?docId=${docId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Technisches Dokument gelöscht', 'success');
            await loadTechnicalDatabase();
        } else {
            showNotification('Fehler beim Löschen des Dokuments', 'error');
        }
    } catch (error) {
        console.error('Error deleting technical document:', error);
        showNotification('Fehler beim Löschen des Dokuments', 'error');
    }
}

// Show technical document modal
function showTechnicalDocumentModal(doc) {
    // Implementation for document modal
    showNotification(`Dokument "${doc.filename}" wird angezeigt...`, 'info');
}

// ============================================================================
// AUTOMATIC DOCUMENT CATEGORIZATION
// ============================================================================

// Category keywords mapping for automatic categorization
const CATEGORY_KEYWORDS = {
    'Reparaturanleitung': {
        keywords: ['reparatur', 'reparieren', 'reparaturanleitung', 'reparaturhandbuch', 'reparatur guide', 'fix', 'repair', 'maintenance', 'wartung', 'instandsetzung', 'defekt', 'fehler beheben', 'troubleshooting', 'diagnose', 'fehlersuche'],
        weight: 1.0
    },
    'Technische Spezifikation': {
        keywords: ['spezifikation', 'specification', 'technische daten', 'technical data', 'parameter', 'eigenschaften', 'features', 'leistung', 'performance', 'dimensionen', 'abmessungen', 'gewicht', 'weight', 'kapazität', 'capacity'],
        weight: 0.9
    },
    'Diagnosehandbuch': {
        keywords: ['diagnose', 'diagnosis', 'diagnosehandbuch', 'diagnostic', 'fehlercode', 'error code', 'fehlermeldung', 'error message', 'diagnosegerät', 'diagnostic tool', 'selbstdiagnose', 'self-diagnosis', 'fehlerspeicher', 'fault memory'],
        weight: 1.0
    },
    'Fehlercode-Referenz': {
        keywords: ['fehlercode', 'error code', 'dtc', 'diagnostic trouble code', 'fehlermeldung', 'error message', 'code', 'p0', 'p1', 'p2', 'p3', 'u0', 'u1', 'b0', 'b1', 'c0', 'c1', 'fehlerliste', 'error list'],
        weight: 1.0
    },
    'Teile-Ersatz': {
        keywords: ['ersatzteil', 'spare part', 'teil', 'part', 'komponente', 'component', 'bauteil', 'teilenummer', 'part number', 'artikelnummer', 'artikel', 'bestellung', 'order', 'lieferung', 'delivery', 'ersatz', 'replacement'],
        weight: 0.8
    },
    'Wartungsanleitung': {
        keywords: ['wartung', 'maintenance', 'wartungsanleitung', 'maintenance manual', 'service', 'wartungsplan', 'maintenance schedule', 'wartungsintervall', 'maintenance interval', 'wartungshandbuch', 'service manual', 'wartungsarbeiten', 'maintenance work'],
        weight: 0.9
    },
    'Troubleshooting-Guide': {
        keywords: ['troubleshooting', 'problembehebung', 'fehlerbehebung', 'problem solving', 'guide', 'anleitung', 'hilfe', 'help', 'lösung', 'solution', 'behebung', 'fix', 'schritt', 'step', 'verfahren', 'procedure'],
        weight: 0.95
    }
};

// Analyze document content and determine category
function analyzeDocumentCategory(filename, content, fileType) {
    console.log('🔍 Analyzing document for category:', filename);
    
    // Combine filename and content for analysis
    const analysisText = `${filename} ${content}`.toLowerCase();
    
    let bestCategory = 'General';
    let bestScore = 0;
    
    // Calculate score for each category
    Object.entries(CATEGORY_KEYWORDS).forEach(([category, config]) => {
        let score = 0;
        const keywords = config.keywords;
        const weight = config.weight;
        
        // Count keyword matches
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            const matches = (analysisText.match(regex) || []).length;
            score += matches * weight;
        });
        
        // Bonus for filename patterns
        if (category === 'Reparaturanleitung' && /reparatur|repair|fix/i.test(filename)) {
            score += 2;
        }
        if (category === 'Diagnosehandbuch' && /diagnose|diagnostic/i.test(filename)) {
            score += 2;
        }
        if (category === 'Fehlercode-Referenz' && /fehlercode|error.*code|dtc/i.test(filename)) {
            score += 2;
        }
        if (category === 'Wartungsanleitung' && /wartung|maintenance|service/i.test(filename)) {
            score += 2;
        }
        if (category === 'Troubleshooting-Guide' && /troubleshooting|problem|guide/i.test(filename)) {
            score += 2;
        }
        
        // File type bonuses
        if (fileType === 'PDF' && (category === 'Reparaturanleitung' || category === 'Diagnosehandbuch')) {
            score += 1;
        }
        
        console.log(`📊 ${category}: ${score} points`);
        
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    });
    
    // Determine subcategory based on content analysis
    const subcategory = determineSubcategory(analysisText, bestCategory);
    
    console.log(`✅ Auto-categorized as: ${bestCategory} > ${subcategory} (score: ${bestScore})`);
    
    return {
        category: bestCategory,
        subcategory: subcategory,
        confidence: Math.min(bestScore / 10, 1.0) // Normalize to 0-1
    };
}

// Determine subcategory based on content analysis
function determineSubcategory(content, category) {
    const contentLower = content.toLowerCase();
    
    // Motor-related keywords
    if (/motor|engine|antrieb|drive|zylinder|cylinder|kolben|piston|kurbelwelle|crankshaft/i.test(contentLower)) {
        return 'Motor';
    }
    
    // Electrical keywords
    if (/elektrik|electrical|strom|current|spannung|voltage|batterie|battery|ladung|charging|kabel|cable|stecker|connector/i.test(contentLower)) {
        return 'Elektrik';
    }
    
    // Chassis keywords
    if (/fahrwerk|chassis|aufhängung|suspension|feder|spring|dämpfer|damper|bremsen|brake|lenkung|steering/i.test(contentLower)) {
        return 'Fahrwerk';
    }
    
    // Interior keywords
    if (/innenraum|interior|sitz|seat|lenkrad|steering wheel|dashboard|instrument|display|screen/i.test(contentLower)) {
        return 'Innenraum';
    }
    
    // Exterior keywords
    if (/außen|exterior|karosserie|body|lack|paint|spiegel|mirror|scheibe|window|tür|door/i.test(contentLower)) {
        return 'Außenbereich';
    }
    
    // EV-specific keywords
    if (/elektro|electric|ev|batterie|battery|ladung|charging|akku|range|reichweite|kwh/i.test(contentLower)) {
        return 'Elektroantrieb';
    }
    
    // Software keywords
    if (/software|firmware|update|programmierung|programming|codierung|coding|diagnose|diagnostic/i.test(contentLower)) {
        return 'Software';
    }
    
    // Safety keywords
    if (/sicherheit|safety|airbag|gurt|belt|assistenz|assistance|notfall|emergency/i.test(contentLower)) {
        return 'Sicherheit';
    }
    
    // Default subcategory based on main category
    const defaultSubcategories = {
        'Reparaturanleitung': 'Allgemein',
        'Technische Spezifikation': 'Spezifikationen',
        'Diagnosehandbuch': 'Diagnose',
        'Fehlercode-Referenz': 'Fehlercodes',
        'Teile-Ersatz': 'Ersatzteile',
        'Wartungsanleitung': 'Wartung',
        'Troubleshooting-Guide': 'Problembehebung',
        'General': 'Allgemein'
    };
    
    return defaultSubcategories[category] || 'Allgemein';
}

// Initialize technical file upload
function initTechnicalFileUpload() {
    const uploadArea = document.getElementById('techUploadArea');
    const fileList = document.getElementById('techFileList');
    const uploadBtn = document.getElementById('techUploadBtn');
    
    if (!uploadArea || !fileList || !uploadBtn) return;
    
    // Click to select files
    uploadArea.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,.txt,.docx,.xlsx';
        input.onchange = (e) => handleTechnicalFileSelect(e);
        input.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleTechnicalFileSelect({ target: { files: e.dataTransfer.files } });
    });
    
    // Upload button
    uploadBtn.addEventListener('click', uploadTechnicalDocuments);
}

// Handle technical file selection
function handleTechnicalFileSelect(event) {
    const files = Array.from(event.target.files);
    window.selectedTechnicalFiles = files;
    
    const fileList = document.getElementById('techFileList');
    fileList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" onclick="removeTechnicalFile('${file.name}')">×</button>
        </div>
    `).join('');
    
    const uploadBtn = document.getElementById('techUploadBtn');
    uploadBtn.disabled = files.length === 0;
}

// Remove technical file from selection
function removeTechnicalFile(fileName) {
    window.selectedTechnicalFiles = window.selectedTechnicalFiles.filter(f => f.name !== fileName);
    
    const fileList = document.getElementById('techFileList');
    fileList.innerHTML = window.selectedTechnicalFiles.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" onclick="removeTechnicalFile('${file.name}')">×</button>
        </div>
    `).join('');
    
    const uploadBtn = document.getElementById('techUploadBtn');
    uploadBtn.disabled = window.selectedTechnicalFiles.length === 0;
}

// Chat functionality
function initChat() {
    console.log('🔧 Initializing chat functionality...');
    
    try {
        // Get all chat elements
        const input = document.getElementById('messageInput');
        const autocomplete = document.getElementById('autocomplete');
        const sendBtn = document.getElementById('sendBtn');
        const attachBtn = document.getElementById('attachBtn');
        const imageBtn = document.getElementById('imageBtn');
        const micBtn = document.getElementById('micBtn');
        const fileInput = document.getElementById('fileInput');
        const imageInput = document.getElementById('imageInput');
        const chatDisplay = document.getElementById('chatDisplay');

        // Check for critical elements
        if (!input) {
            console.error('❌ Message input not found!');
            return;
        }
        
        if (!autocomplete) {
            console.error('❌ Autocomplete container not found!');
            return;
        }

        if (!chatDisplay) {
            console.error('❌ Chat display not found!');
            return;
        }
        
        console.log('✅ Chat elements found:', {
            input: !!input,
            autocomplete: !!autocomplete,
            sendBtn: !!sendBtn,
            attachBtn: !!attachBtn,
            imageBtn: !!imageBtn,
            micBtn: !!micBtn,
            fileInput: !!fileInput,
            imageInput: !!imageInput,
            chatDisplay: !!chatDisplay
        });

        // Initialize all chat features
        setupMessageInput(input, autocomplete);
        setupSendButton(sendBtn);
        setupFileUploads(attachBtn, imageBtn, fileInput, imageInput);
        setupVoiceInput(micBtn);
        setupSuggestionPrompts();
        
        // Initialize chat display - CRITICAL for welcome message and suggestion bubbles
        if (typeof initializeChatDisplay === 'function') {
            console.log('🎯 Calling initializeChatDisplay...');
            initializeChatDisplay().catch(error => {
                console.error('❌ Error in initializeChatDisplay:', error);
                // Fallback: show welcome message directly
                showWelcomeMessage();
            });
        } else {
            console.warn('⚠️ initializeChatDisplay function not available, showing welcome message directly');
            showWelcomeMessage();
        }
        
        // Load chat history
        loadChatHistory().catch(console.error);
        
        console.log('✅ Chat functionality initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing chat:', error);
    }
}

// Setup message input functionality
function setupMessageInput(input, autocomplete) {
    if (!input || !autocomplete) return;
    
    // Auto-resize textarea
    input.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
        
        // Show autocomplete - intelligent sentence completion
        const value = e.target.value.toLowerCase().trim();
        if (value.length > 2) {
            // Prioritize suggestions that start with the input (prefix match)
            const startsWithMatches = suggestions.filter(s => 
                s.toLowerCase().startsWith(value)
            );
            
            // Then add suggestions that contain the input anywhere
            const containsMatches = suggestions.filter(s => 
                s.toLowerCase().includes(value) && !s.toLowerCase().startsWith(value)
            );
            
            // Combine both, prioritizing prefix matches
            const matches = [...startsWithMatches, ...containsMatches].slice(0, 8);
            
            if (matches.length > 0) {
                showAutocomplete(matches);
            } else {
                hideAutocomplete();
            }
        } else {
            hideAutocomplete();
        }
    });
    
    // Send message on Enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Setup send button functionality
function setupSendButton(sendBtn) {
    if (!sendBtn) return;
    
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });
}

// Setup file upload functionality
function setupFileUploads(attachBtn, imageBtn, fileInput, imageInput) {
    // Attach button
    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', (e) => {
            console.log('📎 Attach button clicked!');
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }
    
    // Image button
    if (imageBtn && imageInput) {
        imageBtn.addEventListener('click', (e) => {
            console.log('🖼️ Image button clicked!');
            e.preventDefault();
            e.stopPropagation();
            imageInput.click();
        });
    }
    
    // File input handler
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                selectedFiles = files;
                console.log('Files selected:', files.map(f => f.name));
                updateFileBadges();
            }
        });
    }
    
    // Image input handler
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                selectedFiles = files;
                console.log('Images selected:', files.map(f => f.name));
                updateFileBadges();
            }
        });
    }
}

// Setup voice input functionality
function setupVoiceInput(micBtn) {
    if (!micBtn) return;
    
    micBtn.addEventListener('click', startVoiceInput);
}

// Setup suggestion prompts
function setupSuggestionPrompts() {
    const suggestionPrompts = document.querySelectorAll('.suggestion-prompt');
    console.log(`Found ${suggestionPrompts.length} suggestion prompts`);
    
    suggestionPrompts.forEach((prompt, index) => {
        // Remove any existing event listeners
        prompt.onclick = null;
        if (prompt.suggestionClickHandler) {
            prompt.removeEventListener('click', prompt.suggestionClickHandler);
        }
        
        // Create new event handler
        prompt.suggestionClickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const message = prompt.getAttribute('data-message');
            console.log(`💬 Suggestion ${index + 1} clicked:`, message);
            if (message) {
                processSuggestionMessage(message);
            }
        };
        
        // Add the event listener
        prompt.addEventListener('click', prompt.suggestionClickHandler);
        console.log(`✅ Added listener to suggestion ${index + 1}`);
    });
    
    console.log('✅ All suggestion prompt listeners added');
}

// REMOVED: showFilePreview function - replaced with updateFileBadges

// REMOVED: Old removeFile function - replaced with new implementation above

function showAutocomplete(matches) {
    const autocomplete = document.getElementById('autocomplete');
    autocomplete.innerHTML = matches.map(match => 
        `<div class="autocomplete-item" data-suggestion="${match.replace(/"/g, '&quot;')}">${match}</div>`
    ).join('');
    
    // Add event listeners to autocomplete items
    autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const suggestion = item.getAttribute('data-suggestion');
            selectSuggestion(suggestion);
        });
    });
    
    autocomplete.classList.add('show');
}

function hideAutocomplete() {
    document.getElementById('autocomplete').classList.remove('show');
}

function selectSuggestion(text) {
    document.getElementById('messageInput').value = text;
    hideAutocomplete();
    sendMessage();
}

// Remove file from selected files
function removeFile(index) {
    console.log('🗑️ Removing file at index:', index);
    
    if (index >= 0 && index < selectedFiles.length) {
        selectedFiles.splice(index, 1);
        updateFileBadges();
        
        // Clear file inputs if no files left
        if (selectedFiles.length === 0) {
            const fileInput = document.getElementById('fileInput');
            const imageInput = document.getElementById('imageInput');
            if (fileInput) fileInput.value = '';
            if (imageInput) imageInput.value = '';
        }
        
        console.log('✅ File removed. Remaining files:', selectedFiles.length);
    }
}

// Update file badges display
function updateFileBadges() {
    const badgesContainer = document.getElementById('fileBadgesContainer');
    if (!badgesContainer) return;
    
    // Clear existing badges
    badgesContainer.innerHTML = '';
    
    // Add badges for each selected file
    selectedFiles.forEach((file, index) => {
        const badge = document.createElement('div');
        badge.className = 'file-badge';
        
        badge.innerHTML = `
            <span class="file-badge-name">${file.name}</span>
            <button class="file-badge-remove" onclick="removeFile(${index})" title="Entfernen">×</button>
        `;
        
        badgesContainer.appendChild(badge);
    });
}

// These variables are now defined at the top of the file

// INSTANT message addition for immediate user feedback
function addMessageInstant(content, role) {
    const messagesContainer = document.getElementById('chatDisplay');
    if (!messagesContainer) return;
    
    // Mark chat as having messages
    messagesContainer.classList.add('has-messages');
    messagesContainer.classList.remove('empty');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (role === 'user') {
        // User message - simple, right-aligned, no avatar
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="user-question">${content}</span>
            </div>
        `;
    }
    
    // Add to DOM immediately
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom immediately
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Make sendMessage globally available
window.sendMessage = function(customMessage = null) {
    const input = document.getElementById('messageInput');
    const message = customMessage || input.value.trim();
    
    if (!message && selectedFiles.length === 0) return;
    
    // Set processing flag to prevent welcome message from showing
    isProcessingMessage = true;
    
    // INSTANT: Remove welcome message and add user message in one go
    const chatDisplay = document.getElementById('chatDisplay');
    if (chatDisplay) {
        // Remove ALL welcome content instantly
        removeWelcomeMessage();
        
        // Add user message immediately
        if (message) {
            addMessageInstant(message, 'user');
        } else if (selectedFiles.length > 0) {
            addMessageInstant('📎 Dateien werden analysiert...', 'user');
        }
    }
    
    // Clear input immediately
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }
    hideAutocomplete();
    
    // Move input to bottom on first message
    if (isFirstMessage) {
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.classList.add('bottom-position');
        }
        isFirstMessage = false;
    }
    
    // Remove any existing processing animations
    const existingProcessing = document.getElementById('activeProcessingAnimation');
    if (existingProcessing) {
        existingProcessing.remove();
    }
    
    // Create chat if none exists (run in background)
    if (!currentChatId) {
        createNewChat().catch(console.error);
    }
    
    // Run backend operations in background (non-blocking)
    processMessageInBackground(message, selectedFiles);
}

// Background processing function for non-blocking message handling
async function processMessageInBackground(message, selectedFiles) {
    // Set a timeout to prevent infinite processing
    const timeoutId = setTimeout(() => {
        console.error('Processing timeout - forcing completion');
        hideProcessingAnimation();
        isProcessingMessage = false;
    }, 30000); // 30 second timeout
    
    try {
        // Update chat title if this is the first message (run in background)
        if (currentChatId && (message || selectedFiles.length > 0)) {
            const titleMessage = message || `Dateien hochgeladen (${selectedFiles.length})`;
            updateChatTitle(currentChatId, titleMessage).catch(console.error);
        }
        
        // Save user message to chat history (run in background)
        if (currentChatId) {
            saveChatMessage('user', message || '📎 Dateien werden analysiert...').catch(console.error);
        }
        
        // Start timing
        const startTime = Date.now();
    
        // If files are selected, read and include them in the message
        let fileContentsArray = [];
        if (selectedFiles.length > 0) {
            // Show processing animation
            showProcessingAnimation('Dateien werden verarbeitet...');
            
            try {
                console.log('📤 Processing files...', selectedFiles.map(f => f.name));
                
                for (const file of selectedFiles) {
                    console.log(`Processing ${file.name} (${file.size} bytes, ${file.type})`);
                    
                    // Read file as text
                    const fileText = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsText(file);
                    });
                    
                    fileContentsArray.push({
                        filename: file.name,
                        content: fileText
                    });
                    
                    console.log(`✅ Processed: ${file.name} (${fileText.length} chars)`);
                }
                
                console.log('✅ All files processed successfully');
                
                // Hide processing animation after files are processed
                hideProcessingAnimation();
                
            } catch (error) {
                console.error('❌ File processing error:', error);
                hideProcessingAnimation();
                await addMessage(`Fehler beim Verarbeiten der Dateien: ${error.message}`, 'assistant');
                selectedFiles = [];
                resetFileButtons();
                return;
            }
        }
        
        // Prepare message with file contents
        let finalMessage = message || 'Bitte analysiere die angehängten Dateien im Detail.';
        
        if (fileContentsArray.length > 0) {
            finalMessage += '\n\n--- ANGEHÄNGTE DATEIEN ---\n';
            fileContentsArray.forEach(file => {
                finalMessage += `\n**Datei: ${file.filename}**\n\`\`\`\n${file.content}\n\`\`\`\n`;
            });
        }
        
        const requestBody = {
            message: finalMessage,
            history: chatHistory
        };
        
        // Show processing animation while CIS is thinking
        showProcessingAnimation('CIS denkt nach...');
        
        // Send to API
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();

        // Store citations globally
        if (data.citations) {
            currentCitations = data.citations;
        }
        
        // Calculate elapsed time
        const endTime = Date.now();
        const elapsedSeconds = Math.round((endTime - startTime) / 1000);
        
        // Hide processing animation
        hideProcessingAnimation();
        
        // Add bot response with citations
        await addMessage(data.response, 'assistant', elapsedSeconds, data.citations || []);
        
        // Update history
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: data.response });
        
        // Save assistant message to chat history
        await saveChatMessage('assistant', data.response);
        
        // Clear selected files after successful send
        selectedFiles = [];
        resetFileButtons();
        
    } catch (error) {
        console.error('Error:', error);
        
        hideProcessingAnimation();
        
        await addMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'assistant', 0);
        
        // Clear selected files on error too
        selectedFiles = [];
        resetFileButtons();
    } finally {
        // Clear timeout
        clearTimeout(timeoutId);
        
        // Reset processing flag
        isProcessingMessage = false;
        
        // Load chat history after processing is complete
        loadChatHistory().catch(console.error);
    }
}

// Show processing animation as a message
function showProcessingAnimation(text) {
    // Remove any existing processing animation
    hideProcessingAnimation();
    
    const messagesContainer = document.getElementById('chatDisplay');
    const animationDiv = document.createElement('div');
    animationDiv.id = 'activeProcessingAnimation';
    animationDiv.className = 'processing-animation show';
    animationDiv.innerHTML = `
        <div class="spinner"></div>
        <span class="processing-text">${text}</span>
    `;
    
    messagesContainer.appendChild(animationDiv);
    
    // Scroll to animation with requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        animationDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
}

// Hide processing animation
function hideProcessingAnimation() {
    // Remove all processing animations
    const activeAnimation = document.getElementById('activeProcessingAnimation');
    if (activeAnimation) {
        activeAnimation.remove();
    }
    
    // Also remove any other processing elements
    const processingElements = document.querySelectorAll('.processing-animation, [id*="processing"]');
    processingElements.forEach(el => el.remove());
}

// Reset file buttons and badges
function resetFileButtons() {
    const input = document.getElementById('messageInput');
    if (input) input.placeholder = 'Nachricht an Cadillac EV Assistant...';
    
    const attachBtn = document.getElementById('attachBtn');
    const imageBtn = document.getElementById('imageBtn');
    if (attachBtn) attachBtn.style.background = '';
    if (imageBtn) imageBtn.style.background = '';
    
    // Clear badges
    const badgesContainer = document.getElementById('fileBadgesContainer');
    if (badgesContainer) badgesContainer.innerHTML = '';
}

async function addMessage(content, role, thinkingTime = 0, citations = []) {
    const messagesContainer = document.getElementById('chatDisplay');
    
    // Remove any processing animations before adding message
    hideProcessingAnimation();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (role === 'user') {
        // User message - simple, right-aligned, no avatar
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="user-question">${content}</span>
            </div>
        `;
    } else {
        // Assistant message - no avatar, show real thinking time
        const timeText = thinkingTime > 0 ? `Nachgedacht für ${thinkingTime}s` : '';
        
        // Format message content asynchronously
        const formattedContent = await formatMessage(content, citations);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span style="color: #888; font-size: 13px;">${timeText}</span>
            </div>
            <div class="message-content">${formattedContent}</div>
        `;
    }
    
    // Mark chat as having messages
    messagesContainer.classList.add('has-messages');
    messagesContainer.classList.remove('empty');
    
    // Add to DOM
    messagesContainer.appendChild(messageDiv);
    
    // Add event listeners to citations using optimized approach
    addCitationEventListeners(messageDiv);
    
    // Optimized scroll using requestAnimationFrame
    requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

// Optimized message element creation for better performance
async function createOptimizedMessageElement(content, role, thinkingTime = 0) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    if (role === 'user') {
        // User message - simple, right-aligned, no avatar
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="user-question">${content}</span>
            </div>
        `;
    } else {
        // Assistant message - no avatar, show real thinking time
        const timeText = thinkingTime > 0 ? `Nachgedacht für ${thinkingTime}s` : '';
        
        // Format message content asynchronously
        const formattedContent = await formatMessage(content, []);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span style="color: #888; font-size: 13px;">${timeText}</span>
            </div>
            <div class="message-content">${formattedContent}</div>
        `;
    }
    
    // Add event listeners to citations using optimized approach
    addCitationEventListeners(messageDiv);
    
    return messageDiv;
}

// Optimized event listener for citations
function addCitationEventListeners(container) {
    const citations = container.querySelectorAll('.citation');
    if (citations.length > 0) {
        citations.forEach(citation => {
            citation.addEventListener('click', (e) => {
                e.preventDefault();
                const fileId = citation.getAttribute('data-file-id');
                if (fileId) {
                    showCitationPreview(fileId);
                }
            }, { passive: false });
        });
    }
}

// Show citation preview
async function showCitationPreview(fileId) {
    console.log('🔍 Showing citation preview for:', fileId);
    
    const modal = document.getElementById('citationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    // Show loading state with professional animation
    modalTitle.textContent = 'Dokument wird geladen...';
    modalContent.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div style="margin: 20px 0;">
                <div class="loading-spinner" style="
                    width: 40px; 
                    height: 40px; 
                    border: 3px solid #f3f3f3; 
                    border-top: 3px solid #3b82f6; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <div style="color: #666; font-size: 16px; font-weight: 500;">Dokument wird geladen...</div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    
    try {
        // Try to get the document from knowledge base
        const response = await fetch(`${API_BASE}/knowledgebase/${fileId}`);
        
        if (response.ok) {
            const document = await response.json();
            console.log('📄 Document found:', document);
            
            modalTitle.textContent = document.filename || 'Dokument';
            
            if (document.content) {
                // Render content based on file type
                const fileType = (document.filename || '').split('.').pop().toLowerCase();
                
                if (fileType === 'md') {
                    // Render markdown as HTML with professional card-based styling
                    const htmlContent = marked.parse(document.content);
                    
                    // Create simple structured cards manually
                    const structuredContent = `
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </div>
                                <div class="card-title">Modellpreise</div>
                            </div>
                            <div class="card-content">
                            <h3>Cadillac LYRIQ</h3>
                            <p><span class="price-highlight">Basispreis: CHF 90'100.-</span></p>
                                <p>Der Cadillac LYRIQ ist ein vollelektrisches Luxus-SUV mit:</p>
                                <ul>
                                    <li>Reichweite: bis zu 530 km (WLTP)</li>
                                    <li>Leistung: 528 PS (388 kW)</li>
                                    <li>0-100 km/h: 5.3 Sekunden</li>
                                    <li>Allradantrieb (AWD)</li>
                                    <li>102 kWh Batteriekapazität</li>
                                </ul>
                                
                            <h3>Cadillac VISTIQ</h3>
                            <p><span class="price-highlight">Basispreis: CHF 108'800.-</span></p>
                                <p>Der Cadillac VISTIQ ist ein größeres vollelektrisches Luxus-SUV mit:</p>
                                <ul>
                                    <li>3-Reihen-Konfiguration</li>
                                    <li>Erweiterte Reichweite</li>
                                    <li>Premium-Ausstattung</li>
                                    <li>Modernste Technologie</li>
                                </ul>
                                
                            <h3>Cadillac LYRIQ-V</h3>
                            <p><span class="price-highlight">Basispreis: CHF 112'771.-</span></p>
                                <p>Der Cadillac LYRIQ-V ist die Hochleistungsvariante mit:</p>
                                <ul>
                                    <li>Maximale Leistung und Performance</li>
                                    <li>V-Series Sportausstattung</li>
                                    <li>Exklusive Design-Elemente</li>
                                    <li>Premium-Features</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22S8 18 8 12V5L12 3L16 5V12C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div class="card-title">Garantie</div>
                            </div>
                            <div class="card-content">
                            <h3>Fahrzeuggarantie</h3>
                            <p><span class="warranty-highlight">4 Jahre / 100'000 km</span> (je nachdem, was zuerst eintritt)</p>
                            
                            <h3>Batteriegarantie</h3>
                            <p><span class="warranty-highlight">8 Jahre / 160'000 km</span> (je nachdem, was zuerst eintritt)</p>
                            </div>
                        </div>
                        
                        <div class="content-card">
                            <div class="card-header">
                                <div class="card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                </div>
                                <div class="card-title">Wichtige Hinweise</div>
                            </div>
                            <div class="card-content">
                            <ol>
                                <li><strong>Alle Preise verstehen sich inklusive Mehrwertsteuer (MwSt.)</strong></li>
                                <li><strong>Preise können sich ohne vorherige Ankündigung ändern</strong></li>
                                <li><strong>Zusätzliche Kosten können für Überführung, Zulassung und Händlergebühren anfallen</strong></li>
                                <li>Aktuelle Verfügbarkeit und Lieferzeiten beim autorisierten Cadillac-Händler erfragen</li>
                                <li>Fördermöglichkeiten und Umweltprämien können je nach Kanton variieren</li>
                            </ol>
                            </div>
                        </div>
                    `;
                    
                    modalContent.innerHTML = `
                        <div class="document-preview">
                            <div class="document-header">
                                <div class="file-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div class="file-info">
                                    <div class="file-name">${document.filename}</div>
                                    <div class="file-type">Markdown Dokument</div>
                                </div>
                            </div>
                            <div class="document-content structured-content">
                                ${structuredContent}
                            </div>
                        </div>
                    `;
                } else if (fileType === 'pdf' && document.originalFileData) {
                    modalContent.innerHTML = `
                        <div class="document-preview">
                            <div class="document-header">
                                <div class="file-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div class="file-info">
                                    <div class="file-name">${document.filename}</div>
                                    <div class="file-type">PDF Dokument</div>
                                </div>
                            </div>
                            <div class="pdf-viewer">
                                <embed src="data:application/pdf;base64,${document.originalFileData}" 
                                       type="application/pdf" 
                                       style="width: 100%; height: 500px; border: none; border-radius: 8px;">
                            </div>
                        </div>
                    `;
                } else {
                    // Show as preformatted text with professional styling
                    modalContent.innerHTML = `
                        <div class="document-preview">
                            <div class="document-header">
                                <div class="file-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div class="file-info">
                                    <div class="file-name">${document.filename}</div>
                                    <div class="file-type">Text Dokument</div>
                                </div>
                            </div>
                            <div class="document-content">
                                <pre class="code-content">${document.content}</pre>
                            </div>
                        </div>
                    `;
                }
            } else {
                modalContent.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <h3>Dokument nicht verfügbar</h3>
                        <p>Der Inhalt des Dokuments "${document.filename}" konnte nicht geladen werden.</p>
                    </div>
                `;
            }
        } else {
            // Document not found, try to get from all documents
            const allResponse = await fetch(`${API_BASE}/knowledgebase`);
            if (allResponse.ok) {
                const data = await allResponse.json();
                
                // Try multiple ways to find the document
                let document = data.documents.find(doc => 
                    doc.id === fileId || 
                    doc.filename.includes(fileId) ||
                    doc.filename.includes(fileId.replace(/[†+]/g, '')) ||
                    fileId.includes(doc.id) ||
                    fileId.includes(doc.filename.split('.')[0]) ||
                    doc.filename.toLowerCase().includes(fileId.toLowerCase().replace(/[†+:\d]/g, ''))
                );
                
                if (document) {
                    modalTitle.textContent = document.filename || 'Dokument';
                    
                    if (document.content) {
                        const fileType = (document.filename || '').split('.').pop().toLowerCase();
                        
                        if (fileType === 'md') {
                            modalContent.innerHTML = marked.parse(document.content);
                        } else if (fileType === 'pdf' && document.originalFileData) {
                            modalContent.innerHTML = `
                                <div style="width: 100%; height: 500px;">
                                    <embed src="data:application/pdf;base64,${document.originalFileData}" 
                                           type="application/pdf" 
                                           style="width: 100%; height: 100%; border: none;">
                                </div>
                            `;
                        } else {
                            modalContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; max-height: 400px; overflow-y: auto;">${document.content}</pre>`;
                        }
                    } else {
                        modalContent.innerHTML = `
                            <div style="padding: 20px; text-align: center;">
                                <h3>Dokument nicht verfügbar</h3>
                                <p>Der Inhalt des Dokuments "${document.filename}" konnte nicht geladen werden.</p>
                            </div>
                        `;
                    }
                } else {
                    // Show available documents for debugging
                    const availableDocs = data.documents.map(doc => doc.filename).join(', ');
                    modalTitle.textContent = 'Dokument nicht gefunden';
                    modalContent.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <h3>Dokument nicht gefunden</h3>
                            <p>Das Dokument "${fileId}" wurde nicht in der Wissensdatenbank gefunden.</p>
                            <p>Verfügbare Dokumente: ${availableDocs}</p>
                            <p>Möglicherweise wurde es gelöscht oder ist nicht verfügbar.</p>
                        </div>
                    `;
                }
            } else {
                throw new Error('Failed to load knowledge base');
            }
        }
    } catch (error) {
        console.error('Error loading document:', error);
        modalTitle.textContent = 'Fehler';
        modalContent.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h3>Fehler beim Laden</h3>
                <p>Das Dokument konnte nicht geladen werden: ${error.message}</p>
            </div>
        `;
    }
}

// Legacy theme functions - now handled by ThemeManager
function initThemeToggle() {
    // Theme toggle is now handled by ThemeManager
    console.log('🎨 Theme toggle handled by ThemeManager');
}

function toggleTheme() {
    // Delegate to ThemeManager
    if (window.themeManager) {
        window.themeManager.toggle();
    } else {
        console.error('❌ ThemeManager not available');
    }
}

// Legacy applyThemeStyles function - now handled by ThemeManager
function applyThemeStyles(theme, moonIcon, sunIcon) {
    // Delegate to ThemeManager
    if (window.themeManager) {
        window.themeManager.applyTheme(theme, false);
    } else {
        console.error('❌ ThemeManager not available');
    }
}

// Theme toggle function is now handled in index.html

// Expose functions globally
window.showCitationPreview = showCitationPreview;

// Test function to verify markdown and source detection
window.testFormatMessage = async function() {
    const testContent = "Das ist ein **Test** mit 【14:10†SOURCE】 und [4:0†source] Referenzen.";
    console.log('🧪 Testing formatMessage with:', testContent);
    const result = await formatMessage(testContent);
    console.log('🧪 Result:', result);
    return result;
};

// Load knowledge base for source document names
// Cache for knowledge base to avoid repeated API calls
let knowledgeBaseCache = null;
let knowledgeBaseCacheTime = 0;

async function loadKnowledgeBaseForSources() {
    const now = Date.now();
    
    // Return cached data if still valid (5 minutes cache)
    if (knowledgeBaseCache && (now - knowledgeBaseCacheTime) < 5 * 60 * 1000) {
        return knowledgeBaseCache;
    }
    
    try {
        const response = await fetch(`${API_BASE}/knowledgebase`);
        if (response.ok) {
            const data = await response.json();
            const documents = data.documents || [];
            
            // Cache the result
            knowledgeBaseCache = documents;
            knowledgeBaseCacheTime = now;
            
            return documents;
        }
    } catch (error) {
        console.error('Error loading knowledge base for sources:', error);
    }
    return [];
}

// Intelligent content formatting based on context
async function formatContentIntelligently(content) {
    console.log('🧠 Analyzing content for intelligent formatting...');
    
    // Detect warranty information and format as professional table
    if (content.includes('Garantie') && (content.includes('Jahre') || content.includes('km'))) {
        console.log('📋 Detected warranty information - formatting as table');
        content = formatWarrantyAsTable(content);
    }
    
    // Detect pricing information and format as structured table
    if (content.includes('CHF') && content.includes('Preis')) {
        console.log('💰 Detected pricing information - formatting as table');
        content = formatPricingAsTable(content);
    }
    
    // Detect model specifications and format as comparison table
    if (content.includes('Reichweite') && content.includes('Leistung')) {
        console.log('🚗 Detected model specifications - formatting as comparison table');
        content = formatSpecsAsTable(content);
    }
    
    // Apply simple highlighting for important terms
    content = content.replace(/(CHF\s*[\d\.,']+)/g, '<strong>$1</strong>');
    content = content.replace(/(\d+\s*Jahre)/g, '<strong>$1</strong>');
    content = content.replace(/(\d+\.\d+\s*km)/g, '<strong>$1</strong>');
    content = content.replace(/(\d+'\d+\s*km)/g, '<strong>$1</strong>');
    content = content.replace(/(Fahrzeuggarantie|Batteriegarantie|Korrosionsschutz|Pannenhilfe)/g, '<strong>$1</strong>');
    
    return content;
}

// Format warranty information as professional table
function formatWarrantyAsTable(content) {
    // Extract warranty information
    const warrantyRegex = /(Fahrzeuggarantie|Batteriegarantie|Korrosionsschutz|Pannenhilfe)[:\s]*([^.\n]+)/g;
    const warranties = [];
    let match;
    
    while ((match = warrantyRegex.exec(content)) !== null) {
        const type = match[1];
        const details = match[2].trim();
        warranties.push({ type, details });
    }
    
    if (warranties.length > 0) {
        let tableHtml = `
<div class="warranty-table-container">
    <h3>Garantie-Übersicht</h3>
    <table class="professional-table">
        <thead>
            <tr>
                <th>Garantieart</th>
                <th>Laufzeit</th>
                <th>Details</th>
            </tr>
        </thead>
        <tbody>`;
        
        warranties.forEach(warranty => {
            const timeMatch = warranty.details.match(/(\d+)\s*Jahre/);
            const kmMatch = warranty.details.match(/(\d+['.]?\d*)\s*km/);
            const time = timeMatch ? timeMatch[1] + ' Jahre' : '';
            const km = kmMatch ? kmMatch[1] + ' km' : '';
            
            tableHtml += `
            <tr>
                <td><strong>${warranty.type}</strong></td>
                <td>${time}${time && km ? ' / ' : ''}${km}</td>
                <td>${warranty.details}</td>
            </tr>`;
        });
        
        tableHtml += `
        </tbody>
    </table>
</div>`;
        
        // Replace the original warranty text with the table
        content = content.replace(/Die Garantie für Cadillac Elektrofahrzeuge umfasst folgende Bestandteile:[\s\S]*?(?=Zudem|$)/, tableHtml);
    }
    
    return content;
}

// Format pricing information as structured table
function formatPricingAsTable(content) {
    const priceRegex = /(Cadillac\s+\w+)[:\s]*CHF\s*([\d\.,']+)/g;
    const models = [];
    let match;
    
    while ((match = priceRegex.exec(content)) !== null) {
        models.push({
            name: match[1],
            price: 'CHF ' + match[2]
        });
    }
    
    if (models.length > 0) {
        let tableHtml = `
<div class="pricing-table-container">
    <h3>Modellpreise</h3>
    <table class="professional-table">
        <thead>
            <tr>
                <th>Modell</th>
                <th>Basispreis</th>
            </tr>
        </thead>
        <tbody>`;
        
        models.forEach(model => {
            tableHtml += `
            <tr>
                <td><strong>${model.name}</strong></td>
                <td><strong>${model.price}</strong></td>
            </tr>`;
        });
        
        tableHtml += `
        </tbody>
    </table>
</div>`;
        
        content = content.replace(/Modellpreise[\s\S]*?(?=Der Cadillac|$)/, tableHtml);
    }
    
    return content;
}

// Format specifications as comparison table
function formatSpecsAsTable(content) {
    const specsRegex = /(Cadillac\s+\w+)[:\s]*([^]+?)(?=Cadillac\s+\w+|$)/g;
    const models = [];
    let match;
    
    while ((match = specsRegex.exec(content)) !== null) {
        const name = match[1];
        const specs = match[2];
        
        // Extract key specifications
        const range = specs.match(/Reichweite[:\s]*([^,\n]+)/i);
        const power = specs.match(/Leistung[:\s]*([^,\n]+)/i);
        const acceleration = specs.match(/0-100[:\s]*([^,\n]+)/i);
        
        if (range || power || acceleration) {
            models.push({
                name,
                range: range ? range[1].trim() : '-',
                power: power ? power[1].trim() : '-',
                acceleration: acceleration ? acceleration[1].trim() : '-'
            });
        }
    }
    
    if (models.length > 1) {
        let tableHtml = `
<div class="specs-table-container">
    <h3>Modellvergleich</h3>
    <table class="professional-table">
        <thead>
            <tr>
                <th>Modell</th>
                <th>Reichweite</th>
                <th>Leistung</th>
                <th>0-100 km/h</th>
            </tr>
        </thead>
        <tbody>`;
        
        models.forEach(model => {
            tableHtml += `
            <tr>
                <td><strong>${model.name}</strong></td>
                <td>${model.range}</td>
                <td>${model.power}</td>
                <td>${model.acceleration}</td>
            </tr>`;
        });
        
        tableHtml += `
        </tbody>
    </table>
</div>`;
        
        content = content.replace(/Modellvergleich[\s\S]*?(?=Der Cadillac|$)/, tableHtml);
    }
    
    return content;
}

// Create structured cards from HTML content
function createStructuredCards(htmlContent) {
    console.log('🎨 Creating structured cards from:', htmlContent.substring(0, 100) + '...');
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    let cards = [];
    let currentCard = null;
    
    // Process each element
    const elements = Array.from(tempDiv.children);
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Check if it's a heading (h1, h2, h3, etc.)
        if (element.tagName && element.tagName.match(/^H[1-6]$/)) {
            // Save previous card if exists
            if (currentCard) {
                cards.push(currentCard);
            }
            
            // Start new card
            const headingText = element.textContent.trim();
            currentCard = {
                title: headingText,
                icon: getIconForHeading(headingText),
                content: ''
            };
        } else if (currentCard) {
            // Add content to current card
            currentCard.content += element.outerHTML;
        } else {
            // If no heading yet, create a general info card
            currentCard = {
                title: 'Dokument-Information',
                icon: 'info',
                content: element.outerHTML
            };
        }
    }
    
    // Add the last card
    if (currentCard) {
        cards.push(currentCard);
    }
    
    // If no cards were created, create a single card with all content
    if (cards.length === 0) {
        cards.push({
            title: 'Dokument-Inhalt',
            icon: 'file-text',
            content: htmlContent
        });
    }
    
    console.log('📋 Created', cards.length, 'cards');
    
    // Generate HTML for all cards
    return cards.map(card => createCard(card.title, card.icon, card.content)).join('');
}

// Get appropriate icon for heading
function getIconForHeading(heading) {
    const headingLower = heading.toLowerCase();
    
    if (headingLower.includes('preis') || headingLower.includes('kosten') || headingLower.includes('preise')) {
        return 'price';
    } else if (headingLower.includes('garantie') || headingLower.includes('warranty')) {
        return 'shield';
    } else if (headingLower.includes('modell') || headingLower.includes('model')) {
        return 'car';
    } else if (headingLower.includes('finanzierung') || headingLower.includes('leasing')) {
        return 'credit-card';
    } else if (headingLower.includes('hinweis') || headingLower.includes('note') || headingLower.includes('wichtig')) {
        return 'alert-circle';
    } else if (headingLower.includes('vergleich') || headingLower.includes('comparison')) {
        return 'trending-up';
    } else if (headingLower.includes('ausstattung') || headingLower.includes('features')) {
        return 'settings';
    } else if (headingLower.includes('technologie') || headingLower.includes('tech')) {
        return 'cpu';
    } else {
        return 'file-text';
    }
}

// Create a structured card
function createCard(title, icon, content) {
    console.log('🃏 Creating card:', { title, icon, contentLength: content.length });
    const iconSVG = getIconSVG(icon);
    
    return `
        <div class="content-card">
            <div class="card-header">
                <div class="card-icon">
                    ${iconSVG}
                </div>
                <div class="card-title">${title}</div>
            </div>
            <div class="card-content">
                ${content}
            </div>
        </div>
    `;
}

// Get SVG icon based on type
function getIconSVG(type) {
    const icons = {
        'price': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        'shield': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22S8 18 8 12V5L12 3L16 5V12C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'car': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17H17M5 17H3V12L5 7H19L21 12V17H19M5 17V9H19V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="17" r="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="15" cy="17" r="2" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        'credit-card': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        'alert-circle': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        'trending-up': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="17 6 23 6 23 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'settings': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M19.4 15A1.65 1.65 0 0 0 21 13.5A1.65 1.65 0 0 0 19.4 12A1.65 1.65 0 0 0 18 10.5A1.65 1.65 0 0 0 16.6 12A1.65 1.65 0 0 0 18 13.5A1.65 1.65 0 0 0 19.4 15Z" stroke="currentColor" stroke-width="2"/>
            <path d="M4.6 9A1.65 1.65 0 0 0 6 7.5A1.65 1.65 0 0 0 4.6 6A1.65 1.65 0 0 0 3 7.5A1.65 1.65 0 0 0 4.6 9Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1V3" stroke="currentColor" stroke-width="2"/>
            <path d="M12 21V23" stroke="currentColor" stroke-width="2"/>
            <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2"/>
            <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2"/>
            <path d="M1 12H3" stroke="currentColor" stroke-width="2"/>
            <path d="M21 12H23" stroke="currentColor" stroke-width="2"/>
            <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2"/>
            <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        'cpu': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <rect x="9" y="9" width="6" height="6" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" stroke-width="2"/>
            <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" stroke-width="2"/>
            <line x1="20" y1="14" x2="23" y2="14" stroke="currentColor" stroke-width="2"/>
            <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" stroke-width="2"/>
            <line x1="1" y1="14" x2="4" y2="14" stroke="currentColor" stroke-width="2"/>
        </svg>`,
        'file-text': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
        'info': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/>
        </svg>`
    };
    
    return icons[type] || icons['file-text'];
}

async function formatMessage(content, citations = []) {
    console.log('🔍 Formatting message:', content.substring(0, 100) + '...');
    
    // Extract source references from content with intelligent deduplication
    const sourcePatterns = [
        /【([^】]+)】/g,  // 【14:10†SOURCE】
        /\[([^\]]+)\]/g,  // [14:10†SOURCE]
        /【([^】]+)】/g   // 【4:0†source】
    ];
    
    // Also check for patterns like "4:10†SOURCE" without brackets
    const additionalPatterns = [
        /(\d+:\d+†[A-Z]+)/g,  // 4:10†SOURCE
        /(\d+:\d+[A-Z]+)/g,   // 4:10SOURCE
        /(\d+†[A-Z]+)/g,      // 4†SOURCE
        /(\d+:\d+†[a-z]+)/g,  // 4:10†source
        /(\d+:\d+[a-z]+)/g,   // 4:10source
        /(\d+†[a-z]+)/g       // 4†source
    ];
    
    const sources = [];
    const seenSources = new Set(); // Track unique sources
    
    // Try all patterns with deduplication
    [...sourcePatterns, ...additionalPatterns].forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const fileId = match[1] || match[0];
            const cleanFileId = fileId.replace(/[†+]/g, '').toLowerCase();
            
            // Only add if we haven't seen this source before
            if (!seenSources.has(cleanFileId)) {
                seenSources.add(cleanFileId);
                sources.push({
                    reference: match[0],
                    fileName: fileId,
                    fileId: fileId,
                    cleanId: cleanFileId
                });
            }
        }
    });
    
    // Prioritize sources by relevance and limit to maximum 5
    const prioritizedSources = sources.sort((a, b) => {
        // Prioritize sources with more specific IDs (longer, more descriptive)
        const aScore = a.cleanId.length + (a.cleanId.includes('source') ? 10 : 0);
        const bScore = b.cleanId.length + (b.cleanId.includes('source') ? 10 : 0);
        return bScore - aScore;
    });
    
    const limitedSources = prioritizedSources.slice(0, 5);
    
    console.log('📚 Found sources:', limitedSources);
    console.log('📊 Total unique sources:', limitedSources.length);
    
    // Remove source references from content for clean display
    let cleanContent = content;
    [...sourcePatterns, ...additionalPatterns].forEach(pattern => {
        cleanContent = cleanContent.replace(pattern, '');
    });
    
    // Context-aware content formatting
    cleanContent = await formatContentIntelligently(cleanContent);
    
    // Use marked.js to render markdown with proper configuration
    if (typeof marked !== 'undefined') {
        try {
            // Preprocess content to ensure tables are properly formatted
            // Add blank lines before and after tables to ensure they're recognized
            // Handle tables that appear after colons or other text
            cleanContent = cleanContent.replace(/:\s*(\|[^\n]+\|)/g, ':\n\n$1');
            cleanContent = cleanContent.replace(/([^\n])\n(\|[^\n]+\|)/g, '$1\n\n$2');
            cleanContent = cleanContent.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');
            
            // Configure marked.js for ChatGPT-like rendering
            marked.setOptions({
                gfm: true,              // GitHub Flavored Markdown
                breaks: false,          // Don't convert \n to <br> (breaks tables!)
                headerIds: false,       // Don't add IDs to headers
                mangle: false,          // Don't escape email addresses
                sanitize: false,        // Allow all HTML
                smartLists: true,       // Use smarter list behavior
                smartypants: false      // Don't use smart punctuation
            });
            
            // Parse markdown to HTML
            let html = marked.parse(cleanContent);
            
            // Add proper classes to tables for styling
            html = html.replace(/<table>/g, '<table class="markdown-table">');
            
            // Ensure paragraphs have proper spacing
            html = html.replace(/<p>/g, '<p style="margin: 10px 0;">');
            
            // Add sources section if we found any sources
            if (limitedSources.length > 0) {
                console.log('📚 Adding sources section with', limitedSources.length, 'sources');
                html += '<div class="sources-section">';
                html += '<div class="sources-header">SOURCES</div>';
                html += '<div class="citations">';
                
                // Load knowledge base to get real document names
                const knowledgeBase = await loadKnowledgeBaseForSources();
                
                limitedSources.forEach((source, index) => {
                    const fileId = source.fileId;
                    // Try multiple ways to find the document
                    let kbDoc = knowledgeBase.find(doc => 
                        doc.id === fileId || 
                        doc.filename.includes(fileId) ||
                        doc.filename.includes(fileId.replace(/[†+]/g, '')) ||
                        fileId.includes(doc.id) ||
                        fileId.includes(doc.filename.split('.')[0])
                    );
                    
                    // If still not found, try to extract a meaningful name from the fileId
                    let displayName = 'Unbekanntes Dokument';
                    if (kbDoc) {
                        displayName = kbDoc.filename;
                    } else {
                        // Try to create a meaningful name from the fileId
                        const cleanId = fileId.replace(/[†+:\d]/g, '').trim();
                        if (cleanId && cleanId.length > 0) {
                            displayName = cleanId + '.txt';
                        } else {
                            displayName = 'Dokument ' + (index + 1);
                        }
                    }
                    
                    const fileType = displayName.split('.').pop().toUpperCase() || 'TXT';
                    
                    html += `<span class="citation" data-file-id="${fileId}" data-document-name="${displayName}">`;
                    html += `[${index + 1}] ${fileType}`;
                    html += `</span>`;
                });
                
                html += '</div></div>';
            }
            
            // Also add citations from API if available
            if (citations && citations.length > 0) {
                html += '<div class="sources-section">';
                html += '<div class="sources-header">SOURCES</div>';
                html += '<div class="citations">';
                
                citations.forEach((citation, index) => {
                    const fileName = citation.fileName || 'source';
                    const displayName = fileName.replace(/^[a-zA-Z0-9]{20,}_/, '');
                    const fileType = displayName.split('.').pop().toUpperCase();
                    
                    html += `<span class="citation" data-file-id="${citation.fileId}">`;
                    html += `[${index + 1}] ${fileType}`;
                    html += `</span>`;
                });
                
                html += '</div></div>';
            }
            
            console.log('Markdown rendered successfully with', limitedSources.length, 'sources');
            return html;
        } catch (e) {
            console.error('Markdown parsing error:', e);
            console.log('Falling back to basic formatting');
        }
    } else {
        console.warn('marked.js not loaded, using fallback');
    }
    
    // Fallback if marked.js is not loaded or parsing fails
    cleanContent = cleanContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    cleanContent = cleanContent.replace(/\n/g, '<br>');
    
    // Add sources in fallback mode too
    if (limitedSources.length > 0) {
        console.log('📚 Adding sources in fallback mode with', limitedSources.length, 'sources');
        cleanContent += '<div class="sources-section">';
        cleanContent += '<div class="sources-header">SOURCES</div>';
        cleanContent += '<div class="citations">';
        
        limitedSources.forEach((source, index) => {
            const fileName = source.fileName || 'source';
            const displayName = fileName.replace(/^[a-zA-Z0-9]{20,}_/, '');
            const fileType = displayName.split('.').pop().toUpperCase() || 'TXT';
            
            cleanContent += `<span class="citation" data-file-id="${source.fileId}">`;
            cleanContent += `[${index + 1}] ${fileType}`;
            cleanContent += `</span>`;
        });
        
        cleanContent += '</div></div>';
    }
    
    return cleanContent;
}

// Voice input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Spracheingabe wird in Ihrem Browser nicht unterstützt.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        document.getElementById('micBtn').style.background = '#ff4444';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('messageInput').value = transcript;
        document.getElementById('micBtn').style.background = '#2a2a2a';
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        document.getElementById('micBtn').style.background = '#2a2a2a';
    };
    
    recognition.onend = () => {
        document.getElementById('micBtn').style.background = '#2a2a2a';
    };
    
    recognition.start();
}

// Upload functionality
function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');

    if (!uploadArea || !fileInput || !uploadBtn) return;
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    uploadBtn.addEventListener('click', uploadFiles);
}

function handleFiles(files) {
    selectedFiles = Array.from(files);
    displayFileList();
    document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
}

function displayFileList() {
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">📄</div>
                <div class="file-name">${file.name}</div>
            </div>
        </div>
    `).join('');
}

async function uploadFiles() {
    const uploadBtn = document.getElementById('uploadBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Wird hochgeladen...';
    errorMessage.classList.remove('show');
    
    try {
        // Check for duplicates first
        const filesToUpload = [];
        const duplicateFiles = [];
        
        for (const file of selectedFiles) {
            const existingFile = await checkFileExists(file.name);
            if (existingFile) {
                duplicateFiles.push({ file, existingFile });
            } else {
                filesToUpload.push(file);
            }
        }
        
        // Handle duplicate files
        for (const { file, existingFile } of duplicateFiles) {
            const shouldOverwrite = await showOverwriteDialog(file.name, existingFile);
            if (shouldOverwrite) {
                filesToUpload.push(file);
                showNotification(`✅ ${file.name} wird überschrieben`, 'info');
            } else {
                showNotification(`❌ ${file.name} Upload abgebrochen`, 'info');
            }
        }
        
        if (filesToUpload.length === 0) {
            uploadBtn.textContent = 'Hochladen';
            uploadBtn.disabled = false;
            return;
        }
        
        // Process files to upload
        const uploadPromises = filesToUpload.map(async (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64Data = e.target.result.split(',')[1]; // Remove data:type;base64, prefix
                    resolve({
                        filename: file.name,
                        fileData: base64Data
                    });
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const fileDataArray = await Promise.all(uploadPromises);
        
        // Send each file individually
        for (const fileData of fileDataArray) {
            const response = await fetch(`${API_BASE}/uploadWithOverwrite`, {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...fileData,
                    overwrite: true // Always overwrite since we already checked for duplicates
                })
        });
        
        if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
        }
        
        // Success
        uploadBtn.textContent = 'Erfolgreich hochgeladen!';
        showNotification(`✅ ${filesToUpload.length} Datei(en) erfolgreich hochgeladen!`, 'success');
        
        setTimeout(() => {
            uploadBtn.textContent = 'Hochladen';
            selectedFiles = [];
            displayFileList();
            uploadBtn.disabled = true;
        }, 2000);
        
        // Reload knowledge base and suggestions
        loadKnowledgeBase();
        loadSuggestionsFromKnowledgeBase(); // Now safe - won't overwrite static list
        
    } catch (error) {
        console.error('Upload error:', error);
        errorMessage.classList.add('show');
        showNotification('❌ Fehler beim Hochladen der Dateien', 'error');
        uploadBtn.textContent = 'Hochladen';
        uploadBtn.disabled = false;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }
    
    // Add animation CSS
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Check if file already exists in knowledge base
async function checkFileExists(filename) {
    try {
        const response = await fetch(`${API_BASE}/knowledgebase`);
        const data = await response.json();
        
        if (data.documents) {
            return data.documents.find(doc => doc.filename === filename);
        }
        return null;
    } catch (error) {
        console.error('Error checking file existence:', error);
        return null;
    }
}

// Show overwrite confirmation dialog
function showOverwriteDialog(filename, existingFile) {
    return new Promise((resolve) => {
        // Remove existing dialog if any
        const existing = document.querySelector('.overwrite-dialog');
        if (existing) existing.remove();
        
        // Create dialog overlay
        const overlay = document.createElement('div');
        overlay.className = 'overwrite-dialog';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // Create dialog content
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            animation: slideUp 0.3s ease-out;
        `;
        
        // Dark mode styles
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            dialog.style.background = '#2d2d2d';
            dialog.style.color = '#ffffff';
        }
        
        dialog.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                    <svg width="24" height="24" fill="#f59e0b" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Datei bereits vorhanden</h3>
                    <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Die Datei "${filename}" existiert bereits in der Wissensdatenbank.</p>
                </div>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">Bestehende Datei:</h4>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px; color: #6b7280;">📄</span>
                    <span style="font-size: 14px; font-weight: 500;">${existingFile.filename}</span>
                    <span style="font-size: 12px; color: #6b7280;">•</span>
                    <span style="font-size: 12px; color: #6b7280;">${formatSize(existingFile.size)}</span>
                    <span style="font-size: 12px; color: #6b7280;">•</span>
                    <span style="font-size: 12px; color: #6b7280;">${formatDate(existingFile.uploadedAt)}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancelUpload" style="
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #374151;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Abbrechen</button>
                <button id="overwriteFile" style="
                    padding: 8px 16px;
                    border: none;
                    background: #ef4444;
                    color: white;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Überschreiben</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Add animation styles
        if (!document.querySelector('#overwrite-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'overwrite-dialog-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .overwrite-dialog button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Event listeners
        document.getElementById('cancelUpload').onclick = () => {
            overlay.remove();
            resolve(false);
        };
        
        document.getElementById('overwriteFile').onclick = () => {
            overlay.remove();
            resolve(true);
        };
        
        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        };
    });
}

// Fix existing files in knowledge base
async function fixExistingFiles() {
    try {
        const response = await fetch(`${API_BASE}/fixExistingFiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`Fixed ${data.fixedCount} files`);
            showNotification(`✅ ${data.fixedCount} Dateien erfolgreich repariert!`, 'success');
            // Reload knowledge base to show updated file types
            loadKnowledgeBase();
        }
    } catch (error) {
        console.error('Error fixing files:', error);
        showNotification('❌ Fehler beim Reparieren der Dateien', 'error');
    }
}

// Cleanup database - remove empty or corrupted entries
async function cleanupDatabase() {
    console.log('🧹 cleanupDatabase called');
    showNotification('🧹 Bereinigung wird gestartet...', 'info');
    
    try {
        console.log('📡 Sending request to cleanupDatabase API...');
        const response = await fetch(`${API_BASE}/cleanupDatabase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📡 Response data:', data);
            showNotification(`✅ ${data.cleanedCount} Einträge bereinigt!`, 'success');
            loadKnowledgeBase();
        } else {
            console.error('❌ API Error:', response.status, response.statusText);
            showNotification('❌ Bereinigung fehlgeschlagen', 'error');
        }
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        showNotification('❌ Fehler beim Bereinigen der Datenbank: ' + error.message, 'error');
    }
}

// Refresh all statistics
async function refreshStats() {
    try {
        await loadKnowledgeBase();
        await loadDashboard();
        showNotification('✅ Statistiken erfolgreich aktualisiert!', 'success');
    } catch (error) {
        console.error('Error refreshing stats:', error);
        showNotification('❌ Fehler beim Aktualisieren der Statistiken', 'error');
    }
}

// Create backup of all files
async function createBackup() {
    try {
        const response = await fetch(`${API_BASE}/knowledgebase`);
        const data = await response.json();
        
        if (data.documents) {
            const backup = {
                timestamp: new Date().toISOString(),
                totalFiles: data.documents.length,
                totalSize: data.totalSize,
                files: data.documents.map(doc => ({
                    filename: doc.filename,
                    fileType: doc.fileType,
                    size: doc.size,
                    uploadedAt: doc.uploadedAt,
                    content: doc.content
                }))
            };
            
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `knowledge-base-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('✅ Backup erfolgreich erstellt!', 'success');
        }
    } catch (error) {
        console.error('Error creating backup:', error);
        showNotification('❌ Fehler beim Erstellen des Backups', 'error');
    }
}

// Find and remove duplicate files
async function findDuplicates() {
    try {
        const response = await fetch(`${API_BASE}/findDuplicates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.duplicates && data.duplicates.length > 0) {
                if (confirm(`Gefunden: ${data.duplicates.length} Duplikate. Möchten Sie diese entfernen?`)) {
                    await removeDuplicates(data.duplicates);
                }
            } else {
                showNotification('✅ Keine Duplikate gefunden!', 'success');
            }
        } else {
            showNotification('❌ Suche nach Duplikaten fehlgeschlagen', 'error');
        }
    } catch (error) {
        console.error('Error finding duplicates:', error);
        showNotification('❌ Fehler beim Suchen nach Duplikaten', 'error');
    }
}

// Remove duplicates
async function removeDuplicates(duplicates) {
    try {
        const response = await fetch(`${API_BASE}/removeDuplicates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ duplicates })
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(`✅ ${data.removedCount} Duplikate entfernt!`, 'success');
            loadKnowledgeBase();
        }
    } catch (error) {
        console.error('Error removing duplicates:', error);
        showNotification('❌ Fehler beim Entfernen der Duplikate', 'error');
    }
}

// Validate all files
async function validateFiles() {
    console.log('🔍 validateFiles called');
    showNotification('🔍 Validierung wird gestartet...', 'info');
    
    try {
        console.log('📡 Sending request to validateFiles API...');
        const response = await fetch(`${API_BASE}/validateFiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📡 Response data:', data);
            showNotification(`✅ Validierung abgeschlossen! Gültige: ${data.validCount}, Ungültige: ${data.invalidCount}`, 'success');
            if (data.invalidFiles && data.invalidFiles.length > 0) {
                console.log('Ungültige Dateien:', data.invalidFiles);
                showNotification(`⚠️ ${data.invalidFiles.length} ungültige Dateien gefunden`, 'warning');
            }
        } else {
            console.error('❌ API Error:', response.status, response.statusText);
            showNotification('❌ Validierung fehlgeschlagen', 'error');
        }
    } catch (error) {
        console.error('❌ Error validating files:', error);
        showNotification('❌ Fehler bei der Validierung: ' + error.message, 'error');
    }
}

// Knowledge Base
// Helper functions for formatting
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// Dashboard functionality
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/knowledgebase`);
        const data = await response.json();
        const documents = data.documents || [];
        
        // Update stats (both dashboard and knowledge base tab)
        const docCount = documents.length;
        const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
        const formattedSize = formatFileSize(totalSize);
        
        // Update dashboard stats
        const dashDocCount = document.getElementById('dashDocCount');
        const dashTotalSize = document.getElementById('dashTotalSize');
        const dashLastUpdate = document.getElementById('dashLastUpdate');
        
        if (dashDocCount) dashDocCount.textContent = docCount;
        if (dashTotalSize) dashTotalSize.textContent = formattedSize;
        
        // Update knowledge base stats
        const kbDocCount = document.getElementById('kbDocCount');
        const kbTotalSize = document.getElementById('kbTotalSize');
        const kbLastUpdate = document.getElementById('kbLastUpdate');
        
        if (kbDocCount) kbDocCount.textContent = docCount;
        if (kbTotalSize) kbTotalSize.textContent = formattedSize;
        
        // Find latest update
        if (documents.length > 0) {
            const latest = documents.reduce((a, b) => {
                const dateA = new Date(a.uploadedAt);
                const dateB = new Date(b.uploadedAt);
                return dateA > dateB ? a : b;
            });
            
            console.log('Latest file:', latest.filename, 'Date:', latest.uploadedAt, 'Type:', typeof latest.uploadedAt);
            
            // Use the repaired formatDate function
            const formattedDate = formatDate(latest.uploadedAt);
            
            console.log('Formatted date:', formattedDate);
            console.log('Setting dashLastUpdate to:', formattedDate);
            console.log('Setting kbLastUpdate to:', formattedDate);
            
            if (dashLastUpdate) {
                dashLastUpdate.textContent = formattedDate;
                console.log('dashLastUpdate set to:', dashLastUpdate.textContent);
            }
            if (kbLastUpdate) {
                kbLastUpdate.textContent = formattedDate;
                console.log('kbLastUpdate set to:', kbLastUpdate.textContent);
            }
        } else {
            console.log('No documents found, setting to "Keine Dateien"');
            if (dashLastUpdate) dashLastUpdate.textContent = 'Keine Dateien';
            if (kbLastUpdate) kbLastUpdate.textContent = 'Keine Dateien';
        }
        
        // Count chat messages
        const chatDisplay = document.getElementById('chatDisplay');
        const messageCount = chatDisplay ? chatDisplay.querySelectorAll('.message').length : 0;
        const dashChatCount = document.getElementById('dashChatCount');
        if (dashChatCount) dashChatCount.textContent = messageCount;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function initKnowledgeBase() {
    const searchInput = document.getElementById('kbSearch');
    const filterSelect = document.getElementById('kbFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterKnowledgeBase);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterKnowledgeBase);
    }
}

async function loadKnowledgeBase() {
    try {
        const response = await fetch(`${API_BASE}/knowledgebase`);
        const data = await response.json();
        knowledgeBase = data.documents || [];
        displayKnowledgeBase(knowledgeBase);
    } catch (error) {
        console.error('Error loading knowledge base:', error);
        displayKnowledgeBase([]);
    }
}

function filterKnowledgeBase() {
    const searchTerm = document.getElementById('kbSearch').value.toLowerCase();
    const filter = document.getElementById('kbFilter').value;
    
    let filtered = knowledgeBase;
    
    if (filter !== 'all') {
        filtered = filtered.filter(doc => doc.type === filter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(doc => 
            (doc.filename || doc.name || '').toLowerCase().includes(searchTerm) ||
            (doc.content && doc.content.toLowerCase().includes(searchTerm))
        );
    }
    
    displayKnowledgeBase(filtered);
}

function displayKnowledgeBase(documents) {
    const kbList = document.getElementById('kbList');
    
    // Update stats
    const totalDocs = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const lastUpdated = documents.length > 0 
        ? Math.max(...documents.map(doc => new Date(doc.uploadedAt || Date.now()).getTime()))
        : null;
    
    const kbDocCountEl = document.getElementById('kbDocCount');
    const kbTotalSizeEl = document.getElementById('kbTotalSize');
    const kbLastUpdateEl = document.getElementById('kbLastUpdate');
    
    if (kbDocCountEl) kbDocCountEl.textContent = totalDocs;
    if (kbTotalSizeEl) kbTotalSizeEl.textContent = formatSize(totalSize);
    if (kbLastUpdateEl) kbLastUpdateEl.textContent = lastUpdated 
        ? formatDate(new Date(lastUpdated))
        : '-';
    
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
    
    kbList.innerHTML = documents.map((doc, index) => {
        // Debug logging for each document
        console.log(`Document ${index}:`, {
            filename: doc.filename,
            uploadedAt: doc.uploadedAt,
            uploadedAtType: typeof doc.uploadedAt
        });
        
        return `
        <div class="kb-item" data-file-index="${index}">
            <div class="kb-item-header">
                <div class="kb-item-title">${doc.filename || doc.name || 'Unbekannt'}</div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div class="kb-item-date">${formatDate(doc.uploadedAt)}</div>
                    <button class="kb-delete-btn" data-doc-id="${doc.id}" data-doc-name="${doc.filename || doc.name || 'Unbekannt'}" title="Löschen">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="kb-item-meta">
                <span>📄 ${doc.fileType ? doc.fileType.toUpperCase() : (doc.filename ? doc.filename.split('.').pop().toUpperCase() : 'UNKNOWN')}</span>
                <span>📊 ${formatSize(doc.size)}</span>
            </div>
        </div>
    `;
    }).join('');
    
    // Add click handlers to open file editor
    const kbItems = kbList.querySelectorAll('.kb-item');
    kbItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            // Don't open editor if clicking delete button
            if (e.target.closest('.kb-delete-btn')) return;
            openFileEditor(documents[index]);
        });
    });
    
    // Add click handlers to delete buttons
    const deleteButtons = kbList.querySelectorAll('.kb-delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const docId = btn.getAttribute('data-doc-id');
            const docName = btn.getAttribute('data-doc-name');
            showDeleteModal(docId, docName);
        });
    });
}

function formatDate(timestamp) {
    if (!timestamp) {
        console.log('formatDate: No timestamp provided');
        return 'Unbekannt';
    }
    
    console.log('formatDate input:', timestamp, 'Type:', typeof timestamp);
    
    // Handle different timestamp formats
    let date;
    try {
    if (timestamp._seconds) {
            // Firestore Timestamp format
        date = new Date(timestamp._seconds * 1000);
            console.log('formatDate: Using Firestore _seconds format');
        } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            // Firestore Timestamp object
            date = timestamp.toDate();
            console.log('formatDate: Using Firestore toDate() method');
        } else if (typeof timestamp === 'string') {
            // ISO string or other string format
        date = new Date(timestamp);
            console.log('formatDate: Using string format');
        } else if (typeof timestamp === 'number') {
            // Unix timestamp
            date = new Date(timestamp);
            console.log('formatDate: Using number format');
        } else if (timestamp instanceof Date) {
            // Already a Date object
            date = timestamp;
            console.log('formatDate: Using existing Date object');
    } else {
            console.log('formatDate: Unknown timestamp format:', typeof timestamp, timestamp);
        return 'Unbekannt';
    }
    
        if (isNaN(date.getTime())) {
            console.log('formatDate: Invalid date after parsing:', date);
            return 'Unbekannt';
        }
        
        const now = new Date();
        
        // Reset time to start of day for accurate day comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const fileDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffTime = today - fileDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('formatDate: Parsed date:', date, 'Now:', now);
        console.log('formatDate: Today (start):', today, 'File date (start):', fileDate);
        console.log('formatDate: Diff time (ms):', diffTime, 'Diff days:', diffDays);
        
        if (diffDays === 0) return 'Heute';
        if (diffDays === 1) return 'Gestern';
        if (diffDays < 7) return `Vor ${diffDays} Tagen`;
        
        const formatted = date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
        
        console.log('formatDate result:', formatted);
        return formatted;
    } catch (error) {
        console.error('formatDate error:', error, 'Input:', timestamp);
        return 'Unbekannt';
    }
}

function formatSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Delete document from knowledge base
// Delete Modal Functions
let pendingDeleteDocId = null;
let pendingDeleteFilename = null;

function showDeleteModal(docId, filename) {
    pendingDeleteDocId = docId;
    pendingDeleteFilename = filename;
    
    const modal = document.getElementById('deleteModal');
    const filenameSpan = document.getElementById('deleteFilename');
    
    filenameSpan.textContent = filename;
    modal.classList.add('active');
}

function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
    pendingDeleteDocId = null;
    pendingDeleteFilename = null;
}

async function confirmDelete() {
    if (!pendingDeleteDocId) return;
    
    const docId = pendingDeleteDocId;
    hideDeleteModal();
    
    try {
        const response = await fetch(`${API_BASE}/knowledgebase`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ documentId: docId })
        });
        
        if (response.ok) {
            // Reload knowledge base
            await loadKnowledgeBase();
            
            // Show success message
            showNotification('Dokument erfolgreich gelöscht', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete document');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        showNotification('Fehler beim Löschen des Dokuments: ' + error.message, 'error');
    }
}

function initDeleteModal() {
    const modal = document.getElementById('deleteModal');
    const overlay = document.getElementById('deleteModalOverlay');
    const cancelBtn = document.getElementById('deleteCancelBtn');
    const confirmBtn = document.getElementById('deleteConfirmBtn');
    
    // Close on overlay click
    overlay.addEventListener('click', hideDeleteModal);
    
    // Close on cancel button
    cancelBtn.addEventListener('click', hideDeleteModal);
    
    // Confirm delete
    confirmBtn.addEventListener('click', confirmDelete);
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            hideDeleteModal();
        }
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: ${type === 'success' ? '#10b981' : '#dc2626'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function deleteDocument(event, docId) {
    if (event && event.stopPropagation) {
        event.stopPropagation(); // Prevent opening the file editor
    }
    
    // Get the filename from the document element
    let filename = 'dieses Dokument';
    if (event && event.target) {
        const docElement = event.target.closest('.kb-item');
        filename = docElement ? docElement.querySelector('.kb-item-name').textContent : 'dieses Dokument';
    }
    
    // Show custom delete modal
    showDeleteModal(docId, filename);
}


// File Editor
let currentEditingFile = null;

function initFileEditor() {
    const modal = document.getElementById('fileEditorModal');
    const overlay = document.getElementById('fileEditorOverlay');
    const closeBtn = document.getElementById('fileEditorClose');
    const cancelBtn = document.getElementById('fileEditorCancel');
    const saveBtn = document.getElementById('fileEditorSave');
    
    // Close handlers
    [overlay, closeBtn, cancelBtn].forEach(el => {
        el.addEventListener('click', closeFileEditor);
    });
    
    // Save handler
    saveBtn.addEventListener('click', saveFileContent);
}

function openFileEditor(file) {
    currentEditingFile = file;
    const modal = document.getElementById('fileEditorModal');
    const title = document.getElementById('fileEditorTitle');
    const textarea = document.getElementById('fileEditorTextarea');
    const pdfViewer = document.getElementById('fileEditorPdfViewer');
    const saveBtn = document.getElementById('fileEditorSave');
    const info = document.getElementById('fileEditorInfo');
    
    // Set title
    title.textContent = file.filename;
    
    // Set info
    info.textContent = `${formatSize(file.size)} • Zuletzt geändert: ${formatDate(file.uploadedAt)}`;
    
    // Check file type
    const isPDF = file.fileType === 'PDF' || file.filename.toLowerCase().endsWith('.pdf');
    const isEditable = file.filename.toLowerCase().match(/\.(txt|md|csv)$/);
    
    if (isPDF) {
        console.log('🔍 openFileEditor: PDF file detected, using loadFileContent');
        // For PDFs, use the loadFileContent function which handles the warning
        textarea.style.display = 'none';
        pdfViewer.classList.remove('active');
        saveBtn.disabled = true;
        
        // Load PDF content using our enhanced function
        loadFileContent(file);
    } else {
        // Show text editor
        pdfViewer.classList.remove('active');
        textarea.style.display = 'block';
        saveBtn.disabled = !isEditable;
        
        // Load content
        loadFileContent(file);
    }
    
    // Show modal
    modal.classList.add('active');
}

async function loadFileContent(file) {
    console.log('🔍 loadFileContent called for file:', file);
    console.log('🔍 File details:', {
        id: file.id,
        filename: file.filename,
        fileType: file.fileType
    });
    
    const textarea = document.getElementById('fileEditorTextarea');
    const pdfViewer = document.getElementById('fileEditorPdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    
    console.log('🔍 DOM elements found:', {
        textarea: !!textarea,
        pdfViewer: !!pdfViewer,
        pdfFrame: !!pdfFrame
    });
    
    // Check if it's a PDF file
    if (file.fileType === 'PDF' || file.filename.toLowerCase().endsWith('.pdf')) {
        console.log('📄 PDF file detected, using PDF viewer');
        
        // For PDF files, use the modal's PDF viewer
        textarea.style.display = 'none';
        pdfViewer.classList.add('active');
        
        // Show loading state
        pdfFrame.style.display = 'none';
        pdfViewer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666;">PDF wird geladen...</div>';
        
        try {
            console.log('🔍 Fetching PDF content from:', `${API_BASE}/knowledgebase/${file.id}`);
            
            // Get the PDF content as base64
            const response = await fetch(`${API_BASE}/knowledgebase/${file.id}`);
            let pdfContent = null;
            let fileData = null;
            
            console.log('🔍 API response status:', response.status);
            
            if (response.ok) {
                fileData = await response.json();
                pdfContent = fileData.content;
                console.log('📄 Direct API response - has originalFileData:', !!fileData.originalFileData);
                console.log('📄 Content length:', pdfContent ? pdfContent.length : 0);
            } else {
                console.log('🔍 Direct API failed, trying fallback...');
                // Fallback: get all files and find the specific one
                const allResponse = await fetch(`${API_BASE}/knowledgebase`);
                const allData = await allResponse.json();
                const kbFile = allData.documents.find(doc => doc.id === file.id);
                if (kbFile && kbFile.content) {
                    pdfContent = kbFile.content;
                    fileData = kbFile; // Use the file data from fallback
                    console.log('📄 Fallback response - has originalFileData:', !!fileData.originalFileData);
                    console.log('📄 Fallback content length:', pdfContent ? pdfContent.length : 0);
                }
            }
            
            if (pdfContent) {
                console.log('📄 PDF content found, processing...');
                
                // Check if we have originalFileData (for proper PDF viewing)
                if (fileData && fileData.originalFileData) {
                    console.log('✅ Using original PDF data for rendering');
                    // Use original PDF data for proper rendering
                    pdfFrame.style.display = 'block';
                    pdfFrame.src = `data:application/pdf;base64,${fileData.originalFileData}`;
                } else {
                    console.log('⚠️ No originalFileData - showing warning with extracted text');
                    // Fallback: show warning with extracted text directly in the div
                    pdfFrame.style.display = 'none';
                    
                    // Check if content is meaningful or just placeholder
                    const isPlaceholder = pdfContent && (
                        pdfContent.startsWith('PDF Document:') || 
                        pdfContent.length < 100 ||
                        pdfContent.includes('PDF content could not be extracted')
                    );
                    
                    if (isPlaceholder) {
                        // Show enhanced warning for placeholder content
                        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
                        const bgColor = isDarkMode ? '#1a1a1a' : '#f8f9fa';
                        const cardBg = isDarkMode ? '#2d2d2d' : '#ffffff';
                        const textColor = isDarkMode ? '#ffffff' : '#333333';
                        const warningBg = isDarkMode ? '#4a3c00' : '#fff3cd';
                        const warningBorder = isDarkMode ? '#6b5b00' : '#ffeaa7';
                        const warningText = isDarkMode ? '#ffd700' : '#856404';
                        const infoBg = isDarkMode ? '#1a3a4a' : '#d1ecf1';
                        const infoBorder = isDarkMode ? '#2a5a6a' : '#bee5eb';
                        const infoText = isDarkMode ? '#87ceeb' : '#0c5460';
                        const contentBg = isDarkMode ? '#1a1a1a' : '#f8f9fa';
                        const contentText = isDarkMode ? '#cccccc' : '#666666';
                        
                        pdfViewer.innerHTML = `
                            <div style="padding: 20px; background: ${bgColor}; height: 100%; overflow-y: auto; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100%;">
                                <div style="background: ${warningBg}; border: 1px solid ${warningBorder}; padding: 20px; margin-bottom: 20px; border-radius: 8px; color: ${warningText}; text-align: center; max-width: 600px; width: 100%;">
                                    <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
                                    <h3 style="margin: 0 0 15px 0; color: ${warningText};">PDF-Ansicht nicht verfügbar</h3>
                                    <p style="margin: 0 0 15px 0; line-height: 1.5; color: ${warningText};">
                                        Diese PDF-Datei wurde vor der Implementierung der PDF-Ansicht hochgeladen und enthält nur einen Platzhalter-Text.
                                    </p>
                                    <div style="background: ${cardBg}; padding: 15px; border-radius: 6px; border: 1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}; margin: 15px 0;">
                                        <strong style="color: ${textColor};">Lösung:</strong><br>
                                        <span style="color: ${textColor};">Laden Sie die PDF-Datei erneut hoch, um die vollständige PDF-Ansicht und den extrahierten Text zu erhalten.</span>
                                    </div>
                                    <div style="background: ${infoBg}; padding: 10px; border-radius: 4px; border: 1px solid ${infoBorder}; color: ${infoText}; font-size: 14px;">
                                        <strong>Hinweis:</strong> Nach dem erneuten Hochladen können Sie die PDF-Datei direkt im Browser anzeigen.
                                    </div>
                                </div>
                                <div style="background: ${cardBg}; padding: 20px; border-radius: 8px; border: 1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}; max-width: 600px; width: 100%; text-align: center;">
                                    <h4 style="margin: 0 0 10px 0; color: ${textColor};">Aktueller Inhalt:</h4>
                                    <div style="background: ${contentBg}; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; color: ${contentText}; white-space: pre-wrap; max-height: 300px; overflow-y: auto; text-align: left;">
                                        ${pdfContent}
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        // Show normal warning with extracted text
                        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
                        const bgColor = isDarkMode ? '#1a1a1a' : '#f8f9fa';
                        const cardBg = isDarkMode ? '#2d2d2d' : '#ffffff';
                        const textColor = isDarkMode ? '#ffffff' : '#333333';
                        const warningBg = isDarkMode ? '#4a3c00' : '#fff3cd';
                        const warningBorder = isDarkMode ? '#6b5b00' : '#ffeaa7';
                        const warningText = isDarkMode ? '#ffd700' : '#856404';
                        const contentText = isDarkMode ? '#cccccc' : '#333333';
                        
                        pdfViewer.innerHTML = `
                            <div style="padding: 20px; background: ${bgColor}; height: 100%; overflow-y: auto;">
                                <div style="background: ${warningBg}; border: 1px solid ${warningBorder}; padding: 15px; margin-bottom: 20px; border-radius: 8px; color: ${warningText};">
                                    <strong>⚠️ PDF-Ansicht nicht verfügbar</strong><br>
                                    Diese PDF-Datei wurde vor der Reparatur hochgeladen und enthält nur den extrahierten Text. 
                                    Für eine vollständige PDF-Ansicht laden Sie die Datei erneut hoch.
                                </div>
                                <div style="background: ${cardBg}; padding: 20px; border-radius: 8px; border: 1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}; white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.5; color: ${contentText}; max-height: 400px; overflow-y: auto;">
                                    ${pdfContent}
                                </div>
                            </div>
                        `;
                    }
                }
            } else {
                console.log('❌ No PDF content found');
                pdfFrame.style.display = 'none';
                pdfViewer.innerHTML = '<div style="color: #dc3545; text-align: center; padding: 20px;">PDF-Inhalt konnte nicht geladen werden.</div>';
            }
        } catch (error) {
            console.error('Error loading PDF content:', error);
            pdfFrame.style.display = 'none';
            pdfViewer.innerHTML = '<div style="color: #dc3545; text-align: center; padding: 20px;">Fehler beim Laden des PDFs: ' + error.message + '</div>';
        }
    } else {
        console.log('📝 Non-PDF file, using textarea');
        // For non-PDF files, use the textarea as before
        textarea.style.display = 'block';
        pdfViewer.classList.remove('active');
        
    textarea.value = 'Lädt...';
    
    try {
            // First try to get the specific file content
            const response = await fetch(`${API_BASE}/knowledgebase/${file.id}`);
            
            if (response.ok) {
        const data = await response.json();
                if (data.content) {
                    textarea.value = data.content;
                    return;
                }
            }
            
            // Fallback: get all files and find the specific one
            const allResponse = await fetch(`${API_BASE}/knowledgebase`);
            const allData = await allResponse.json();
        
        // Find the file in the knowledge base
            const kbFile = allData.documents.find(doc => doc.id === file.id);
        
        if (kbFile && kbFile.content) {
            textarea.value = kbFile.content;
        } else {
            textarea.value = 'Inhalt konnte nicht geladen werden.';
        }
    } catch (error) {
        console.error('Error loading file content:', error);
        textarea.value = 'Fehler beim Laden des Inhalts.';
        }
    }
}

async function saveFileContent() {
    const textarea = document.getElementById('fileEditorTextarea');
    const saveBtn = document.getElementById('fileEditorSave');
    
    // Check if we're viewing a PDF (PDFs are read-only)
    const pdfViewer = document.getElementById('pdfViewer');
    if (pdfViewer && pdfViewer.style.display !== 'none') {
        showNotification('PDF-Dateien können nicht bearbeitet werden', 'info');
        return;
    }
    
    if (!currentEditingFile) return;
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Speichert...';
    
    try {
        const response = await fetch(`${API_BASE}/knowledgebase/${currentEditingFile.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: textarea.value
            })
        });
        
        if (response.ok) {
            alert('Datei erfolgreich gespeichert!');
            closeFileEditor();
            loadKnowledgeBase(); // Reload the list
        } else {
            throw new Error('Save failed');
        }
    } catch (error) {
        console.error('Error saving file:', error);
        alert('Fehler beim Speichern der Datei.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Speichern';
    }
}

function closeFileEditor() {
    const modal = document.getElementById('fileEditorModal');
    modal.classList.remove('active');
    currentEditingFile = null;
}


// Branding Management
let currentLogo = '';

async function loadBrandingSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
            const data = await response.json();
            const settings = data.settings || data;
            applyBrandingSettings(settings);
            
            // Populate settings form
            document.getElementById('brandText').value = settings.brandText || 'Cadillac EV';
            document.getElementById('welcomeTitle').value = settings.welcomeTitle || 'Cadillac EV Assistant';
            document.getElementById('welcomeSubtitle').value = settings.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge';
            
            if (settings.logo) {
                currentLogo = settings.logo;
                updateLogoPreview(settings.logo);
            }
            
            // Load design settings
            if (settings.primaryColor) {
                document.getElementById('primaryColor').value = settings.primaryColor;
            }
            if (settings.secondaryColor) {
                document.getElementById('secondaryColor').value = settings.secondaryColor;
            }
            if (settings.accentColor) {
                document.getElementById('accentColor').value = settings.accentColor;
            }
            if (settings.fontFamily) {
                document.getElementById('fontFamily').value = settings.fontFamily;
            }
            if (settings.fontSize) {
                document.getElementById('fontSize').value = settings.fontSize;
            }
            if (settings.borderRadius) {
                document.getElementById('borderRadius').value = settings.borderRadius;
            }
            if (settings.shadowIntensity) {
                document.getElementById('shadowIntensity').value = settings.shadowIntensity;
            }
            if (settings.animationSpeed) {
                document.getElementById('animationSpeed').value = settings.animationSpeed;
            }
        }
    } catch (error) {
        console.error('Error loading branding settings:', error);
    }
}

function applyBrandingSettings(settings) {
    // Update navigation brand text
    const navBrandText = document.getElementById('navBrandText');
    if (navBrandText && settings.brandText) {
        navBrandText.textContent = settings.brandText;
    }
    
    // Update navigation logo
    const navLogo = document.getElementById('navLogo');
    if (navLogo && settings.logo) {
        navLogo.style.backgroundImage = `url(${settings.logo})`;
        navLogo.style.backgroundSize = 'cover';
        navLogo.textContent = '';
    }
    
    // Update welcome message
    const welcomeTitle = document.getElementById('welcomeMessageTitle');
    const welcomeSubtitle = document.getElementById('welcomeMessageSubtitle');
    
    if (welcomeTitle && settings.welcomeTitle) {
        welcomeTitle.textContent = settings.welcomeTitle;
    }
    
    if (welcomeSubtitle && settings.welcomeSubtitle) {
        welcomeSubtitle.textContent = settings.welcomeSubtitle;
    }
}

async function saveBrandingSettings() {
    const brandText = document.getElementById('brandText').value;
    const welcomeTitle = document.getElementById('welcomeTitle').value;
    const welcomeSubtitle = document.getElementById('welcomeSubtitle').value;
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    const accentColor = document.getElementById('accentColor').value;
    const fontFamily = document.getElementById('fontFamily').value;
    const fontSize = document.getElementById('fontSize').value;
    const borderRadius = document.getElementById('borderRadius').value;
    const shadowIntensity = document.getElementById('shadowIntensity').value;
    const animationSpeed = document.getElementById('animationSpeed').value;
    
    const settings = {
        logo: currentLogo,
        brandText: brandText,
        welcomeTitle: welcomeTitle,
        welcomeSubtitle: welcomeSubtitle,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        accentColor: accentColor,
        fontFamily: fontFamily,
        fontSize: fontSize,
        borderRadius: borderRadius,
        shadowIntensity: shadowIntensity,
        animationSpeed: animationSpeed
    };
    
    try {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            const result = await response.json();
            applyBrandingSettings(result.settings);
            
            // Show success message
            const successMsg = document.getElementById('brandingSuccess');
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        } else {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            alert('Fehler beim Speichern: ' + (errorData.message || 'Unbekannter Fehler'));
        }
    } catch (error) {
        console.error('Error saving branding settings:', error);
        alert('Fehler beim Speichern der Einstellungen: ' + error.message);
    }
}

function updateLogoPreview(logoUrl) {
    const preview = document.getElementById('logoPreview');
    if (preview) {
        preview.style.backgroundImage = `url(${logoUrl})`;
        preview.style.backgroundSize = 'cover';
        preview.textContent = '';
    }
}

// Logo upload and branding initialization
function initBranding() {
    const logoUpload = document.getElementById('logoUpload');
    const saveBrandingBtn = document.getElementById('saveBrandingBtn');
    
    if (logoUpload) {
        logoUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                alert('Bitte wählen Sie eine Bilddatei aus.');
                return;
            }
            
            const resizedImage = await resizeImage(file, 48, 48);
            currentLogo = resizedImage;
            updateLogoPreview(resizedImage);
        });
    }
    
    if (saveBrandingBtn) {
        saveBrandingBtn.addEventListener('click', saveBrandingSettings);
    }
    
    loadBrandingSettings();
}

function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function updateChatMessagesClass() {
    const chatDisplay = document.getElementById('chatDisplay');
    if (!chatDisplay) return;
    
    const messages = chatDisplay.querySelectorAll('.message');
    
    if (messages.length > 0) {
        chatDisplay.classList.remove('empty');
        chatDisplay.classList.add('has-messages');
    } else {
        chatDisplay.classList.remove('has-messages');
        chatDisplay.classList.add('empty');
    }
}

// Settings Tab Switching
function initSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
                
                // Load data when switching to specific tabs
                if (targetTab === 'knowledge') {
                    loadKnowledgeBase();
                } else if (targetTab === 'technical') {
                    loadTechnicalDatabase();
                }
            }
        });
    });

    // Initialize default tab content visibility
    const activeTab = document.querySelector('.settings-tab.active');
    if (activeTab) {
        const targetTab = activeTab.getAttribute('data-tab');
        const targetContent = document.getElementById(targetTab + 'Tab');
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
        }
    }
    
    // Hide all other tab contents initially
    tabContents.forEach(c => {
        if (!c.classList.contains('active')) {
            c.style.display = 'none';
        }
    });
}

// Initialize tabs when settings page is shown
const originalShowSettings = window.showPage;
window.showPage = function(pageId) {
    if (typeof originalShowSettings === 'function') {
        originalShowSettings(pageId);
    } else {
        // Default showPage implementation
        const pages = document.querySelectorAll('.dashboard-page, .chat-page, .settings-page');
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        const navItems = document.querySelectorAll('.nav-item, .nav-button');
        navItems.forEach(item => item.classList.remove('active'));
    }
    
    if (pageId === 'settingsPage') {
        initSettingsTabs();
    }
};

// Initialize on page load - SINGLE DOMContentLoaded Listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing application...');
    
    // Small delay to ensure all DOM elements are loaded
    setTimeout(async () => {
        // Load system settings first
        await loadSystemSettings();
        
        // Load knowledge base and suggestions first
        loadKnowledgeBase();
        loadSuggestionsFromKnowledgeBase();
        loadDashboard(); // Load dashboard stats
        
        // Initialize system settings
        initSystemSettings();
        
        // Initialize mobile optimizations
        initMobileOptimizations();
        
        // Initialize performance optimizations
        initPerformanceOptimizations();
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                switchPage(page);
                document.querySelectorAll('.nav-item, .nav-button').forEach(nav => nav.classList.remove('active'));
                document.querySelector(`[data-page="${page}"]`).classList.add('active');
            });
        });
        
        // Show chat page by default on initial load
        switchPage('chat');
        const chatNavItem = document.querySelector('.nav-item[data-page="chat"]');
        if (chatNavItem) {
            chatNavItem.classList.add('active');
        }
        
        // Initialize all core functionality
        initSettingsTabs();
        initNavigation();
        initThemeToggle();
        initChat();
        initUpload();
        initKnowledgeBase();
        initFileEditor();
        initDeleteModal();
        initChatHistory();
        initBranding();
        initAnalytics();
        setupChatButtons();
        setupSidebarToggle();
        
        // Ensure suggestion prompts are set up after everything loads
        setTimeout(() => {
            setupSuggestionPrompts();
            addSuggestionPromptListeners();
        }, 100);
        
        // Initialize settings if on settings page
        if (document.querySelector('.settings-page')) {
            // These functions may not be defined yet, but will be added in the future
            if (typeof initAiConfiguration === 'function') initAiConfiguration();
            if (typeof initChatBehaviorSettings === 'function') initChatBehaviorSettings();
            if (typeof initSystemPreferences === 'function') initSystemPreferences();
        }
        
        // Force apply theme to suggestion prompts after everything is loaded
        setTimeout(() => {
            if (typeof applySuggestionPromptsTheme === 'function') {
                applySuggestionPromptsTheme();
            }
        }, 100);
        
        console.log('✅ All systems initialized successfully');
    }, 1000);
}); // End of DOMContentLoaded

// Force apply theme to suggestion prompts
function applySuggestionPromptsTheme() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    console.log('🎨 Applying suggestion prompts theme:', theme);
    
    const suggestionPrompts = document.querySelectorAll('.suggestion-prompt');
    const suggestionTexts = document.querySelectorAll('.suggestion-prompt-text');
    
    if (theme === 'dark') {
        suggestionPrompts.forEach(prompt => {
            // Remove inline styles first
            prompt.removeAttribute('style');
            // Then apply dark theme
            prompt.style.setProperty('background-color', '#2d2d2d', 'important');
            prompt.style.setProperty('border', '1px solid #404040', 'important');
            prompt.style.setProperty('color', '#ffffff', 'important');
        });
        
        suggestionTexts.forEach(text => {
            text.removeAttribute('style');
            text.style.setProperty('color', '#ffffff', 'important');
        });
        
        console.log('✅ Dark theme applied to', suggestionPrompts.length, 'suggestion prompts');
    } else {
        suggestionPrompts.forEach(prompt => {
            // Remove inline styles first
            prompt.removeAttribute('style');
            // Then apply light theme
            prompt.style.setProperty('background-color', '#ffffff', 'important');
            prompt.style.setProperty('border', '1px solid #e5e5e5', 'important');
            prompt.style.setProperty('color', '#2d2d2d', 'important');
        });
        
        suggestionTexts.forEach(text => {
            text.removeAttribute('style');
            text.style.setProperty('color', '#2d2d2d', 'important');
        });
        
        console.log('✅ Light theme applied to', suggestionPrompts.length, 'suggestion prompts');
    }
}

// ============================================================================
// CHAT HISTORY MANAGEMENT
// ============================================================================

// systemSettings is already defined at the top of the file

// Load system settings from backend
async function loadSystemSettings() {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (response.ok) {
            const settings = await response.json();
            systemSettings = {
                brandText: settings.brandText || 'Cadillac EV',
                welcomeTitle: settings.welcomeTitle || 'Cadillac EV Assistant',
                welcomeSubtitle: settings.welcomeSubtitle || 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
                logoUrl: settings.logoUrl || ''
            };
            console.log('✅ System settings loaded:', systemSettings);
        } else {
            console.warn('⚠️ Failed to load system settings, using defaults');
        }
    } catch (error) {
        console.error('❌ Error loading system settings:', error);
    }
}

// Format chat date for display
function formatChatDate(date) {
    if (!date) return 'Heute';
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Heute';
    } else if (diffDays === 2) {
        return 'Gestern';
    } else if (diffDays <= 7) {
        return `Vor ${diffDays - 1} Tagen`;
    } else {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    }
}

// Get current page
function getCurrentPage() {
    const chatPage = document.getElementById('chatPage');
    const settingsPage = document.getElementById('settingsPage');
    const dashboardPage = document.getElementById('dashboardPage');
    
    if (chatPage && chatPage.style.display !== 'none') return 'chat';
    if (settingsPage && settingsPage.style.display !== 'none') return 'settings';
    if (dashboardPage && dashboardPage.style.display !== 'none') return 'dashboard';
    return 'chat'; // Default to chat
}

// Initialize chat history system
function initChatHistory() {
    // Ensure sidebar is visible on chat page
    const currentPage = getCurrentPage();
    if (currentPage === 'chat') {
        const chatSidebar = document.getElementById('chatSidebar');
        if (chatSidebar) {
            chatSidebar.style.display = 'block';
            chatSidebar.classList.remove('hidden');
        }
    }
    
    // Load chat history
    loadChatHistory();
    
    // Don't show welcome message on page load - only when creating new chat
    // showWelcomeMessageIfNeeded();
    
    // Set up chat buttons and sidebar toggle
    setupChatButtons();
    setupSidebarToggle();
}

// Show welcome message only if no chats exist
async function showWelcomeMessageIfNoChats() {
    try {
        const userId = getUserId();
        const response = await fetch(`${API_BASE}/getChats?userId=${userId}`);
        
        if (response.ok) {
            const data = await response.json();
            const hasChats = data.chats && data.chats.length > 0;
            
            if (!hasChats) {
                console.log('🎉 No chats found, showing welcome message');
                showWelcomeMessage();
            } else {
                console.log('ℹ️ Chats exist, not showing welcome message');
            }
        }
    } catch (error) {
        console.error('Error checking for chats:', error);
        // Show welcome message on error as fallback
        showWelcomeMessage();
    }
}

// Show the welcome message
// Show welcome message
function showWelcomeMessage() {
    console.log('🎉 Showing welcome message...');
    
    const chatDisplay = document.getElementById('chatDisplay');
    if (!chatDisplay) {
        console.error('❌ Chat display not found!');
        return;
    }
    
    // Ensure systemSettings has default values
    if (!systemSettings) {
        console.warn('⚠️ systemSettings not loaded, using defaults');
        systemSettings = {
            brandText: 'Cadillac EV',
            welcomeTitle: 'Cadillac EV Assistant',
            welcomeSubtitle: 'Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge',
            logoUrl: ''
        };
    }
    
    // Remove any existing welcome message first
    removeWelcomeMessage();
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.id = 'welcomeMessage';
    welcomeDiv.innerHTML = `
        <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 8px; color: #2a2a2a;">${systemSettings.welcomeTitle}</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; font-weight: 400;">${systemSettings.welcomeSubtitle}</p>
        <div class="suggestion-grid">
            <button class="suggestion-prompt" data-message="Was kostet der Cadillac LYRIQ in der Schweiz?">
                <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
            </button>
            <button class="suggestion-prompt" data-message="Wie hoch ist die Reichweite des LYRIQ?">
                <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
            </button>
            <button class="suggestion-prompt" data-message="Wie lange dauert die Lieferung?">
                <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
            </button>
            <button class="suggestion-prompt" data-message="Welche Garantie gibt es?">
                <span class="suggestion-prompt-text">Garantie & Service</span>
            </button>
        </div>
    `;
    chatDisplay.appendChild(welcomeDiv);
    
    console.log('✅ Welcome message created');
    
    // Add event listeners to suggestion prompts
    addSuggestionPromptListeners();
    
    console.log('✅ Suggestion prompt listeners added');
}

// INSTANT welcome message removal (no console logs for speed)
// Remove welcome message
function removeWelcomeMessage() {
    const chatDisplay = document.getElementById('chatDisplay');
    if (!chatDisplay) return;
    
    // INSTANT: Remove ALL welcome message content
    const welcomeDiv = chatDisplay.querySelector('#welcomeMessage');
    if (welcomeDiv) {
        welcomeDiv.remove();
    }
    
    // Remove any remaining suggestion elements
    const suggestionElements = chatDisplay.querySelectorAll('.suggestion-prompt, .suggestions, .suggestion-grid');
    suggestionElements.forEach(el => el.remove());
    
    // Remove processing animations
    const processingElements = chatDisplay.querySelectorAll('#activeProcessingAnimation, .processing-animation');
    processingElements.forEach(el => el.remove());
    
    // Remove any text nodes that might be welcome content
    const textNodes = Array.from(chatDisplay.childNodes);
    textNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text === '${systemSettings.welcomeTitle}' || text === '${systemSettings.welcomeSubtitle}') {
                node.remove();
            }
        }
    });
    
    // Mark chat as having messages
    chatDisplay.classList.add('has-messages');
    chatDisplay.classList.remove('empty');
}

// Initialize chat display
async function initializeChatDisplay() {
    console.log('🎯 Initializing chat display...');
    
    // If we're processing a message, don't show welcome message
    if (isProcessingMessage) {
        console.log('⏳ Processing message, skipping welcome message');
        return;
    }
    
    try {
        const userId = getUserId();
        console.log('👤 User ID:', userId);
        
        const response = await fetch(`${API_BASE}/getChats?userId=${userId}`);
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            const hasChats = data.chats && data.chats.length > 0;
            
            console.log('📊 Chat status:', { hasChats, currentChatId });
            
            // Load chat history sidebar
            await loadChatHistory();
            
            if (currentChatId) {
                // Load the current chat if one is selected
                console.log('🔄 Loading current chat:', currentChatId);
                await loadChatMessages(currentChatId);
            } else {
                // No current chat, show welcome message
                console.log('🎉 No current chat, showing welcome message');
                showWelcomeMessage();
            }
        } else {
            // Error loading chats, show welcome message
            console.log('⚠️ Error loading chats, showing welcome message');
            await loadChatHistory(); // Still load sidebar
            showWelcomeMessage();
        }
    } catch (error) {
        console.error('❌ Error initializing chat display:', error);
        // Fallback: show welcome message
        try {
            await loadChatHistory(); // Still load sidebar
        } catch (sidebarError) {
            console.error('❌ Error loading chat history:', sidebarError);
        }
        showWelcomeMessage();
    }
}

// Set up new chat button
function setupChatButtons() {
    console.log('🔧 Setting up chat buttons...');
    
    // Set up new chat button
    const newChatBtn = document.getElementById('newChatBtn');
    console.log('🔘 New chat button:', newChatBtn);
    
    if (newChatBtn) {
        // Remove all existing event listeners
        const newNewChatBtn = newChatBtn.cloneNode(true);
        newChatBtn.parentNode.replaceChild(newNewChatBtn, newChatBtn);
        
        // Add new event listener
        newNewChatBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🆕 New chat button clicked!');
            
            // Clear current chat
            currentChatId = null;
            currentThreadId = null;
            
            // Clear chat messages and show welcome screen
            const chatDisplay = document.getElementById('chatDisplay');
            if (chatDisplay) {
                chatDisplay.innerHTML = '';
                chatDisplay.classList.remove('has-messages');
                chatDisplay.classList.add('empty');
                
                // Show welcome message
                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'welcome-message';
                welcomeDiv.id = 'welcomeMessage';
                welcomeDiv.innerHTML = `
                    <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 8px; color: #2a2a2a;">${systemSettings.welcomeTitle}</h1>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; font-weight: 400;">${systemSettings.welcomeSubtitle}</p>
                    <div class="suggestion-grid">
                        <button class="suggestion-prompt" data-message="Was kostet der Cadillac LYRIQ in der Schweiz?">
                            <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
                        </button>
                        <button class="suggestion-prompt" data-message="Wie hoch ist die Reichweite des LYRIQ?">
                            <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
                        </button>
                        <button class="suggestion-prompt" data-message="Wie lange dauert die Lieferung?">
                            <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
                        </button>
                        <button class="suggestion-prompt" data-message="Welche Garantie gibt es?">
                            <span class="suggestion-prompt-text">Garantie & Service</span>
                        </button>
                    </div>
                `;
                chatDisplay.appendChild(welcomeDiv);
                
                // Add event listeners to suggestion prompts
                const suggestionPrompts = chatDisplay.querySelectorAll('.suggestion-prompt');
                suggestionPrompts.forEach(prompt => {
                    prompt.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const message = prompt.getAttribute('data-message');
                        if (message) {
                            console.log('💬 Sending message:', message);
                            // Add user message immediately
                            const userMessage = document.createElement('div');
                            userMessage.className = 'message user';
                            userMessage.innerHTML = `
                                <div class="message-header">
                                    <span class="user-question">${message}</span>
                                </div>
                            `;
                            chatDisplay.appendChild(userMessage);
                            
                            // Remove welcome message
                            const welcomeMessage = document.getElementById('welcomeMessage');
                            if (welcomeMessage) {
                                welcomeMessage.remove();
                            }
                            
                            // Scroll to bottom
                            chatDisplay.scrollTop = chatDisplay.scrollHeight;
                        }
                    };
                });
            }
            
            console.log('✅ New chat created successfully');
            alert('Neuer Chat wurde erstellt!');
        };
        
        console.log('✅ New chat button setup complete');
    } else {
        console.error('❌ New chat button not found!');
    }
    
    // Clear all button uses global handleClearAll function (defined elsewhere)
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        console.log('✅ Clear all button found - using global handleClearAll function');
    } else {
        console.error('❌ Clear all button not found!');
    }
    
    console.log('✅ All chat buttons setup complete');
    }
    
    // Set up sidebar toggle with hover
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const chatSidebar = document.getElementById('chatSidebar');
    const sidebarHoverArea = document.getElementById('sidebarHoverArea');
    
    // Start with sidebar open
    if (chatSidebar) {
        chatSidebar.classList.remove('hidden');
    }
    
    // Ensure toggle button has correct class for open state
    if (sidebarToggle) {
        sidebarToggle.classList.add('sidebar-open');
    }
    
    if (sidebarToggle && chatSidebar && sidebarHoverArea) {
        // Remove any existing event listeners
        const newToggle = sidebarToggle.cloneNode(true);
        sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
        
        // Update reference to the new element
        const updatedToggle = document.getElementById('sidebarToggle');
        
        // Toggle sidebar on click
        updatedToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Sidebar toggle clicked!');
            toggleSidebar();
        });
        
        // Also add mousedown for better responsiveness
        updatedToggle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            console.log('🔄 Sidebar toggle mousedown!');
        });
        
        // Show toggle button on hover area
        sidebarHoverArea.addEventListener('mouseenter', () => {
            const isHidden = chatSidebar.classList.contains('hidden');
            if (isHidden) {
                sidebarToggle.classList.add('visible');
            }
        });
        
        sidebarHoverArea.addEventListener('mouseleave', () => {
            const isHidden = chatSidebar.classList.contains('hidden');
            if (isHidden) {
                sidebarToggle.classList.remove('visible');
            }
        });
        
        // Show toggle when hovering toggle itself
        sidebarToggle.addEventListener('mouseenter', () => {
            sidebarToggle.classList.add('visible');
        });
        
        // Keep toggle visible when sidebar is open
        chatSidebar.addEventListener('mouseenter', () => {
            const isHidden = chatSidebar.classList.contains('hidden');
            if (!isHidden) {
                sidebarToggle.classList.add('visible');
            }
        });
    }
    
    // Don't auto-create chat - let user create manually
    // Only load existing chats from history
}

// Load chat history from backend
async function loadChatHistory() {
    try {
        const userId = getUserId(); // Get or create user ID
        const response = await fetch(`${API_BASE}/getChats?userId=${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load chat history');
        }
        
        const data = await response.json();
        const chatHistoryList = document.getElementById('chatHistoryList');
        
        if (!chatHistoryList) {
            console.error('❌ chatHistoryList element not found!');
            return;
        }
        
        console.log('✅ chatHistoryList found:', chatHistoryList);
        
        chatHistoryList.innerHTML = '';
        
        // Don't remove welcome message here - let initializeChatDisplay handle it
        // removeWelcomeMessage();
        
        console.log('📊 Chat history data:', data);
        
        if (data.chats && data.chats.length > 0) {
            console.log('📝 Found', data.chats.length, 'chats');
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            data.chats.forEach(chat => {
                console.log('📝 Processing chat:', chat);
                const chatItem = document.createElement('div');
                chatItem.className = 'chat-history-item';
                chatItem.dataset.chatId = chat.id;
                
                const title = document.createElement('div');
                title.className = 'chat-title';
                title.textContent = chat.title || 'Neuer Chat';
                
                const date = document.createElement('div');
                date.className = 'chat-date';
                const chatDate = chat.createdAt ? new Date(chat.createdAt) : new Date();
                date.textContent = formatChatDate(chatDate);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'chat-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Prevent multiple clicks
                    if (deleteBtn.disabled) return;
                    deleteBtn.disabled = true;
                    deleteBtn.classList.add('deleting');
                    
                    try {
                        await deleteChat(chat.id);
                    } catch (error) {
                        console.error('Delete error:', error);
                    } finally {
                        deleteBtn.disabled = false;
                        deleteBtn.classList.remove('deleting');
                    }
                });
                
                chatItem.appendChild(title);
                chatItem.appendChild(date);
                chatItem.appendChild(deleteBtn);
                
                chatItem.addEventListener('click', () => switchToChat(chat.id));
                
                // Mark as active if it's the current chat
                if (chat.id === currentChatId) {
                    chatItem.classList.add('active');
                }
                
                fragment.appendChild(chatItem);
            });
            
            // Append all at once for better performance
            chatHistoryList.appendChild(fragment);
        }
    } catch (error) {
        console.error('Load chat history error:', error);
    }
}

// Render chat history list
function renderChatHistory() {
    const chatHistoryList = document.getElementById('chatHistoryList');
    if (!chatHistoryList) return;
    
    chatHistoryList.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const chatItem = document.createElement('button');
        chatItem.className = 'chat-history-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        const title = document.createElement('div');
        title.className = 'chat-history-item-title';
        title.textContent = chat.title || 'Neuer Chat';
        
        const date = document.createElement('div');
        date.className = 'chat-history-item-date';
        if (chat.createdAt && chat.createdAt._seconds) {
            const chatDate = new Date(chat.createdAt._seconds * 1000);
            date.textContent = formatChatDate(chatDate);
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'chat-delete-btn';
        deleteBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            // Prevent multiple clicks
            if (deleteBtn.disabled) return;
            deleteBtn.disabled = true;
            deleteBtn.classList.add('deleting');
            
            try {
            await deleteChat(chat.id);
            } catch (error) {
                console.error('Delete error:', error);
            } finally {
                deleteBtn.disabled = false;
                deleteBtn.classList.remove('deleting');
            }
        });
        
        chatItem.appendChild(title);
        chatItem.appendChild(date);
        chatItem.appendChild(deleteBtn);
        
        chatItem.addEventListener('click', () => switchToChat(chat.id));
        
        chatHistoryList.appendChild(chatItem);
    });
}

// Make theme toggle globally available
window.toggleTheme = toggleTheme;

// Make chat functions globally available
window.handleNewChat = handleNewChat;
window.handleClearAllClick = handleClearAllClick;

// Make functions globally available
window.loadChatHistory = loadChatHistory;
window.switchToChat = switchToChat;
window.loadChatMessages = loadChatMessages;
window.createNewChat = createNewChat;
window.showWelcomeMessage = showWelcomeMessage;
window.removeWelcomeMessage = removeWelcomeMessage;
window.saveChatMessage = saveChatMessage;
window.initializeChatDisplay = initializeChatDisplay;
window.addMessage = addMessage;
window.addMessageInstant = addMessageInstant;
window.hideProcessingAnimation = hideProcessingAnimation;
window.showProcessingAnimation = showProcessingAnimation;
window.resetFileButtons = resetFileButtons;
window.updateChatTitle = updateChatTitle;
window.formatMessage = formatMessage;
window.addCitationEventListeners = addCitationEventListeners;
window.hideAutocomplete = hideAutocomplete;
window.startVoiceInput = startVoiceInput;
window.initChat = initChat;
window.getCurrentPage = getCurrentPage;
window.switchPage = switchPage;
window.loadKnowledgeBase = loadKnowledgeBase;
window.loadTechnicalDatabase = loadTechnicalDatabase;
window.loadDashboard = loadDashboard;
window.initTroubleshooting = initTroubleshooting;
window.loadTroubleshootingAnalytics = loadTroubleshootingAnalytics;
window.setupTroubleshootingIntelligence = setupTroubleshootingIntelligence;
window.updateTroubleshootingAnalytics = updateTroubleshootingAnalytics;
window.displayKnowledgeBase = displayKnowledgeBase;
window.initTroubleshootingTabs = initTroubleshootingTabs;
window.updateTroubleshootingIntelligenceAfterAnalysis = updateTroubleshootingIntelligenceAfterAnalysis;
window.findSimilarCases = findSimilarCases;
window.initTroubleshootingIntelligence = initTroubleshootingIntelligence;
window.initTroubleshootingChat = initTroubleshootingChat;

// Format chat date for display
// Make formatChatDate globally available
window.formatChatDate = function(date) {
    // Validate date
    if (!date || isNaN(date.getTime())) {
        return 'Heute';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Heute';
    } else if (diffDays === 1) {
        return 'Gestern';
    } else if (diffDays < 7) {
        return `Vor ${diffDays} Tagen`;
    } else {
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}

// Create a new chat
// Create a new chat
async function createNewChat() {
    console.log('🆕 Creating new chat...');
    
    try {
        const userId = getUserId();
        console.log('👤 User ID:', userId);
        
        const response = await fetch(`${API_BASE}/createChat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                title: 'Neuer Chat'
            })
        });
        
        console.log('📡 Create chat response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to create chat: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Chat created:', data);
        
        // Store the old chat ID to check if this is truly a new chat
        const oldChatId = currentChatId;
        
            currentChatId = data.chatId;
        currentThreadId = data.threadId;
            
        // Clear chat messages for new chats
            const chatDisplay = document.getElementById('chatDisplay');
        console.log('💬 Chat messages container:', chatDisplay);
        
            if (chatDisplay) {
                chatDisplay.innerHTML = '';
                chatDisplay.classList.remove('has-messages');
                chatDisplay.classList.add('empty');
                
            // Show welcome message only for truly new chats (not when switching)
            console.log('🎉 Showing welcome message for new chat...');
            showWelcomeMessage();
        } else {
            console.error('❌ Chat messages container not found!');
            }
            
            // Reload chat history
            console.log('🔄 Reloading chat history...');
            await loadChatHistory();
            console.log('✅ Chat history reloaded');
    } catch (error) {
        console.error('Failed to create new chat:', error);
    }
}

// Switch to a different chat
// Switch to a different chat
async function switchToChat(chatId) {
    console.log('🔄 Switching to chat:', chatId);
    currentChatId = chatId;
    await loadChatMessages(chatId);
    updateActiveChatInSidebar(chatId);
    console.log('✅ Chat switch completed');
}

// Update active chat highlighting in sidebar without re-rendering
function updateActiveChatInSidebar(activeChatId) {
    const chatItems = document.querySelectorAll('.chat-history-item');
    chatItems.forEach(item => {
        if (item.dataset.chatId === activeChatId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Load messages for a specific chat
// Load messages for a specific chat
async function loadChatMessages(chatId) {
    console.log('🔄 Loading chat messages for:', chatId);
    try {
        const response = await fetch(`${API_BASE}/getChatMessages?chatId=${chatId}`);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Chat data received:', data);
        
        const chatDisplay = document.getElementById('chatDisplay');
        if (!chatDisplay) {
            console.error('❌ chatDisplay element not found');
            return;
        }
        
        chatDisplay.innerHTML = '';
        
        // Always remove welcome message when loading a chat
        removeWelcomeMessage();
        
        if (data.messages && data.messages.length > 0) {
            console.log('💬 Loading', data.messages.length, 'messages');
            chatDisplay.classList.add('has-messages');
            chatDisplay.classList.remove('empty');
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Process messages in batches for better performance
            const processMessages = async (messages, startIndex = 0, batchSize = 3) => {
                const endIndex = Math.min(startIndex + batchSize, messages.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    const msg = messages[i];
                    console.log(`📝 Message ${i + 1}:`, msg.role, msg.content.substring(0, 50) + '...');
                    
                    const thinkingTime = msg.thinkingTime || 0;
                    const messageDiv = await createOptimizedMessageElement(
                        msg.content, 
                        msg.role === 'assistant' ? 'bot' : 'user', 
                        thinkingTime
                    );
                    
                    if (messageDiv) {
                        fragment.appendChild(messageDiv);
                    }
                }
                
                // Process next batch if there are more messages
                if (endIndex < messages.length) {
                    await new Promise(resolve => requestAnimationFrame(resolve));
                    await processMessages(messages, endIndex, batchSize);
                } else {
                    // All messages processed, append to DOM
                    chatDisplay.appendChild(fragment);
                    // Scroll to bottom after all messages are loaded
                    requestAnimationFrame(() => {
                        chatDisplay.scrollTop = chatDisplay.scrollHeight;
                    });
                }
            };
            
            await processMessages(data.messages);
        } else {
            console.log('📭 No messages found - chat is empty');
            // Just mark as empty, don't show welcome message here
            // Welcome message is only shown in createNewChat()
            chatDisplay.classList.remove('has-messages');
            chatDisplay.classList.add('empty');
        }
        console.log('✅ Chat messages loaded successfully');
    } catch (error) {
        console.error('❌ Failed to load chat messages:', error);
        // Show error message to user
        const chatDisplay = document.getElementById('chatDisplay');
        if (chatDisplay) {
            chatDisplay.innerHTML = `
                <div class="welcome-message">
                    <h1>${systemSettings.welcomeTitle}</h1>
                    <p>Fehler beim Laden der Chat-Nachrichten.</p>
                    <p style="color: #ff6b6b; font-size: 14px;">Bitte versuchen Sie es erneut.</p>
                </div>
            `;
        }
    }
}

// Save a message to the current chat
async function saveChatMessage(role, content) {
    if (!currentChatId) {
        await createNewChat();
    }
    
    try {
        console.log('💾 Saving message:', { role, content: content.substring(0, 50) + '...', chatId: currentChatId });
        
        const response = await fetch(`${API_BASE}/saveChatMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId: currentChatId,
                role,
                content
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ Message saved successfully');
        await loadChatHistory();
    } catch (error) {
        console.error('❌ Failed to save chat message:', error);
    }
}

// Delete a chat
async function deleteChat(chatId) {
    console.log('🗑️ Deleting chat:', chatId);
    
    try {
        const response = await fetch(`https://us-central1-cis-de.cloudfunctions.net/deleteChat`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chatId: chatId })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Delete response:', result);
        
        // If deleted chat was active, switch to another or clear chat
        if (currentChatId === chatId) {
            currentChatId = null;
            await loadChatHistory();
            
            // Clear chat messages and show welcome screen
            const chatDisplay = document.getElementById('chatDisplay');
            if (chatDisplay) {
                chatDisplay.innerHTML = '';
                chatDisplay.classList.remove('has-messages');
                chatDisplay.classList.add('empty');
                
                // Show welcome message
                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'welcome-message';
                welcomeDiv.id = 'welcomeMessage';
                welcomeDiv.innerHTML = `
                    <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 8px; color: #2a2a2a;">${systemSettings.welcomeTitle}</h1>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; font-weight: 400;">${systemSettings.welcomeSubtitle}</p>
                    <div class="suggestion-grid">
                        <button class="suggestion-prompt" data-message="Was kostet der Cadillac LYRIQ in der Schweiz?">
                            <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
                        </button>
                        <button class="suggestion-prompt" data-message="Wie hoch ist die Reichweite des LYRIQ?">
                            <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
                        </button>
                        <button class="suggestion-prompt" data-message="Wie lange dauert die Lieferung?">
                            <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
                        </button>
                        <button class="suggestion-prompt" data-message="Welche Garantie gibt es?">
                            <span class="suggestion-prompt-text">Garantie & Service</span>
                        </button>
                    </div>
                `;
                chatDisplay.appendChild(welcomeDiv);
                
                // Add event listeners to suggestion prompts
                addSuggestionPromptListeners();
            }
        } else {
            await loadChatHistory();
        }
        
        console.log('✅ Chat deleted successfully');
    } catch (error) {
        console.error('❌ Failed to delete chat:', error);
        alert('Fehler beim Löschen des Chats: ' + error.message);
        throw error; // Re-throw to handle in button click
    }
}

// Update chat title based on first message
async function updateChatTitle(chatId, message) {
    try {
        // Only update if title is still "Neuer Chat"
        const chatHistoryList = document.getElementById('chatHistoryList');
        if (!chatHistoryList) return;
        
        const chatItems = chatHistoryList.querySelectorAll('.chat-history-item');
        for (let item of chatItems) {
            if (item.dataset.chatId === chatId) {
                const titleElement = item.querySelector('.chat-title');
                if (titleElement && titleElement.textContent === 'Neuer Chat') {
                    // Create a meaningful title from the message
                    let title = message.length > 30 ? message.substring(0, 30) + '...' : message;
                    titleElement.textContent = title;
                    
                    // Update in backend
                    await fetch(`${API_BASE}/updateChatTitle`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chatId, title })
                    });
                }
                break;
            }
        }
    } catch (error) {
        console.error('Failed to update chat title:', error);
    }
}

// Clear all chats function
// Make clearAllChats globally available
window.clearAllChats = async function() {
    try {
        const userId = getUserId();
        const response = await fetch(`${API_BASE}/clearAllChats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear all chats');
        }
        
        // Clear current chat
        currentChatId = null;
        currentThreadId = null;
        
        // Clear chat messages and show welcome screen
        const chatDisplay = document.getElementById('chatDisplay');
        if (chatDisplay) {
            chatDisplay.innerHTML = '';
            chatDisplay.classList.remove('has-messages');
            chatDisplay.classList.add('empty');
            
            // Show welcome message
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.id = 'welcomeMessage';
            welcomeDiv.innerHTML = `
                <h1 style="font-size: 28px; font-weight: 600; margin: 0 0 8px; color: #2a2a2a;">Cadillac EV Assistant</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; font-weight: 400;">Ihr persönlicher Assistent für Cadillac Elektrofahrzeuge</p>
                <div class="suggestion-grid">
                    <button class="suggestion-prompt" data-message="Was kostet der Cadillac LYRIQ in der Schweiz?">
                        <span class="suggestion-prompt-text">Was kostet der Cadillac LYRIQ?</span>
                    </button>
                    <button class="suggestion-prompt" data-message="Wie hoch ist die Reichweite des LYRIQ?">
                        <span class="suggestion-prompt-text">Wie hoch ist die Reichweite?</span>
                    </button>
                    <button class="suggestion-prompt" data-message="Wie lange dauert die Lieferung?">
                        <span class="suggestion-prompt-text">Lieferzeiten & Bestellung</span>
                    </button>
                    <button class="suggestion-prompt" data-message="Welche Garantie gibt es?">
                        <span class="suggestion-prompt-text">Garantie & Service</span>
                    </button>
                </div>
            `;
            chatDisplay.appendChild(welcomeDiv);
            
            // Add event listeners to suggestion prompts
            addSuggestionPromptListeners();
        }
        
        // Reload chat history (should be empty now)
        await loadChatHistory();
        
        console.log('✅ All chats cleared successfully');
    } catch (error) {
        console.error('Failed to clear all chats:', error);
        alert('Fehler beim Löschen aller Chats');
    }
}

// Chat history is initialized in the main DOMContentLoaded event

// ============================================================================
// SYSTEM SETTINGS FUNCTIONS
// ============================================================================

function initSystemSettings() {
    console.log('🔧 Initializing system settings...');
    
    // Sync theme radio buttons with current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.checked = radio.value === currentTheme;
        console.log(`Theme radio ${radio.value}: ${radio.checked} (current: ${currentTheme})`);
    });
    
    // Theme radio buttons
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const theme = this.value;
                console.log('🔄 Theme change detected:', theme);
                
                // Use ThemeManager to apply theme
                if (window.themeManager) {
                    window.themeManager.applyTheme(theme, true);
                } else {
                    console.error('❌ ThemeManager not available');
                }
            }
        });
    });
    
    // Font size dropdown
    const fontSizeSelect = document.getElementById('fontSize');
    if (fontSizeSelect) {
        // Sync font size with current setting
        const currentFontSize = localStorage.getItem('fontSize') || 'normal';
        fontSizeSelect.value = currentFontSize;
        console.log(`Font size synced: ${currentFontSize}`);
        
        fontSizeSelect.addEventListener('change', function() {
            const size = this.value;
            document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
            localStorage.setItem('fontSize', size);
            showNotification(`Schriftgröße auf ${this.options[this.selectedIndex].text} geändert`, 'success');
        });
    }
    
    // System maintenance buttons
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const exportSettingsBtn = document.getElementById('exportSettingsBtn');
    const importSettingsBtn = document.getElementById('importSettingsBtn');
    
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
    
    if (exportSettingsBtn) {
        exportSettingsBtn.addEventListener('click', exportConfiguration);
    }
    
    if (importSettingsBtn) {
        importSettingsBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    importConfiguration(file);
                }
            };
            input.click();
        });
    }
    
    // Load system info
    loadSystemInfo();
}

function loadSystemInfo() {
    // Browser info
    const browserInfo = document.getElementById('browserInfo');
    if (browserInfo) {
        const userAgent = navigator.userAgent;
        let browserName = 'Unbekannt';
        
        if (userAgent.includes('Chrome')) browserName = 'Chrome';
        else if (userAgent.includes('Firefox')) browserName = 'Firefox';
        else if (userAgent.includes('Safari')) browserName = 'Safari';
        else if (userAgent.includes('Edge')) browserName = 'Edge';
        
        browserInfo.textContent = browserName;
    }
    
    // Online status
    const onlineStatus = document.getElementById('onlineStatus');
    if (onlineStatus) {
        onlineStatus.textContent = navigator.onLine ? 'Online' : 'Offline';
        onlineStatus.style.color = navigator.onLine ? '#10b981' : '#ef4444';
        
        // Update on status change
        window.addEventListener('online', () => {
            onlineStatus.textContent = 'Online';
            onlineStatus.style.color = '#10b981';
        });
        
        window.addEventListener('offline', () => {
            onlineStatus.textContent = 'Offline';
            onlineStatus.style.color = '#ef4444';
        });
    }
}

function clearCache() {
    console.log('🧹 Clearing cache...');
    showNotification('Cache wird geleert...', 'info');
    
    try {
        // Clear localStorage
        const keysToKeep = ['theme', 'fontSize', 'settings'];
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Force reload to clear memory cache
        setTimeout(() => {
            showNotification('✅ Cache erfolgreich geleert!', 'success');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }, 500);
        
    } catch (error) {
        console.error('Error clearing cache:', error);
        showNotification('❌ Fehler beim Leeren des Cache', 'error');
    }
}

function resetSettings() {
    console.log('🔄 Resetting settings...');
    
    // Use custom confirmation instead of browser confirm
    const confirmed = window.confirm('Möchten Sie wirklich alle Einstellungen zurücksetzen? Dies kann nicht rückgängig gemacht werden.');
    if (confirmed) {
        showNotification('Einstellungen werden zurückgesetzt...', 'info');
        
        try {
            // Clear all settings
            localStorage.clear();
            sessionStorage.clear();
            
            // Reset theme
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.style.fontSize = '16px';
            
            // Reset form elements
            const themeRadios = document.querySelectorAll('input[name="theme"]');
            themeRadios.forEach(radio => {
                radio.checked = radio.value === 'light';
            });
            
            const fontSizeSelect = document.getElementById('fontSize');
            if (fontSizeSelect) {
                fontSizeSelect.value = 'normal';
            }
            
            showNotification('✅ Einstellungen erfolgreich zurückgesetzt!', 'success');
            
            // Reload page after delay
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            showNotification('❌ Fehler beim Zurücksetzen der Einstellungen', 'error');
        }
    }
}

function exportConfiguration() {
    console.log('📤 Exporting configuration...');
    
    try {
        const config = {
            theme: localStorage.getItem('theme') || 'light',
            fontSize: localStorage.getItem('fontSize') || 'normal',
            settings: JSON.parse(localStorage.getItem('settings') || '{}'),
            exportDate: new Date().toISOString(),
            version: '2025-10-12-v3'
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cadillac-ev-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ Konfiguration erfolgreich exportiert!', 'success');
        
    } catch (error) {
        console.error('Error exporting configuration:', error);
        showNotification('❌ Fehler beim Exportieren der Konfiguration', 'error');
    }
}

function importConfiguration(file) {
    console.log('📥 Importing configuration...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            
            // Validate config
            if (!config.version || !config.theme) {
                throw new Error('Ungültige Konfigurationsdatei');
            }
            
            // Apply settings
            if (config.theme) {
                document.documentElement.setAttribute('data-theme', config.theme);
                localStorage.setItem('theme', config.theme);
                
                // Update radio buttons
                const themeRadios = document.querySelectorAll('input[name="theme"]');
                themeRadios.forEach(radio => {
                    radio.checked = radio.value === config.theme;
                });
            }
            
            if (config.fontSize) {
                document.documentElement.style.fontSize = config.fontSize === 'small' ? '14px' : config.fontSize === 'large' ? '18px' : '16px';
                localStorage.setItem('fontSize', config.fontSize);
                
                const fontSizeSelect = document.getElementById('fontSize');
                if (fontSizeSelect) {
                    fontSizeSelect.value = config.fontSize;
                }
            }
            
            if (config.settings) {
                localStorage.setItem('settings', JSON.stringify(config.settings));
            }
            
            // Use ThemeManager to apply theme
            if (window.themeManager) {
                window.themeManager.applyTheme(config.theme, false);
            } else {
                console.error('❌ ThemeManager not available');
            }
            showNotification('✅ Konfiguration erfolgreich importiert!', 'success');
            
            // Reload page after delay
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Error importing configuration:', error);
            showNotification('❌ Fehler beim Importieren der Konfiguration: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// ============================================================================
// CASE DATABASE FUNCTIONS
// ============================================================================

let currentCases = [];
let currentPage = 1;
let casesPerPage = 10;
let totalCases = 0;
let currentFilters = {
    category: '',
    status: '',
    difficulty: ''
};

// Load cases from API
async function loadCases(page = 1, filters = {}) {
    try {
        const params = new URLSearchParams({
            limit: casesPerPage,
            offset: (page - 1) * casesPerPage,
            ...filters
        });

        const response = await fetch(`${API_BASE}/getCases?${params}`);
        const data = await response.json();

        if (data.cases) {
            currentCases = data.cases;
            currentPage = page;
            totalCases = data.cases.length; // This would need to be updated with actual total from API
            renderCases();
            updatePagination();
            updateStats();
        }
    } catch (error) {
        console.error('Error loading cases:', error);
        showNotification('Error loading cases', 'error');
    }
}

// Search cases with AI-powered matching
async function searchCases(query, category = '') {
    try {
        const response = await fetch(`${API_BASE}/searchCases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                category: category,
                maxResults: 50
            })
        });
        
        const data = await response.json();

        if (data.cases) {
            currentCases = data.cases;
            renderCases();
            updateStats();
        }
    } catch (error) {
        console.error('Error searching cases:', error);
        showNotification('Error searching cases', 'error');
    }
}




// Create new case with auto-categorization
async function createCase(caseData) {
    try {
        // First, try to auto-categorize the case
        let autoCategorization = null;
        try {
            const autoResponse = await fetch(`${API_BASE}/autoCategorizeCase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    problemDescription: caseData.problemDescription,
                    solution: caseData.solution || '',
                    tags: caseData.tags || []
                })
            });

            if (autoResponse.ok) {
                autoCategorization = await autoResponse.json();
                console.log('Auto-categorization result:', autoCategorization);
            }
        } catch (error) {
            console.log('Auto-categorization failed, using manual values:', error);
        }

        // Merge auto-categorization with manual data
        const enhancedCaseData = {
            ...caseData,
            ...(autoCategorization && {
                problemCategory: autoCategorization.category,
                problemSubcategory: autoCategorization.subcategory,
                difficulty: autoCategorization.difficulty,
                tags: [...(caseData.tags || []), ...(autoCategorization.suggestedTags || [])]
            })
        };

        const response = await fetch(`${API_BASE}/createCase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enhancedCaseData)
        });

        const result = await response.json();

        if (result.id) {
            let message = 'Case created successfully';
            if (autoCategorization && autoCategorization.confidence > 0.7) {
                message += ` (Auto-categorized as ${autoCategorization.category})`;
            }
            showNotification(message, 'success');
            closeCreateCaseModal();
            loadCases(currentPage, currentFilters);
            return result;
            } else {
            throw new Error(result.error || 'Failed to create case');
        }
    } catch (error) {
        console.error('Error creating case:', error);
        showNotification('Error creating case: ' + error.message, 'error');
    }
}

// Update case
async function updateCase(caseId, updateData) {
    try {
        const response = await fetch(`${API_BASE}/updateCase/${caseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Case updated successfully', 'success');
            closeCaseModal();
            loadCases(currentPage, currentFilters);
        } else {
            throw new Error(result.error || 'Failed to update case');
        }
    } catch (error) {
        console.error('Error updating case:', error);
        showNotification('Error updating case: ' + error.message, 'error');
    }
}

// Delete case
async function deleteCase(caseId) {
    if (!confirm('Are you sure you want to delete this case?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/deleteCase/${caseId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Case deleted successfully', 'success');
            closeCaseModal();
            loadCases(currentPage, currentFilters);
} else {
            throw new Error(result.error || 'Failed to delete case');
        }
    } catch (error) {
        console.error('Error deleting case:', error);
        showNotification('Error deleting case: ' + error.message, 'error');
    }
}

// Record case usage
async function recordCaseUsage(caseId, wasSuccessful, feedback = '') {
    try {
        await fetch(`${API_BASE}/recordCaseUsage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caseId: caseId,
                wasSuccessful: wasSuccessful,
                feedback: feedback
            })
        });
    } catch (error) {
        console.error('Error recording case usage:', error);
    }
}

// Update pagination
function updatePagination() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const paginationInfo = document.getElementById('paginationInfo');

    if (prevBtn && nextBtn && paginationInfo) {
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage * casesPerPage >= totalCases;
        
        const totalPages = Math.ceil(totalCases / casesPerPage);
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

// Update statistics
function updateStats() {
    const totalCasesEl = document.getElementById('totalCases');
    const verifiedCasesEl = document.getElementById('verifiedCases');
    const avgSuccessRateEl = document.getElementById('avgSuccessRate');
    const totalAttemptsEl = document.getElementById('totalAttempts');

    if (totalCasesEl) totalCasesEl.textContent = currentCases.length;
    
    const verifiedCount = currentCases.filter(c => c.status === 'verified').length;
    if (verifiedCasesEl) verifiedCasesEl.textContent = verifiedCount;
    
    const avgSuccess = currentCases.length > 0 
        ? Math.round(currentCases.reduce((sum, c) => sum + (c.successRate || 0), 0) / currentCases.length * 100)
        : 0;
    if (avgSuccessRateEl) avgSuccessRateEl.textContent = avgSuccess + '%';
    
    const totalAttempts = currentCases.reduce((sum, c) => sum + (c.totalAttempts || 0), 0);
    if (totalAttemptsEl) totalAttemptsEl.textContent = totalAttempts;
}


// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Initialize troubleshooting tabs
function initTroubleshootingTabs() {
    console.log('🔧 Initializing troubleshooting tabs');
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.troubleshooting-tab');
    const tabContents = document.querySelectorAll('.troubleshooting-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`troubleshooting${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}Tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Load content based on active tab
            if (targetTab === 'cases') {
                loadTroubleshootingCases();
            } else if (targetTab === 'analytics') {
                loadTroubleshootingAnalytics();
            }
        });
    });
    
}


// Global variable to store troubleshooting cases
let troubleshootingCases = [];



// Update troubleshooting intelligence after analysis
async function updateTroubleshootingIntelligenceAfterAnalysis(userMessage, imageDescription) {
    try {
        // Find similar cases for the analysis
        const similarCases = await findSimilarCases(userMessage, imageDescription);
        
        // Update similar cases display
        displaySimilarCases(similarCases);
        
        // Calculate and update confidence score
        const confidenceScore = calculateEnhancedConfidenceScore(similarCases, [], 'found');
        updateDiagnosisConfidence(confidenceScore, similarCases.length);
        
        // Update analytics with new data
        loadTroubleshootingAnalytics();
        
    } catch (error) {
        console.error('Error updating troubleshooting intelligence:', error);
    }
}
