/**
 * Dashboard Platform Service Management
 * 
 * مدير خدمات المنصات المتكامل للوحة التحكم
 * يتم استخدام هذا الملف للربط بين واجهة المستخدم في لوحة التحكم وبين نظام إدارة المنصات والخدمات
 *
 * المواصفات المطلوبة:
 * - إدارة المنصات من لوحة التحكم فقط تحت المفتاح social_platforms
 * - إدارة الخدمات من لوحة التحكم تحت المفتاح social_services
 * - التأكد من الربط الصحيح بين الخدمات والمنصات عن طريق platformId
 */

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود لوحة التحكم
    if (!window.location.pathname.includes('dashboard')) {
        return;
    }

    console.log('تهيئة إدارة المنصات والخدمات في لوحة التحكم...');

    // التأكد من وجود مدير الخدمات والمنصات الموحد
    if (!window.UnifiedPlatformServiceManager) {
        console.error('مدير الخدمات والمنصات الموحد غير متوفر. جاري تحميله...');
        
        // تحميل الملف بشكل ديناميكي
        const script = document.createElement('script');
        script.src = 'js/unified-platform-service-manager-new.js';
        script.onload = function() {
            console.log('تم تحميل مدير الخدمات والمنصات الموحد بنجاح');
            initializeDashboardIntegration();
        };
        script.onerror = function() {
            console.error('فشل في تحميل مدير الخدمات والمنصات الموحد');
        };
        document.head.appendChild(script);
    } else {
        // مدير الخدمات والمنصات الموحد متوفر بالفعل
        initializeDashboardIntegration();
    }
});

/**
 * تهيئة التكامل مع لوحة التحكم
 */
function initializeDashboardIntegration() {
    if (!window.UnifiedPlatformServiceManager) {
        console.error('لم يتم العثور على مدير الخدمات والمنصات الموحد');
        return;
    }

    // تهيئة إدارة المنصات
    initializePlatformsManagement();

    // تهيئة إدارة الخدمات
    initializeServicesManagement();

    // إضافة استماع لتحديث البيانات
    document.addEventListener('platformServiceDataUpdated', function() {
        refreshDashboardData();
    });

    // تحديث البيانات في لوحة التحكم
    refreshDashboardData();

    console.log('تم تهيئة إدارة المنصات والخدمات في لوحة التحكم بنجاح');
}

/**
 * تهيئة إدارة المنصات
 */
function initializePlatformsManagement() {
    // التقاط زر إضافة منصة جديدة
    const addPlatformButton = document.getElementById('add-platform-button');
    if (addPlatformButton) {
        addPlatformButton.addEventListener('click', function() {
            showPlatformModal();
        });
    }

    // إضافة استماع لنموذج إضافة منصة
    const platformForm = document.getElementById('platform-form');
    if (platformForm) {
        platformForm.addEventListener('submit', function(event) {
            event.preventDefault();
            savePlatform();
        });
    }
}

/**
 * عرض نافذة إدارة المنصة
 * @param {string} platformId - معرف المنصة (للتعديل) أو فارغ (للإضافة)
 */
function showPlatformModal(platformId) {
    // الحصول على عناصر النموذج
    const modal = document.getElementById('add-platform-modal');
    const form = document.getElementById('platform-form');
    
    if (!modal || !form) return;

    // إعادة تعيين النموذج
    form.reset();

    // تعيين العنوان حسب العملية (إضافة أو تعديل)
    const modalTitle = document.getElementById('platform-modal-title');
    if (modalTitle) {
        modalTitle.textContent = platformId ? 'تعديل منصة' : 'إضافة منصة جديدة';
    }

    // تعيين معرف المنصة (للتعديل)
    const platformIdInput = document.getElementById('platform-id');
    if (platformIdInput) {
        platformIdInput.value = platformId || '';
    }

    // ملء البيانات في حالة التعديل
    if (platformId) {
        fillPlatformForm(platformId);
    }

    // عرض النافذة
    modal.classList.remove('hidden');
}

/**
 * ملء نموذج المنصة بالبيانات للتعديل
 * @param {string} platformId - معرف المنصة
 */
function fillPlatformForm(platformId) {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على بيانات المنصة
    const platform = UnifiedPlatformServiceManager.getPlatformById(platformId);
    if (!platform) return;

    // تعيين البيانات في النموذج
    const nameInput = document.getElementById('platform-name');
    const iconInput = document.getElementById('platform-icon');
    const colorInput = document.getElementById('platform-color');
    const activeInput = document.getElementById('platform-active');

    if (nameInput) nameInput.value = platform.name || '';
    if (iconInput) iconInput.value = platform.icon || '';
    if (colorInput) colorInput.value = platform.color || '#000000';
    if (activeInput) activeInput.checked = platform.active === true;
}

