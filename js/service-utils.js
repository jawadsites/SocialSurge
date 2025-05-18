// نظام إدارة الخدمات - Service Management System

const serviceUtils = (() => {
    // المتغيرات الخاصة
    const STORAGE_KEY = 'social_services';
    const OLD_STORAGE_KEY = 'services'; // المفتاح القديم
    let services = [];
    let isInitialized = false;

    // تهيئة النظام
    const init = () => {
        if (isInitialized) return;
        
        console.log('تهيئة نظام إدارة الخدمات...');
        
        // ترحيل البيانات القديمة قبل تحميل الخدمات
        migrateOldData();
        
        // تحميل الخدمات من التخزين المحلي
        loadServices();
        
        console.log(`تم تحميل ${services.length} خدمة من التخزين المحلي`);
        isInitialized = true;
    };

    // ترحيل البيانات القديمة من المفتاح القديم إلى المفتاح الجديد
    const migrateOldData = () => {
        try {
            // التحقق من وجود بيانات قديمة
            const oldData = localStorage.getItem(OLD_STORAGE_KEY);
            if (!oldData) {
                console.log('لا توجد بيانات قديمة للترحيل');
                return;
            }

            // التحقق من عدم وجود بيانات في المفتاح الجديد 
            // (لتجنب الكتابة فوق البيانات الموجودة)
            const newData = localStorage.getItem(STORAGE_KEY);
            if (newData && JSON.parse(newData).length > 0) {
                console.log('يوجد بالفعل بيانات في المفتاح الجديد، تم تخطي الترحيل');
                return;
            }

            // ترحيل البيانات
            const oldServices = JSON.parse(oldData);
            if (Array.isArray(oldServices) && oldServices.length > 0) {
                localStorage.setItem(STORAGE_KEY, oldData);
                console.log(`تم ترحيل ${oldServices.length} خدمة من المفتاح القديم "${OLD_STORAGE_KEY}" إلى المفتاح الجديد "${STORAGE_KEY}"`);
            } else {
                console.log('المفتاح القديم يحتوي على بيانات غير صالحة أو فارغة');
            }
        } catch (error) {
            console.error('خطأ أثناء ترحيل بيانات الخدمات القديمة:', error);
        }
    };

    // تحميل الخدمات من localStorage
    const loadServices = () => {
        try {
            const storedServices = localStorage.getItem(STORAGE_KEY);
            services = storedServices ? JSON.parse(storedServices) : [];
            return services;
        } catch (error) {
            console.error('خطأ في تحميل الخدمات:', error);
            services = [];
            return services;
        }
    };

    // حفظ الخدمات في localStorage
    const saveServices = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
            console.log(`تم حفظ ${services.length} خدمة في التخزين المحلي`);
            return true;
        } catch (error) {
            console.error('خطأ في حفظ الخدمات:', error);
            return false;
        }
    };

    // الحصول على جميع الخدمات
    const getAllServices = () => {
        return [...services];
    };

    // الحصول على الخدمات النشطة فقط
    const getActiveServices = () => {
        return services.filter(service => service.active === true);
    };

    // الحصول على الخدمات حسب المنصة
    const getServicesByPlatform = (platformId) => {
        return services.filter(service => service.platformId === platformId);
    };

    // الحصول على الخدمات النشطة المرتبطة بمنصات صالحة
    const getValidServices = () => {
        // تحميل المنصات للتحقق من صلاحية الـ platformId
        const platforms = JSON.parse(localStorage.getItem('social_platforms') || '[]');
        const platformIds = platforms.map(platform => platform.id);
        
        return services.filter(service => 
            service.active === true && 
            platformIds.includes(service.platformId)
        );
    };

    // البحث عن خدمة بواسطة المعرف
    const getServiceById = (id) => {
        return services.find(service => service.id === id);
    };

    // إضافة خدمة جديدة
    const addService = (serviceData) => {
        try {
            console.log('بيانات الخدمة المراد إضافتها:', serviceData);
            
            // التأكد من وجود معرف فريد
            const newId = serviceData.id || generateUniqueId();
            
            // التحقق من وجود البيانات الإلزامية
            if (!serviceData.name || !serviceData.platformId) {
                console.error('البيانات الإلزامية مفقودة (الاسم أو المنصة)');
                return false;
            }
            
            // التحقق من وجود منصة صالحة
            if (!isValidPlatformId(serviceData.platformId)) {
                console.error('المنصة غير صالحة أو غير موجودة:', serviceData.platformId);
                return false;
            }
            
            // إنشاء كائن الخدمة الجديدة مع القيم الافتراضية للحقول المفقودة
            const newService = {
                id: newId,
                name: serviceData.name,
                description: serviceData.description || '',
                platformId: serviceData.platformId,
                price: parseFloat(serviceData.price) || 0,
                minQuantity: parseInt(serviceData.minQuantity) || 100,
                maxQuantity: parseInt(serviceData.maxQuantity) || 10000,
                active: serviceData.active === undefined ? true : serviceData.active,
                createdAt: serviceData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // إضافة الخدمة للمصفوفة
            services.push(newService);
            
            // حفظ التغييرات
            const saved = saveServices();
            if (saved) {
                console.log('تمت إضافة الخدمة بنجاح:', newService.name);
                return newService;
            } else {
                console.error('فشل في حفظ الخدمة الجديدة');
                return false;
            }
        } catch (error) {
            console.error('خطأ أثناء إضافة خدمة جديدة:', error);
            return false;
        }
    };

    // تحديث خدمة موجودة
    const updateService = (id, serviceData) => {
        try {
            const index = services.findIndex(service => service.id === id);
            if (index === -1) {
                console.error('الخدمة غير موجودة:', id);
                return false;
            }
            
            // التحقق من وجود منصة صالحة إذا تم تغييرها
            if (serviceData.platformId && !isValidPlatformId(serviceData.platformId)) {
                console.error('المنصة غير صالحة أو غير موجودة');
                return false;
            }
            
            // تحديث الخدمة مع الاحتفاظ بالقيم القديمة إذا لم يتم توفير قيم جديدة
            services[index] = {
                ...services[index],
                ...serviceData,
                updatedAt: new Date().toISOString()
            };
            
            // حفظ التغييرات
            const saved = saveServices();
            if (saved) {
                console.log('تم تحديث الخدمة بنجاح:', services[index].name);
                return services[index];
            } else {
                console.error('فشل في حفظ تحديثات الخدمة');
                return false;
            }
        } catch (error) {
            console.error('خطأ أثناء تحديث الخدمة:', error);
            return false;
        }
    };

    // حذف خدمة
    const deleteService = (id) => {
        try {
            const index = services.findIndex(service => service.id === id);
            if (index === -1) {
                console.error('الخدمة غير موجودة:', id);
                return false;
            }
            
            // حفظ اسم الخدمة قبل الحذف للتوثيق
            const serviceName = services[index].name;
            
            // حذف الخدمة من المصفوفة
            services.splice(index, 1);
            
            // حفظ التغييرات
            const saved = saveServices();
            if (saved) {
                console.log('تم حذف الخدمة بنجاح:', serviceName);
                return true;
            } else {
                console.error('فشل في حفظ التغييرات بعد حذف الخدمة');
                return false;
            }
        } catch (error) {
            console.error('خطأ أثناء حذف الخدمة:', error);
            return false;
        }
    };

    // تفعيل أو تعطيل خدمة
    const toggleServiceStatus = (id) => {
        try {
            const index = services.findIndex(service => service.id === id);
            if (index === -1) {
                console.error('الخدمة غير موجودة:', id);
                return false;
            }
            
            // تبديل حالة التفعيل
            services[index].active = !services[index].active;
            services[index].updatedAt = new Date().toISOString();
            
            // حفظ التغييرات
            const saved = saveServices();
            if (saved) {
                console.log(`تم ${services[index].active ? 'تفعيل' : 'تعطيل'} الخدمة بنجاح:`, services[index].name);
                return services[index];
            } else {
                console.error('فشل في حفظ تغيير حالة الخدمة');
                return false;
            }
        } catch (error) {
            console.error('خطأ أثناء تغيير حالة الخدمة:', error);
            return false;
        }
    };

    // إنشاء معرف فريد
    const generateUniqueId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    // التحقق من صلاحية معرف المنصة
    const isValidPlatformId = (platformId) => {
        if (!platformId) return false;
        
        try {
            // تحميل المنصات للتحقق
            const platforms = JSON.parse(localStorage.getItem('social_platforms') || '[]');
            return platforms.some(platform => platform.id === platformId);
        } catch (error) {
            console.error('خطأ أثناء التحقق من صلاحية المنصة:', error);
            return false;
        }
    };

    // تصدير البيانات
    const exportServices = () => {
        return JSON.stringify(services, null, 2);
    };

    // استيراد البيانات
    const importServices = (jsonData) => {
        try {
            const importedServices = JSON.parse(jsonData);
            if (!Array.isArray(importedServices)) {
                console.error('البيانات المستوردة ليست مصفوفة صالحة');
                return false;
            }
            services = importedServices;
            const saved = saveServices();
            if (saved) {
                console.log(`تم استيراد ${services.length} خدمة بنجاح`);
                return true;
            } else {
                console.error('فشل في حفظ البيانات المستوردة');
                return false;
            }
        } catch (error) {
            console.error('خطأ في استيراد الخدمات:', error);
            return false;
        }
    };    // تهيئة الخدمات بالبيانات الافتراضية
    const initializeServices = () => {
        try {
            // تحقق مما إذا كانت هناك خدمات مخزنة بالفعل
            const storedServices = localStorage.getItem(STORAGE_KEY);
            
            if (!storedServices || JSON.parse(storedServices).length === 0) {
                // إذا لم تكن هناك خدمات، قم بتهيئتها بالخدمات الافتراضية
                console.log('لم يتم العثور على خدمات. إضافة الخدمات الافتراضية...');
                
                // Get default services from getDefaultServices method
                const defaultServicesList = getDefaultServices();
                
                if (defaultServicesList.length > 0) {
                    services = [...defaultServicesList];
                    saveServices();
                    console.log(`تمت إضافة ${services.length} خدمة افتراضية`);
                } else {
                    console.warn('لم يتم العثور على خدمات افتراضية لإضافتها.');
                    
                    // As a last resort, try to initialize defaultServicesInitializer
                    if (typeof defaultServicesInitializer !== 'undefined' && 
                        typeof defaultServicesInitializer.init === 'function') {
                        console.log('محاولة تهيئة defaultServicesInitializer...');
                        defaultServicesInitializer.init();
                        
                        // Try again to get services
                        const servicesAfterInit = getDefaultServices();
                        if (servicesAfterInit.length > 0) {
                            services = [...servicesAfterInit];
                            saveServices();
                            console.log(`تمت إضافة ${services.length} خدمة افتراضية بعد تهيئة defaultServicesInitializer`);
                        }
                    }
                }
            } else {
                console.log('تم العثور على خدمات مخزنة بالفعل');
                
                // Even if services exist, check if all default services are present
                const currentServices = JSON.parse(storedServices);
                const defaultServicesList = getDefaultServices();
                
                if (defaultServicesList.length > 0) {
                    // Check if any default services are missing
                    const currentServiceIds = new Set(currentServices.map(service => service.id.toString()));
                    const missingDefaultServices = defaultServicesList.filter(
                        service => !currentServiceIds.has(service.id.toString())
                    );
                    
                    // Add any missing default services
                    if (missingDefaultServices.length > 0) {
                        console.log(`Adding ${missingDefaultServices.length} missing default services...`);
                        services = [...currentServices, ...missingDefaultServices];
                        saveServices();
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('خطأ أثناء تهيئة الخدمات:', error);
            return false;
        }
    };
      // الحصول على الخدمات الافتراضية
    const getDefaultServices = () => {
        // First try to get from global defaultServices (set by defaultServicesInitializer)
        if (typeof window.defaultServices !== 'undefined' && Array.isArray(window.defaultServices)) {
            return window.defaultServices;
        }
        
        // Second, try to get from defaultServicesInitializer if available
        if (typeof defaultServicesInitializer !== 'undefined' && 
            typeof defaultServicesInitializer.generateDefaultServices === 'function') {
            return defaultServicesInitializer.generateDefaultServices();
        }
        
        // Fallback: empty array if no default services found
        return [];
    };
    
    // الواجهة العامة للوحدة
    return {
        init,
        migrateOldData,
        loadServices,
        saveServices,
        getAllServices,
        getActiveServices,
        getServicesByPlatform,
        getValidServices,
        getServiceById,
        addService,
        updateService,
        deleteService,
        toggleServiceStatus,
        exportServices,
        importServices,
        isValidPlatformId,
        initializeServices,
        getDefaultServices
    };
})();

// تصدير الوحدة للاستخدام الخارجي
if (typeof module !== 'undefined' && module.exports) {
    module.exports = serviceUtils;
}

// حدث نقل البيانات عند تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام الخدمات...');
    
    // تأخير قليل للتأكد من تحميل المكونات الأخرى
    setTimeout(() => {
        try {
            // فحص التخزين المحلي
            const storedServices = localStorage.getItem(serviceUtils.STORAGE_KEY);
            console.log('خدمات التخزين المحلي:', storedServices ? JSON.parse(storedServices).length : 0);
            
            // ترحيل البيانات من المفتاح القديم إلى المفتاح الجديد
            serviceUtils.migrateOldData();
            
            // تهيئة الخدمات بالبيانات الافتراضية إذا لم تكن موجودة
            // أو ضمان الاتساق إذا كانت موجودة بالفعل
            serviceUtils.initializeServices();
            
            // تأكد من وجود جميع الخدمات الافتراضية
            // هذا سيضمن أن جميع الخدمات الافتراضية موجودة في localStorage
            const defaultServices = serviceUtils.getDefaultServices();
            const currentServices = serviceUtils.getAllServices();
            
            // تحقق من وجود جميع الخدمات الافتراضية في القائمة الحالية
            const currentServiceIds = new Set(currentServices.map(service => service.id));
            const missingDefaultServices = defaultServices.filter(service => 
                !currentServiceIds.has(service.id)
            );
            
            // إذا كانت هناك خدمات افتراضية مفقودة، أضفها
            if (missingDefaultServices.length > 0) {
                console.log(`إضافة ${missingDefaultServices.length} خدمة افتراضية مفقودة`);
                const updatedServices = [...currentServices, ...missingDefaultServices];
                serviceUtils.saveServices(updatedServices);
            }
            
            // فحص النتيجة
            const services = serviceUtils.getAllServices();
            console.log(`بعد التهيئة: ${services.length} خدمة في النظام`);
            
            // إضافة معلومات تشخيصية
            console.log('معلومات التشخيص:');
            console.log('- مفتاح التخزين:', serviceUtils.STORAGE_KEY);
            console.log('- التخزين المحلي متاح:', typeof localStorage !== 'undefined');
            console.log('- وحدة serviceUtils جاهزة:', true);
            
            console.log('تم الانتهاء من نقل وتهيئة بيانات الخدمات');
            
            // إطلاق حدث لإخبار المكونات الأخرى بأن الخدمات جاهزة
            document.dispatchEvent(new CustomEvent('servicesReady', { 
                detail: { serviceCount: services.length }
            }));
        } catch (error) {
            console.error('حدث خطأ أثناء تهيئة نظام الخدمات:', error);
        }
    }, 300);
});