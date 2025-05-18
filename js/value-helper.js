/**
 * وحدة مساعد القيم
 * توفر دوال لمعالجة القيم بأمان
 */

// معالجة آمنة للقيم الرقمية
const valueHelper = {
    // تنسيق رقم باستخدام toLocaleString بشكل آمن
    formatNumber: function(value, options = {}) {
        // التحقق من كون القيمة رقمًا صالحًا
        if (value === null || value === undefined || isNaN(value)) {
            value = 0;
        }
        
        // التأكد من أن القيمة رقمية
        if (typeof value !== 'number') {
            value = Number(value);
            if (isNaN(value)) {
                value = 0;
            }
        }
        
        // تنسيق الرقم باستخدام toLocaleString
        return value.toLocaleString(undefined, options);
    },
    
    // التحقق من كون القيمة رقمًا صالحًا
    isValidNumber: function(value) {
        return value !== null && value !== undefined && !isNaN(value) && typeof value === 'number';
    },
    
    // الحصول على قيمة رقمية آمنة
    getSafeNumber: function(value, defaultValue = 0) {
        if (this.isValidNumber(value)) {
            return value;
        }
        return defaultValue;
    }
};

// تصدير الدوال لاستخدامها في الملفات الأخرى
window.valueHelper = valueHelper;