/**
 * حفظ بيانات المنصة
 */
function savePlatform() {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على بيانات النموذج
    const platformId = document.getElementById('platform-id').value.trim();
    const name = document.getElementById('platform-name').value.trim();
    const icon = document.getElementById('platform-icon').value.trim();
    const color = document.getElementById('platform-color').value.trim();
    const active = document.getElementById('platform-active').checked;

    // التحقق من البيانات المطلوبة
    if (!name || !icon || !color) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    try {
        if (platformId) {
            // تحديث منصة موجودة
            UnifiedPlatformServiceManager.updatePlatform(platformId, {
                name: name,
                icon: icon,
                color: color,
                active: active
            });
        } else {
            // إنشاء معرف جديد
            const newId = icon.toLowerCase().replace(/[^a-z0-9]/g, '-');

            // إضافة منصة جديدة
            UnifiedPlatformServiceManager.addPlatform({
                id: newId,
                name: name,
                icon: icon,
                color: color,
                active: active
            });
        }

        // إغلاق النافذة
        const modal = document.getElementById('add-platform-modal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // تحديث العرض
        refreshDashboardData();

    } catch (error) {
        alert('حدث خطأ أثناء حفظ المنصة: ' + error.message);
    }
}

/**
 * تهيئة إدارة الخدمات
 */
function initializeServicesManagement() {
    // التقاط زر إضافة خدمة جديدة
    const addServiceButton = document.getElementById('add-service-button');
    if (addServiceButton) {
        addServiceButton.addEventListener('click', function() {
            showServiceModal();
        });
    }

    // إضافة استماع لنموذج إضافة خدمة
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveService();
        });
    }
}

/**
 * عرض نافذة إدارة الخدمة
 * @param {string} serviceId - معرف الخدمة (للتعديل) أو فارغ (للإضافة)
 */
function showServiceModal(serviceId) {
    // الحصول على عناصر النموذج
    const modal = document.getElementById('add-service-modal');
    const form = document.getElementById('service-form');
    
    if (!modal || !form) return;

    // إعادة تعيين النموذج
    form.reset();

    // تعيين العنوان حسب العملية (إضافة أو تعديل)
    const modalTitle = document.getElementById('service-modal-title');
    if (modalTitle) {
        modalTitle.textContent = serviceId ? 'تعديل خدمة' : 'إضافة خدمة جديدة';
    }

    // تعيين معرف الخدمة (للتعديل)
    const serviceIdInput = document.getElementById('service-id');
    if (serviceIdInput) {
        serviceIdInput.value = serviceId || '';
    }

    // ملء البيانات في حالة التعديل
    if (serviceId) {
        fillServiceForm(serviceId);
    }

    // ملء قائمة المنصات
    fillPlatformsDropdown();

    // عرض النافذة
    modal.classList.remove('hidden');
}

/**
 * ملء قائمة المنصات في نموذج الخدمة
 */
function fillPlatformsDropdown() {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على عنصر القائمة
    const platformSelect = document.getElementById('service-platform');
    if (!platformSelect) return;

    // مسح القائمة الحالية
    platformSelect.innerHTML = '';

    // إضافة خيار فارغ
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- اختر منصة --';
    platformSelect.appendChild(emptyOption);

    // الحصول على جميع المنصات
    const platforms = UnifiedPlatformServiceManager.getAllPlatforms();

    // إضافة المنصات إلى القائمة
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.id;
        option.textContent = platform.name;
        platformSelect.appendChild(option);
    });
}

/**
 * ملء نموذج الخدمة بالبيانات للتعديل
 * @param {string} serviceId - معرف الخدمة
 */
function fillServiceForm(serviceId) {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على بيانات الخدمة
    const service = UnifiedPlatformServiceManager.getServiceById(serviceId);
    if (!service) return;

    // تعيين البيانات في النموذج
    const nameInput = document.getElementById('service-name');
    const descriptionInput = document.getElementById('service-description');
    const platformSelect = document.getElementById('service-platform');
    const priceInput = document.getElementById('service-price');
    const minQuantityInput = document.getElementById('service-min-quantity');
    const maxQuantityInput = document.getElementById('service-max-quantity');
    const activeInput = document.getElementById('service-active');

    if (nameInput) nameInput.value = service.name || '';
    if (descriptionInput) descriptionInput.value = service.description || '';
    if (platformSelect) platformSelect.value = service.platformId || '';
    if (priceInput) priceInput.value = service.price || '';
    if (minQuantityInput) minQuantityInput.value = service.minQuantity || '';
    if (maxQuantityInput) maxQuantityInput.value = service.maxQuantity || '';
    if (activeInput) activeInput.checked = service.active === true;
}

