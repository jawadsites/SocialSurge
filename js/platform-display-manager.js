/**
 * نظام عرض المنصات في الصفحة الرئيسية
 * Platform Display System for the homepage
 */
const platformDisplayManager = {
    // حاوية المنصات
    platformsContainerId: 'platforms-container',
    // حاوية الخدمات
    servicesContainerId: 'services-container',
    
    /**
     * تهيئة نظام العرض
     */
    init() {
        this.displayPlatforms();
        
        // الاستماع لأحداث تحديث البيانات
        document.addEventListener('platformServiceDataUpdated', () => {
            this.displayPlatforms();
        });
        
        // الاستماع لحدث تحديد المنصة للعرض
        document.addEventListener('click', (e) => {
            const platformElement = e.target.closest('.platform-option');
            if (platformElement) {
                const platformId = platformElement.dataset.platformId;
                if (platformId) {
                    this.handlePlatformClick(platformId, platformElement);
                }
            }
        });
    },
    
    /**
     * عرض المنصات في الواجهة
     */
    displayPlatforms() {
        // التأكد من وجود مدير المنصات والخدمات
        if (!window.UnifiedPlatformServiceManager && !window.PlatformServiceManager) {
            console.error('مدير المنصات والخدمات غير متوفر!');
            return;
        }
        
        // الحصول على الحاوية
        const container = document.getElementById(this.platformsContainerId);
        if (!container) return;
        
        // استدعاء مدير المنصات المناسب
        const manager = window.UnifiedPlatformServiceManager || window.PlatformServiceManager;
        
        // الحصول على المنصات النشطة فقط
        const platforms = manager.getDisplayPlatforms();
        
        // تفريغ الحاوية
        container.innerHTML = '';
        
        // إذا لم توجد منصات
        if (!platforms || platforms.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500">لا توجد منصات متاحة حالياً</div>';
            return;
        }
        
        // إنشاء شبكة المنصات
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4';
        grid.id = 'platforms-grid';
        container.appendChild(grid);
        
        // عرض كل منصة
        platforms.forEach(platform => {
            const platformCard = this.createPlatformCard(platform);
            grid.appendChild(platformCard);
        });
        
        // تحديد المنصة الأولى كافتراضية
        if (platforms.length > 0) {
            setTimeout(() => {
                const firstPlatformCard = grid.querySelector('.platform-option');
                if (firstPlatformCard) {
                    this.handlePlatformClick(platforms[0].id, firstPlatformCard);
                }
            }, 100);
        }
    },
    
    /**
     * إنشاء بطاقة منصة
     * @param {Object} platform - بيانات المنصة
     * @returns {HTMLElement} عنصر HTML للمنصة
     */
    createPlatformCard(platform) {
        // استخراج اللون بشكل آمن
        let bgColor = 'rgba(243, 244, 246, 0.5)';
        let textColor = '#4f46e5';
        
        if (platform.color && /^#[0-9a-fA-F]{6}$/.test(platform.color)) {
            bgColor = `${platform.color}20`; // 20 للشفافية
            textColor = platform.color;
        }
        
        // تنظيف اسم الأيقونة
        const icon = platform.icon ? platform.icon.replace(/^fab fa-/, '') : 'globe';
        
        // إنشاء عنصر div للمنصة
        const platformCard = document.createElement('div');
        platformCard.className = 'platform-option border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1';
        platformCard.dataset.platformId = platform.id;
        platformCard.style.borderColor = 'rgba(209, 213, 219, 0.5)';
        
        // محتوى البطاقة
        platformCard.innerHTML = `
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-3" style="background-color: ${bgColor}">
                <i class="fab fa-${icon} text-2xl" style="color: ${textColor}"></i>
            </div>
            <h3 class="font-bold text-center">${platform.name}</h3>
        `;
        
        return platformCard;
    },
    
    /**
     * معالجة النقر على منصة
     * @param {string} platformId - معرف المنصة
     * @param {HTMLElement} platformElement - عنصر المنصة
     */
    handlePlatformClick(platformId, platformElement) {
        // تعليم المنصة المحددة
        const allPlatforms = document.querySelectorAll('.platform-option');
        allPlatforms.forEach(el => {
            el.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
            el.classList.add('bg-white');
        });
        
        platformElement.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
        platformElement.classList.remove('bg-white');
        
        // إرسال حدث اختيار المنصة
        document.dispatchEvent(new CustomEvent('platformSelected', {
            detail: { platformId }
        }));
        
        // عرض خدمات المنصة
        this.displayPlatformServices(platformId);
    },
    
    /**
     * عرض الخدمات المرتبطة بمنصة معينة
     * @param {string} platformId - معرف المنصة
     */
    displayPlatformServices(platformId) {
        // التأكد من وجود مدير المنصات والخدمات
        if (!window.UnifiedPlatformServiceManager && !window.PlatformServiceManager) {
            console.error('مدير المنصات والخدمات غير متوفر!');
            return;
        }
        
        // الحصول على الحاوية
        const container = document.getElementById(this.servicesContainerId);
        if (!container) return;
        
        // استدعاء مدير المنصات المناسب
        const manager = window.UnifiedPlatformServiceManager || window.PlatformServiceManager;
        
        // الحصول على المنصة
        const platform = manager.getPlatformById(platformId);
        if (!platform) return;
        
        // الحصول على الخدمات المرتبطة بالمنصة
        const services = manager.getPlatformServices(platformId);
        
        // تفريغ الحاوية
        container.innerHTML = '';
        
        // إضافة عنوان القسم
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'mb-6';
        sectionHeader.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-2">خدمات ${platform.name}</h2>
            <p class="text-gray-600">اختر إحدى الخدمات التالية للطلب</p>
        `;
        container.appendChild(sectionHeader);
        
        // إنشاء حاوية للبطاقات
        const servicesGrid = document.createElement('div');
        servicesGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        container.appendChild(servicesGrid);
        
        // إذا لم توجد خدمات للمنصة
        if (!services || services.length === 0) {
            servicesGrid.innerHTML = `
                <div class="col-span-full bg-gray-50 rounded-lg p-8 text-center">
                    <i class="fas fa-info-circle text-blue-500 text-3xl mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">لا توجد خدمات متاحة</h3>
                    <p class="text-gray-600">لم يتم العثور على خدمات لمنصة ${platform.name} حالياً.</p>
                </div>
            `;
            return;
        }
        
        // عرض كل خدمة
        services.forEach(service => {
            const serviceCard = this.createServiceCard(service, platform);
            servicesGrid.appendChild(serviceCard);
        });
        
        // التمرير إلى قسم الخدمات
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },
    
    /**
     * إنشاء بطاقة خدمة
     * @param {Object} service - بيانات الخدمة
     * @param {Object} platform - بيانات المنصة
     * @returns {HTMLElement} عنصر HTML للخدمة
     */
    createServiceCard(service, platform) {
        // الحصول على أيقونة الخدمة
        const icon = this.getServiceIcon(service);
        const iconClass = this.getServiceIconClass(service);
        
        // تنسيق السعر
        const price = this.formatPrice(service.price);
        
        // إنشاء عنصر div للخدمة
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1';
        serviceCard.dataset.serviceId = service.id;
        
        // محتوى البطاقة
        serviceCard.innerHTML = `
            <div class="p-6">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full ${iconClass} flex items-center justify-center mr-4">
                        <i class="${icon}"></i>
                    </div>
                    <h3 class="text-lg font-bold">${service.name}</h3>
                </div>
                
                <p class="text-gray-600 mb-4 text-sm h-12 overflow-hidden">${service.description}</p>
                
                <div class="flex justify-between items-center border-t pt-4">
                    <div class="flex items-center">
                        <span class="bg-gray-100 text-xs px-2 py-1 rounded text-gray-600">
                            ${service.minQuantity}+ وحدة
                        </span>
                        <span class="mr-2 bg-indigo-100 text-xs px-2 py-1 rounded text-indigo-700">
                            <i class="fab fa-${platform.icon || 'globe'} ml-1"></i>${platform.name}
                        </span>
                    </div>
                    <span class="font-bold text-lg text-indigo-600">${price}</span>
                </div>
            </div>
            <button class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors select-service-btn">
                اختيار الخدمة
            </button>
        `;
        
        // إضافة حدث النقر
        const selectButton = serviceCard.querySelector('.select-service-btn');
        if (selectButton) {
            selectButton.addEventListener('click', () => {
                this.handleServiceSelection(service, platform);
            });
        }
        
        return serviceCard;
    },
    
    /**
     * معالجة اختيار خدمة
     * @param {Object} service - بيانات الخدمة
     * @param {Object} platform - بيانات المنصة
     */
    handleServiceSelection(service, platform) {
        // إرسال حدث اختيار الخدمة
        document.dispatchEvent(new CustomEvent('serviceSelected', {
            detail: { serviceId: service.id, platformId: platform.id }
        }));
        
        // تحديث النموذج إذا كان Alpine.js متاحًا
        const alpineForm = document.querySelector('[x-data]');
        if (window.Alpine && alpineForm) {
            const alpineComponent = window.Alpine.$data(alpineForm);
            if (alpineComponent) {
                alpineComponent.selectedPlatform = platform.id;
                alpineComponent.selectedService = service.id;
                
                // تحديث الكمية بناءً على الحد الأدنى للخدمة
                if (service.minQuantity) {
                    alpineComponent.quantity = service.minQuantity;
                }
                
                // تحديث السعر
                if (typeof alpineComponent.updatePrice === 'function') {
                    alpineComponent.updatePrice();
                }
                
                // التمرير إلى نموذج الطلب
                const orderForm = document.getElementById('order-form');
                if (orderForm) {
                    setTimeout(() => {
                        orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        }
    },
    
    /**
     * الحصول على أيقونة الخدمة
     * @param {Object} service - بيانات الخدمة
     * @returns {string} صنف أيقونة Font Awesome
     */
    getServiceIcon(service) {
        if (!service || !service.name) return 'fas fa-certificate';
        
        const name = service.name.toLowerCase();
        
        if (name.includes('متابع') || name.includes('follow')) {
            return 'fas fa-user-plus';
        } else if (name.includes('إعجاب') || name.includes('like')) {
            return 'fas fa-heart';
        } else if (name.includes('مشاهد') || name.includes('view')) {
            return 'fas fa-eye';
        } else if (name.includes('تعليق') || name.includes('comment')) {
            return 'fas fa-comment';
        }
        
        return 'fas fa-certificate';
    },
    
    /**
     * الحصول على صنف أيقونة الخدمة
     * @param {Object} service - بيانات الخدمة
     * @returns {string} أصناف CSS للأيقونة
     */
    getServiceIconClass(service) {
        if (!service || !service.name) return 'bg-gray-100 text-gray-600';
        
        const name = service.name.toLowerCase();
        
        if (name.includes('متابع') || name.includes('follow')) {
            return 'bg-indigo-100 text-indigo-600';
        } else if (name.includes('إعجاب') || name.includes('like')) {
            return 'bg-pink-100 text-pink-600';
        } else if (name.includes('مشاهد') || name.includes('view')) {
            return 'bg-blue-100 text-blue-600';
        } else if (name.includes('تعليق') || name.includes('comment')) {
            return 'bg-green-100 text-green-600';
        }
        
        return 'bg-gray-100 text-gray-600';
    },
    
    /**
     * تنسيق السعر
     * @param {number} price - السعر
     * @param {string} currency - العملة (افتراضي: USD)
     * @returns {string} السعر المنسق
     */
    formatPrice(price, currency = 'USD') {
        if (typeof price !== 'number') {
            price = 0;
        }
        
        const currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'SAR': '﷼',
            'AED': 'د.إ'
        };
        
        const symbol = currencySymbols[currency] || '$';
        return `${symbol}${price.toFixed(2)}`;
    }
};

// تهيئة نظام عرض المنصات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    platformDisplayManager.init();
});
