/**
 * dashboard-connectors.js
 * يوفر وظائف لربط جميع مكونات لوحة التحكم ببعضها البعض
 */

const dashboardConnectors = {
    /**
     * تهيئة وربط جميع المكونات
     */
    init: function() {
        console.log('تهيئة موصلات لوحة التحكم...');
        
        // ربط مكونات واجهة المستخدم
        this.connectUIComponents();
        
        // ربط مدراء البيانات
        this.connectDataManagers();
        
        // ربط نظام الإشعارات
        this.connectNotificationSystem();
        
        // ربط مزامنة البيانات مع الصفحة الرئيسية
        this.connectDataSync();
        
        console.log('تم ربط جميع مكونات لوحة التحكم بنجاح');
    },

    /**
     * ربط مكونات واجهة المستخدم
     */
    connectUIComponents: function() {
        // ربط أحداث الأزرار والنماذج
        this.setupButtonActions();
        
        // ربط أحداث تبويبات لوحة التحكم
        this.setupTabEvents();
    },

    /**
     * ربط مدراء البيانات
     */
    connectDataManagers: function() {
        console.log('ربط مدراء البيانات...');
        
        // التأكد من وجود مدير الإعدادات
        if (typeof settingsManager !== 'undefined') {
            // ربط مدير الإعدادات بمدير الخدمات
            if (typeof servicesDashboard !== 'undefined') {
                console.log('ربط مدير الإعدادات بمدير الخدمات');
                this.connectServicesManager();
            }
            
            // ربط مدير الإعدادات بمدير المنصات
            if (typeof platformsDashboard !== 'undefined') {
                console.log('ربط مدير الإعدادات بمدير المنصات');
                this.connectPlatformsManager();
            }
            
            // ربط مدير الإعدادات بمدير التسعير
            if (typeof pricingCustomizer !== 'undefined') {
                console.log('ربط مدير الإعدادات بمدير التسعير');
                this.connectPricingManager();
            }
            
            // ربط مدير الإعدادات بمدير الطلبات
            if (typeof ordersDashboard !== 'undefined') {
                console.log('ربط مدير الإعدادات بمدير الطلبات');
                this.connectOrdersManager();
            }
        } else {
            console.error('مدير الإعدادات غير موجود!');
        }
    },

    /**
     * ربط مدير الخدمات
     */
    connectServicesManager: function() {
        // تسجيل مستمع أحداث لتحديثات الخدمات
        document.addEventListener('servicesUpdated', function(event) {
            console.log('تم تحديث الخدمات:', event.detail);
              // حفظ الخدمات في التخزين المحلي الموحد للمزامنة مع الصفحة الرئيسية
            if (event.detail && event.detail.services) {
                // استخدام serviceUtils إذا كان متاحًا
                if (typeof serviceUtils !== 'undefined') {
                    serviceUtils.saveServices(event.detail.services);
                } else {
                    localStorage.setItem('dashboard_services', JSON.stringify(event.detail.services));
                }
                
                // حفظ نسخة للصفحة الرئيسية أيضًا
                localStorage.setItem('services_data_for_index', JSON.stringify(event.detail.services));
            }
            
            // تحديث واجهة المستخدم إذا لزم الأمر
            if (typeof settingsManager !== 'undefined') {
                settingsManager.handleServicesUpdate(event);
            }
        });
        
        // تفعيل الوظائف في أزرار الخدمات
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', function() {
                const modal = document.getElementById('add-service-modal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
            });
        }
        
        // تفعيل زر حفظ الخدمة
        const saveServiceBtn = document.getElementById('save-service');
        if (saveServiceBtn) {
            saveServiceBtn.addEventListener('click', function() {
                if (typeof servicesDashboard !== 'undefined' && typeof servicesDashboard.saveService === 'function') {
                    servicesDashboard.saveService();
                    
                    // إغلاق النافذة المنبثقة بعد الحفظ
                    const modal = document.getElementById('add-service-modal');
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                }
            });
        }
    },

    /**
     * ربط مدير المنصات
     */
    connectPlatformsManager: function() {
        // تسجيل مستمع أحداث لتحديثات المنصات
        document.addEventListener('platformsUpdated', function(event) {
            console.log('تم تحديث المنصات:', event.detail);
            
            // حفظ المنصات في التخزين المحلي للمزامنة مع الصفحة الرئيسية
            if (event.detail && event.detail.platforms) {
                localStorage.setItem('dashboard_platforms', JSON.stringify(event.detail.platforms));
                localStorage.setItem('platforms_data_for_index', JSON.stringify(event.detail.platforms));
            }
            
            // تحديث واجهة المستخدم إذا لزم الأمر
            if (typeof settingsManager !== 'undefined') {
                settingsManager.handlePlatformsUpdate(event);
            }
        });
          // تفعيل الوظائف في أزرار المنصات - استخدم platformsDashboard مباشرة
        // وذلك لأن platformsDashboard سيقوم باستخدام platformModalManager
        const addPlatformBtn = document.getElementById('add-platform-btn');
        if (addPlatformBtn) {
            // إزالة أي مستمعي أحداث موجودين
            const newAddPlatformBtn = addPlatformBtn.cloneNode(true);
            addPlatformBtn.parentNode.replaceChild(newAddPlatformBtn, addPlatformBtn);
            
            // إضافة مستمع جديد
            newAddPlatformBtn.addEventListener('click', function() {
                if (typeof platformsDashboard !== 'undefined' && typeof platformsDashboard.handleAddPlatform === 'function') {
                    platformsDashboard.handleAddPlatform();
                } else {
                    // احتياطي
                    const modal = document.getElementById('add-platform-modal');
                    if (modal) modal.classList.remove('hidden');
                }
            });
        }
        
        // تفعيل زر حفظ المنصة - استخدم platformModalManager مباشرة
        const savePlatformBtn = document.getElementById('save-platform');
        if (savePlatformBtn) {
            // إزالة أي مستمعي أحداث موجودين
            const newSavePlatformBtn = savePlatformBtn.cloneNode(true);
            savePlatformBtn.parentNode.replaceChild(newSavePlatformBtn, savePlatformBtn);
            
            // إضافة مستمع جديد
            newSavePlatformBtn.addEventListener('click', function() {
                if (typeof platformModalManager !== 'undefined' && typeof platformModalManager.handleFormSubmit === 'function') {
                    platformModalManager.handleFormSubmit();
                } else if (typeof platformsDashboard !== 'undefined' && typeof platformsDashboard.savePlatform === 'function') {
                    platformsDashboard.savePlatform();
                }
            });
        }
        
        // تفعيل زر إلغاء المنصة
        const cancelPlatformBtn = document.getElementById('cancel-platform');
        if (cancelPlatformBtn) {
            // إزالة أي مستمعي أحداث موجودين
            const newCancelPlatformBtn = cancelPlatformBtn.cloneNode(true);
            cancelPlatformBtn.parentNode.replaceChild(newCancelPlatformBtn, cancelPlatformBtn);
            
            // إضافة مستمع جديد
            newCancelPlatformBtn.addEventListener('click', function() {
                if (typeof platformModalManager !== 'undefined' && typeof platformModalManager.hideModal === 'function') {
                    platformModalManager.hideModal();
                } else {
                    const modal = document.getElementById('add-platform-modal');
                    if (modal) modal.classList.add('hidden');
                }
            });
        }
        
        // تفعيل زر إغلاق المنصة
        const closePlatformBtn = document.getElementById('close-platform-modal');
        if (closePlatformBtn) {
            // إزالة أي مستمعي أحداث موجودين
            const newClosePlatformBtn = closePlatformBtn.cloneNode(true);
            closePlatformBtn.parentNode.replaceChild(newClosePlatformBtn, closePlatformBtn);
            
            // إضافة مستمع جديد
            newClosePlatformBtn.addEventListener('click', function() {
                if (typeof platformModalManager !== 'undefined' && typeof platformModalManager.hideModal === 'function') {
                    platformModalManager.hideModal();
                } else {
                    const modal = document.getElementById('add-platform-modal');
                    if (modal) modal.classList.add('hidden');
                }
            });
        }
    },

    /**
     * ربط مدير التسعير
     */
    connectPricingManager: function() {
        // تسجيل مستمع أحداث لتحديثات التسعير
        document.addEventListener('pricingUpdated', function(event) {
            console.log('تم تحديث التسعير:', event.detail);
            
            // حفظ التسعير في التخزين المحلي للمزامنة مع الصفحة الرئيسية
            if (event.detail && event.detail.pricing) {
                localStorage.setItem('dashboard_pricing', JSON.stringify(event.detail.pricing));
                localStorage.setItem('pricing_data_for_index', JSON.stringify(event.detail.pricing));
            }
            
            // تحديث واجهة المستخدم إذا لزم الأمر
            if (typeof settingsManager !== 'undefined') {
                settingsManager.handlePricingUpdate(event);
            }
        });
        
        // تفعيل زر إضافة مستوى سعر جديد
        const addPriceTierBtn = document.getElementById('add-price-tier-btn');
        if (addPriceTierBtn) {
            addPriceTierBtn.addEventListener('click', function() {
                if (typeof pricingCustomizer !== 'undefined' && typeof pricingCustomizer.addPriceTier === 'function') {
                    pricingCustomizer.addPriceTier();
                }
            });
        }
    },

    /**
     * ربط مدير الطلبات
     */
    connectOrdersManager: function() {
        // تسجيل مستمع أحداث لتحديثات الطلبات
        document.addEventListener('ordersUpdated', function(event) {
            console.log('تم تحديث الطلبات:', event.detail);
            
            // حفظ الطلبات في التخزين المحلي
            if (event.detail && event.detail.orders) {
                localStorage.setItem('dashboard_orders', JSON.stringify(event.detail.orders));
            }
            
            // تحديث واجهة المستخدم إذا لزم الأمر
            // يمكن إضافة وظائف لتحديث عناصر واجهة المستخدم هنا
        });
    },

    /**
     * ربط نظام الإشعارات
     */
    connectNotificationSystem: function() {
        // التحقق من وجود مساعد الإشعارات
        if (typeof notificationHelper !== 'undefined') {
            console.log('ربط نظام الإشعارات...');
            
            // إنشاء مستمع حدث للإشعارات
            document.addEventListener('showNotification', function(event) {
                if (event.detail) {
                    notificationHelper.show(event.detail.message, event.detail.type);
                }
            });
            
            // تعيين إعدادات الإشعارات من مدير الإعدادات
            if (typeof settingsManager !== 'undefined') {
                const notificationSettings = settingsManager.getGeneralSettings();
                if (notificationSettings && notificationSettings.enableNotifications !== undefined) {
                    notificationHelper.setEnabled(notificationSettings.enableNotifications);
                }
            }
        }
    },

    /**
     * ربط مزامنة البيانات مع الصفحة الرئيسية
     */
    connectDataSync: function() {
        console.log('ربط مزامنة البيانات مع الصفحة الرئيسية...');
        
        // تسجيل مستمع أحداث للمزامنة
        document.addEventListener('syncWithHomePage', function(event) {
            console.log('طلب مزامنة البيانات مع الصفحة الرئيسية:', event.detail);
              // مزامنة الخدمات باستخدام وحدة الخدمات الموحدة
            if (typeof serviceUtils !== 'undefined') {
                // الخدمات الآن موحدة في مفتاح تخزين واحد
                const services = serviceUtils.getAllServices();
                if (services && services.length > 0) {
                    localStorage.setItem('services_data_for_index', JSON.stringify(services));
                    console.log('تم مزامنة الخدمات من المفتاح الموحد');
                }
            } else {
                // الحل البديل: استخدام مفتاح التخزين القديم
                const services = localStorage.getItem('dashboard_services');
                if (services) {
                    localStorage.setItem('services_data_for_index', services);
                }
            }
            
            // مزامنة المنصات باستخدام الوحدة الموحدة
            if (typeof platformUtils !== 'undefined') {
                // المنصات الآن موحدة في مفتاح تخزين واحد، لم يعد هناك حاجة للمزامنة
                console.log('المنصات موحدة بالفعل، لا حاجة للمزامنة');
            }
            
            // مزامنة التسعير
            const pricing = localStorage.getItem('dashboard_pricing');
            if (pricing) {
                localStorage.setItem('pricing_data_for_index', pricing);
            }
            
            // إظهار إشعار بنجاح المزامنة
            if (typeof notificationHelper !== 'undefined') {
                notificationHelper.show('تمت مزامنة البيانات مع الصفحة الرئيسية بنجاح.', 'success');
            }
        });
    },

    /**
     * إعداد إجراءات الأزرار
     */
    setupButtonActions: function() {
        // حفظ التغييرات في الإعدادات
        const saveSettingsBtn = document.querySelector('#settings button[class*="bg-blue-600"]');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', function() {
                if (typeof settingsManager !== 'undefined') {
                    settingsManager.saveSettings();
                }
            });
        }
        
        // زر تحديث لوحة المعلومات (تم إزالته من واجهة المستخدم ولكن نترك الكود للتوافق مع النظام)
        const refreshDashboardBtn = document.getElementById('refresh-dashboard');
        if (refreshDashboardBtn) {
            refreshDashboardBtn.addEventListener('click', function() {
                if (typeof socialDashboard !== 'undefined') {
                    socialDashboard.refreshDashboard();
                }
            });
        }
        
        // أزرار الإجراءات الأخرى يمكن إضافتها هنا
    },

    /**
     * إعداد أحداث التبويبات
     */
    setupTabEvents: function() {
        // ربط تبويب الإعدادات
        this.connectSettingsTab();
        
        // أحداث التبويبات الأخرى
    },

    /**
     * ربط تبويب الإعدادات
     */
    connectSettingsTab: function() {
        const settingsTabLink = document.querySelector('a[data-tab="settings"]');
        if (settingsTabLink) {
            settingsTabLink.addEventListener('click', () => {
                console.log('تم النقر على تبويب الإعدادات');
                if (typeof settingsManager !== 'undefined') {
                    setTimeout(() => {
                        settingsManager.renderSettingsUI();
                    }, 100);
                }
            });
        }
        
        // ربط زر حفظ الإعدادات
        document.addEventListener('click', (e) => {
            if (e.target && (e.target.id === 'save-settings' || (e.target.closest('button') && e.target.closest('button').id === 'save-settings'))) {
                console.log('تم النقر على زر حفظ الإعدادات (من dashboard-connectors)');
                if (typeof settingsManager !== 'undefined') {
                    settingsManager.saveGeneralSettings();
                }
            }
        });
    },

    /**
     * إعداد أحداث التبويبات
     */
    setupTabEvents: function() {
        // الاستماع لتغييرات التبويب لتحميل المحتوى المناسب
        document.addEventListener('tabChanged', function(event) {
            if (event.detail && event.detail.tabId) {
                const tabId = event.detail.tabId;
                
                // إذا كان التبويب هو الإعدادات، قم بتهيئة واجهة الإعدادات
                if (tabId === 'settings' && typeof settingsManager !== 'undefined') {
                    settingsManager.renderSettingsUI();
                }
                
                // إذا كان التبويب هو الخدمات، قم بتحديث قائمة الخدمات
                if (tabId === 'services' && typeof servicesDashboard !== 'undefined') {
                    servicesDashboard.refreshServicesList();
                }
                
                // إذا كان التبويب هو المنصات، قم بتحديث قائمة المنصات
                if (tabId === 'platforms' && typeof platformsDashboard !== 'undefined') {
                    platformsDashboard.refreshPlatformsList();
                }
                
                // إذا كان التبويب هو التسعير، قم بتحديث واجهة التسعير
                if (tabId === 'pricing' && typeof pricingCustomizer !== 'undefined') {
                    pricingCustomizer.refreshPricingUI();
                }
                
                // إذا كان التبويب هو الطلبات، قم بتحديث قائمة الطلبات
                if (tabId === 'orders' && typeof ordersDashboard !== 'undefined') {
                    ordersDashboard.refreshOrdersList();
                }
            }
        });
    }
};

// تهيئة موصلات لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    dashboardConnectors.init();
});