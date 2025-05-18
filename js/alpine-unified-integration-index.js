/**
 * Alpine.js Data Integration with UnifiedPlatformServiceManager for index.html
 * This file provides integration between the index page's Alpine.js components 
 * and the UnifiedPlatformServiceManager
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if the current page is index.html
    if (window.location.pathname.includes('index') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        console.log('Setting up Alpine.js integration with UnifiedPlatformServiceManager for index.html');
        
        // Make sure UnifiedPlatformServiceManager is available and initialized
        if (!window.UnifiedPlatformServiceManager) {
            console.error('UnifiedPlatformServiceManager not found. Loading script...');
            
            // Dynamically load the UnifiedPlatformServiceManager script
            const script = document.createElement('script');
            script.src = 'js/unified-platform-service-manager.js';
            script.onload = function() {
                console.log('UnifiedPlatformServiceManager loaded successfully');
                setupIndexIntegration();
            };
            script.onerror = function() {
                console.error('Failed to load UnifiedPlatformServiceManager');
            };
            document.head.appendChild(script);
        } else {
            // UnifiedPlatformServiceManager is already available
            setupIndexIntegration();
        }
    }
});

/**
 * Set up integration for index.html page
 */
function setupIndexIntegration() {
    // Wait for Alpine.js to initialize
    if (window.Alpine) {
        updateAlpineInitialization();
    } else {
        // Wait for Alpine.js to load
        document.addEventListener('alpine:init', updateAlpineInitialization);
    }
    
    // Check if the orderFormData function is already defined
    if (typeof orderFormData === 'function') {
        // Patch the existing orderFormData function
        const originalOrderFormData = orderFormData;
        window.orderFormData = function() {
            const data = originalOrderFormData();
            patchOrderFormDataMethods(data);
            return data;
        };
        
        console.log('Patched orderFormData function to use UnifiedPlatformServiceManager');
    }
}

/**
 * Update Alpine initialization
 */
function updateAlpineInitialization() {
    // Find Alpine.js components on the page
    document.querySelectorAll('[x-data]').forEach(el => {
        try {
            if (!window.Alpine.$data) return;
            
            const alpineData = window.Alpine.$data(el);
            if (!alpineData) return;
            
            // Check if this is an order form component
            if (alpineData.platforms !== undefined && alpineData.services !== undefined) {
                // Patch the Alpine data methods
                patchOrderFormDataMethods(alpineData);
                
                console.log('Updated Alpine.js component to use UnifiedPlatformServiceManager');
                
                // Reload data if needed
                if (typeof alpineData.loadPlatforms === 'function') {
                    alpineData.loadPlatforms();
                }
                
                if (typeof alpineData.loadServices === 'function') {
                    alpineData.loadServices();
                }
                
                if (typeof alpineData.updatePrice === 'function') {
                    alpineData.updatePrice();
                }
            }
        } catch (error) {
            console.error('Error updating Alpine.js component:', error);
        }
    });
}

/**
 * Patch the methods of the orderFormData object to use UnifiedPlatformServiceManager
 * @param {Object} data - The Alpine.js component data
 */
function patchOrderFormDataMethods(data) {
    if (!data) return;
    
    // Replace the loadPlatforms method
    if (typeof data.loadPlatforms === 'function') {
        const originalLoadPlatforms = data.loadPlatforms;
        
        data.loadPlatforms = function() {
            try {
                // Try to use UnifiedPlatformServiceManager first
                if (window.UnifiedPlatformServiceManager) {
                    this.platforms = UnifiedPlatformServiceManager.getDisplayPlatforms();
                    console.log(`Loaded ${this.platforms.length} platforms from UnifiedPlatformServiceManager`);
                    return;
                }
            } catch (error) {
                console.error('Error loading platforms from UnifiedPlatformServiceManager:', error);
            }
            
            // Fall back to the original method
            originalLoadPlatforms.call(this);
        };
    }
    
    // Replace the loadServices method
    if (typeof data.loadServices === 'function') {
        const originalLoadServices = data.loadServices;
        
        data.loadServices = function() {
            try {
                // Try to use UnifiedPlatformServiceManager first
                if (window.UnifiedPlatformServiceManager) {
                    this.services = UnifiedPlatformServiceManager.getDisplayServices();
                    console.log(`Loaded ${this.services.length} services from UnifiedPlatformServiceManager`);
                    return;
                }
            } catch (error) {
                console.error('Error loading services from UnifiedPlatformServiceManager:', error);
            }
            
            // Fall back to the original method
            originalLoadServices.call(this);
        };
    }
    
    // Add computed properties if they don't exist or modify them if they do
    Object.defineProperties(data, {
        availablePlatforms: {
            get: function() {
                if (window.UnifiedPlatformServiceManager) {
                    return UnifiedPlatformServiceManager.getDisplayPlatforms();
                }
                return this.platforms.filter(p => p.active === true);
            }
        },
        
        availableServices: {
            get: function() {
                if (!this.selectedPlatform) {
                    return [];
                }
                
                if (window.UnifiedPlatformServiceManager) {
                    return UnifiedPlatformServiceManager.getPlatformServices(this.selectedPlatform);
                }
                return this.services.filter(
                    service => service.platformId === this.selectedPlatform && service.active === true
                );
            }
        }
    });
    
    // Replace the getPlatformIcon method
    if (typeof data.getPlatformIcon === 'function') {
        data.getPlatformIcon = function(platformId) {
            if (window.UnifiedPlatformServiceManager) {
                const platform = UnifiedPlatformServiceManager.getPlatformById(platformId);
                return platform ? `fab fa-${platform.icon || 'globe'}` : 'fab fa-globe';
            }
            
            const platform = this.platforms.find(p => p.id === platformId);
            return platform ? `fab fa-${platform.icon || 'globe'}` : 'fab fa-globe';
        };
    }
    
    // Setup event listeners for data updates
    if (typeof data.setupEventListeners === 'function') {
        // Make sure we have only one event listener for platformServiceDataUpdated
        document.removeEventListener('platformServiceDataUpdated', data._dataUpdateHandler);
        
        // Create a handler
        data._dataUpdateHandler = function() {
            if (typeof data.loadPlatforms === 'function') {
                data.loadPlatforms();
            }
            if (typeof data.loadServices === 'function') {
                data.loadServices();
            }
            if (typeof data.updatePrice === 'function') {
                data.updatePrice();
            }
        };
        
        // Add the event listener
        document.addEventListener('platformServiceDataUpdated', data._dataUpdateHandler);
    }
    
    console.log('Successfully patched Alpine.js data methods to use UnifiedPlatformServiceManager');
}
