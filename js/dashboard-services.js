/**
 * نظام إدارة الخدمات في لوحة التحكم
 * @version 1.0.0
 */
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود واجهة الخدمات في الصفحة
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;
    
    console.log("تم تحميل نظام إدارة الخدمات");
    
    // تعريف منشئ نظام إدارة الخدمات
    window.servicesDashboard = (function() {
        // متغيرات النظام
        const state = {
            isInitialized: false,
            services: [],
            currentServiceId: null,
            filteredServices: [],
            platforms: [],
            isSilent: true // إضافة متغير للتحكم في إظهار الإشعارات
        };
        
        /**
         * تهيئة نظام إدارة الخدمات
         */
        function init() {
            console.log("تهيئة نظام إدارة الخدمات...");
            
            // التحقق من وجود مدير المنصات والخدمات الموحد
            if (!window.UnifiedPlatformServiceManager) {
                console.error("لم يتم العثور على مدير المنصات والخدمات الموحد!");
                showNotification("خطأ في تحميل نظام إدارة الخدمات", "error", false);
                return;
            }
            
            // تحميل المنصات من مدير المنصات والخدمات الموحد
            loadPlatforms();
            
            // تحميل الخدمات من مدير المنصات والخدمات الموحد
            loadServices();
            
            // إضافة استمعات الأحداث
            setupEventListeners();
            
            // التأكد من وجود على الأقل بعض الخدمات الافتراضية
            ensureDefaultServicesExist();
            
            // تحديث حالة التهيئة
            state.isInitialized = true;
            
            // عرض الخدمات فوراً
            renderServices();
            
            console.log("تم تهيئة نظام إدارة الخدمات بنجاح.");
            
            // بعد التهيئة الأولى، نعيد تفعيل الإشعارات
            setTimeout(() => {
                state.isSilent = false;
            }, 1000);
        }
        
        /**
         * تحميل المنصات من مدير المنصات والخدمات الموحد
         */
        function loadPlatforms() {
            try {
                console.log("جاري تحميل المنصات...");
                
                // الحصول على المنصات من مدير المنصات والخدمات الموحد
                const platforms = UnifiedPlatformServiceManager.getAllPlatforms() || [];
                
                // تحديث حالة النظام
                state.platforms = platforms;
                
                console.log("تم تحميل المنصات بنجاح:", platforms.length);
                
                return platforms.length > 0;
            } catch (error) {
                console.error("خطأ في تحميل المنصات:", error);
                showNotification("خطأ في تحميل المنصات", "error", false);
                return false;
            }
        }
        
        /**
         * التأكد من وجود خدمات افتراضية
         */
        function ensureDefaultServicesExist() {
            // إذا لم توجد خدمات، أضف الخدمات الافتراضية
            if (state.services.length === 0) {
                console.log("لا توجد خدمات، إضافة خدمات افتراضية...");
                
                // التأكد من وجود منصات
                if (state.platforms.length === 0) {
                    console.error("لا توجد منصات لإضافة خدمات لها!");
                    return;
                }
                
                // الحصول على معرفات المنصات النشطة
                const activePlatformIds = state.platforms
                    .filter(platform => platform.active)
                    .map(platform => platform.id);
                
                if (activePlatformIds.length === 0) {
                    console.warn("لا توجد منصات نشطة لإضافة خدمات لها!");
                    return;
                }
                
                // إنشاء خدمات افتراضية لكل منصة نشطة
                const defaultServices = [];
                
                // للمنصة الأولى (مثل انستغرام)
                if (activePlatformIds[0]) {
                    defaultServices.push({
                        name: "متابعين",
                        description: "زيادة عدد المتابعين لحسابك",
                        platformId: activePlatformIds[0],
                        price: 5.00,
                        minQuantity: 100,
                        maxQuantity: 10000,
                        active: true
                    });
                    
                    defaultServices.push({
                        name: "إعجابات",
                        description: "زيادة عدد الإعجابات على منشوراتك",
                        platformId: activePlatformIds[0],
                        price: 3.50,
                        minQuantity: 50,
                        maxQuantity: 5000,
                        active: true
                    });
                }
                
                // للمنصة الثانية إذا وجدت (مثل فيسبوك)
                if (activePlatformIds[1]) {
                    defaultServices.push({
                        name: "متابعين",
                        description: "زيادة عدد المتابعين لصفحتك",
                        platformId: activePlatformIds[1],
                        price: 6.00,
                        minQuantity: 100,
                        maxQuantity: 10000,
                        active: true
                    });
                    
                    defaultServices.push({
                        name: "إعجابات",
                        description: "زيادة عدد الإعجابات على منشوراتك",
                        platformId: activePlatformIds[1],
                        price: 4.00,
                        minQuantity: 50,
                        maxQuantity: 5000,
                        active: true
                    });
                }
                
                // للمنصة الثالثة إذا وجدت (مثل يوتيوب)
                if (activePlatformIds[2]) {
                    defaultServices.push({
                        name: "مشاهدات",
                        description: "زيادة عدد مشاهدات فيديوهاتك",
                        platformId: activePlatformIds[2],
                        price: 8.00,
                        minQuantity: 500,
                        maxQuantity: 50000,
                        active: true
                    });
                    
                    defaultServices.push({
                        name: "اشتراكات",
                        description: "زيادة عدد المشتركين في قناتك",
                        platformId: activePlatformIds[2],
                        price: 12.00,
                        minQuantity: 100,
                        maxQuantity: 10000,
                        active: true
                    });
                }
                
                // إضافة كل خدمة افتراضية إلى النظام
                defaultServices.forEach(service => {
                    UnifiedPlatformServiceManager.addService(service);
                });
                
                // إعادة تحميل الخدمات بعد إضافة الخدمات الافتراضية
                loadServices();
            }
        }
        
        /**
         * تحميل الخدمات من مدير المنصات والخدمات الموحد
         */
        function loadServices() {
            try {
                console.log("جاري تحميل الخدمات...");
                
                // الحصول على الخدمات من مدير المنصات والخدمات الموحد
                const services = UnifiedPlatformServiceManager.getAllServices() || [];
                
                // تحديث حالة النظام
                state.services = services;
                state.filteredServices = services;
                
                console.log("تم تحميل الخدمات بنجاح:", services.length);
                
                return services.length > 0;
            } catch (error) {
                console.error("خطأ في تحميل الخدمات:", error);
                showNotification("خطأ في تحميل الخدمات", "error", false);
                return false;
            }
        }
        
        /**
         * إضافة استمعات الأحداث
         */
        function setupEventListeners() {
            // زر إضافة خدمة جديدة
            const addServiceBtn = document.getElementById('add-service-btn');
            if (addServiceBtn) {
                addServiceBtn.addEventListener('click', function() {
                    openServiceModal();
                });
            }
            
            // خانة البحث
            const serviceSearch = document.getElementById('service-search');
            if (serviceSearch) {
                serviceSearch.addEventListener('input', function() {
                    filterServices();
                });
            }
            
            // قائمة التصفية
            const serviceFilter = document.getElementById('service-filter');
            if (serviceFilter) {
                serviceFilter.addEventListener('change', function() {
                    filterServices();
                });
            }
            
            // زر حفظ الخدمة
            const saveServiceBtn = document.getElementById('save-service');
            if (saveServiceBtn) {
                saveServiceBtn.addEventListener('click', function() {
                    saveService();
                });
            }
            
            // زر إلغاء إضافة/تعديل الخدمة
            const cancelServiceBtn = document.getElementById('cancel-service');
            if (cancelServiceBtn) {
                cancelServiceBtn.addEventListener('click', function() {
                    closeServiceModal();
                });
            }
            
            // زر إغلاق النافذة المنبثقة
            const closeServiceModalBtn = document.getElementById('close-service-modal');
            if (closeServiceModalBtn) {
                closeServiceModalBtn.addEventListener('click', function() {
                    closeServiceModal();
                });
            }
            
            // الاستماع لأحداث تحديث بيانات الخدمات
            document.addEventListener('serviceDataUpdated', function() {
                loadServices();
                renderServices();
            });
            
            // إضافة مستمع للتبويبات للتأكد من تنشيط تبويب الخدمات
            document.querySelectorAll('.tab-link').forEach(tab => {
                tab.addEventListener('click', function() {
                    if (this.getAttribute('data-tab') === 'services') {
                        setTimeout(() => {
                            console.log("إعادة تحميل الخدمات بعد تنشيط التبويب");
                            loadServices();
                            renderServices();
                        }, 100);
                    }
                });
            });
        }
        
        /**
         * فتح النافذة المنبثقة لإضافة/تعديل خدمة
         * @param {string|null} serviceId - معرف الخدمة (null لإضافة خدمة جديدة)
         */
        function openServiceModal(serviceId = null) {
            // تحديث حالة النظام
            state.currentServiceId = serviceId;
            
            // تحديث عنوان النافذة المنبثقة
            const modalTitle = document.querySelector('#add-service-modal h3');
            if (modalTitle) {
                modalTitle.textContent = serviceId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة';
            }
            
            // الحصول على نموذج الخدمة
            const serviceForm = document.getElementById('add-service-form');
            
            // تحديث وضع النموذج
            if (serviceForm) {
                serviceForm.setAttribute('data-mode', serviceId ? 'edit' : 'add');
                
                // إعادة تعيين النموذج
                serviceForm.reset();
                
                // ملء النموذج بقائمة المنصات النشطة
                const platformSelect = document.getElementById('service-platform');
                if (platformSelect) {
                    platformSelect.innerHTML = '<option value="" disabled selected>اختر المنصة</option>';
                    
                    state.platforms.forEach(platform => {
                        if (platform.active) {
                            const option = document.createElement('option');
                            option.value = platform.id;
                            option.textContent = platform.name;
                            platformSelect.appendChild(option);
                        }
                    });
                }
                
                // ملء النموذج ببيانات الخدمة إذا كان التعديل
                if (serviceId) {
                    const service = state.services.find(s => s.id === serviceId);
                    if (service) {
                        const nameInput = document.getElementById('service-name');
                        const descriptionInput = document.getElementById('service-description');
                        const platformSelect = document.getElementById('service-platform');
                        const priceInput = document.getElementById('service-price');
                        const minQuantityInput = document.getElementById('min-quantity');
                        const maxQuantityInput = document.getElementById('max-quantity');
                        const activeCheckbox = document.getElementById('service-active');
                        
                        if (nameInput) nameInput.value = service.name || '';
                        if (descriptionInput) descriptionInput.value = service.description || '';
                        if (platformSelect) platformSelect.value = service.platformId || '';
                        if (priceInput) priceInput.value = service.price || 0;
                        if (minQuantityInput) minQuantityInput.value = service.minQuantity || 100;
                        if (maxQuantityInput) maxQuantityInput.value = service.maxQuantity || 10000;
                        if (activeCheckbox) activeCheckbox.checked = service.active !== false;
                    }
                }
            }
            
            // إظهار النافذة المنبثقة
            const serviceModal = document.getElementById('add-service-modal');
            if (serviceModal) {
                serviceModal.classList.remove('hidden');
            }
        }
        
        /**
         * إغلاق النافذة المنبثقة
         */
        function closeServiceModal() {
            // إخفاء النافذة المنبثقة
            const serviceModal = document.getElementById('add-service-modal');
            if (serviceModal) {
                serviceModal.classList.add('hidden');
            }
            
            // إعادة تعيين حالة النظام
            state.currentServiceId = null;
        }
        
        /**
         * حفظ الخدمة (إضافة/تعديل)
         */
        function saveService() {
            // التحقق من صحة البيانات
            const nameInput = document.getElementById('service-name');
            const descriptionInput = document.getElementById('service-description');
            const platformSelect = document.getElementById('service-platform');
            const priceInput = document.getElementById('service-price');
            const minQuantityInput = document.getElementById('min-quantity');
            const maxQuantityInput = document.getElementById('max-quantity');
            const activeCheckbox = document.getElementById('service-active');
            
            if (!nameInput.value.trim()) {
                showNotification("يرجى إدخال اسم الخدمة", "error", false);
                return;
            }
            
            if (!platformSelect.value) {
                showNotification("يرجى اختيار منصة للخدمة", "error", false);
                return;
            }
            
            if (!priceInput.value || isNaN(parseFloat(priceInput.value)) || parseFloat(priceInput.value) <= 0) {
                showNotification("يرجى إدخال سعر صحيح للخدمة", "error", false);
                return;
            }
            
            // إعداد بيانات الخدمة
            const serviceData = {
                name: nameInput.value.trim(),
                description: descriptionInput.value.trim() || null,
                platformId: platformSelect.value,
                price: parseFloat(priceInput.value) || 0,
                minQuantity: parseInt(minQuantityInput.value) || 100,
                maxQuantity: parseInt(maxQuantityInput.value) || 10000,
                active: activeCheckbox.checked
            };
            
            try {
                let success = false;
                
                if (state.currentServiceId) {
                    // تعديل خدمة موجودة
                    serviceData.id = state.currentServiceId;
                    success = UnifiedPlatformServiceManager.updateService(serviceData);
                    
                    if (success) {
                        // هنا سنظهر الإشعار دائمًا
                        showNotification("تم تحديث الخدمة بنجاح", "success", false);
                    } else {
                        showNotification("خطأ في تحديث الخدمة", "error", false);
                        return;
                    }
                } else {
                    // إضافة خدمة جديدة
                    success = UnifiedPlatformServiceManager.addService(serviceData);
                    
                    if (success) {
                        // هنا سنظهر الإشعار دائمًا
                        showNotification("تم إضافة الخدمة بنجاح", "success", false);
                    } else {
                        showNotification("خطأ في إضافة الخدمة", "error", false);
                        return;
                    }
                }
                
                // إغلاق النافذة المنبثقة
                closeServiceModal();
                
                // إعادة تحميل الخدمات
                loadServices();
                
                // عرض الخدمات
                renderServices();
                
            } catch (error) {
                console.error("خطأ في حفظ الخدمة:", error);
                showNotification("حدث خطأ أثناء حفظ الخدمة", "error", false);
            }
        }
        
        /**
         * تصفية الخدمات حسب البحث والتصفية
         */
        function filterServices() {
            if (!state.services) return;
            
            try {
                let filtered = [...state.services];
                const serviceSearch = document.getElementById('service-search');
                const serviceFilter = document.getElementById('service-filter');
                
                // تصفية حسب نص البحث
                if (serviceSearch && serviceSearch.value) {
                    const searchValue = serviceSearch.value.trim().toLowerCase();
                    filtered = filtered.filter(service => {
                        return (
                            (service.name && service.name.toLowerCase().includes(searchValue)) ||
                            (service.description && service.description.toLowerCase().includes(searchValue))
                        );
                    });
                }
                
                // تصفية حسب نوع الخدمة
                if (serviceFilter && serviceFilter.value && serviceFilter.value !== 'all') {
                    const filterValue = serviceFilter.value;
                    
                    if (filterValue === 'active') {
                        filtered = filtered.filter(service => service.active === true);
                    } else if (filterValue === 'inactive') {
                        filtered = filtered.filter(service => service.active === false);
                    } else {
                        // تصفية حسب المنصة
                        filtered = filtered.filter(service => service.platformId === filterValue);
                    }
                }
                
                // تحديث حالة النظام
                state.filteredServices = filtered;
                
                // عرض الخدمات المصفاة
                renderServices();
                
            } catch (error) {
                console.error("خطأ في تصفية الخدمات:", error);
            }
        }
        
        /**
         * عرض الخدمات في شبكة بطاقات
         */
        function renderServices() {
            const servicesContainer = document.getElementById('services-container');
            if (!servicesContainer) return;
            
            try {
                console.log("جاري عرض الخدمات في الشبكة...");
                
                // إفراغ الحاوية
                servicesContainer.innerHTML = '';
                
                // التحقق من وجود خدمات مصفاة
                if (!state.filteredServices || state.filteredServices.length === 0) {
                    servicesContainer.innerHTML = `
                        <div class="col-span-full p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                            <i class="fas fa-info-circle text-blue-500 text-3xl mb-4"></i>
                            <p class="text-gray-600">لم يتم العثور على خدمات${document.getElementById('service-search') && document.getElementById('service-search').value ? ' تطابق بحثك' : ''}.</p>
                            <button id="add-service-empty-btn" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                                <i class="fas fa-plus mr-1"></i> إضافة خدمة جديدة
                            </button>
                        </div>
                    `;
                    
                    // إضافة استمع الحدث لزر الإضافة
                    const addServiceEmptyBtn = document.getElementById('add-service-empty-btn');
                    if (addServiceEmptyBtn) {
                        addServiceEmptyBtn.addEventListener('click', function() {
                            openServiceModal();
                        });
                    }
                    
                    return;
                }
                
                // إنشاء بطاقات الخدمات
                state.filteredServices.forEach(service => {
                    // الحصول على المنصة المرتبطة بالخدمة
                    const platform = state.platforms.find(p => p.id === service.platformId);
                    if (!platform) return; // تخطي الخدمات بدون منصة
                    
                    // إنشاء بطاقة الخدمة باستخدام الدالة المحسنة
                    const serviceCard = createServiceCard(service, platform);
                    
                    // إضافة البطاقة إلى الحاوية
                    servicesContainer.appendChild(serviceCard);
                    
                    // إضافة استمعات الأحداث للأزرار
                    const editButton = serviceCard.querySelector('.edit-service-btn');
                    if (editButton) {
                        editButton.addEventListener('click', function() {
                            const serviceId = this.getAttribute('data-id');
                            openServiceModal(serviceId);
                        });
                    }
                    
                    const toggleButton = serviceCard.querySelector('.toggle-service-btn');
                    if (toggleButton) {
                        toggleButton.addEventListener('click', function() {
                            const serviceId = this.getAttribute('data-id');
                            toggleServiceStatus(serviceId);
                        });
                    }
                    
                    const deleteButton = serviceCard.querySelector('.delete-service-btn');
                    if (deleteButton) {
                        deleteButton.addEventListener('click', function() {
                            const serviceId = this.getAttribute('data-id');
                            confirmDeleteService(serviceId);
                        });
                    }
                });
                
                console.log("تم عرض الخدمات:", state.filteredServices.length);
                
            } catch (error) {
                console.error("خطأ في عرض الخدمات:", error);
                showNotification("خطأ في عرض الخدمات", "error", false);
            }
        }
        
        /**
         * تبديل حالة الخدمة (نشط/غير نشط)
         * @param {string} serviceId - معرف الخدمة
         */
        function toggleServiceStatus(serviceId) {
            try {
                // الحصول على الخدمة من الحالة
                const service = state.services.find(s => s.id === serviceId);
                if (!service) {
                    console.error(`الخدمة ذات المعرف ${serviceId} غير موجودة`);
                    return;
                }
                
                // تبديل حالة التفعيل
                const updatedService = { ...service, active: !service.active };
                
                // تحديث الخدمة في مدير المنصات والخدمات
                const success = UnifiedPlatformServiceManager.updateService(updatedService);
                
                if (success) {
                    // تحديث الخدمة في الحالة المحلية
                    const index = state.services.findIndex(s => s.id === serviceId);
                    if (index !== -1) {
                        state.services[index] = updatedService;
                    }
                    
                    // إعادة تصفية وعرض الخدمات
                    filterServices();
                    
                    // هنا سنظهر الإشعار دائمًا
                    showNotification(`تم ${updatedService.active ? 'تفعيل' : 'تعطيل'} الخدمة بنجاح`, "success", false);
                } else {
                    showNotification("خطأ في تحديث حالة الخدمة", "error", false);
                }
                
            } catch (error) {
                console.error("خطأ في تبديل حالة الخدمة:", error);
                showNotification("حدث خطأ أثناء تحديث حالة الخدمة", "error", false);
            }
        }
        
        /**
         * تأكيد حذف الخدمة
         * @param {string} serviceId - معرف الخدمة
         */
        function confirmDeleteService(serviceId) {
            try {
                const service = state.services.find(s => s.id === serviceId);
                
                if (!service) {
                    showNotification("لم يتم العثور على الخدمة!", "error", false);
                    return;
                }
                
                if (confirm(`هل أنت متأكد من رغبتك في حذف الخدمة "${service.name}"؟`)) {
                    deleteService(serviceId);
                }
            } catch (error) {
                console.error("خطأ في تأكيد حذف الخدمة:", error);
                showNotification("خطأ في حذف الخدمة", "error", false);
            }
        }
        
        /**
         * حذف الخدمة
         * @param {string} serviceId - معرف الخدمة
         */
        function deleteService(serviceId) {
            try {
                // حذف الخدمة من مدير المنصات والخدمات الموحد
                const success = UnifiedPlatformServiceManager.deleteService(serviceId);
                
                if (success) {
                    // هنا سنظهر الإشعار دائمًا
                    showNotification("تم حذف الخدمة بنجاح", "success", false);
                    
                    // إعادة تحميل الخدمات
                    loadServices();
                    
                    // إعادة تصفية وعرض الخدمات
                    filterServices();
                } else {
                    showNotification("خطأ في حذف الخدمة", "error", false);
                }
            } catch (error) {
                console.error("خطأ في حذف الخدمة:", error);
                showNotification("خطأ في حذف الخدمة", "error", false);
            }
        }
        
        /**
         * الحصول على أيقونة الخدمة بناءً على اسمها
         * @param {string} serviceName - اسم الخدمة
         * @returns {string} - صنف الأيقونة
         */
        function getServiceIcon(serviceName) {
            if (!serviceName) return 'fas fa-cube';
            
            const name = serviceName.toLowerCase();
            
            if (name.includes('متابع') || name.includes('follow')) {
                return 'fas fa-user-plus';
            } else if (name.includes('إعجاب') || name.includes('like')) {
                return 'fas fa-heart';
            } else if (name.includes('تعليق') || name.includes('comment')) {
                return 'fas fa-comment';
            } else if (name.includes('مشاهد') || name.includes('view')) {
                return 'fas fa-eye';
            } else if (name.includes('اشتراك') || name.includes('subscribe')) {
                return 'fas fa-star';
            }
            
            return 'fas fa-cube';
        }
        
        /**
         * الحصول على صنف الأيقونة بناءً على اسم الخدمة
         * @param {string} serviceName - اسم الخدمة
         * @returns {string} - صنف الأيقونة
         */
        function getServiceIconClass(serviceName) {
            if (!serviceName) return 'bg-gray-100 text-gray-600';
            
            const name = serviceName.toLowerCase();
            
            if (name.includes('متابع') || name.includes('follow')) {
                return 'bg-blue-100 text-blue-600';
            } else if (name.includes('إعجاب') || name.includes('like')) {
                return 'bg-red-100 text-red-600';
            } else if (name.includes('تعليق') || name.includes('comment')) {
                return 'bg-green-100 text-green-600';
            } else if (name.includes('مشاهد') || name.includes('view')) {
                return 'bg-purple-100 text-purple-600';
            } else if (name.includes('اشتراك') || name.includes('subscribe')) {
                return 'bg-yellow-100 text-yellow-600';
            }
            
            return 'bg-gray-100 text-gray-600';
        }
        
        /**
         * عرض إشعار
         * @param {string} message - نص الإشعار
         * @param {string} type - نوع الإشعار (success, error, info, warning)
         * @param {boolean} respectSilent - ما إذا كان يجب احترام وضع الصمت
         */
        function showNotification(message, type = 'info', respectSilent = true) {
            // فحص ما إذا كان في وضع الصمت
            if (respectSilent && state.isSilent) {
                console.log(`(صامت) ${type}: ${message}`);
                return;
            }
            
            // استخدام نظام الإشعارات المضمن إن وجد
            if (window.notificationHelper && typeof notificationHelper[type] === 'function') {
                notificationHelper[type](message);
            } else {
                // استخدام نظام تنبيهات المتصفح كبديل
                if (type === 'error') {
                    console.error(message);
                    alert('خطأ: ' + message);
                } else {
                    console.log(message);
                    if (type === 'success') alert(message);
                }
            }
        }
        
        // إعادة الواجهة العامة
        return {
            init,
            state,
            loadServices,
            filterServices,
            renderServices,
            openServiceModal
        };
    })();
    
    // تهيئة نظام إدارة الخدمات
    servicesDashboard.init();
});

