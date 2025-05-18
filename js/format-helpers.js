/**
 * وحدة مساعدة لتنسيق القيم
 * تحتوي على دوال مساعدة لتنسيق الأرقام والعملات والتواريخ
 */

// دالة تنسيق السعر مع رمز العملة
function formatPrice(value, currency = 'USD') {
    // التأكد من أن القيمة رقم
    if (typeof value !== 'number' || isNaN(value)) {
        value = 0;
    }
    
    // تقريب القيمة إلى رقمين عشريين
    const formattedValue = value.toFixed(2);
    
    // رموز العملات المعروفة
    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'SAR': 'ر.س',
        'AED': 'د.إ',
        'KWD': 'د.ك',
        'QAR': 'ر.ق',
        'BHD': 'د.ب',
        'OMR': 'ر.ع',
        'EGP': 'ج.م',
        'JOD': 'د.أ'
    };
    
    // إضافة رمز العملة إن وجد، وإلا استخدام اختصار العملة
    const symbol = currencySymbols[currency] || currency;
    
    return formattedValue + ' ' + symbol;
}

// تصدير الدوال لاستخدامها في الملفات الأخرى
window.formatPrice = formatPrice;
