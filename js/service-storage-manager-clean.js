/**
 * Service Storage Manager
 * Handles saving, retrieving and synchronizing services with localStorage
 */

const serviceStorageManager = {
    // Storage key for services
    STORAGE_KEY: 'services_data',
    
    /**
     * Initialize the storage manager
     */
    init: function() {
        // Load services when the page loads
        this.loadFromStorage();
        
        // Add event listeners for service changes
        document.addEventListener('serviceAdded', () => this.saveToStorage());
        document.addEventListener('serviceUpdated', () => this.saveToStorage());
        document.addEventListener('serviceDeleted', () => this.saveToStorage());
        document.addEventListener('servicesImported', () => this.saveToStorage());
        
        // Save services before page unload
        window.addEventListener('beforeunload', () => this.saveToStorage());
    },
    
    /**
     * Save current services to localStorage
     */
    saveToStorage: function() {
        try {
            // Get services from the service manager
            let services = [];
            
            // Check which service management system is in use
            if (typeof servicesDashboard !== 'undefined' && servicesDashboard.getServices) {
                services = servicesDashboard.getServices();
            } else if (typeof serviceUtils !== 'undefined' && serviceUtils.getAllServices) {
                services = serviceUtils.getAllServices();
            } else {
                this.handleError('No service management system found');
                return;
            }
            
            // Save to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(services));
            
            // Dispatch event for other components that might need to know
            document.dispatchEvent(new CustomEvent('servicesSaved', {
                detail: { count: services.length }
            }));
        } catch (error) {
            this.handleError('Error saving services to localStorage', error);
        }
    },
    
    /**
     * Load services from localStorage
     * @returns {Array} The loaded services or empty array if none found
     */
    loadFromStorage: function() {
        try {
            const savedServices = localStorage.getItem(this.STORAGE_KEY);
            
            if (savedServices) {
                const services = JSON.parse(savedServices);
                
                // Apply the loaded services to the appropriate service management system
                if (typeof servicesDashboard !== 'undefined' && servicesDashboard.setServices) {
                    servicesDashboard.setServices(services);
                } else if (typeof serviceUtils !== 'undefined' && serviceUtils.setAllServices) {
                    serviceUtils.setAllServices(services);
                } else {
                    this.handleError('No service management system found to load services into');
                    return [];
                }
                
                // Dispatch event for other components that might need to know
                document.dispatchEvent(new CustomEvent('servicesLoaded', {
                    detail: { services: services, count: services.length }
                }));
                
                return services;
            } else {
                return [];
            }
        } catch (error) {
            this.handleError('Error loading services from localStorage', error);
            return [];
        }
    },
    
    /**
     * Clear services from localStorage (useful for debugging or reset)
     */
    clearStorage: function() {
        localStorage.removeItem(this.STORAGE_KEY);
    },
    
    /**
     * Handle errors consistently
     * @param {string} message - Error message
     * @param {Error} error - Optional error object
     */
    handleError: function(message, error = null) {
        // Only log errors in development environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (error) {
                console.error(message, error);
            } else {
                console.error(message);
            }
        }
        
        // Dispatch error event for error handling systems
        document.dispatchEvent(new CustomEvent('storageError', {
            detail: { message: message, error: error }
        }));
    }
};

// Initialize the manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    serviceStorageManager.init();
});
