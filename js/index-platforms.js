/**
 * ربط المنصات بالصفحة الرئيسية
 * هذا الملف يقوم بعرض المنصات المخزنة في localStorage على الصفحة الرئيسية
 */

document.addEventListener('DOMContentLoaded', function() {
    // تحميل المنصات وعرضها في الصفحة الرئيسية
    loadAndDisplayPlatforms();
    
    // تهيئة أزرار التصفية
    initFilterButtons();
});

// حالة التصفية الحالية
let currentFilter = 'all';
let allPlatforms = [];

/**
 * تهيئة أزرار تصفية المنصات
 */
function initFilterButtons() {
    const filterButtons = [
        { id: 'filter-all', type: 'all' },
        { id: 'filter-social', type: 'social' },
        { id: 'filter-video', type: 'video' },
        { id: 'filter-messaging', type: 'messaging' }
    ];
    
    filterButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('click', () => {
                // إزالة الفئة النشطة من جميع الأزرار
                filterButtons.forEach(b => {
                    const btn = document.getElementById(b.id);
                    if (btn) {
                        btn.classList.remove('bg-blue-600', 'text-white');
                        btn.classList.add('bg-gray-200', 'text-gray-700');
                    }
                });
                
                // إضافة الفئة النشطة إلى الزر المحدد
                element.classList.remove('bg-gray-200', 'text-gray-700');
                element.classList.add('bg-blue-600', 'text-white');
                
                // تحديث حالة التصفية وإعادة عرض المنصات
                currentFilter = button.type;
                displayFilteredPlatforms();
            });
        }
    });
}

/**
 * عرض المنصات المصفاة حسب النوع الحالي
 */
