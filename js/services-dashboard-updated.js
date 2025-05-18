/**
 * نظام إدارة الخدمات المحدث للوحة التحكم
 * يعتمد بشكل كامل على PlatformServiceManager
 */
const servicesDashboard = {
    state: {
        services: [],
        platforms: [],
        currentService: null,
        isAddMode: true,
        filterPlatform: 'all',
        isLoading: false,
        isSilentLoad: true  // إضافة متغير للتحكم في ظهور الإشعارات عند التحميل الأولي
    },
    
    /**
     * تهيئة النظام
     */
    init: function() {
        // تعيين وضع التحميل الصامت عند التهيئة
        this.state.isSilentLoad = true;
        this.loadData();
        this.setupEventListeners();
        this.renderServices();
        this.setupPlatformDropdown();
        
        // إعادة تعيين وضع التحميل الصامت بعد التهيئة الأولى
        setTimeout(() => {
            this.state.isSilentLoad = false;
        }, 2000);
    },
      /**
     * تحميل البيانات من UnifiedPlatformServiceManager
     */
    loadData: function() {
        this.state.isLoading = true;
        
        // تحميل المنصات والخدمات من UnifiedPlatformServiceManager
        if (window.UnifiedPlatformServiceManager) {
            this.state.platforms = UnifiedPlatformServiceManager.loadPlatforms();
            this.state.services = UnifiedPlatformServiceManager.loadServices();
        } else {
            console.error("لم يتم العثور على UnifiedPlatformServiceManager!");
            this.state.platforms = [];
            this.state.services = [];
        }
        
        this.state.isLoading = false;
    },
    
    /**
     * تحميل البيانات وإنشاء الارتباطات
     */
    loadPlatformsAndServices: function() {
        this.loadData();
        this.renderServices();
        this.setupPlatformDropdown();
    },
    
    /**
     * إعداد الأحداث
     */
    setupEventListeners: function() {
        // الاستماع لتحديثات البيانات من PlatformServiceManager
        document.addEventListener('platformServiceDataUpdated', () => {
            this.loadPlatformsAndServices();
        });
        
        // إضافة خدمة جديدة
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => this.openAddServiceModal());
        }
        
        // إغلاق مودال الخدمة
        const closeServiceModal = document.getElementById('close-service-modal');
        if (closeServiceModal) {
            closeServiceModal.addEventListener('click', () => this.closeServiceModal());
        }
        const cancelService = document.getElementById('cancel-service');
        if (cancelService) {
            cancelService.addEventListener('click', () => this.closeServiceModal());
        }
        
        // حفظ الخدمة
        const saveService = document.getElementById('save-service');
        if (saveService) {
            saveService.addEventListener('click', () => this.saveService());
        }
        
        // تصفية الخدمات حسب المنصة
        const serviceFilter = document.getElementById('service-filter');
        if (serviceFilter) {
            serviceFilter.addEventListener('change', (e) => {
                this.state.filterPlatform = e.target.value;
                this.renderServices();
            });
        }
    },
    
    /**
     * فتح مودال إضافة خدمة جديدة
     */
    openAddServiceModal: function() {
        this.state.isAddMode = true;
        this.state.currentService = {
            id: 'service-' + new Date().getTime(),
            name: '',
            description: '',
            platformId: '',
            price: 10,
            minQuantity: 1000,
            maxQuantity: 10000,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        this.updateServiceForm();
        
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    /**
     * فتح مودال تعديل خدمة موجودة
     * @param {string} serviceId معرف الخدمة
     */    openEditServiceModal: function(serviceId) {
        if (!serviceId) return;
        
        // البحث عن الخدمة بواسطة UnifiedPlatformServiceManager
        const service = UnifiedPlatformServiceManager.getServiceById(serviceId);
        if (!service) {
            console.error(`لم يتم العثور على الخدمة بالمعرف: ${serviceId}`);
            return;
        }
        
        this.state.isAddMode = false;
        this.state.currentService = { ...service };
        
        this.updateServiceForm();
        
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    /**
     * تحديث نموذج الخدمة
     */
    updateServiceForm: function() {
        const form = document.getElementById('add-service-form');
        if (!form) return;
        
        // تعبئة بيانات النموذج
        const service = this.state.currentService;
        
        // تعيين وضع النموذج (إضافة أو تعديل)
        form.dataset.mode = this.state.isAddMode ? 'add' : 'edit';
        
        // الحصول على كل عنصر في النموذج
        const nameInput = form.querySelector('#service-name');
        const descriptionInput = form.querySelector('#service-description');
        const platformSelect = form.querySelector('#service-platform');
        const priceInput = form.querySelector('#service-price');
        const minQuantityInput = form.querySelector('#service-min-quantity');
        const maxQuantityInput = form.querySelector('#service-max-quantity');
        const activeCheckbox = form.querySelector('#service-active');
        
        // تعبئة القيم
        if (nameInput) nameInput.value = service.name || '';
        if (descriptionInput) descriptionInput.value = service.description || '';
        if (platformSelect) {
            // مسح كل الخيارات الحالية
            platformSelect.innerHTML = '';
            
            // إضافة خيار فارغ
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'اختر منصة...';
            platformSelect.appendChild(emptyOption);
            
            // إضافة خيارات المنصات
            this.state.platforms.forEach(platform => {
                const option = document.createElement('option');
                option.value = platform.id;
                option.textContent = platform.name;
                option.selected = platform.id === service.platformId;
                platformSelect.appendChild(option);
            });
        }
        
        if (priceInput) priceInput.value = service.price || 10;
        if (minQuantityInput) minQuantityInput.value = service.minQuantity || 1000;
        if (maxQuantityInput) maxQuantityInput.value = service.maxQuantity || 10000;
        if (activeCheckbox) activeCheckbox.checked = service.active !== false;
        
        // تحديث عنوان المودال
        const modalTitle = document.querySelector('#add-service-modal h3');
        if (modalTitle) {
            modalTitle.textContent = this.state.isAddMode ? 'إضافة خدمة جديدة' : 'تعديل الخدمة';
        }
        
        // تحديث نص زر الحفظ
        const saveButton = document.getElementById('save-service');
        if (saveButton) {
            saveButton.textContent = this.state.isAddMode ? 'إضافة الخدمة' : 'حفظ التغييرات';
        }
    },
    
    /**
     * إغلاق مودال الخدمة
     */
    closeServiceModal: function() {
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    /**
     * حفظ الخدمة
     */
    saveService: function() {
        const form = document.getElementById('add-service-form');
        if (!form) return;
        
        // الحصول على القيم من النموذج
        const nameInput = form.querySelector('#service-name');
        const descriptionInput = form.querySelector('#service-description');
        const platformSelect = form.querySelector('#service-platform');
        const priceInput = form.querySelector('#service-price');
        const minQuantityInput = form.querySelector('#service-min-quantity');
        const maxQuantityInput = form.querySelector('#service-max-quantity');
        const activeCheckbox = form.querySelector('#service-active');
        
        // التحقق من صحة القيم
        if (!nameInput.value) {
            this.showError('يرجى إدخال اسم الخدمة');
            return;
        }
        
        if (!platformSelect.value) {
            this.showError('يرجى اختيار منصة للخدمة');
            return;
        }
        
        // تحديث كائن الخدمة
        this.state.currentService.name = nameInput.value;
        this.state.currentService.description = descriptionInput.value;
        this.state.currentService.platformId = platformSelect.value;
        this.state.currentService.price = parseFloat(priceInput.value) || 10;
        this.state.currentService.minQuantity = parseInt(minQuantityInput.value) || 1000;
        this.state.currentService.maxQuantity = parseInt(maxQuantityInput.value) || 10000;
        this.state.currentService.active = activeCheckbox.checked;
          // حفظ الخدمة بواسطة UnifiedPlatformServiceManager
        if (this.state.isAddMode) {
            // إضافة خدمة جديدة
            const success = UnifiedPlatformServiceManager.addService(this.state.currentService);
            if (success) {
                this.showSuccess('تمت إضافة الخدمة بنجاح');
            } else {
                this.showError('حدث خطأ أثناء إضافة الخدمة');
                return;
            }
        } else {
            // تعديل خدمة موجودة
            const success = UnifiedPlatformServiceManager.updateService(this.state.currentService);
            if (success) {
                this.showSuccess('تم تحديث الخدمة بنجاح');
            } else {
                this.showError('حدث خطأ أثناء تحديث الخدمة');
                return;
            }
        }
        
        // إغلاق المودال وتحديث العرض
        this.closeServiceModal();
        this.loadData();
        this.renderServices();
    },
    
    /**
     * حذف خدمة
     * @param {string} serviceId معرف الخدمة
     */
    deleteService: function(serviceId) {
        if (!serviceId) return;
          if (confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة؟')) {
            // حذف الخدمة بواسطة UnifiedPlatformServiceManager
            const success = UnifiedPlatformServiceManager.deleteService(serviceId);
            if (success) {
                this.showSuccess('تم حذف الخدمة بنجاح');
                this.loadData();
                this.renderServices();
            } else {
                this.showError('حدث خطأ أثناء حذف الخدمة');
            }
        }
    },
    
    /**
     * عرض الخدمات
     */
    renderServices: function() {
        const container = document.getElementById('services-container');
        if (!container) return;
        
        // تفريغ الحاوية
        container.innerHTML = '';
        
        // فلترة الخدمات حسب المنصة المختارة
        let filteredServices = [...this.state.services];
        if (this.state.filterPlatform && this.state.filterPlatform !== 'all') {
            filteredServices = filteredServices.filter(service => service.platformId === this.state.filterPlatform);
        }
        
        // إذا لم تكن هناك خدمات
        if (filteredServices.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-info-circle text-blue-500 text-4xl mb-4"></i>
                    <p class="text-gray-600">لا توجد خدمات مضافة. قم بإضافة خدمة جديدة الآن!</p>
                </div>
            `;
            return;
        }
        
        // إنشاء بطاقات الخدمات
        filteredServices.forEach(service => {
            // الحصول على معلومات المنصة المرتبطة
            const platform = this.getPlatformById(service.platformId);
            
            if (!platform) {
                // تخطي الخدمات التي لا ترتبط بمنصة موجودة
                console.warn(`تم تخطي عرض الخدمة ${service.id} (${service.name}) لأن المنصة ${service.platformId} غير موجودة`);
                return;
            }
            
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card bg-white p-5 rounded-lg shadow-md mb-4 flex flex-col md:flex-row justify-between items-center';
            serviceCard.id = `service-${service.id}`;
            
            const iconClass = this.getServiceIconClass(service.name);
            const iconName = this.getServiceIcon(service.name);
            
            // بناء بطاقة الخدمة مع إظهار معلومات المنصة المرتبطة
            serviceCard.innerHTML = `
                <div class="flex items-center w-full md:w-auto mb-3 md:mb-0">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4 ${iconClass}">
                        <i class="${iconName} text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">${service.name}</h3>
                        <div class="flex items-center text-sm text-gray-500">
                            <span class="platform-tag flex items-center">
                                <i class="fab fa-${platform.icon || 'globe'} mr-1" style="color: ${platform.color || '#4f46e5'}"></i>
                                ${platform.name}
                            </span>
                            <span class="mx-2">•</span>
                            <span>${service.description || 'لا يوجد وصف'}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2 rtl:space-x-reverse mt-3 md:mt-0">
                    <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        ${service.price ? this.formatPrice(service.price) : 'السعر غير محدد'}
                    </span>
                    <button class="edit-service-btn px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700" data-id="${service.id}">
                        تعديل
                    </button>
                    <button class="delete-service-btn px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700" data-id="${service.id}">
                        حذف
                    </button>
                </div>
            `;
            
            container.appendChild(serviceCard);
        });
        
        // إعداد أحداث بطاقات الخدمات
        this.setupServiceCardListeners();
    },
    
    /**
     * إعداد أحداث بطاقات الخدمات
     */
    setupServiceCardListeners: function() {
        // أزرار تعديل الخدمة
        document.querySelectorAll('.edit-service-btn').forEach(button => {
            button.addEventListener('click', () => {
                const serviceId = button.dataset.id;
                if (serviceId) {
                    this.openEditServiceModal(serviceId);
                }
            });
        });
        
        // أزرار حذف الخدمة
        document.querySelectorAll('.delete-service-btn').forEach(button => {
            button.addEventListener('click', () => {
                const serviceId = button.dataset.id;
                if (serviceId) {
                    this.deleteService(serviceId);
                }
            });
        });
    },
    
    /**
     * إعداد القائمة المنسدلة للمنصات
     */
    setupPlatformDropdown: function() {
        const serviceFilter = document.getElementById('service-filter');
        if (!serviceFilter) return;
        
        // مسح الخيارات الحالية
        serviceFilter.innerHTML = '';
        
        // إضافة خيار "الكل"
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'جميع المنصات';
        serviceFilter.appendChild(allOption);
        
        // إضافة خيارات المنصات
        this.state.platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform.id;
            option.textContent = platform.name;
            serviceFilter.appendChild(option);
        });
        
        // تعيين القيمة الافتراضية
        serviceFilter.value = this.state.filterPlatform;
    },
    
    /**
     * الحصول على منصة بواسطة المعرف
     */    getPlatformById: function(platformId) {
        return UnifiedPlatformServiceManager.getPlatformById(platformId) || this.state.platforms.find(p => p.id === platformId) || null;
    },
    
    /**
     * تنسيق السعر
     */
    formatPrice: function(price) {
        return '$' + parseFloat(price).toFixed(2);
    },
    
    /**
     * عرض رسالة نجاح
     */
    showSuccess: function(message) {
        // تجاهل الإشعارات في وضع التحميل الصامت
        if (this.state.isSilentLoad) {
            console.log('[صامت] رسالة نجاح:', message);
            return;
        }

        if (window.notificationHelper && typeof notificationHelper.success === 'function') {
            notificationHelper.success(message);
        } else {
            alert(message);
        }
    },
    
    /**
     * عرض رسالة خطأ
     */
    showError: function(message) {
        // نعرض أخطاء حتى في وضع التحميل الصامت لأنها مهمة
        if (window.notificationHelper && typeof notificationHelper.error === 'function') {
            notificationHelper.error(message);
        } else {
            alert('خطأ: ' + message);
        }
    },
    
    /**
     * الحصول على أيقونة الخدمة بناءً على اسمها
     */
    getServiceIcon: function(serviceName) {
        if (!serviceName) return 'fas fa-certificate';
        
        const name = serviceName.toLowerCase();
        
        if (name.includes('متابع') || name.includes('follow')) {
            return 'fas fa-user-plus';
        } else if (name.includes('إعجاب') || name.includes('like')) {
            return 'fas fa-heart';
        } else if (name.includes('تعليق') || name.includes('comment')) {
            return 'fas fa-comment';
        } else if (name.includes('مشاهد') || name.includes('view')) {
            return 'fas fa-eye';
        } else if (name.includes('مشارك') || name.includes('share')) {
            return 'fas fa-share';
        }
        
        return 'fas fa-certificate';
    },
    
    /**
     * الحصول على صنف أيقونة الخدمة
     */
    getServiceIconClass: function(serviceName) {
        if (!serviceName) return 'bg-gray-100 text-gray-600';
        
        const name = serviceName.toLowerCase();
        
        if (name.includes('متابع') || name.includes('follow')) {
            return 'bg-indigo-100 text-indigo-600';
        } else if (name.includes('إعجاب') || name.includes('like')) {
            return 'bg-red-100 text-red-600';
        } else if (name.includes('تعليق') || name.includes('comment')) {
            return 'bg-green-100 text-green-600';
        } else if (name.includes('مشاهد') || name.includes('view')) {
            return 'bg-blue-100 text-blue-600';
        } else if (name.includes('مشارك') || name.includes('share')) {
            return 'bg-yellow-100 text-yellow-600';
        }
        
        return 'bg-gray-100 text-gray-600';
    },
    
    /**
     * تحديث قائمة الخدمات (لاستخدامها من الخارج)
     */
    refreshServicesList: function(silent = false) {
        // تحديد ما إذا كان التحديث صامتًا
        const wasSilent = this.state.isSilentLoad;
        if (silent) this.state.isSilentLoad = true;
        
        // تحميل المنصات والخدمات من جديد
        this.loadPlatformsAndServices();
        
        // إعادة عرض الخدمات
        this.renderServices();
        
        // تحديث القائمة المنسدلة للمنصات
        this.setupPlatformDropdown();
        
        // إظهار رسالة نجاح فقط إذا لم يكن في وضع صامت
        if (!this.state.isSilentLoad) {
            this.showSuccess("تم تحديث قائمة الخدمات بنجاح");
        }
        
        // إعادة تعيين حالة الصمت إلى ما كانت عليه
        if (silent) this.state.isSilentLoad = wasSilent;
    },
    
    /**
     * الحصول على الخدمات
     */
    getServices: function() {
        return this.state.services;
    },
    
    /**
     * تعيين الخدمات
     */
    setServices: function(services) {
        if (Array.isArray(services)) {
            this.state.services = services;
            this.renderServices();
        }
    }
};

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    servicesDashboard.init();
});
