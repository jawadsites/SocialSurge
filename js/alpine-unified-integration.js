/**
 * Alpine.js Data Integration with UnifiedPlatformServiceManager
 * This file provides integration between Alpine.js components and the UnifiedPlatformServiceManager
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if Alpine.js and UnifiedPlatformServiceManager are available
    if (window.Alpine && window.UnifiedPlatformServiceManager) {
        console.log('Setting up Alpine.js integration with UnifiedPlatformServiceManager');
        
        // Wait for Alpine to initialize
        document.addEventListener('alpine:initialized', () => {
            setupAlpineIntegration();
        });
        
        // Also check if Alpine is already initialized
        if (document.querySelector('[x-data]')) {
            setupAlpineIntegration();
        }
    }
});

/**
 * Set up integration between Alpine.js components and UnifiedPlatformServiceManager
 */
function setupAlpineIntegration() {
    // Get all Alpine.js components on the page
    document.querySelectorAll('[x-data]').forEach(el => {
        try {
            if (!window.Alpine.$data) return;
            
            const alpineData = window.Alpine.$data(el);
            if (!alpineData) return;
            
            // Update Alpine's platform and service loading methods
            patchAlpineDataMethods(alpineData);
            
            // Listen for UnifiedPlatformServiceManager data updates
            document.addEventListener('platformServiceDataUpdated', () => {
                if (typeof alpineData.loadPlatforms === 'function') {
                    alpineData.loadPlatforms();
                }
                
                if (typeof alpineData.loadServices === 'function') {
                    alpineData.loadServices();
                }
                
                // Update prices if method exists
                if (typeof alpineData.updatePrice === 'function') {
                    alpineData.updatePrice();
                }
            });
            
            console.log('Alpine.js integration with UnifiedPlatformServiceManager set up successfully');
        } catch (error) {
            console.error('Error setting up Alpine.js integration:', error);
        }
    });
}

/**
 * Patch Alpine.js component methods to use UnifiedPlatformServiceManager
 * @param {Object} alpineData - The Alpine.js component data
 */
function patchAlpineDataMethods(alpineData) {
    // Replace the loadPlatforms method to use UnifiedPlatformServiceManager
    if (typeof alpineData.loadPlatforms === 'function') {
        const originalLoadPlatforms = alpineData.loadPlatforms;
        
        alpineData.loadPlatforms = function() {
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
            
            // Fall back to the original method if UnifiedPlatformServiceManager fails
            originalLoadPlatforms.call(this);
        };
    }
    
    // Replace the loadServices method to use UnifiedPlatformServiceManager
    if (typeof alpineData.loadServices === 'function') {
        const originalLoadServices = alpineData.loadServices;
        
        alpineData.loadServices = function() {
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
            
            // Fall back to the original method if UnifiedPlatformServiceManager fails
            originalLoadServices.call(this);
        };
    }
    
    // Add method to reload data from UnifiedPlatformServiceManager
    alpineData.reloadFromUnifiedManager = function() {
        if (window.UnifiedPlatformServiceManager) {
            if (typeof this.loadPlatforms === 'function') {
                this.loadPlatforms();
            }
            
            if (typeof this.loadServices === 'function') {
                this.loadServices();
            }
            
            if (typeof this.updatePrice === 'function') {
                this.updatePrice();
            }
            
            console.log('Alpine.js data reloaded from UnifiedPlatformServiceManager');
        }
    };
}