/**
 * حفظ بيانات الخدمة
 */
function saveService() {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على بيانات النموذج
    const serviceId = document.getElementById('service-id').value.trim();
    const name = document.getElementById('service-name').value.trim();
    const description = document.getElementById('service-description').value.trim();
    const platformId = document.getElementById('service-platform').value.trim();
    const price = parseFloat(document.getElementById('service-price').value);
    const minQuantity = parseInt(document.getElementById('service-min-quantity').value);
    const maxQuantity = parseInt(document.getElementById('service-max-quantity').value);
    const active = document.getElementById('service-active').checked;

    // التحقق من البيانات المطلوبة
    if (!name || !platformId) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    try {
        if (serviceId) {
            // تحديث خدمة موجودة
            UnifiedPlatformServiceManager.updateService(serviceId, {
                name: name,
                description: description,
                platformId: platformId,
                price: price,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity,
                active: active
            });
        } else {
            // إضافة خدمة جديدة
            UnifiedPlatformServiceManager.addService({
                name: name,
                description: description,
                platformId: platformId,
                price: price,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity,
                active: active
            });
        }

        // إغلاق النافذة
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // تحديث العرض
        refreshDashboardData();

    } catch (error) {
        alert('حدث خطأ أثناء حفظ الخدمة: ' + error.message);
    }
}

/**
 * تحديث عرض البيانات في لوحة التحكم
 */
function refreshDashboardData() {
    if (!window.UnifiedPlatformServiceManager) return;

    // تحديث عرض المنصات
    refreshPlatformsTable();

    // تحديث عرض الخدمات
    refreshServicesTable();
}

/**
 * تحديث عرض جدول المنصات
 */
