// مكوّن عرض الخدمات في الواجهة الأمامية - نسخة محدثة

const servicesFrontend = (() => {
    // تهيئة النظام
    const init = () => {
        // تحميل وعرض الخدمات من localStorage فقط
        loadServicesFromLocalStorage();
        
        console.log('تم تهيئة مكوّن عرض الخدمات في الواجهة الأمامية (نسخة محدثة)');
    };
    
    // تحميل الخدمات من localStorage.social_services فقط
    const loadServicesFromLocalStorage = () => {
        // الحصول على المنصات والخدمات من localStorage
        let services = [];
        let platforms = [];
        
        try {
            // تحميل المنصات أولا
            const storedPlatforms = localStorage.getItem('social_platforms');
            if (storedPlatforms) {
                platforms = JSON.parse(storedPlatforms);
                // تصفية المنصات النشطة فقط
                platforms = platforms.filter(platform => platform.active === true);
                
                console.log(`تم تحميل ${platforms.length} منصة من localStorage.social_platforms`);
            } else {
                console.log('لم يتم العثور على أي منصات في localStorage.social_platforms');
            }
            
            // تحميل الخدمات بناءً على المنصات المتاحة
            const storedServices = localStorage.getItem('social_services');
            
            if (storedServices && platforms.length > 0) {
                // تحويل البيانات من JSON إلى كائنات JavaScript
                const allServices = JSON.parse(storedServices);
                
                // الحصول على قائمة المعرفات للمنصات المتاحة
                const platformIds = platforms.map(platform => platform.id);
                
                // تصفية الخدمات:
                // 1. يجب أن تكون الخدمة نشطة (active === true)
                // 2. يجب أن تكون المنصة موجودة في social_platforms
                services = allServices.filter(service => 
                    service.active === true && 
                    platformIds.includes(service.platformId)
                );
                
                console.log(`تم تحميل ${services.length} خدمة صالحة من localStorage.social_services`);
            } else {
                console.log('لم يتم العثور على خدمات أو منصات كافية');
            }
        } catch (error) {
            console.error('خطأ أثناء تحميل البيانات من localStorage:', error);
        }
        
        // عرض الخدمات والمنصات في الواجهة
        renderPlatformsWithServices(platforms, services);
    };
    
    // عرض المنصات والخدمات في الواجهة
    const renderPlatformsWithServices = (platforms, services) => {
        const container = document.getElementById('social-platforms-container');
        if (!container) {
            console.error('لم يتم العثور على حاوية المنصات في الصفحة');
            return;
        }
        
        // تفريغ الحاوية
        container.innerHTML = '';
        
        // التحقق من وجود منصات وخدمات
        if (!platforms || platforms.length === 0 || !services || services.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <div class="text-gray-400 mb-4"><i class="fas fa-box-open text-4xl"></i></div>
                    <h3 class="text-xl font-bold text-gray-700">لا توجد خدمات أو منصات متاحة حالياً</h3>
                    <p class="text-gray-500 mt-2">يرجى التحقق من إعدادات الخدمات والمنصات في لوحة التحكم.</p>
                </div>
            `;
            return;
        }
        
        // تصنيف الخدمات حسب المنصة
        const servicesByPlatform = {};
        platforms.forEach(platform => {
            servicesByPlatform[platform.id] = services.filter(service => 
                service.platformId === platform.id && service.active === true
            );
        });
        
        // إنشاء بطاقات المنصات
        platforms.forEach(platform => {
            // تخطي المنصات بدون خدمات
            if (!servicesByPlatform[platform.id] || servicesByPlatform[platform.id].length === 0) {
                return;
            }
            
            // إنشاء بطاقة المنصة
            const platformCard = document.createElement('div');
            platformCard.className = 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all';
            
            // رأس البطاقة (معلومات المنصة)
            platformCard.innerHTML = `
                <div class="p-5 border-b">
                    <div class="flex items-center">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center mr-3" style="background-color: ${hexToRgba(platform.color, 0.15)}">
                            <i class="fab fa-${platform.icon || 'globe'} text-xl" style="color: ${platform.color || '#3b82f6'}"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">${platform.name}</h3>
                            <p class="text-sm text-gray-500">${servicesByPlatform[platform.id].length} خدمة متاحة</p>
                        </div>
                    </div>
                </div>
                <div class="p-4 platform-services"></div>
            `;
            
            // الحصول على حاوية الخدمات
            const servicesContainer = platformCard.querySelector('.platform-services');
            
            // إضافة خدمات المنصة
            servicesByPlatform[platform.id].forEach(service => {
                const serviceElement = document.createElement('div');
                serviceElement.className = 'border-b border-gray-100 py-3 last:border-b-0';
                serviceElement.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-medium">${service.name}</h4>
                            <p class="text-xs text-gray-500 mt-1">${service.description || 'لا يوجد وصف'}</p>
                        </div>
                        <div>
                            <button class="order-service-btn px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition" 
                                    data-service-id="${service.id}" 
                                    data-platform-id="${platform.id}">
                                <i class="fas fa-shopping-cart mr-1"></i> طلب
                            </button>
                        </div>
                    </div>
                `;
                
                servicesContainer.appendChild(serviceElement);
            });
            
            container.appendChild(platformCard);
        });
        
        // تفعيل أزرار الطلب
        attachOrderButtonEvents();
    };
    
    // تحويل اللون السداسي إلى RGBA
    const hexToRgba = (hex, alpha = 1) => {
        if (!hex) return `rgba(107, 114, 128, ${alpha})`;
        
        try {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch (error) {
            return `rgba(107, 114, 128, ${alpha})`;
        }
    };
    
    // إضافة أحداث لأزرار الطلب
    const attachOrderButtonEvents = () => {
        document.querySelectorAll('.order-service-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const serviceId = e.currentTarget.getAttribute('data-service-id');
                const platformId = e.currentTarget.getAttribute('data-platform-id');
                
                // إرسال حدث اختيار المنصة والخدمة للنموذج الرئيسي
                document.dispatchEvent(new CustomEvent('platformSelected', { detail: { platformId } }));
                document.dispatchEvent(new CustomEvent('serviceSelected', { detail: { serviceId } }));
                
                // التمرير إلى أعلى الصفحة
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    };
    
    // الواجهة العامة
    return {
        init,
        loadServicesFromLocalStorage
    };
})();

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (typeof servicesFrontend !== 'undefined') {
        servicesFrontend.init();
    }
});
