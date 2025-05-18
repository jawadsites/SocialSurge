/**
 * تكامل نظام المنصات والخدمات مع الصفحة الرئيسية
 * @version 1.0.0
 */
document.addEventListener('DOMContentLoaded', function() {
    // التأكد من تهيئة نظام إدارة المنصات والخدمات
    if (!window.UnifiedPlatformServiceManager) {
        console.error('نظام إدارة المنصات والخدمات غير موجود!');
        return;
    }
    
    // التأكد من وجود Alpine.js
    if (!window.Alpine) {
        console.error('Alpine.js غير موجود!');
        return;
    }
    
    // تكامل مع Alpine.js
    document.addEventListener('alpine:init', function() {
        // دالة للتكامل مع Alpine.js
        function integrateWithAlpine() {
            const alpineElement = document.querySelector('[x-data="orderFormData()"]');
            if (alpineElement) {
                try {
                    const alpineComponent = Alpine.$data(alpineElement);
                    
                    if (alpineComponent) {
                        // تحديث المنصات والخدمات في Alpine.js
                        
                        // تحديث المنصات
                        const platforms = UnifiedPlatformServiceManager.getAllPlatforms();
                        alpineComponent.platforms = platforms.filter(p => p.active);
                        alpineComponent.availablePlatforms = platforms.filter(p => p.active);
                        
                        // تحديث الخدمات
                        const allServices = UnifiedPlatformServiceManager.getAllServices();
                        alpineComponent.services = allServices.filter(s => s.active);
                        
                        // تحديث الخدمات المتاحة بناءً على المنصة المختارة
                        if (alpineComponent.selectedPlatform) {
                            alpineComponent.availableServices = allServices.filter(
                                s => s.active && s.platformId === alpineComponent.selectedPlatform
                            );
                        }
                        
                        // تحديث سعر الخدمة الحالية إذا كانت محددة
                        if (alpineComponent.selectedService) {
                            alpineComponent.updatePrice();
                        }
                        
                        console.log('تم تحديث بيانات Alpine.js بنجاح');
                    }
                } catch (error) {
                    console.error('خطأ في تكامل Alpine.js:', error);
                }
            }
        }
        
        // دالة إعادة تهيئة المنصات (للاستدعاء الخارجي)
        window.reinitializePlatforms = function() {
            integrateWithAlpine();
        };
        
        // الاستماع لأحداث تحديث البيانات
        document.addEventListener('platformDataUpdated', integrateWithAlpine);
        document.addEventListener('serviceDataUpdated', integrateWithAlpine);
        
        // التهيئة المبدئية
        integrateWithAlpine();
    });
    
    // تهيئة نظام عرض المنصات والخدمات في الصفحة الرئيسية
    function initializeFrontendDisplay() {
        const platformsGrid = document.getElementById('platforms-grid');
        
        // التأكد من وجود شبكة المنصات
        if (platformsGrid) {
            // الاستماع لحدث تحديث بيانات المنصات
            document.addEventListener('platformDataUpdated', displayPlatforms);
            
            // عرض المنصات
            displayPlatforms();
        }
        
        // إضافة مستمع حدث تحديث بيانات الخدمات للتكامل مع Alpine.js
        document.addEventListener('serviceDataUpdated', function() {
            // إعادة تهيئة المنصات في Alpine.js
            if (typeof reinitializePlatforms === 'function') {
                reinitializePlatforms();
            }
        });
    }
    
    /**
     * عرض المنصات في شبكة المنصات
     */
    function displayPlatforms() {
        const platformsGrid = document.getElementById('platforms-grid');
        if (!platformsGrid) return;
        
        try {
            // الحصول على المنصات النشطة فقط
            const platforms = UnifiedPlatformServiceManager.getAllPlatforms().filter(p => p.active);
            
            // تفريغ الشبكة
            platformsGrid.innerHTML = '';
            
            // إضافة قالب Alpine.js لعرض المنصات
            const template = document.createElement('template');
            template.setAttribute('x-for', 'platform in availablePlatforms');
            template.setAttribute(':key', 'platform.id');
            
            // محتوى القالب
            template.innerHTML = `
                <div class="platform-option border rounded-lg p-3 flex flex-col items-center cursor-pointer" 
                     :class="{'active': selectedPlatform === platform.id}"
                     @click="selectedPlatform = platform.id; selectedService = availableServices.length > 0 ? availableServices[0].id : ''; updatePrice()">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2" 
                         :style="\`background-color: rgba(\${parseInt(platform.color.slice(1,3),16)}, \${parseInt(platform.color.slice(3,5),16)}, \${parseInt(platform.color.slice(5,7),16)}, 0.15)\`">
                        <i :class="\`fab fa-\${platform.icon} text-xl\`" :style="\`color: \${platform.color}\`"></i>
                    </div>
                    <span class="text-sm font-medium" x-text="platform.name"></span>
                </div>
            `;
            
            // إضافة القالب إلى الشبكة
            platformsGrid.appendChild(template);
            
            // إعلام بنجاح عرض المنصات
            console.log('تم عرض المنصات في الواجهة', platforms.length);
            
            // تحديث Alpine.js
            if (typeof reinitializePlatforms === 'function') {
                reinitializePlatforms();
            }
        } catch (error) {
            console.error('خطأ في عرض المنصات:', error);
        }
    }
    
    // تهيئة العرض في الواجهة
    initializeFrontendDisplay();
});