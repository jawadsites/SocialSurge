/**
 * امتداد لنظام إدارة الخدمات
 * يضيف تحققات إضافية للمنصات
 */

(function() {
    // نظام إدارة الأخطاء والسجلات
    const Logger = {
        debug: false,
        
        init: function() {
            this.debug = (window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.indexOf('test') > -1);
        },
        
        log: function(...args) {
            if (this.debug) {
                console.log(...args);
            }
        },
        
        error: function(...args) {
            console.error(...args);
            // إذا كانت هناك خدمة تتبع الأخطاء
            if (window.ErrorTracker && typeof window.ErrorTracker.captureException === 'function') {
                const error = args.find(arg => arg instanceof Error) || new Error(args.join(' '));
                window.ErrorTracker.captureException(error);
            }
        }
    };
    
    // تهيئة نظام السجلات
    Logger.init();

    // انتظر حتى يتم تحميل نظام إدارة الخدمات
    document.addEventListener('DOMContentLoaded', function() {
        // التأكد من وجود كائن serviceUtils
        if (typeof serviceUtils === 'undefined') {
            Logger.error('لم يتم العثور على كائن serviceUtils');
            return;
        }
        
        Logger.log('تهيئة امتداد التحقق من المنصات للخدمات...');
        
        // حفظ المراجع للدوال الأصلية
        const originalSaveService = serviceUtils.saveService;
        const originalLoadServices = serviceUtils.loadServices;
        
        /**
         * تجاوز دالة حفظ الخدمات للتحقق من وجود منصة
         */
        serviceUtils.saveService = function(service) {
            // التحقق من أن الخدمة تحتوي على منصة صالحة
            if (!service.platformId) {
                Logger.error('محاولة حفظ خدمة بدون منصة:', service);
                
                // عرض تنبيه للمستخدم
                if (typeof showNotification === 'function') {
                    showNotification(
                        'خطأ في حفظ الخدمة',
                        'لا يمكن حفظ الخدمة بدون تحديد منصة',
                        'error'
                    );
                } else {
                    alert('يرجى اختيار المنصة');
                }
                
                return false; // إلغاء عملية الحفظ
            }
            
            // متابعة الحفظ إذا كانت البيانات صالحة
            return originalSaveService.call(serviceUtils, service);
        };
        
        /**
         * تجاوز دالة تحميل الخدمات للتحقق من صحة البيانات
         */
        serviceUtils.loadServices = function() {
            // استدعاء الدالة الأصلية للحصول على جميع الخدمات
            const allServices = originalLoadServices.call(serviceUtils);
            
            if (!allServices || !Array.isArray(allServices)) {
                return []; // التأكد من إرجاع مصفوفة فارغة إذا لم تكن البيانات صالحة
            }
            
            // تصفية الخدمات التي لا تحتوي على منصة صالحة
            const validServices = allServices.filter(service => !!service.platformId);
            
            // تسجيل عدد الخدمات التي تم تجاهلها
            const ignoredCount = allServices.length - validServices.length;
            if (ignoredCount > 0) {
                Logger.log(`تم تجاهل ${ignoredCount} خدمة غير صالحة (بدون منصة)`);
            }
            
            return validServices;
        };
        
        /**
         * إضافة دالة جديدة للتحقق من صحة الخدمة
         */
        serviceUtils.validateService = function(service) {
            const errors = [];
            
            // التحقق من الحقول المطلوبة
            if (!service.name || service.name.trim() === '') {
                errors.push('اسم الخدمة مطلوب');
            }
            
            if (!service.platformId) {
                errors.push('المنصة مطلوبة');
            }
            
            if (!service.price || isNaN(parseFloat(service.price))) {
                errors.push('السعر غير صالح');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        };
    });
})();
