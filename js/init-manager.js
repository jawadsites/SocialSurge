/**
 * Init Manager
 * Ensures proper module initialization, especially when switching tabs
 */

const initManager = {
    // Track modules initialization state
    state: {
        initialized: {
            platforms: false,
            services: false,
            orders: false,
            pricing: false
        },
        activeTabs: []
    },
    
    // Initialize the init manager
    init: function() {
        console.log('تهيئة مدير التهيئة...');
        this.setupTabs();
        this.monitorTabs();
    },
      // Setup tabs tracking
    setupTabs: function() {
        const tabLinks = document.querySelectorAll('.tab-link');
        
        tabLinks.forEach(tabLink => {
            tabLink.addEventListener('click', (e) => {
                const tabId = tabLink.getAttribute('data-tab');
                console.log('Tab changed to:', tabId);
                
                // Initialize once per session rather than on every click
                if (tabId === 'platforms' && typeof platformsDashboard !== 'undefined' && !this.state.initialized.platforms) {
                    console.log('إعادة تهيئة قسم المنصات من قبل مدير التهيئة');
                    setTimeout(() => {
                        platformsDashboard.init();
                        this.state.initialized.platforms = true;
                    }, 150);
                }
                
                // Add to active tabs
                if (!this.state.activeTabs.includes(tabId)) {
                    this.state.activeTabs.push(tabId);
                }
            });
        });
    },
      // Monitor tabs to ensure initialization
    monitorTabs: function() {
        // Check if any visible tab needs initialization but only once per 10 seconds
        // to prevent excessive re-initializations
        let lastCheck = 0;
        setInterval(() => {
            const now = Date.now();
            // Only check every 10 seconds
            if (now - lastCheck < 10000) {
                return;
            }
            lastCheck = now;
            
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab) {
                const tabId = activeTab.id;
                
                // Force reinitialization for platforms tab if it's visible but not loaded properly
                // and hasn't been initialized in this session
                if (tabId === 'platforms' && typeof platformsDashboard !== 'undefined' && !this.state.initialized.platforms) {
                    const platformsContainer = document.getElementById('platforms-container');
                    if (platformsContainer && platformsContainer.children.length === 0) {
                        console.log('اكتشاف قسم منصات فارغ، إعادة التهيئة...');
                        platformsDashboard.init();
                        this.state.initialized.platforms = true;
                    }
                }
            }
        }, 2000);
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    initManager.init();
});