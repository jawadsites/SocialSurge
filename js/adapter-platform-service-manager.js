/**
 * Adapter for Platform and Service Management
 * This adapter makes sure the old platform-manager.js and services-dashboard-updated.js
 * work with the new UnifiedPlatformServiceManager
 */

// Make sure old references work with the new unified manager
if (window.UnifiedPlatformServiceManager && !window.PlatformServiceManager) {
    console.log('Creating adapter for PlatformServiceManager -> UnifiedPlatformServiceManager');
    
    // Create an adapter for backward compatibility
    window.PlatformServiceManager = {
        // Platform management methods
        loadPlatforms: function() {
            return UnifiedPlatformServiceManager.loadPlatforms();
        },
        
        savePlatforms: function(platforms) {
            return UnifiedPlatformServiceManager.savePlatforms(platforms);
        },
        
        getPlatformById: function(platformId) {
            return UnifiedPlatformServiceManager.getPlatformById(platformId);
        },
        
        addPlatform: function(platform) {
            return UnifiedPlatformServiceManager.addPlatform(platform);
        },
        
        updatePlatform: function(platform) {
            return UnifiedPlatformServiceManager.updatePlatform(platform);
        },
        
        deletePlatform: function(platformId) {
            return UnifiedPlatformServiceManager.deletePlatform(platformId);
        },
        
        // Service management methods
        loadServices: function() {
            return UnifiedPlatformServiceManager.loadServices();
        },
        
        saveServices: function(services) {
            return UnifiedPlatformServiceManager.saveServices(services);
        },
        
        getServiceById: function(serviceId) {
            return UnifiedPlatformServiceManager.getServiceById(serviceId);
        },
        
        addService: function(service) {
            return UnifiedPlatformServiceManager.addService(service);
        },
        
        updateService: function(service) {
            return UnifiedPlatformServiceManager.updateService(service);
        },
        
        deleteService: function(serviceId) {
            return UnifiedPlatformServiceManager.deleteService(serviceId);
        },
        
        // Display methods
        getDisplayPlatforms: function() {
            return UnifiedPlatformServiceManager.getDisplayPlatforms();
        },
        
        getPlatformServices: function(platformId) {
            return UnifiedPlatformServiceManager.getPlatformServices(platformId);
        },
        
        getDisplayServices: function() {
            return UnifiedPlatformServiceManager.getDisplayServices();
        }
    };
    
    console.log('PlatformServiceManager adapter created successfully');
}