function refreshPlatformsTable() {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على عنصر الجدول
    const tableBody = document.getElementById('platforms-table-body');
    if (!tableBody) return;

    // مسح الجدول الحالي
    tableBody.innerHTML = '';

    // الحصول على جميع المنصات
    const platforms = UnifiedPlatformServiceManager.getAllPlatforms();

    // إضافة المنصات إلى الجدول
    platforms.forEach(platform => {
        const row = document.createElement('tr');
        
        // إنشاء خلايا البيانات
        row.innerHTML = `
            <td class="px-4 py-3 border">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                         style="background-color: ${platform.color}20;">
                        <i class="fab fa-${platform.icon}" style="color: ${platform.color};"></i>
                    </div>
                    <span class="font-medium">${platform.name}</span>
                </div>
            </td>
            <td class="px-4 py-3 border">${platform.id}</td>
            <td class="px-4 py-3 border"><i class="fab fa-${platform.icon}"></i> ${platform.icon}</td>
            <td class="px-4 py-3 border">
                <div class="flex items-center">
                    <div class="w-6 h-6 rounded mr-2" style="background-color: ${platform.color};"></div>
                    <span>${platform.color}</span>
                </div>
            </td>
            <td class="px-4 py-3 border text-center">
                <span class="px-2 py-1 rounded-full text-xs ${platform.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${platform.active ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td class="px-4 py-3 border">
                <div class="flex justify-center space-x-2 rtl:space-x-reverse">
                    <button type="button" class="text-blue-600 hover:text-blue-800" onclick="showPlatformModal('${platform.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="text-red-600 hover:text-red-800" onclick="deletePlatform('${platform.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // إضافة الصف إلى الجدول
        tableBody.appendChild(row);
    });

    // إضافة صف إذا كان الجدول فارغاً
    if (platforms.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="px-4 py-6 border text-center text-gray-500">
                لا توجد منصات مضافة. يرجى إضافة منصة جديدة.
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

/**
 * تحديث عرض جدول الخدمات
 */
function refreshServicesTable() {
    if (!window.UnifiedPlatformServiceManager) return;

    // الحصول على عنصر الجدول
    const tableBody = document.getElementById('services-table-body');
    if (!tableBody) return;

    // مسح الجدول الحالي
    tableBody.innerHTML = '';

    // الحصول على جميع الخدمات
    const services = UnifiedPlatformServiceManager.getAllServices();

    // إضافة الخدمات إلى الجدول
    services.forEach(service => {
        // الحصول على معلومات المنصة
        const platform = UnifiedPlatformServiceManager.getPlatformById(service.platformId);

        const row = document.createElement('tr');
        
        // إنشاء خلايا البيانات
        row.innerHTML = `
            <td class="px-4 py-3 border">
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3 ${platform ? 'bg-blue-100' : 'bg-gray-200'}">
                        <i class="fas fa-${platform ? platform.icon : 'question'}" style="color: ${platform ? platform.color : '#888'};"></i>
                    </div>
                    <div>
                        <div class="font-medium">${service.name}</div>
                        <div class="text-sm text-gray-500">${service.description || '-'}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 border">
                <span class="px-2 py-1 rounded-full text-xs ${platform ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}">
                    ${platform ? platform.name : 'منصة غير موجودة'}
                </span>
            </td>
            <td class="px-4 py-3 border text-center">$${service.price.toFixed(2)}</td>
            <td class="px-4 py-3 border text-center">${service.minQuantity || 0}</td>
            <td class="px-4 py-3 border text-center">${service.maxQuantity || 0}</td>
            <td class="px-4 py-3 border text-center">
                <span class="px-2 py-1 rounded-full text-xs ${service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${service.active ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td class="px-4 py-3 border">
                <div class="flex justify-center space-x-2 rtl:space-x-reverse">
                    <button type="button" class="text-blue-600 hover:text-blue-800" onclick="showServiceModal('${service.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="text-red-600 hover:text-red-800" onclick="deleteService('${service.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // إضافة الصف إلى الجدول
        tableBody.appendChild(row);
    });

    // إضافة صف إذا كان الجدول فارغاً
    if (services.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="7" class="px-4 py-6 border text-center text-gray-500">
                لا توجد خدمات مضافة. يرجى إضافة خدمة جديدة.
            </td>
        `;
        tableBody.appendChild(emptyRow);
    }
}

/**
 * حذف منصة
 * @param {string} platformId - معرف المنصة
 */
function deletePlatform(platformId) {
    if (!window.UnifiedPlatformServiceManager) return;

    // التأكيد قبل الحذف
    if (!confirm('هل أنت متأكد من حذف هذه المنصة؟ سيتم حذف جميع الخدمات المرتبطة بها أيضاً.')) {
        return;
    }

    try {
        // حذف المنصة
        UnifiedPlatformServiceManager.deletePlatform(platformId);
        
        // تحديث العرض
        refreshDashboardData();

    } catch (error) {
        alert('حدث خطأ أثناء حذف المنصة: ' + error.message);
    }
}

/**
 * حذف خدمة
 * @param {string} serviceId - معرف الخدمة
 */
function deleteService(serviceId) {
    if (!window.UnifiedPlatformServiceManager) return;

    // التأكيد قبل الحذف
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
        return;
    }

    try {
        // حذف الخدمة
        UnifiedPlatformServiceManager.deleteService(serviceId);
        
        // تحديث العرض
        refreshDashboardData();

    } catch (error) {
        alert('حدث خطأ أثناء حذف الخدمة: ' + error.message);
    }
}

// تصدير الدوال للاستخدام العام
window.showPlatformModal = showPlatformModal;
window.savePlatform = savePlatform;
window.showServiceModal = showServiceModal;
window.saveService = saveService;
window.deletePlatform = deletePlatform;
window.deleteService = deleteService;

// تهيئة التكامل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود لوحة التحكم
    if (!window.location.pathname.includes('dashboard')) {
        return;
    }

    console.log('تهيئة إدارة المنصات والخدمات في لوحة التحكم...');

    // التأكد من وجود مدير الخدمات والمنصات الموحد
    if (!window.UnifiedPlatformServiceManager) {
        console.error('مدير الخدمات والمنصات الموحد غير متوفر. جاري تحميله...');
        
        // تحميل الملف بشكل ديناميكي
        const script = document.createElement('script');
        script.src = 'js/unified-platform-service-manager-new.js';
        script.onload = function() {
            console.log('تم تحميل مدير الخدمات والمنصات الموحد بنجاح');
            initializeDashboardIntegration();
        };
        script.onerror = function() {
            console.error('فشل في تحميل مدير الخدمات والمنصات الموحد');
        };
        document.head.appendChild(script);
    } else {
        // مدير الخدمات والمنصات الموحد متوفر بالفعل
        initializeDashboardIntegration();
    }
});
