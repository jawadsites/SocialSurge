/**
 * نظام التبويب
 * يتعامل مع تبديل علامات التبويب في واجهة المستخدم
 */

/**
 * إعداد نظام التبويب
 * يضيف مستمعي الأحداث وينظم عملية تبديل التبويبات
 */
function setupTabSystem() {
    // الحصول على جميع روابط التبويب ومحتويات التبويب
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // إضافة مستمع نقر لكل رابط تبويب
    tabLinks.forEach(tabLink => {
        tabLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // الحصول على التبويب المراد تنشيطه
            const tabId = this.getAttribute('data-tab');
            
            // تغيير التبويب النشط
            changeTab(tabId, tabLinks, tabContents);
            
            // تهيئة مكونات التبويب المحدد
            initTabComponents(tabId);
        });
    });
}

/**
 * تغيير التبويب النشط
 * @param {string} tabId - معرف التبويب المراد تنشيطه
 * @param {NodeList} tabLinks - جميع روابط التبويب
 * @param {NodeList} tabContents - جميع محتويات التبويب
 */
function changeTab(tabId, tabLinks, tabContents) {
    // إزالة الفئة النشطة من جميع روابط التبويب والمحتويات
    tabLinks.forEach(link => {
        link.classList.remove('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
        link.classList.add('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
    });
    
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // إضافة الفئة النشطة إلى رابط المحتوى الحالي
    const currentTabLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
    if (currentTabLink) {
        currentTabLink.classList.add('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
        currentTabLink.classList.remove('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
    }
    
    // تنشيط التبويب المحدد
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

/**
 * تهيئة مكونات التبويب المحدد
 * @param {string} tabId - معرف التبويب النشط
 */
function initTabComponents(tabId) {
    // تأخير تنفيذ التهيئة قليلاً لضمان تحميل العناصر
    setTimeout(() => {
        // تهيئة الوحدات النمطية المحددة عند تنشيط تبويبها
        if (tabId === 'services' && typeof servicesDashboard !== 'undefined') {
            // تهيئة مكون إدارة الخدمات
            servicesDashboard.init();
        } else if (tabId === 'orders' && typeof ordersDashboard !== 'undefined') {
            // تهيئة مكون إدارة الطلبات
            ordersDashboard.init();
        } else if (tabId === 'pricing' && typeof pricingCustomizer !== 'undefined') {
            // تهيئة مكون تخصيص الأسعار
            pricingCustomizer.init();
        } else if (tabId === 'settings' && typeof settingsManager !== 'undefined') {
            // تهيئة مكون الإعدادات
            settingsManager.init();
            // عرض واجهة الإعدادات
            settingsManager.renderSettingsUI();
        }
        
        // اطلاق حدث تبديل التبويب للمكونات الأخرى
        document.dispatchEvent(new CustomEvent('tabChanged', {
            detail: { tabId: tabId }
        }));
    }, 100); // تأخير كافٍ للتأكد من جاهزية العناصر
}

// إعداد النوافذ المنبثقة
function setupModals() {
    // الحصول على جميع أزرار إغلاق النوافذ المنبثقة
    const closeButtons = document.querySelectorAll('[id$="-modal"] [id^="close-"]');
    
    // إضافة مستمع نقر لكل زر إغلاق
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // العثور على النافذة المنبثقة الأصل
            const modal = this.closest('[id$="-modal"]');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارج محتوى النافذة المنبثقة
    document.addEventListener('click', function(e) {
        document.querySelectorAll('[id$="-modal"]').forEach(modal => {
            const modalContent = modal.querySelector('.bg-white');
            if (modal && !modal.classList.contains('hidden') && modalContent && !modalContent.contains(e.target) && e.target !== modalContent) {
                // إغلاق فقط عند النقر على الطبقة المتراكبة، وليس على محتوى النافذة المنبثقة
                if (modal.contains(e.target)) {
                    modal.classList.add('hidden');
                }
            }
        });
    });
}

// تصدير الدوال لاستخدامها في الملفات الأخرى
window.setupTabSystem = setupTabSystem;
window.setupModals = setupModals;

// تهيئة النظام عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    setupTabSystem();
    setupModals();
});