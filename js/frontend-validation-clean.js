
/**
 * Alpine.js Components Validation
 * This file provides functions to validate the Alpine.js component structure
 * with proper error handling instead of using console.log statements.
 */

document.addEventListener('DOMContentLoaded', () => {
    validateAlpineComponents();
});

/**
 * Validates all Alpine.js components and their data structure
 */
function validateAlpineComponents() {
    // Wait to ensure Alpine.js is fully initialized
    setTimeout(() => {
        if (!window.Alpine) {
            handleValidationError('Alpine.js not detected');
            return;
        }
        
        try {
            const app = Alpine.closestDataStack(document.querySelector('[x-data]'));
            
            if (!app) {
                handleValidationError('Alpine app component not found');
                return;
            }
            
            validateAppData(app);
            validateDomElements();
        } catch (error) {
            handleValidationError('Error validating Alpine.js component', error);
        }
    }, 1000);
}

/**
 * Validates app data structure and integrity
 * @param {Object} app - The Alpine.js app data object
 */
function validateAppData(app) {
    // Check for data availability
    const platformsAvailable = app.platforms && Array.isArray(app.platforms);
    const servicesAvailable = app.services && Array.isArray(app.services);
    
    // Validate service IDs for duplicates
    if (servicesAvailable) {
        const serviceIds = app.services.map(s => s.id);
        const uniqueIds = [...new Set(serviceIds)];
        
        if (serviceIds.length !== uniqueIds.length) {
            handleValidationError(
                `Duplicate services detected: ${serviceIds.length - uniqueIds.length} duplicates`,
                { serviceIds }
            );
        }
    }

    // Validate selected platform has available services
    if (app.selectedPlatform && (!app.availableServices || app.availableServices.length === 0)) {
        handleValidationError('No services available for selected platform', {
            platform: app.selectedPlatform
        });
    }
}

/**
 * Validates that DOM elements for platforms and services are rendered
 */
function validateDomElements() {
    setTimeout(() => {
        const platformElements = document.querySelectorAll('.platform-option');
        const serviceElements = document.querySelectorAll('.service-card');
        
        if (platformElements.length === 0) {
            handleValidationError('No platform elements found in DOM');
        }
        
        if (serviceElements.length === 0) {
            handleValidationError('No service elements found in DOM');
        }
    }, 500);
}

/**
 * Handles validation errors with consistent formatting
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
function handleValidationError(message, details = null) {
    // In production, errors could be sent to a monitoring service
    // For now, we'll just add them to a hidden validation report element
    
    const validationReport = document.getElementById('validation-report') || 
                          createValidationReportElement();
                          
    const errorItem = document.createElement('div');
    errorItem.className = 'validation-error';
    errorItem.textContent = message;
    
    if (details) {
        const detailsPre = document.createElement('pre');
        detailsPre.className = 'text-xs mt-1 text-gray-600';
        detailsPre.textContent = JSON.stringify(details, null, 2);
        errorItem.appendChild(detailsPre);
    }
    
    validationReport.appendChild(errorItem);
}

/**
 * Creates a validation report element in the DOM
 * @returns {HTMLElement} The validation report element
 */
function createValidationReportElement() {
    const validationReport = document.createElement('div');
    validationReport.id = 'validation-report';
    validationReport.className = 'hidden';
    document.body.appendChild(validationReport);
    return validationReport;
}
