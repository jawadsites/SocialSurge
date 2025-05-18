/**
 * Social Media Checkout Module
 * Handles all checkout and payment related operations
 */

const socialCheckout = {
    // Checkout state
    state: {
        services: [],
        platforms: [],
        currencies: {},
        selectedService: null,
        selectedPlatform: null,
        quantity: 100,
        currency: 'USD',
        totalPrice: 0,
        userInfo: {
            name: '',
            email: '',
            socialLink: ''
        },
        debug: false // Set to true only in development
    },

    /**
     * Initialize checkout
     */
    init: function() {
        // Set debug mode based on environment
        this.state.debug = (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
                          
        this.loadServices();
        this.loadCurrencies();
        this.setupEventListeners();
        this.updatePriceDisplay();
    },
    
    /**
     * Load services from serviceUtils or fallback to localStorage
     */
    loadServices: function() {
        // Try to use serviceUtils first (preferred method)
        if (typeof serviceUtils !== 'undefined') {
            const services = serviceUtils.getAllServices();
            if (services && services.length > 0) {
                this.state.services = services;
                this.logDebug(`Loaded ${services.length} services from unified storage`);
                return;
            }
        }
        
        // Fallback: Try to get from localStorage
        const storedServices = localStorage.getItem('dashboard_services');
        if (storedServices) {
            try {
                this.state.services = JSON.parse(storedServices);
                
                // Try to migrate data if serviceUtils is available
                if (typeof serviceUtils !== 'undefined') {
                    serviceUtils.migrateOldData();
                }
            } catch (e) {
                this.handleError('Error parsing stored services', e);
            }
        }
    },
    
    /**
     * Handle errors consistently
     * @param {string} message - Error message
     * @param {Error} error - Optional error object
     */
    handleError: function(message, error = null) {
        // In development, log to console
        if (this.state.debug) {
            if (error) {
                console.error(message, error);
            } else {
                console.error(message);
            }
        }
        
        // Log error for analytics
        if (typeof errorMonitor !== 'undefined' && errorMonitor.logError) {
            errorMonitor.logError('Checkout', message, error);
        }
    },
    
    /**
     * Log debug messages (only in development)
     */
    logDebug: function(...args) {
        if (this.state.debug) {
            console.log(...args);
        }
    }

    // ... existing functions ...
};

// Initialize the checkout when document is ready
document.addEventListener('DOMContentLoaded', function() {
    socialCheckout.init();
});
