/**
 * نظام إدارة المنصات والخدمات الموحد
 * @version 2.0.0
 */
window.UnifiedPlatformServiceManager = (function() {
    // مفاتيح التخزين المحلي
    const STORAGE_KEYS = {
        PLATFORMS: 'social_platforms',
        SERVICES: 'social_services',
        CONFIG: 'platform_service_config'
    };

    // معرفات افتراضية
    let nextPlatformId = 1;
    let nextServiceId = 1;

    /**
     * تحميل المنصات من التخزين المحلي
     * @returns {Array} مصفوفة المنصات
     */
    function loadPlatforms() {
        try {
            console.log("تحميل المنصات من التخزين المحلي...");
            const platformsData = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
            let platforms = [];
            
            if (platformsData) {
                platforms = JSON.parse(platformsData);
                console.log(`تم تحميل ${platforms.length} منصة من التخزين المحلي`);
                
                // تحديث المعرف التالي
                const maxId = Math.max(...platforms.map(p => {
                    const numId = parseInt(p.id.toString().replace('platform-', ''));
                    return isNaN(numId) ? 0 : numId;
                }), 0);
                
                nextPlatformId = maxId + 1;
            } else {
                console.log("لم يتم العثور على منصات في التخزين المحلي");
                platforms = createDefaultPlatforms();
                savePlatforms(platforms);
            }
            
            return platforms;
        } catch (error) {
            console.error("خطأ في تحميل المنصات:", error);
            // إنشاء منصات افتراضية في حالة الخطأ
            const defaultPlatforms = createDefaultPlatforms();
            savePlatforms(defaultPlatforms);
            return defaultPlatforms;
        }
    }

    /**
     * تحميل الخدمات من التخزين المحلي
     * @returns {Array} مصفوفة الخدمات
     */
    function loadServices() {
        try {
            console.log("تحميل الخدمات من التخزين المحلي...");
            const servicesData = localStorage.getItem(STORAGE_KEYS.SERVICES);
            let services = [];
            
            if (servicesData) {
                services = JSON.parse(servicesData);
                console.log(`تم تحميل ${services.length} خدمة من التخزين المحلي`);
                
                // تحديث المعرف التالي
                const maxId = Math.max(...services.map(s => {
                    const numId = parseInt(s.id.toString().replace('service-', ''));
                    return isNaN(numId) ? 0 : numId;
                }), 0);
                
                nextServiceId = maxId + 1;
            } else {
                console.log("لم يتم العثور على خدمات في التخزين المحلي");
                // إنشاء خدمات افتراضية
                const platforms = loadPlatforms();
                services = createDefaultServices(platforms);
                saveServices(services);
            }
            
            return services;
        } catch (error) {
            console.error("خطأ في تحميل الخدمات:", error);
            // إنشاء خدمات افتراضية في حالة الخطأ
            const platforms = loadPlatforms();
            const defaultServices = createDefaultServices(platforms);
            saveServices(defaultServices);
            return defaultServices;
        }
    }

    /**
     * حفظ المنصات في التخزين المحلي
     * @param {Array} platforms مصفوفة المنصات
     */
    function savePlatforms(platforms) {
        try {
            localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms));
            console.log(`تم حفظ ${platforms.length} منصة في التخزين المحلي`);
            // إطلاق حدث تحديث البيانات
            dispatchDataUpdateEvent('platforms');
        } catch (error) {
            console.error("خطأ في حفظ المنصات:", error);
        }
    }

    /**
     * حفظ الخدمات في التخزين المحلي
     * @param {Array} services مصفوفة الخدمات
     */
    function saveServices(services) {
        try {
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
            console.log(`تم حفظ ${services.length} خدمة في التخزين المحلي`);
            // إطلاق حدث تحديث البيانات
            dispatchDataUpdateEvent('services');
        } catch (error) {
            console.error("خطأ في حفظ الخدمات:", error);
        }
    }

    /**
     * إطلاق حدث تحديث البيانات
     * @param {string} dataType نوع البيانات (platforms, services)
     */
    function dispatchDataUpdateEvent(dataType) {
        const event = new CustomEvent('platformServiceDataUpdated', {
            detail: { type: dataType, timestamp: new Date().getTime() }
        });
        document.dispatchEvent(event);
    }

    /**
     * الحصول على جميع المنصات
     * @returns {Array} مصفوفة المنصات
     */
    function getAllPlatforms() {
        return loadPlatforms();
    }

    /**
     * الحصول على جميع الخدمات
     * @returns {Array} مصفوفة الخدمات
     */
    function getAllServices() {
        return loadServices();
    }

    /**
     * إضافة منصة جديدة
     * @param {Object} platformData بيانات المنصة
     * @returns {boolean} نجاح العملية
     */
    function addPlatform(platformData) {
        if (!platformData || typeof platformData !== 'object') {
            console.error("بيانات المنصة غير صحيحة");
            return false;
        }

        try {
            const platforms = loadPlatforms();
            
            // التحقق من عدم وجود منصة بنفس الاسم
            if (platforms.some(p => p.name.toLowerCase() === platformData.name.toLowerCase())) {
                console.error(`منصة بنفس الاسم موجودة بالفعل: ${platformData.name}`);
                return false;
            }
            
            // إنشاء معرف جديد
            const newId = `platform-${nextPlatformId++}`;
            
            // إنشاء كائن المنصة الجديد
            const newPlatform = {
                id: newId,
                name: platformData.name,
                slug: platformData.slug || platformData.name.toLowerCase().replace(/\s+/g, '-'),
                description: platformData.description || null,
                icon: platformData.icon || 'globe',
                color: platformData.color || '#3b82f6',
                website: platformData.website || null,
                type: platformData.type || 'social',
                active: platformData.active !== false,
                createdAt: new Date().toISOString()
            };
            
            // إضافة المنصة إلى المصفوفة وحفظها
            platforms.push(newPlatform);
            savePlatforms(platforms);
            
            console.log(`تمت إضافة منصة جديدة بنجاح: ${newPlatform.name} (${newId})`);
            return true;
        } catch (error) {
            console.error("خطأ في إضافة المنصة:", error);
            return false;
        }
    }

    /**
     * تحديث منصة موجودة
     * @param {string} platformId معرف المنصة
     * @param {Object} platformData بيانات المنصة الجديدة
     * @returns {boolean} نجاح العملية
     */
    function updatePlatform(platformId, platformData) {
        if (!platformId || !platformData || typeof platformData !== 'object') {
            console.error("معرف المنصة أو البيانات غير صحيحة");
            return false;
        }

        try {
            const platforms = loadPlatforms();
            const platformIndex = platforms.findIndex(p => p.id === platformId);
            
            if (platformIndex === -1) {
                console.error(`لم يتم العثور على منصة بهذا المعرف: ${platformId}`);
                return false;
            }
            
            // تحديث بيانات المنصة
            const updatedPlatform = {
                ...platforms[platformIndex],
                name: platformData.name || platforms[platformIndex].name,
                slug: platformData.slug || platforms[platformIndex].slug,
                description: platformData.description !== undefined ? platformData.description : platforms[platformIndex].description,
                icon: platformData.icon || platforms[platformIndex].icon,
                color: platformData.color || platforms[platformIndex].color,
                website: platformData.website !== undefined ? platformData.website : platforms[platformIndex].website,
                type: platformData.type || platforms[platformIndex].type,
                active: platformData.active !== undefined ? platformData.active : platforms[platformIndex].active,
                updatedAt: new Date().toISOString()
            };
            
            // تحديث المنصة في المصفوفة وحفظها
            platforms[platformIndex] = updatedPlatform;
            savePlatforms(platforms);
            
            console.log(`تم تحديث المنصة بنجاح: ${updatedPlatform.name} (${platformId})`);
            return true;
        } catch (error) {
            console.error("خطأ في تحديث المنصة:", error);
            return false;
        }
    }

    /**
     * حذف منصة
     * @param {string} platformId معرف المنصة
     * @returns {boolean} نجاح العملية
     */
    function deletePlatform(platformId) {
        if (!platformId) {
            console.error("معرف المنصة غير صحيح");
            return false;
        }

        try {
            const platforms = loadPlatforms();
            const platformIndex = platforms.findIndex(p => p.id === platformId);
            
            if (platformIndex === -1) {
                console.error(`لم يتم العثور على منصة بهذا المعرف: ${platformId}`);
                return false;
            }
            
            // حذف المنصة من المصفوفة
            const deletedPlatform = platforms.splice(platformIndex, 1)[0];
            savePlatforms(platforms);
            
            // حذف الخدمات المرتبطة بالمنصة
            const services = loadServices();
            const updatedServices = services.filter(service => service.platformId !== platformId);
            
            if (updatedServices.length < services.length) {
                saveServices(updatedServices);
                console.log(`تم حذف ${services.length - updatedServices.length} خدمة مرتبطة بالمنصة`);
            }
            
            console.log(`تم حذف المنصة بنجاح: ${deletedPlatform.name} (${platformId})`);
            return true;
        } catch (error) {
            console.error("خطأ في حذف المنصة:", error);
            return false;
        }
    }

    /**
     * إضافة خدمة جديدة
     * @param {Object} serviceData بيانات الخدمة
     * @returns {boolean} نجاح العملية
     */
    function addService(serviceData) {
        if (!serviceData || typeof serviceData !== 'object') {
            console.error("بيانات الخدمة غير صحيحة");
            return false;
        }

        try {
            const services = loadServices();
            
            // التحقق من صحة المنصة
            const platforms = loadPlatforms();
            if (!serviceData.platformId || !platforms.some(p => p.id === serviceData.platformId)) {
                console.error(`معرف المنصة غير صحيح: ${serviceData.platformId}`);
                return false;
            }
            
            // إنشاء معرف جديد
            const newId = `service-${nextServiceId++}`;
            
            // إنشاء كائن الخدمة الجديدة
            const newService = {
                id: newId,
                name: serviceData.name,
                description: serviceData.description || '',
                platformId: serviceData.platformId,
                price: parseFloat(serviceData.price) || 0,
                minQuantity: parseInt(serviceData.minQuantity) || 100,
                maxQuantity: parseInt(serviceData.maxQuantity) || 10000,
                active: serviceData.active !== false,
                createdAt: new Date().toISOString()
            };
            
            // إضافة الخدمة إلى المصفوفة وحفظها
            services.push(newService);
            saveServices(services);
            
            console.log(`تمت إضافة خدمة جديدة بنجاح: ${newService.name} (${newId})`);
            return true;
        } catch (error) {
            console.error("خطأ في إضافة الخدمة:", error);
            return false;
        }
    }

    /**
     * تحديث خدمة موجودة
     * @param {string} serviceId معرف الخدمة
     * @param {Object} serviceData بيانات الخدمة الجديدة
     * @returns {boolean} نجاح العملية
     */
    function updateService(serviceId, serviceData) {
        if (!serviceId) {
            console.error("معرف الخدمة غير صحيح");
            return false;
        }

        try {
            const services = loadServices();
            const serviceIndex = services.findIndex(s => s.id === serviceId);
            
            if (serviceIndex === -1) {
                console.error(`لم يتم العثور على خدمة بهذا المعرف: ${serviceId}`);
                return false;
            }
            
            // التحقق من صحة المنصة إذا تم تغييرها
            if (serviceData.platformId && serviceData.platformId !== services[serviceIndex].platformId) {
                const platforms = loadPlatforms();
                if (!platforms.some(p => p.id === serviceData.platformId)) {
                    console.error(`معرف المنصة غير صحيح: ${serviceData.platformId}`);
                    return false;
                }
            }
            
            // تحديث بيانات الخدمة
            const updatedService = {
                ...services[serviceIndex],
                name: serviceData.name || services[serviceIndex].name,
                description: serviceData.description !== undefined ? serviceData.description : services[serviceIndex].description,
                platformId: serviceData.platformId || services[serviceIndex].platformId,
                price: serviceData.price !== undefined ? parseFloat(serviceData.price) : services[serviceIndex].price,
                minQuantity: serviceData.minQuantity !== undefined ? parseInt(serviceData.minQuantity) : services[serviceIndex].minQuantity,
                maxQuantity: serviceData.maxQuantity !== undefined ? parseInt(serviceData.maxQuantity) : services[serviceIndex].maxQuantity,
                active: serviceData.active !== undefined ? serviceData.active : services[serviceIndex].active,
                updatedAt: new Date().toISOString()
            };
            
            // تحديث الخدمة في المصفوفة وحفظها
            services[serviceIndex] = updatedService;
            saveServices(services);
            
            console.log(`تم تحديث الخدمة بنجاح: ${updatedService.name} (${serviceId})`);
            return true;
        } catch (error) {
            console.error("خطأ في تحديث الخدمة:", error);
            return false;
        }
    }

    /**
     * حذف خدمة
     * @param {string} serviceId معرف الخدمة
     * @returns {boolean} نجاح العملية
     */
    function deleteService(serviceId) {
        if (!serviceId) {
            console.error("معرف الخدمة غير صحيح");
            return false;
        }

        try {
            const services = loadServices();
            const serviceIndex = services.findIndex(s => s.id === serviceId);
            
            if (serviceIndex === -1) {
                console.error(`لم يتم العثور على خدمة بهذا المعرف: ${serviceId}`);
                return false;
            }
            
            // حذف الخدمة من المصفوفة
            const deletedService = services.splice(serviceIndex, 1)[0];
            saveServices(services);
            
            console.log(`تم حذف الخدمة بنجاح: ${deletedService.name} (${serviceId})`);
            return true;
        } catch (error) {
            console.error("خطأ في حذف الخدمة:", error);
            return false;
        }
    }

    /**
     * الحصول على منصة بواسطة المعرف
     * @param {string} platformId معرف المنصة
     * @returns {Object|null} كائن المنصة أو null
     */
    function getPlatformById(platformId) {
        if (!platformId) return null;
        
        try {
            const platforms = loadPlatforms();
            return platforms.find(p => p.id === platformId) || null;
        } catch (error) {
            console.error("خطأ في الحصول على المنصة:", error);
            return null;
        }
    }

    /**
     * الحصول على خدمة بواسطة المعرف
     * @param {string} serviceId معرف الخدمة
     * @returns {Object|null} كائن الخدمة أو null
     */
    function getServiceById(serviceId) {
        if (!serviceId) return null;
        
        try {
            const services = loadServices();
            return services.find(s => s.id === serviceId) || null;
        } catch (error) {
            console.error("خطأ في الحصول على الخدمة:", error);
            return null;
        }
    }

    /**
     * الحصول على الخدمات المرتبطة بمنصة محددة
     * @param {string} platformId معرف المنصة
     * @returns {Array} مصفوفة الخدمات
     */
    function getServicesByPlatformId(platformId) {
        if (!platformId) return [];
        
        try {
            const services = loadServices();
            return services.filter(s => s.platformId === platformId);
        } catch (error) {
            console.error("خطأ في الحصول على خدمات المنصة:", error);
            return [];
        }
    }

    /**
     * إنشاء منصات افتراضية
     * @returns {Array} مصفوفة المنصات الافتراضية
     */
    function createDefaultPlatforms() {
        console.log("إنشاء منصات افتراضية...");
        
        const defaultPlatforms = [
            {
                id: "platform-1",
                name: "انستغرام",
                slug: "instagram",
                description: "منصة مشاركة الصور والفيديوهات",
                icon: "instagram",
                color: "#E1306C",
                website: "https://instagram.com",
                type: "social",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "platform-2",
                name: "فيسبوك",
                slug: "facebook",
                description: "منصة التواصل الاجتماعي الأشهر",
                icon: "facebook",
                color: "#1877F2",
                website: "https://facebook.com",
                type: "social",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "platform-3",
                name: "تويتر",
                slug: "twitter",
                description: "منصة التدوين المصغر",
                icon: "twitter",
                color: "#1DA1F2",
                website: "https://twitter.com",
                type: "social",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "platform-4",
                name: "يوتيوب",
                slug: "youtube",
                description: "منصة مشاركة الفيديوهات",
                icon: "youtube",
                color: "#FF0000",
                website: "https://youtube.com",
                type: "video",
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: "platform-5",
                name: "تيك توك",
                slug: "tiktok",
                description: "منصة الفيديوهات القصيرة",
                icon: "tiktok",
                color: "#000000",
                website: "https://tiktok.com",
                type: "video",
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        // تحديث المعرف التالي
        nextPlatformId = defaultPlatforms.length + 1;
        
        console.log(`تم إنشاء ${defaultPlatforms.length} منصات افتراضية`);
        return defaultPlatforms;
    }

    /**
     * إنشاء خدمات افتراضية
     * @param {Array} platforms مصفوفة المنصات
     * @returns {Array} مصفوفة الخدمات الافتراضية
     */
    function createDefaultServices(platforms) {
        console.log("إنشاء خدمات افتراضية...");
        
        const defaultServices = [];
        
        // التحقق من وجود منصات
        if (!platforms || platforms.length === 0) {
            console.error("لا توجد منصات لإنشاء خدمات افتراضية");
            return [];
        }
        
        // الحصول على معرفات المنصات النشطة
        const activePlatformIds = platforms
            .filter(platform => platform.active)
            .map(platform => platform.id);
        
        // التأكد من وجود منصات نشطة
        if (activePlatformIds.length === 0) {
            console.warn("لا توجد منصات نشطة لإضافة خدمات لها!");
            return [];
        }
        
        // للمنصة الأولى (انستغرام)
        if (activePlatformIds[0]) {
            defaultServices.push({
                id: "service-1",
                name: "متابعين انستغرام",
                description: "زيادة عدد المتابعين لحسابك",
                platformId: activePlatformIds[0],
                price: 5.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-2",
                name: "إعجابات انستغرام",
                description: "زيادة عدد الإعجابات على منشوراتك",
                platformId: activePlatformIds[0],
                price: 3.50,
                minQuantity: 50,
                maxQuantity: 5000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-3",
                name: "تعليقات انستغرام",
                description: "إضافة تعليقات على منشوراتك",
                platformId: activePlatformIds[0],
                price: 8.00,
                minQuantity: 10,
                maxQuantity: 500,
                active: true,
                createdAt: new Date().toISOString()
            });
        }
        
        // للمنصة الثانية (فيسبوك)
        if (activePlatformIds[1]) {
            defaultServices.push({
                id: "service-4",
                name: "متابعين فيسبوك",
                description: "زيادة عدد متابعين صفحتك",
                platformId: activePlatformIds[1],
                price: 6.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-5",
                name: "إعجابات فيسبوك",
                description: "زيادة عدد الإعجابات على منشوراتك",
                platformId: activePlatformIds[1],
                price: 4.00,
                minQuantity: 50,
                maxQuantity: 5000,
                active: true,
                createdAt: new Date().toISOString()
            });
        }
        
        // للمنصة الثالثة (تويتر)
        if (activePlatformIds[2]) {
            defaultServices.push({
                id: "service-6",
                name: "متابعين تويتر",
                description: "زيادة عدد المتابعين لحسابك",
                platformId: activePlatformIds[2],
                price: 7.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-7",
                name: "إعجابات تويتر",
                description: "زيادة عدد الإعجابات لتغريداتك",
                platformId: activePlatformIds[2],
                price: 4.25,
                minQuantity: 50,
                maxQuantity: 5000,
                active: true,
                createdAt: new Date().toISOString()
            });
        }
        
        // للمنصة الرابعة (يوتيوب)
        if (activePlatformIds[3]) {
            defaultServices.push({
                id: "service-8",
                name: "مشاهدات يوتيوب",
                description: "زيادة عدد مشاهدات الفيديو",
                platformId: activePlatformIds[3],
                price: 10.00,
                minQuantity: 500,
                maxQuantity: 50000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-9",
                name: "اشتراكات يوتيوب",
                description: "زيادة عدد المشتركين في قناتك",
                platformId: activePlatformIds[3],
                price: 12.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            });
        }
        
        // للمنصة الخامسة (تيك توك)
        if (activePlatformIds[4]) {
            defaultServices.push({
                id: "service-10",
                name: "متابعين تيك توك",
                description: "زيادة عدد المتابعين لحسابك",
                platformId: activePlatformIds[4],
                price: 6.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-11",
                name: "إعجابات تيك توك",
                description: "زيادة عدد الإعجابات لفيديوهاتك",
                platformId: activePlatformIds[4],
                price: 5.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            });
            
            defaultServices.push({
                id: "service-12",
                name: "مشاهدات تيك توك",
                description: "زيادة عدد مشاهدات الفيديو",
                platformId: activePlatformIds[4],
                price: 4.50,
                minQuantity: 1000,
                maxQuantity: 100000,
                active: true,
                createdAt: new Date().toISOString()
            });
        }
        
        // تحديث المعرف التالي
        nextServiceId = defaultServices.length + 1;
        
        console.log(`تم إنشاء ${defaultServices.length} خدمات افتراضية`);
        return defaultServices;
    }

    /**
     * مسح جميع البيانات المخزنة
     * @returns {boolean} نجاح العملية
     */
    function clearAllData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.PLATFORMS);
            localStorage.removeItem(STORAGE_KEYS.SERVICES);
            localStorage.removeItem(STORAGE_KEYS.CONFIG);
            console.log("تم مسح جميع البيانات المخزنة");
            return true;
        } catch (error) {
            console.error("خطأ في مسح البيانات:", error);
            return false;
        }
    }

    /**
     * إعادة ضبط البيانات وإنشاء منصات وخدمات افتراضية
     * @returns {boolean} نجاح العملية
     */
    function resetToDefault() {
        try {
            clearAllData();
            
            // إنشاء منصات افتراضية وحفظها
            const defaultPlatforms = createDefaultPlatforms();
            savePlatforms(defaultPlatforms);
            
            // إنشاء خدمات افتراضية وحفظها
            const defaultServices = createDefaultServices(defaultPlatforms);
            saveServices(defaultServices);
            
            console.log("تم إعادة ضبط البيانات وإنشاء منصات وخدمات افتراضية");
            return true;
        } catch (error) {
            console.error("خطأ في إعادة ضبط البيانات:", error);
            return false;
        }
    }

    // تصدير الواجهة العامة للمكون
    return {
        // وظائف المنصات
        getAllPlatforms,
        getPlatformById,
        addPlatform,
        updatePlatform,
        deletePlatform,
        
        // وظائف الخدمات
        getAllServices,
        getServiceById,
        getServicesByPlatformId,
        addService,
        updateService,
        deleteService,
        
        // وظائف التخزين
        loadPlatforms,
        loadServices,
        savePlatforms,
        saveServices,
        
        // وظائف إدارة البيانات
        clearAllData,
        resetToDefault
    };
})();

// إنشاء البيانات الافتراضية عند تحميل الصفحة (إذا لم تكن موجودة)
document.addEventListener('DOMContentLoaded', function() {
    console.log("تهيئة مدير المنصات والخدمات الموحد...");
    
    // التحقق من وجود البيانات وإنشاء بيانات افتراضية إذا لم تكن موجودة
    const platforms = UnifiedPlatformServiceManager.loadPlatforms();
    const services = UnifiedPlatformServiceManager.loadServices();
    
    console.log(`عدد المنصات المحملة: ${platforms.length}`);
    console.log(`عدد الخدمات المحملة: ${services.length}`);
    
    // إطلاق حدث اكتمال تحميل البيانات
    const event = new CustomEvent('platformServiceManagerReady', {
        detail: { platforms: platforms.length, services: services.length }
    });
    document.dispatchEvent(event);
});
