/**
 * نظام إدارة المنصات في لوحة التحكم
 * @version 1.0.0
 */
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود واجهة المنصات في الصفحة
    const platformsSection = document.getElementById('platforms');
    if (!platformsSection) return;
    
    console.log("تم تحميل نظام إدارة المنصات");
    
    // تعريف منشئ نظام إدارة المنصات
    window.platformsManager = (function() {
        // متغيرات النظام
        const state = {
            isInitialized: false,
            platforms: [],
            currentPlatformId: null,
            filteredPlatforms: []
        };
        
        // عناصر واجهة المستخدم
        let platformsContainer, 
            addPlatformBtn, 
            platformSearch, 
            platformFilter, 
            platformModal,
            platformForm,
            platformNameInput,
            platformSlugInput, 
            platformDescriptionInput,
            platformTypeInput,
            platformIconInput,
            platformIconPreview,
            platformWebsiteInput,
            platformColorInput,
            platformColorHexInput,
            platformActiveInput,
            savePlatformBtn,
            cancelPlatformBtn,
            closePlatformModalBtn;
        
        /**
         * تهيئة نظام إدارة المنصات
         */
        function init() {
            console.log("تهيئة نظام إدارة المنصات...");
            
            // التحقق من وجود مدير المنصات والخدمات الموحد
            if (!window.UnifiedPlatformServiceManager) {
                console.error("لم يتم العثور على مدير المنصات والخدمات الموحد!");
                
                // إنشاء منصات افتراضية إذا لم يكن هناك مدير منصات
                createDefaultPlatforms();
                showNotification("تم تحميل المنصات الافتراضية بسبب عدم وجود مدير المنصات", "warning");
                return;
            }
            
            // تعيين مراجع عناصر واجهة المستخدم
            setupUIReferences();
            
            // تحميل المنصات من التخزين المحلي
            loadPlatforms();
            
            // إضافة استمعات الأحداث
            setupEventListeners();
            
            // تأكد من وجود على الأقل بعض المنصات الافتراضية
            ensureDefaultPlatformsExist();
            
            // تحديث حالة التهيئة
            state.isInitialized = true;
            
            console.log("تم تهيئة نظام إدارة المنصات بنجاح.");
        }
        
        /**
         * إنشاء منصات افتراضية إذا لم يكن هناك منصات
         */
        function ensureDefaultPlatformsExist() {
            // إذا لم توجد منصات، أضف المنصات الافتراضية
            if (state.platforms.length === 0) {
                console.log("لا توجد منصات، إضافة منصات افتراضية...");
                
                const defaultPlatforms = [
                    {
                        name: "انستغرام",
                        icon: "instagram",
                        color: "#E1306C",
                        active: true,
                        type: "social"
                    },
                    {
                        name: "فيسبوك",
                        icon: "facebook",
                        color: "#1877F2",
                        active: true,
                        type: "social"
                    },
                    {
                        name: "تويتر",
                        icon: "twitter",
                        color: "#1DA1F2",
                        active: true,
                        type: "social"
                    },
                    {
                        name: "يوتيوب",
                        icon: "youtube",
                        color: "#FF0000",
                        active: true,
                        type: "video"
                    },
                    {
                        name: "تيك توك",
                        icon: "tiktok",
                        color: "#000000",
                        active: true,
                        type: "video"
                    }
                ];
                
                // إضافة كل منصة افتراضية إلى النظام
                defaultPlatforms.forEach(platform => {
                    UnifiedPlatformServiceManager.addPlatform(platform);
                });
                
                // إعادة تحميل المنصات بعد إضافة المنصات الافتراضية
                loadPlatforms();
                
                showNotification("تم إضافة المنصات الافتراضية بنجاح", "success");
            }
        }
        
        /**
         * تهيئة مراجع عناصر واجهة المستخدم
         */
        function setupUIReferences() {
            platformsContainer = document.getElementById('platforms-container');
            addPlatformBtn = document.getElementById('add-platform-btn');
            platformSearch = document.getElementById('platform-search');
            platformFilter = document.getElementById('platform-filter');
            platformModal = document.getElementById('add-platform-modal');
            platformForm = document.getElementById('add-platform-form');
            platformNameInput = document.getElementById('platform-name');
            platformSlugInput = document.getElementById('platform-slug');
            platformDescriptionInput = document.getElementById('platform-description');
            platformTypeInput = document.getElementById('platform-type');
            platformIconInput = document.getElementById('platform-icon');
            platformIconPreview = document.getElementById('platform-icon-preview');
            platformWebsiteInput = document.getElementById('platform-website');
            platformColorInput = document.getElementById('platform-color');
            platformColorHexInput = document.getElementById('platform-color-hex');
            platformActiveInput = document.getElementById('platform-active');
            savePlatformBtn = document.getElementById('save-platform');
            cancelPlatformBtn = document.getElementById('cancel-platform');
            closePlatformModalBtn = document.getElementById('close-platform-modal');
        }
        
        /**
         * إضافة استمعات الأحداث
         */
        function setupEventListeners() {
            // زر إضافة منصة جديدة
            if (addPlatformBtn) {
                addPlatformBtn.addEventListener('click', function() {
                    openPlatformModal();
                });
            }
            
            // خانة البحث
            if (platformSearch) {
                platformSearch.addEventListener('input', function() {
                    filterPlatforms();
                });
            }
            
            // قائمة التصفية
            if (platformFilter) {
                platformFilter.addEventListener('change', function() {
                    filterPlatforms();
                });
            }
            
            // نموذج المنصة
            if (platformForm) {
                platformForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    savePlatform();
                });
            }
            
            // زر حفظ المنصة
            if (savePlatformBtn) {
                savePlatformBtn.addEventListener('click', function() {
                    savePlatform();
                });
            }
            
            // زر إلغاء إضافة/تعديل المنصة
            if (cancelPlatformBtn) {
                cancelPlatformBtn.addEventListener('click', function() {
                    closePlatformModal();
                });
            }
            
            // زر إغلاق النافذة المنبثقة
            if (closePlatformModalBtn) {
                closePlatformModalBtn.addEventListener('click', function() {
                    closePlatformModal();
                });
            }
            
            // تغيير لون المنصة
            if (platformColorInput && platformColorHexInput) {
                // تحديث اللون عند تغيير حقل اللون
                platformColorInput.addEventListener('input', function() {
                    platformColorHexInput.value = this.value.toUpperCase();
                    updatePlatformIconPreview();
                });
                
                // تحديث حقل اللون عند تغيير الكود السداسي
                platformColorHexInput.addEventListener('input', function() {
                    if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                        platformColorInput.value = this.value;
                        updatePlatformIconPreview();
                    }
                });
            }
            
            // تحديث معاينة أيقونة المنصة عند تغيير رمز الأيقونة
            if (platformIconInput) {
                platformIconInput.addEventListener('input', function() {
                    updatePlatformIconPreview();
                });
            }
            
            // الاستماع لأحداث تحديث بيانات المنصات
            document.addEventListener('platformDataUpdated', function() {
                loadPlatforms();
            });

            // إضافة مستمع للتبويبات للتأكد من تنشيط تبويب المنصات
            document.querySelectorAll('.tab-link').forEach(tab => {
                tab.addEventListener('click', function() {
                    if (this.getAttribute('data-tab') === 'platforms') {
                        setTimeout(() => {
                            console.log("إعادة تحميل المنصات بعد تنشيط التبويب");
                            loadPlatforms();
                            renderPlatformGrid();
                        }, 100);
                    }
                });
            });
        }
        
        /**
         * فتح النافذة المنبثقة لإضافة/تعديل منصة
         * @param {string|null} platformId - معرف المنصة (null لإضافة منصة جديدة)
         */
        function openPlatformModal(platformId = null) {
            // الكود الحالي بدون تغيير
            // تحديث حالة النظام
            state.currentPlatformId = platformId;
            
            // تحديث عنوان النافذة المنبثقة
            const modalTitle = platformModal.querySelector('h3');
            if (modalTitle) {
                modalTitle.textContent = platformId ? 'تعديل المنصة' : 'إضافة منصة جديدة';
            }
            
            // تحديث وضع النموذج
            platformForm.setAttribute('data-mode', platformId ? 'edit' : 'add');
            
            // إعادة تعيين النموذج
            platformForm.reset();
            
            // ملء النموذج ببيانات المنصة إذا كان التعديل
            if (platformId) {
                const platform = state.platforms.find(p => p.id === platformId);
                if (platform) {
                    platformNameInput.value = platform.name || '';
                    platformSlugInput.value = platform.slug || platform.icon || '';
                    platformDescriptionInput.value = platform.description || '';
                    platformTypeInput.value = platform.type || 'social';
                    platformIconInput.value = platform.icon || '';
                    platformWebsiteInput.value = platform.website || '';
                    platformColorInput.value = platform.color || '#3b82f6';
                    platformColorHexInput.value = platform.color || '#3b82f6';
                    platformActiveInput.checked = platform.active !== false;
                    
                    // تحديث معاينة الأيقونة
                    updatePlatformIconPreview();
                }
            } else {
                // قيم افتراضية للمنصة الجديدة
                platformColorInput.value = '#3b82f6';
                platformColorHexInput.value = '#3b82f6';
                platformActiveInput.checked = true;
                platformTypeInput.value = 'social';
            }
            
            // إظهار النافذة المنبثقة
            platformModal.classList.remove('hidden');
        }
        
        /**
         * إغلاق النافذة المنبثقة
         */
        function closePlatformModal() {
            // إخفاء النافذة المنبثقة
            platformModal.classList.add('hidden');
            
            // إعادة تعيين حالة النظام
            state.currentPlatformId = null;
        }
        
        /**
         * تحديث معاينة أيقونة المنصة
         */
        function updatePlatformIconPreview() {
            if (!platformIconPreview) return;
            
            // الحصول على رمز الأيقونة واللون
            const iconValue = platformIconInput.value.trim();
            const colorValue = platformColorInput.value;
            
            // إزالة الأصناف السابقة
            platformIconPreview.className = '';
            
            // تعيين الصنف الجديد
            if (iconValue) {
                platformIconPreview.className = 'fab fa-' + iconValue;
            } else {
                platformIconPreview.className = 'fab fa-globe';
            }
            
            // تعيين لون الأيقونة
            platformIconPreview.style.color = colorValue;
        }
        
        /**
         * حفظ المنصة (إضافة/تعديل)
         */
        function savePlatform() {
            // التحقق من صحة البيانات
            if (!platformNameInput.value.trim()) {
                showNotification("يرجى إدخال اسم المنصة", "error");
                return;
            }
            
            // إعداد بيانات المنصة
            const platformData = {
                name: platformNameInput.value.trim(),
                slug: platformSlugInput.value.trim() || null,
                description: platformDescriptionInput.value.trim() || null,
                type: platformTypeInput.value,
                icon: platformIconInput.value.trim() || 'globe',
                website: platformWebsiteInput.value.trim() || null,
                color: platformColorHexInput.value || '#3b82f6',
                active: platformActiveInput.checked
            };
            
            try {
                let success = false;
                
                if (state.currentPlatformId) {
                    // تعديل منصة موجودة
                    success = UnifiedPlatformServiceManager.updatePlatform(state.currentPlatformId, platformData);
                    
                    if (success) {
                        showNotification("تم تحديث المنصة بنجاح", "success");
                    } else {
                        showNotification("خطأ في تحديث المنصة", "error");
                        return;
                    }
                } else {
                    // إضافة منصة جديدة
                    success = UnifiedPlatformServiceManager.addPlatform(platformData);
                    
                    if (success) {
                        showNotification("تم إضافة المنصة بنجاح", "success");
                    } else {
                        showNotification("خطأ في إضافة المنصة", "error");
                        return;
                    }
                }
                
                // إغلاق النافذة المنبثقة
                closePlatformModal();
                
                // إعادة تحميل المنصات
                loadPlatforms();
                
            } catch (error) {
                console.error("خطأ في حفظ المنصة:", error);
                showNotification("حدث خطأ أثناء حفظ المنصة", "error");
            }
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
                
                console.log("عدد المنصات المحملة:", platforms.length);
                
                // تصفية المنصات
                filterPlatforms();
                
                // التأكد من عرض المنصات
                renderPlatformGrid();
                
                console.log("تم تحميل المنصات بنجاح:", platforms.length);
                
                return platforms.length > 0;
            } catch (error) {
                console.error("خطأ في تحميل المنصات:", error);
                showNotification("خطأ في تحميل المنصات", "error");
                return false;
            }
        }
        
        /**
         * تصفية المنصات حسب البحث والتصفية
         */
        function filterPlatforms() {
            if (!state.platforms) return;
            
            try {
                let filtered = [...state.platforms];
                
                // تصفية حسب نص البحث
                if (platformSearch && platformSearch.value) {
                    const searchValue = platformSearch.value.trim().toLowerCase();
                    filtered = filtered.filter(platform => {
                        return (
                            (platform.name && platform.name.toLowerCase().includes(searchValue)) ||
                            (platform.description && platform.description.toLowerCase().includes(searchValue)) ||
                            (platform.slug && platform.slug.toLowerCase().includes(searchValue))
                        );
                    });
                }
                
                // تصفية حسب نوع المنصة
                if (platformFilter && platformFilter.value && platformFilter.value !== 'all') {
                    const filterValue = platformFilter.value;
                    
                    if (filterValue === 'active') {
                        filtered = filtered.filter(platform => platform.active === true);
                    } else if (filterValue === 'inactive') {
                        filtered = filtered.filter(platform => platform.active === false);
                    } else {
                        filtered = filtered.filter(platform => platform.type === filterValue);
                    }
                }
                
                // تحديث حالة النظام
                state.filteredPlatforms = filtered;
                
                // عرض المنصات
                renderPlatformGrid();
                
            } catch (error) {
                console.error("خطأ في تصفية المنصات:", error);
            }
        }
        
        /**
         * عرض المنصات في شبكة بطاقات
         */
        function renderPlatformGrid() {
            if (!platformsContainer) return;
            
            try {
                console.log("جاري عرض المنصات في الشبكة...");
                
                // إفراغ الحاوية
                platformsContainer.innerHTML = '';
                
                // التحقق من وجود منصات مصفاة
                if (!state.filteredPlatforms || state.filteredPlatforms.length === 0) {
                    platformsContainer.innerHTML = `
                        <div class="col-span-full p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                            <i class="fas fa-info-circle text-blue-500 text-3xl mb-4"></i>
                            <p class="text-gray-600">لم يتم العثور على منصات${platformSearch && platformSearch.value ? ' تطابق بحثك' : ''}.</p>
                            <button id="add-platform-empty-btn" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                                <i class="fas fa-plus mr-1"></i> إضافة منصة جديدة
                            </button>
                        </div>
                    `;
                    
                    // إضافة استمع الحدث لزر الإضافة
                    const addPlatformEmptyBtn = document.getElementById('add-platform-empty-btn');
                    if (addPlatformEmptyBtn) {
                        addPlatformEmptyBtn.addEventListener('click', function() {
                            openPlatformModal();
                        });
                    }
                    
                    return;
                }
                
                // إنشاء بطاقات المنصات
                state.filteredPlatforms.forEach(platform => {
                    // إعداد متغيرات البطاقة
                    const iconClass = platform.icon ? `fab fa-${platform.icon}` : 'fab fa-globe';
                    const platformClass = platform.active ? 'border-green-200' : 'border-gray-200 opacity-70';
                    const statusText = platform.active ? 'نشط' : 'غير نشط';
                    const statusClass = platform.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
                    
                    // إنشاء عنصر بطاقة المنصة
                    const platformCard = document.createElement('div');
                    platformCard.className = `platform-card bg-white border ${platformClass} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`;
                    platformCard.innerHTML = `
                        <div class="p-4 flex items-center border-b border-gray-100">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${platform.color}20">
                                <i class="${iconClass} text-2xl" style="color: ${platform.color}"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-800">${platform.name}</h3>
                                <span class="text-xs px-2 py-1 rounded-full ${statusClass}">${statusText}</span>
                            </div>
                        </div>
                        <div class="p-4">
                            <p class="text-gray-600 text-sm mb-4">${platform.description || 'لا يوجد وصف'}</p>
                            <div class="flex justify-between items-center">
                                <div>
                                    <span class="text-xs text-gray-500">نوع المنصة:</span>
                                    <span class="text-sm ml-1">${getPlatformTypeText(platform.type)}</span>
                                </div>
                                <div class="flex space-x-1 space-x-reverse">
                                    <button class="edit-platform-btn bg-blue-100 hover:bg-blue-200 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors" data-platform-id="${platform.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-platform-btn bg-red-100 hover:bg-red-200 text-red-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors" data-platform-id="${platform.id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // إضافة البطاقة إلى الحاوية
                    platformsContainer.appendChild(platformCard);
                    
                    // إضافة استمع حدث للزر تعديل
                    const editButton = platformCard.querySelector('.edit-platform-btn');
                    if (editButton) {
                        editButton.addEventListener('click', function() {
                            const platformId = this.getAttribute('data-platform-id');
                            openPlatformModal(platformId);
                        });
                    }
                    
                    // إضافة استمع حدث للزر حذف
                    const deleteButton = platformCard.querySelector('.delete-platform-btn');
                    if (deleteButton) {
                        deleteButton.addEventListener('click', function() {
                            const platformId = this.getAttribute('data-platform-id');
                            confirmDeletePlatform(platformId);
                        });
                    }
                });
                
                console.log("تم عرض المنصات:", state.filteredPlatforms.length);
                
            } catch (error) {
                console.error("خطأ في عرض المنصات:", error);
                showNotification("خطأ في عرض المنصات", "error");
            }
        }
        
        /**
         * عرض المنصات في جدول مفصل
         */
        function renderPlatformTable() {
            // التأكد من تهيئة النظام
            if (!state.isInitialized) {
                init();
            }
            
            try {
                if (!platformsContainer) return;
                
                console.log("جاري عرض المنصات في الجدول...");
                
                // إفراغ الحاوية
                platformsContainer.innerHTML = '';
                
                // تحويل عرض المنصات إلى جدول لعرض تفاصيل أكثر
                const tableContainer = document.createElement('div');
                tableContainer.className = 'overflow-x-auto';
                tableContainer.innerHTML = `
                    <table class="min-w-full divide-y divide-gray-200 dashboard-table responsive-table">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 text-right">المنصة</th>
                                <th class="px-6 py-3 text-right">النوع</th>
                                <th class="px-6 py-3 text-right">الأيقونة</th>
                                <th class="px-6 py-3 text-right">الحالة</th>
                                <th class="px-6 py-3 text-right">عدد الخدمات</th>
                                <th class="px-6 py-3 text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="platforms-table-body">
                        </tbody>
                    </table>
                `;
                
                platformsContainer.appendChild(tableContainer);
                
                const tableBody = document.getElementById('platforms-table-body');
                
                if (!tableBody) return;
                
                // التحقق من وجود منصات
                if (!state.filteredPlatforms || state.filteredPlatforms.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center">
                                <i class="fas fa-info-circle text-blue-500 text-3xl mb-4"></i>
                                <p class="text-gray-600">لم يتم العثور على منصات.</p>
                                <button id="add-platform-empty-table-btn" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                                    <i class="fas fa-plus mr-1"></i> إضافة منصة جديدة
                                </button>
                            </td>
                        </tr>
                    `;
                    
                    // إضافة استمع الحدث لزر الإضافة
                    const addPlatformEmptyTableBtn = document.getElementById('add-platform-empty-table-btn');
                    if (addPlatformEmptyTableBtn) {
                        addPlatformEmptyTableBtn.addEventListener('click', function() {
                            openPlatformModal();
                        });
                    }
                    
                    return;
                }
                
                // بقية الكود لعرض المنصات في الجدول
                // ...
            } catch (error) {
                console.error("خطأ في عرض جدول المنصات:", error);
                showNotification("خطأ في عرض جدول المنصات", "error");
            }
        }
        
        // الدوال المتبقية بدون تغيير
        
        /**
         * الحصول على النص الوصفي لنوع المنصة
         */
        function getPlatformTypeText(type) {
            switch (type) {
                case 'social':
                    return 'تواصل اجتماعي';
                case 'video':
                    return 'منصة فيديو';
                case 'messaging':
                    return 'منصة مراسلة';
                case 'other':
                    return 'أخرى';
                default:
                    return 'غير محدد';
            }
        }
        
        /**
         * عرض إشعار
         */
        function showNotification(message, type = 'info') {
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
            loadPlatforms,
            filterPlatforms,
            renderPlatformGrid,
            renderPlatformTable,
            openPlatformModal,
            updatePlatformIconPreview
        };
    })();
    
    // تهيئة نظام إدارة المنصات فوراً عند تحميل الصفحة
    platformsManager.init();
    
    // تأكد من عرض المنصات بعد تحميل الصفحة مباشرة
    setTimeout(() => {
        if (platformsManager.state.platforms.length > 0) {
            platformsManager.renderPlatformGrid();
        } else {
            platformsManager.loadPlatforms();
            platformsManager.renderPlatformGrid();
        }
    }, 500);
});