function displayFilteredPlatforms() {
    const platformsContainer = document.getElementById('social-platforms-container');
    if (!platformsContainer) return;
    
    // تنظيف الحاوية
    platformsContainer.innerHTML = '';
    
    // التحقق من وجود منصات
    if (!allPlatforms || allPlatforms.length === 0) {
        platformsContainer.innerHTML = `
            <div class="col-span-full text-center py-10">
                <div class="text-gray-500">
                    <i class="fas fa-globe text-4xl mb-3 opacity-50"></i>
                    <p class="text-lg">لا توجد منصات متاحة</p>
                    <p class="text-sm mt-2">يمكنك إضافة منصات جديدة من <a href="dashboard.html" class="text-blue-600 hover:underline">لوحة التحكم</a></p>
                </div>
            </div>
        `;
        return;
    }
    
    // إنشاء مجموعة لتخزين المنصات الفريدة باستخدام الـ slug
    const uniquePlatformsBySlug = {};
    allPlatforms.forEach(platform => {
        if (platform.slug) {
            uniquePlatformsBySlug[platform.slug] = platform;
        }
    });
    
    // تحويل المنصات الفريدة إلى مصفوفة
    const uniquePlatformsArray = Object.values(uniquePlatformsBySlug);
    
    // تصفية المنصات النشطة وحسب النوع المحدد
    const filteredPlatforms = uniquePlatformsArray.filter(platform => {
        if (!platform.active) return false;
        if (currentFilter === 'all') return true;
        return platform.type === currentFilter;
    });
    
    // إذا لا توجد منصات بعد التصفية
    if (filteredPlatforms.length === 0) {
        platformsContainer.innerHTML = `
            <div class="col-span-full text-center py-10">
                <div class="text-gray-500">
                    <i class="fas fa-filter text-4xl mb-3 opacity-50"></i>
                    <p class="text-lg">لا توجد منصات من هذا النوع</p>
                    <p class="text-sm mt-2">يمكنك تغيير التصفية أو إضافة منصات من <a href="dashboard.html" class="text-blue-600 hover:underline">لوحة التحكم</a></p>
                </div>
            </div>
        `;
        return;
    }
    
    // إنشاء عناصر HTML للمنصات
    filteredPlatforms.forEach((platform, index) => {
        const platformEl = document.createElement('div');
        platformEl.className = 'platform-card bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 opacity-0';
        // إضافة تأثير ظهور متسلسل
        setTimeout(() => {
            platformEl.classList.add('opacity-100');
            platformEl.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease';
        }, 100 * index);

        // تحديد فئة الأيقونة
        const iconClass = platform.icon ? `fab fa-${platform.icon}` : 'fas fa-globe';

        // تحديد شارة نوع المنصة
        let typeBadge = '';
        switch(platform.type) {
            case 'social':
                typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">تواصل اجتماعي</span>';
                break;
            case 'video':
                typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">فيديو</span>';
                break;
            case 'messaging':
                typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">مراسلة</span>';
                break;
            default:
                typeBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">أخرى</span>';
        }

        platformEl.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center ml-3" style="background-color: ${platform.color || '#e5e7eb'}">
                    <i class="${iconClass} text-white text-xl"></i>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${platform.name}</h3>
                    <div class="mt-1">${typeBadge}</div>
                </div>
            </div>
            <p class="text-gray-600 mb-4">${platform.description || 'لا يوجد وصف متاح'}</p>
            <a href="${platform.website || '#'}" class="text-blue-600 hover:text-blue-800 text-sm flex items-center" target="_blank">
                زيارة المنصة <i class="fas fa-external-link-alt mr-2 text-xs"></i>
            </a>
        `;

        platformsContainer.appendChild(platformEl);
    });
}

/**
 * تحميل وعرض المنصات في الصفحة الرئيسية
 */
function loadAndDisplayPlatforms() {
    // العثور على الحاوية التي ستعرض فيها المنصات
    const platformsContainer = document.getElementById('social-platforms-container');
    if (!platformsContainer) {
        console.log('لا توجد حاوية المنصات في هذه الصفحة');
        return;
    }

    // إظهار حالة التحميل
    platformsContainer.innerHTML = `
        <div class="col-span-full text-center py-10">
            <div class="text-gray-500">
                <i class="fas fa-spinner fa-spin text-4xl mb-3"></i>
                <p class="text-lg">جاري تحميل المنصات...</p>
            </div>
        </div>
    `;    // محاولة تحميل المنصات من localStorage
    try {
        const storedPlatforms = localStorage.getItem('social_platforms');
        if (storedPlatforms) {
            // تحميل المنصات ومعالجة التكرار باستخدام slug
            const platformsArray = JSON.parse(storedPlatforms);
            
            // استخدام Map لإزالة التكرار باستخدام الـ slug
            const slugMap = new Map();
            platformsArray.forEach(platform => {
                if (platform.slug) {
                    slugMap.set(platform.slug, platform);
                }
            });
            
            // تحويل الـ Map إلى مصفوفة
            allPlatforms = Array.from(slugMap.values());
            console.log(`تم تحميل ${allPlatforms.length} منصة من localStorage (بعد إزالة التكرار)`);
        } else {
            console.log('لا توجد منصات مخزنة في localStorage');
            allPlatforms = [];
        }
    } catch (e) {
        console.error('خطأ في تحميل المنصات:', e);
        allPlatforms = [];
    }

    // تأخير صغير لإظهار حالة التحميل (للتجربة فقط)
    setTimeout(() => {
        // عرض المنصات المصفاة
        displayFilteredPlatforms();
    }, 500);
}

/**
 * تحديث عرض المنصات (يتم استدعاؤها من platforms-manager.js عند الحاجة)
 */
function updateIndexPlatforms() {
    console.log('تحديث عرض المنصات في الصفحة الرئيسية...');
    
    // تنظيف ذاكرة التخزين المؤقت للمنصات
    allPlatforms = [];
    
    // إعادة تحميل المنصات من localStorage وعرضها
    loadAndDisplayPlatforms();
    
    // إرسال حدث لإعلام المكونات الأخرى بتحديث المنصات
    document.dispatchEvent(new CustomEvent('platformsUpdated', {
        detail: { timestamp: Date.now() }
    }));
}

// تصدير الدالة للاستخدام في الملفات الأخرى
window.updateIndexPlatforms = updateIndexPlatforms;
