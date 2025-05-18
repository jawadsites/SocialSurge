/**
 * إصلاح أخطاء التاريخ في التطبيق
 * 
 * هذا الملف يحتوي على إصلاحات لأخطاء Date.now()
 */

// التأكد من أن Date.now() تعمل بشكل صحيح
(function() {
    if (typeof Date.now !== 'function') {
        Date.now = function now() {
            return new Date().getTime();
        };
    }
    
    // إصلاح خطأ محتمل في استخدام Date now()
    const originalDateConstructor = Date;
    
    if (window.fixDateNowError) {
        return; // تم إصلاح الخطأ بالفعل
    }
    
    window.fixDateNowError = true;
    
    // الاستماع للأخطاء واعتراض أخطاء الصياغة
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message && event.error.message.includes("Unexpected identifier 'now'")) {
            console.warn("Caught 'Date now()' syntax error. Use Date.now() instead.");
        }
    });
})();