// استبدال كود إنشاء بطاقة الخدمة بالكود المحسّن
function createServiceCard(service, platform) {
  const card = document.createElement('div');
  card.className = 'service-card';
  card.id = `service-${service.id}`;
  
  // تحديد أيقونة الخدمة ولونها
  const iconClass = getServiceIconClass(service.name);
  const iconName = getServiceIcon(service.name);
  
  // تنسيق البطاقة بشكل أفضل
  card.innerHTML = `
    <div class="card-header">
      <div class="card-icon ${iconClass}">
        <i class="${iconName}"></i>
      </div>
      <div>
        <h3 class="card-title">${service.name}</h3>
        <div class="card-subtitle">
          <span class="status-badge ${service.active ? 'status-active' : 'status-inactive'}">
            ${service.active ? 'مفعلة' : 'معطلة'}
          </span>
          <span class="platform">
            <i class="fab fa-${platform.icon || 'globe'} platform-icon" style="color: ${platform.color || '#4f46e5'}"></i>
            ${platform.name}
          </span>
        </div>
      </div>
    </div>
    <div class="card-body">
      <p class="card-description">${service.description || 'لا يوجد وصف للخدمة'}</p>
      <div class="card-price">$${service.price.toFixed(2)}</div>
      <div class="card-quantity text-sm text-gray-500">
        الكمية: ${service.minQuantity} - ${service.maxQuantity.toLocaleString()}
      </div>
      <div class="card-actions">
        <button class="edit-btn edit-service-btn" data-id="${service.id}">
          <i class="fas fa-edit ml-1"></i> تعديل
        </button>
        <button class="delete-btn delete-service-btn" data-id="${service.id}">
          <i class="fas fa-trash-alt ml-1"></i> حذف
        </button>
      </div>
    </div>
    <div class="price-tag">$${service.price.toFixed(2)}</div>
  `;
  
  return card;
}