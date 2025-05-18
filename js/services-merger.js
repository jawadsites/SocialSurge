/**
 * Services Data Merger
 * This script merges service data from the old storage key (services_data_for_index) into the new one (social_services)
 * It ensures no duplicate services based on ID, and removes the old storage key after the merge
 */

const servicesMerger = (() => {
    // Constants
    const OLD_STORAGE_KEY = 'services_data_for_index';
    const NEW_STORAGE_KEY = 'social_services';
    
    // Check if data needs to be merged
    const needsMerge = () => {
        return !!localStorage.getItem(OLD_STORAGE_KEY);
    };
    
    // Merge services from old storage into the new one
    const mergeServices = () => {
        console.log('Merging services data from old storage to new...');
        
        try {
            // Get old services data
            const oldServicesData = localStorage.getItem(OLD_STORAGE_KEY);
            if (!oldServicesData) {
                console.log('No old services data found. Nothing to merge.');
                return false;
            }
            
            // Parse old services
            const oldServices = JSON.parse(oldServicesData);
            if (!Array.isArray(oldServices) || oldServices.length === 0) {
                console.log('Old services data is empty or invalid. Nothing to merge.');
                localStorage.removeItem(OLD_STORAGE_KEY);
                return false;
            }
            
            console.log(`Found ${oldServices.length} services in old storage.`);
            
            // Get current services from new storage
            const newServicesData = localStorage.getItem(NEW_STORAGE_KEY);
            let newServices = [];
            
            if (newServicesData) {
                try {
                    newServices = JSON.parse(newServicesData);
                    if (!Array.isArray(newServices)) {
                        newServices = [];
                    }
                    console.log(`Found ${newServices.length} existing services in new storage.`);
                } catch (e) {
                    console.error('Error parsing new services data:', e);
                    newServices = [];
                }
            }
            
            // Create a map of existing service IDs to avoid duplicates
            const existingServiceIds = new Set();
            newServices.forEach(service => {
                if (service.id) {
                    existingServiceIds.add(service.id.toString());
                }
            });
            
            // Add non-duplicate services from old storage to new storage
            let addedCount = 0;
            oldServices.forEach(service => {
                if (service.id && !existingServiceIds.has(service.id.toString())) {
                    newServices.push(service);
                    existingServiceIds.add(service.id.toString());
                    addedCount++;
                }
            });
            
            console.log(`Added ${addedCount} new services from old storage.`);
            
            // Save the merged services back to new storage
            localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(newServices));
            
            // Delete the old storage key
            localStorage.removeItem(OLD_STORAGE_KEY);
            console.log('Old storage key deleted after successful merge.');
            
            return true;
        } catch (error) {
            console.error('Error merging services data:', error);
            return false;
        }
    };
    
    // Initialize - check and merge data if needed
    const init = () => {
        if (needsMerge()) {
            console.log('Services merger: Data merge needed. Starting merge process...');
            return mergeServices();
        } else {
            console.log('Services merger: No data merge needed.');
            return false;
        }
    };
    
    // Public API
    return {
        init,
        needsMerge,
        mergeServices
    };
})();

// Run the merger when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Services merger initializing...');
    servicesMerger.init();
});