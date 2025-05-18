/**
 * PlatformServiceManager - نظام موحد لإدارة المنصات وخدمات التواصل الاجتماعي
 * يدير عملية تخزين واسترجاع وربط وتحديث المنصات والخدمات في localStorage
 * ويضمن الربط الصحيح بين platformId في الخدمات والمنصات المتاحة
 */
const PlatformServiceManager = {
    // مفاتيح التخزين في localStorage
    PLATFORMS_KEY: 'social_platforms',
    SERVICES_KEY: 'social_services',
    
    // قائمة بالمفاتيح القديمة التي يجب تنظيفها
    LEGACY_KEYS: [
        'services_data',
        'unified_platforms',
        'unified_services',
        'social_services_backup',
        'services_data_for_index',
        'default_services_initialized'
    ],
    
    /**
     * تنظيف المفاتيح القديمة من localStorage
     */
    cleanLegacyKeys() {
        console.log("تنظيف المفاتيح القديمة من localStorage...");
        this.LEGACY_KEYS.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`تم حذف المفتاح القديم: ${key}`);
            }
        });
    },
    
    /**
     * تحميل جميع المنصات من التخزين المحلي
     * @returns {Array} مصفوفة المنصات
     */
    loadPlatforms() {
        try {
            const platformsData = localStorage.getItem(this.PLATFORMS_KEY);
            if (!platformsData) {
                return [];
            }
            return JSON.parse(platformsData);
        } catch (error) {
            console.error("خطأ في تحميل المنصات:", error);
            return [];
        }
    },
    
    /**
     * تحميل جميع الخدمات من التخزين المحلي
     * @returns {Array} مصفوفة الخدمات
     */
    loadServices() {
        try {
            const servicesData = localStorage.getItem(this.SERVICES_KEY);
            if (!servicesData) {
                return [];
            }
            return JSON.parse(servicesData);
        } catch (error) {
            console.error("خطأ في تحميل الخدمات:", error);
            return [];
        }
    },
    
    /**
     * حفظ المنصات في التخزين المحلي
     * @param {Array} platforms - مصفوفة المنصات
     * @returns {boolean} نجاح العملية
     */
    savePlatforms(platforms) {
        try {
            localStorage.setItem(this.PLATFORMS_KEY, JSON.stringify(platforms));
            this.notifyDataUpdated();
            return true;
        } catch (error) {
            console.error("خطأ في حفظ المنصات:", error);
            return false;
        }
    },
    
    /**
     * حفظ الخدمات في التخزين المحلي
     * @param {Array} services - مصفوفة الخدمات
     * @returns {boolean} نجاح العملية
     */
    saveServices(services) {
        try {
            localStorage.setItem(this.SERVICES_KEY, JSON.stringify(services));
            this.notifyDataUpdated();
            return true;
        } catch (error) {
            console.error("خطأ في حفظ الخدمات:", error);
            return false;
        }
    },
    
    /**
     * إنشاء حدث تحديث البيانات
     */
    notifyDataUpdated() {
        document.dispatchEvent(new CustomEvent('platformServiceDataUpdated'));
    },
    
    /**
     * تحميل البيانات وتنظيفها
     * يقوم بحذف الخدمات التي ليس لها platformId أو المرتبطة بمنصة غير موجودة
     */
    loadAndClean() {
        // تحميل المنصات
        const platforms = this.loadPlatforms();
        
        // إنشاء مجموعة من معرفات المنصات للبحث السريع
        const platformIds = new Set(platforms.map(platform => platform.id));
        
        // تحميل الخدمات
        let services = this.loadServices();
        
        // حساب عدد الخدمات قبل التنظيف
        const initialCount = services.length;
        
        // تصفية الخدمات بناء على وجود platformId صالح
        services = services.filter(service => {
            // التأكد من وجود platformId
            if (!service.platformId) {
                console.log(`حذف الخدمة ${service.id || 'غير معروفة'} لعدم وجود platformId`);
                return false;
            }
            
            // التأكد من وجود المنصة المرتبطة في قائمة المنصات
            if (!platformIds.has(service.platformId)) {
                console.log(`حذف الخدمة ${service.id || 'غير معروفة'} لأن المنصة ${service.platformId} غير موجودة`);
                return false;
            }
            
            return true;
        });
        
        // حساب عدد الخدمات المحذوفة
        const removedCount = initialCount - services.length;
        if (removedCount > 0) {
            console.log(`تم حذف ${removedCount} خدمة غير صالحة`);
            
            // حفظ الخدمات المنقحة
            this.saveServices(services);
        }
    },
    
    /**
     * إضافة منصة جديدة
     * @param {Object} platform - كائن المنصة
     * @returns {boolean} نجاح العملية
     */
    addPlatform(platform) {
        if (!platform || !platform.id || !platform.name) {
            console.error("بيانات المنصة غير كاملة");
            return false;
        }
        
        const platforms = this.loadPlatforms();
        
        // التحقق من عدم وجود منصة بنفس المعرف
        if (platforms.some(p => p.id === platform.id)) {
            console.error(`المنصة بالمعرف ${platform.id} موجودة بالفعل`);
            return false;
        }
        
        // إضافة تاريخ الإنشاء
        if (!platform.createdAt) {
            platform.createdAt = new Date().toISOString();
        }
        
        // التأكد من تعيين حالة النشاط
        if (platform.active === undefined) {
            platform.active = true;
        }
        
        // إضافة المنصة إلى المصفوفة
        platforms.push(platform);
        
        // حفظ المنصات
        return this.savePlatforms(platforms);
    },
    
    /**
     * تحديث منصة موجودة
     * @param {Object} platform - كائن المنصة المحدثة
     * @returns {boolean} نجاح العملية
     */
    updatePlatform(platform) {
        if (!platform || !platform.id) {
            console.error("معرف المنصة مطلوب للتحديث");
            return false;
        }
        
        const platforms = this.loadPlatforms();
        
        // البحث عن المنصة
        const index = platforms.findIndex(p => p.id === platform.id);
        if (index === -1) {
            console.error(`المنصة بالمعرف ${platform.id} غير موجودة`);
            return false;
        }
        
        // تحديث المنصة
        platforms[index] = { ...platforms[index], ...platform };
        
        // حفظ المنصات
        return this.savePlatforms(platforms);
    },
    
    /**
     * حذف منصة وجميع خدماتها المرتبطة
     * @param {string} platformId - معرف المنصة
     * @returns {boolean} نجاح العملية
     */
    deletePlatform(platformId) {
        if (!platformId) {
            console.error("معرف المنصة مطلوب للحذف");
            return false;
        }
        
        // حذف المنصة
        const platforms = this.loadPlatforms();
        const updatedPlatforms = platforms.filter(p => p.id !== platformId);
        
        // حذف الخدمات المرتبطة
        const services = this.loadServices();
        const updatedServices = services.filter(s => s.platformId !== platformId);
        
        // حساب عدد العناصر المحذوفة
        const removedPlatforms = platforms.length - updatedPlatforms.length;
        const removedServices = services.length - updatedServices.length;
        
        // حفظ البيانات المحدثة
        const platformsSaved = this.savePlatforms(updatedPlatforms);
        const servicesSaved = this.saveServices(updatedServices);
        
        console.log(`تم حذف ${removedPlatforms} منصة و ${removedServices} خدمة مرتبطة`);
        
        return platformsSaved && servicesSaved;
    },
    
    /**
     * إضافة خدمة جديدة
     * @param {Object} service - كائن الخدمة
     * @returns {boolean} نجاح العملية
     */
    addService(service) {
        if (!service || !service.name) {
            console.error("اسم الخدمة مطلوب");
            return false;
        }
        
        // التحقق من وجود platformId
        if (!service.platformId) {
            console.error("الرجاء اختيار منصة");
            return false;
        }
        
        // التحقق من وجود المنصة المختارة
        const platforms = this.loadPlatforms();
        if (!platforms.some(p => p.id === service.platformId)) {
            console.error(`المنصة بالمعرف ${service.platformId} غير موجودة`);
            return false;
        }
        
        const services = this.loadServices();
        
        // إنشاء معرف فريد للخدمة إذا لم يكن موجودًا
        if (!service.id) {
            service.id = `service-${new Date().getTime()}`;
        }
        
        // التحقق من عدم وجود خدمة بنفس المعرف
        if (services.some(s => s.id === service.id)) {
            console.error(`الخدمة بالمعرف ${service.id} موجودة بالفعل`);
            return false;
        }
        
        // إضافة تاريخ الإنشاء
        if (!service.createdAt) {
            service.createdAt = new Date().toISOString();
        }
        
        // التأكد من تعيين حالة النشاط
        if (service.active === undefined) {
            service.active = true;
        }
        
        // إضافة الخدمة إلى المصفوفة
        services.push(service);
        
        // حفظ الخدمات
        return this.saveServices(services);
    },
    
    /**
     * تحديث خدمة موجودة
     * @param {Object} service - كائن الخدمة المحدثة
     * @returns {boolean} نجاح العملية
     */
    updateService(service) {
        if (!service || !service.id) {
            console.error("معرف الخدمة مطلوب للتحديث");
            return false;
        }
        
        // التحقق من وجود platformId
        if (!service.platformId) {
            console.error("الرجاء اختيار منصة");
            return false;
        }
        
        // التحقق من وجود المنصة المختارة
        const platforms = this.loadPlatforms();
        if (!platforms.some(p => p.id === service.platformId)) {
            console.error(`المنصة بالمعرف ${service.platformId} غير موجودة`);
            return false;
        }
        
        const services = this.loadServices();
        
        // البحث عن الخدمة
        const index = services.findIndex(s => s.id === service.id);
        if (index === -1) {
            console.error(`الخدمة بالمعرف ${service.id} غير موجودة`);
            return false;
        }
        
        // تحديث الخدمة
        services[index] = { ...services[index], ...service };
        
        // حفظ الخدمات
        return this.saveServices(services);
    },
    
    /**
     * حذف خدمة
     * @param {string} serviceId - معرف الخدمة
     * @returns {boolean} نجاح العملية
     */
    deleteService(serviceId) {
        if (!serviceId) {
            console.error("معرف الخدمة مطلوب للحذف");
            return false;
        }
        
        const services = this.loadServices();
        const updatedServices = services.filter(s => s.id !== serviceId);
        
        // حفظ الخدمات
        return this.saveServices(updatedServices);
    },
    
    /**
     * الحصول على المنصات النشطة فقط للعرض
     * @returns {Array} المنصات النشطة
     */
    getDisplayPlatforms() {
        const platforms = this.loadPlatforms();
        return platforms.filter(platform => platform.active === true);
    },
    
    /**
     * الحصول على الخدمات المرتبطة بمنصة معينة للعرض
     * @param {string} platformId - معرف المنصة
     * @returns {Array} الخدمات المرتبطة بالمنصة
     */
    getPlatformServices(platformId) {
        if (!platformId) {
            return [];
        }
        
        const services = this.loadServices();
        return services.filter(service => 
            service.platformId === platformId && 
            service.active === true
        );
    },
    
    /**
     * الحصول على جميع الخدمات النشطة التي لها منصات نشطة للعرض
     * @returns {Array} الخدمات النشطة المرتبطة بمنصات نشطة
     */
    getDisplayServices() {
        const services = this.loadServices();
        const platforms = this.loadPlatforms();
        
        // إنشاء مجموعة من معرفات المنصات النشطة
        const activePlatformIds = new Set(
            platforms
                .filter(platform => platform.active === true)
                .map(platform => platform.id)
        );
        
        // تصفية الخدمات بناءً على نشاطها وارتباطها بمنصة نشطة
        return services.filter(service => 
            service.active === true && 
            activePlatformIds.has(service.platformId)
        );
    },
    
    /**
     * الحصول على منصة بواسطة المعرف
     * @param {string} platformId - معرف المنصة
     * @returns {Object|null} كائن المنصة أو null إذا لم توجد
     */
    getPlatformById(platformId) {
        if (!platformId) {
            return null;
        }
        
        const platforms = this.loadPlatforms();
        return platforms.find(platform => platform.id === platformId) || null;
    },
    
    /**
     * الحصول على خدمة بواسطة المعرف
     * @param {string} serviceId - معرف الخدمة
     * @returns {Object|null} كائن الخدمة أو null إذا لم توجد
     */
    getServiceById(serviceId) {
        if (!serviceId) {
            return null;
        }
        
        const services = this.loadServices();
        return services.find(service => service.id === serviceId) || null;
    },
    
    /**
     * تهيئة النظام بمنصات وخدمات افتراضية إذا كانت غير موجودة
     */
    initializeDefaults() {
        const platforms = this.loadPlatforms();
        const services = this.loadServices();
        
        // إضافة منصات افتراضية إذا لم تكن هناك منصات
        if (platforms.length === 0) {
            const defaultPlatforms = [
                {
                    id: 'instagram',
                    name: 'انستغرام',
                    icon: 'instagram',
                    color: '#E1306C',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'facebook',
                    name: 'فيسبوك',
                    icon: 'facebook',
                    color: '#1877F2',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'twitter',
                    name: 'تويتر',
                    icon: 'twitter',
                    color: '#1DA1F2',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'youtube',
                    name: 'يوتيوب',
                    icon: 'youtube',
                    color: '#FF0000',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'tiktok',
                    name: 'تيك توك',
                    icon: 'tiktok',
                    color: '#000000',
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.savePlatforms(defaultPlatforms);
            console.log("تمت إضافة المنصات الافتراضية");
        }
        
        // إضافة خدمات افتراضية إذا لم تكن هناك خدمات
        if (services.length === 0 && platforms.length > 0) {
            const defaultServices = [
                {
                    id: 'service-1',
                    name: 'متابعين انستغرام',
                    description: 'زيادة عدد المتابعين لحسابك على انستغرام',
                    platformId: 'instagram',
                    price: 5,
                    minQuantity: 100,
                    maxQuantity: 10000,
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'service-2',
                    name: 'لايكات فيسبوك',
                    description: 'زيادة عدد الإعجابات على منشوراتك في فيسبوك',
                    platformId: 'facebook',
                    price: 3,
                    minQuantity: 200,
                    maxQuantity: 20000,
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'service-3',
                    name: 'مشاهدات يوتيوب',
                    description: 'زيادة عدد المشاهدات لفيديوهاتك على يوتيوب',
                    platformId: 'youtube',
                    price: 8,
                    minQuantity: 500,
                    maxQuantity: 50000,
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.saveServices(defaultServices);
            console.log("تمت إضافة الخدمات الافتراضية");
        }
    }
};

// تصدير الكائن للاستخدام العالمي
window.PlatformServiceManager = PlatformServiceManager;