/**
 * Services Validation Module
 * Validates service data before creation/update
 */

const servicesValidation = {
  // State object
  state: {
    debug: false // Set to true only in development
  },

  init: function() {
    // Set debug mode based on environment
    this.state.debug = (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.indexOf('test') > -1);
    
    this.logDebug('Initializing services validation...');
    this.addEventListeners();
  },

  addEventListeners: function() {
    // Get save button for service form
    const saveServiceButton = document.getElementById('save-service');
    if (saveServiceButton) {
      // Replace the click event with our validated version
      const originalClickHandler = saveServiceButton.onclick;
      saveServiceButton.onclick = (e) => {
        e.preventDefault();
        if (this.validateServiceForm()) {
          // If validation passes, call original handler or proceed
          if (originalClickHandler) {
            originalClickHandler.call(saveServiceButton, e);
          } else {
            // Default save behavior if no handler exists
            this.saveService();
          }
        }
      };
    }
  },

  validateServiceForm: function() {
    // Get form values
    const serviceName = document.getElementById('service-name').value.trim();
    const servicePlatform = document.getElementById('service-platform').value;
    const servicePrice = document.getElementById('service-price').value;
    const minQuantity = document.getElementById('min-quantity').value;
    const maxQuantity = document.getElementById('max-quantity').value;
    
    // Create validation errors array
    const errors = [];
    
    // Validate required fields
    if (!serviceName) errors.push('اسم الخدمة مطلوب');
    if (!servicePlatform) errors.push('يجب اختيار المنصة');
    if (!servicePrice) errors.push('السعر مطلوب');
    if (!minQuantity) errors.push('الحد الأدنى للكمية مطلوب');
    if (!maxQuantity) errors.push('الحد الأقصى للكمية مطلوب');
    
    // If we have errors, show them and return false
    if (errors.length > 0) {
      this.showNotification('يرجى تصحيح الأخطاء التالية:\n\n' + errors.join('\n'), 'error');
      return false;
    }
    
    // Additional validation
    if (parseFloat(minQuantity) > parseFloat(maxQuantity)) {
      this.showNotification('الحد الأدنى للكمية يجب أن يكون أقل من الحد الأقصى', 'error');
      return false;
    }
    
    return true;
  },
  
  saveService: function() {
    // Default implementation - can be extended
    const form = document.getElementById('service-form');
    if (form) {
      form.submit();
    }
  },

  /**
   * عرض إشعار للمستخدم
   * @param {string} message - نص الإشعار
   * @param {string} type - نوع الإشعار (success, error, warning, info)
   */
  showNotification: function(message, type = 'info') {
    // إذا كانت هناك واجهة إشعارات متقدمة
    if (window.NotificationSystem && typeof window.NotificationSystem.show === 'function') {
      window.NotificationSystem.show(message, type);
      return;
    }
    
    // الطريقة الاحتياطية: استخدام alert
    alert(message);
  },

  /**
   * معالجة الأخطاء وتسجيلها
   * @param {string} context - سياق الخطأ
   * @param {Error} error - كائن الخطأ
   */
  handleError: function(context, error) {
    // تسجيل الخطأ في السجل
    console.error(`${context}:`, error);
    
    // إذا كانت هناك خدمة تتبع الأخطاء
    if (window.ErrorTracker && typeof window.ErrorTracker.captureException === 'function') {
      window.ErrorTracker.captureException(error, { context });
    }
  },

  /**
   * تسجيل رسائل التصحيح (فقط في بيئة التطوير)
   */
  logDebug: function(...args) {
    if (this.state.debug) {
      console.log(...args);
    }
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  servicesValidation.init();
});
