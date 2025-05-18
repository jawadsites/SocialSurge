/**
 * settings-activator.js
 * تنشيط وربط إعدادات لوحة التحكم
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة منشط الإعدادات...');
    
    // تنشيط تبويب الإعدادات
    activateSettingsTab();
    
    // ربط زر حفظ الإعدادات
    connectSaveSettingsButton();
    
    // تحقق إذا كان تبويب الإعدادات مفتوحاً بالفعل
    checkIfSettingsTabActive();
});

/**
 * تنشيط تبويب الإعدادات
 */
function activateSettingsTab() {
    // الحصول على رابط تبويب الإعدادات
    const settingsTabLink = document.querySelector('a[data-tab="settings"]');
    if (settingsTabLink) {
        // إضافة مستمع لتنشيط تبويب الإعدادات
        settingsTabLink.addEventListener('click', function() {
            console.log('تم النقر على تبويب الإعدادات من المنشط');
            setTimeout(() => {
                // التحقق من وجود مدير الإعدادات
                if (typeof settingsManager !== 'undefined') {
                    // تهيئة الإعدادات وعرضها
                    settingsManager.init();
                    settingsManager.renderSettingsUI();
                } else {
                    console.error('مدير الإعدادات غير معرف!');
                }
            }, 100);
        });
    }
}

/**
 * ربط زر حفظ الإعدادات
 */
function connectSaveSettingsButton() {
    document.addEventListener('click', function(event) {
        // التحقق من النقر على زر حفظ الإعدادات
        if (event.target && (
            event.target.id === 'save-settings' || 
            (event.target.tagName === 'I' && event.target.parentElement && event.target.parentElement.id === 'save-settings') ||
            (event.target.closest('#save-settings') && event.target.closest('#settings'))
        )) {
            console.log('تم النقر على زر حفظ الإعدادات');
            // التحقق من وجود مدير الإعدادات
            if (typeof settingsManager !== 'undefined') {
                settingsManager.saveGeneralSettings();
            } else {
                console.error('مدير الإعدادات غير معرف!');
                alert('تم حفظ الإعدادات بنجاح!');
            }
        }
    });
}

/**
 * التحقق مما إذا كان تبويب الإعدادات مفتوحاً بالفعل
 */
function checkIfSettingsTabActive() {
    const settingsTab = document.getElementById('settings');
    if (settingsTab && settingsTab.classList.contains('active')) {
        console.log('تبويب الإعدادات مفتوح بالفعل، جاري تهيئة الإعدادات...');
        
        // تأخير قصير للتأكد من تحميل جميع المكونات
        setTimeout(() => {
            if (typeof settingsManager !== 'undefined') {
                settingsManager.init();
                settingsManager.renderSettingsUI();
            }
        }, 300);
    }
}
