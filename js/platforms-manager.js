/**
 * نظام إدارة منصات التواصل الاجتماعي
 * يقوم بإدارة إضافة وتحرير وحذف وعرض منصات التواصل الاجتماعي
 * ويخزنها في localStorage
 */

const platformsManager = {
    // حالة إدارة المنصات
    state: {
        platforms: [],
        activePlatform: null,
        isInitialized: false,
        modalMode: 'add' // 'add' أو 'edit'
    },    // تهيئة مدير المنصات
    init: function() {
        // تسجيل حالة التهيئة السابقة
        const wasInitialized = this.state.isInitialized;
        
        console.log('تهيئة نظام إدارة المنصات...');
        
        // تحميل المنصات من localStorage
        this.loadPlatforms();
        
        // تهيئة مستمعي الأحداث
        this.initEventListeners();
        
        // عرض جدول المنصات - نقوم دائمًا بعرض الجدول لضمان تحديثه
        this.renderPlatformTable();
        
        // تعيين المتغير ليكون مُهيَّأ
        this.state.isInitialized = true;
        
        // تهيئة مرشح المنصات
        this.initPlatformFilter();
        
        // تأكد من وجود نظام الإشعارات
        if (typeof notificationHelper !== 'undefined' && !notificationHelper.isInitialized) {
            notificationHelper.init();
        }
        
        console.log('تم تهيئة نظام إدارة المنصات بنجاح!');
        
        // عرض إشعار ترحيبي فقط في حالة التهيئة لأول مرة
        if (!wasInitialized) {
            this.showNotification('تم تهيئة نظام إدارة المنصات', 'success');
        }
    },    // تحميل المنصات من UnifiedPlatformServiceManager
    loadPlatforms: function() {
        if (window.UnifiedPlatformServiceManager) {
            // استخدام UnifiedPlatformServiceManager لتحميل المنصات
            this.state.platforms = UnifiedPlatformServiceManager.loadPlatforms();
            console.log(`تم تحميل ${this.state.platforms.length} منصة من نظام المنصات الموحد`);
            
            // التحقق من وجود منصات، وإذا لم تكن موجودة، إضافة منصات افتراضية
            if (this.state.platforms.length === 0) {
                console.log('لم يتم العثور على منصات. إضافة المنصات الافتراضية تلقائيا...');
                this.addDefaultPlatforms();
            }
        } else {
            console.error('لم يتم العثور على UnifiedPlatformServiceManager!');
            
            // الرجوع إلى السلوك القديم كخطة احتياطية
            const storedPlatforms = localStorage.getItem('social_platforms');
            if (storedPlatforms) {
                try {
                    this.state.platforms = JSON.parse(storedPlatforms);
                    console.log(`تم تحميل ${this.state.platforms.length} منصة من التخزين المحلي (خطة احتياطية)`);
                } catch (e) {
                    console.error('خطأ في قراءة بيانات المنصات:', e);
                    this.state.platforms = [];
                    this.addDefaultPlatforms();
                }
            } else {
                // إضافة المنصات الافتراضية
                this.state.platforms = [];
                console.log('لم يتم العثور على منصات. إضافة المنصات الافتراضية تلقائيا...');
                this.addDefaultPlatforms();
            }
        }
    },
      // إضافة منصات افتراضية
    addDefaultPlatforms: function() {
        // تعريف المنصات الافتراضية
        const defaultPlatformsData = [
            {
                name: 'انستغرام',
                slug: 'instagram',
                icon: 'instagram',
                color: '#E1306C',
                description: 'منصة مشاركة الصور ومقاطع الفيديو القصيرة',
                type: 'social',
                website: 'https://instagram.com',
                active: true
            },
            {
                name: 'فيسبوك',
                slug: 'facebook',
                icon: 'facebook',
                color: '#1877F2',
                description: 'أكبر شبكة تواصل اجتماعي في العالم',
                type: 'social',
                website: 'https://facebook.com',
                active: true
            },
            {
                name: 'تيك توك',
                slug: 'tiktok',
                icon: 'tiktok',
                color: '#000000',
                description: 'منصة مقاطع فيديو قصيرة وترفيهية',
                type: 'video',
                website: 'https://tiktok.com',
                active: true
            },
            {
                name: 'يوتيوب',
                slug: 'youtube',
                icon: 'youtube',
                color: '#FF0000',
                description: 'منصة مشاركة الفيديو الأشهر عالمياً',
                type: 'video',
                website: 'https://youtube.com',
                active: true
            },
            {
                name: 'تويتر',
                slug: 'twitter',
                icon: 'twitter',
                color: '#1DA1F2',
                description: 'منصة التدوينات القصيرة والأخبار',
                type: 'social',
                website: 'https://twitter.com',
                active: true
            }
        ];
        
        // إضافة كل منصة باستخدام وظيفة addPlatform التي ستتحقق من وجود المنصة قبل إضافتها
        let addedCount = 0;
        defaultPlatformsData.forEach(platform => {
            // التحقق من وجود المنصة قبل إضافتها
            const existingPlatform = this.state.platforms.find(p => p.slug === platform.slug);
            if (!existingPlatform) {
                // إضافة المنصة
                this.addPlatform(platform);
                addedCount++;
            } else {
                console.log(`المنصة ${platform.name} موجودة بالفعل. لن تتم إضافتها مرة أخرى.`);
            }
        });
        
        console.log(`تمت إضافة ${addedCount} من المنصات الافتراضية`);
    },    // حفظ المنصات في localStorage    savePlatforms: function() {
        // استخدام UnifiedPlatformServiceManager لحفظ المنصات
        if (window.UnifiedPlatformServiceManager) {
            const success = UnifiedPlatformServiceManager.savePlatforms(this.state.platforms);
            if (success) {
                console.log('تم حفظ المنصات بنجاح باستخدام UnifiedPlatformServiceManager');
            } else {
                console.error('فشل حفظ المنصات باستخدام UnifiedPlatformServiceManager');
                // الرجوع إلى الطريقة القديمة في حالة الفشل
                localStorage.setItem('social_platforms', JSON.stringify(this.state.platforms));
                console.log('تم حفظ المنصات باستخدام localStorage كخطة احتياطية');
            }
        } else {
            // الرجوع إلى الطريقة القديمة
            localStorage.setItem('social_platforms', JSON.stringify(this.state.platforms));
            console.log('تم حفظ المنصات باستخدام localStorage (UnifiedPlatformServiceManager غير متوفر)');
        }
        
        // تحديث عرض المنصات في الصفحة الرئيسية إذا كانت الدالة متاحة
        if (typeof window.updateIndexPlatforms === 'function') {
            console.log('تحديث عرض المنصات في الصفحة الرئيسية...');
            window.updateIndexPlatforms();
        }
        
        // تحديث بيانات Alpine.js إذا كانت الدالة متاحة
        this.updateAlpineData();
    },
    
    // تحديث بيانات Alpine.js بالمنصات المحدثة
    updateAlpineData: function() {
        // Check if we're on the index page with Alpine.js
        if (typeof window.Alpine !== 'undefined') {
            // If we have a platform integration module
            if (typeof window.platformIntegration !== 'undefined' && 
                typeof window.platformIntegration.updateAlpineDataWithPlatforms === 'function') {
                window.platformIntegration.updateAlpineDataWithPlatforms();
                return;
            }
            
            // Direct update if integration module isn't available
            document.querySelectorAll('[x-data]').forEach(el => {
                const alpineData = window.Alpine.$data(el);
                if (alpineData && alpineData.loadPlatformsFromLocalStorage) {
                    alpineData.loadPlatformsFromLocalStorage();
                    console.log('تم تحديث بيانات Alpine.js بالمنصات المحدثة');
                }
            });
        }
    },
    
    // تهيئة مستمعي الأحداث لإدارة المنصات
    initEventListeners: function() {
        // زر إضافة منصة
        const addPlatformBtn = document.getElementById('add-platform-btn');
        if (addPlatformBtn) {
            addPlatformBtn.addEventListener('click', () => this.openPlatformModal('add'));
        }
        
        // زر حفظ المنصة
        const savePlatformBtn = document.getElementById('save-platform');
        if (savePlatformBtn) {
            savePlatformBtn.addEventListener('click', () => this.handleSavePlatform());
        }
        
        // زر إلغاء إضافة/تعديل المنصة
        const cancelPlatformBtn = document.getElementById('cancel-platform');
        if (cancelPlatformBtn) {
            cancelPlatformBtn.addEventListener('click', this.closePlatformModal.bind(this));
        }
        
        // زر إغلاق النافذة المنبثقة للمنصة
        const closePlatformModalBtn = document.getElementById('close-platform-modal');
        if (closePlatformModalBtn) {
            closePlatformModalBtn.addEventListener('click', this.closePlatformModal.bind(this));
        }
        
        // معاينة أيقونة المنصة
        const platformIconInput = document.getElementById('platform-icon');
        if (platformIconInput) {
            platformIconInput.addEventListener('input', this.updateIconPreview.bind(this));
        }
        
        // مزامنة إدخال لون الهيكس
        const platformColorInput = document.getElementById('platform-color');
        const platformColorHexInput = document.getElementById('platform-color-hex');
        
        if (platformColorInput && platformColorHexInput) {
            platformColorInput.addEventListener('input', function() {
                platformColorHexInput.value = platformColorInput.value;
            });
            
            platformColorHexInput.addEventListener('input', function() {
                // التأكد من أن الإدخال هو لون هيكس صالح
                if (/^#[0-9A-F]{6}$/i.test(platformColorHexInput.value)) {
                    platformColorInput.value = platformColorHexInput.value;
                }
            });
        }
        
        // توليد الاسم المختصر (slug) تلقائياً من الاسم
        const platformNameInput = document.getElementById('platform-name');
        const platformSlugInput = document.getElementById('platform-slug');
        
        if (platformNameInput && platformSlugInput) {
            platformNameInput.addEventListener('input', function() {
                if (!platformSlugInput.value) {
                    // توليد الاسم المختصر من الاسم (تحويل إلى حروف صغيرة، إزالة الأحرف الخاصة)
                    platformSlugInput.value = platformNameInput.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }
            });
        }
        
        // البحث في المنصات
        const platformSearchInput = document.getElementById('platform-search');
        if (platformSearchInput) {
            platformSearchInput.addEventListener('input', () => {
                this.filterPlatforms();
            });
        }
    },
    
    // تهيئة فلتر المنصات
    initPlatformFilter: function() {
        const platformFilter = document.getElementById('platform-filter');
        if (!platformFilter) return;
        
        // إضافة أنواع المنصات إلى قائمة الفلتر
        platformFilter.innerHTML = `
            <option value="all">جميع المنصات</option>
            <option value="social">منصات التواصل الاجتماعي</option>
            <option value="video">منصات الفيديو</option>
            <option value="messaging">منصات المراسلة</option>
            <option value="active">المنصات المفعلة</option>
            <option value="inactive">المنصات المعطلة</option>
        `;
        
        // إضافة مستمع حدث لتصفية المنصات
        platformFilter.addEventListener('change', () => {
            this.filterPlatforms();
        });
    },
    
    // تصفية المنصات حسب البحث والفلتر
    filterPlatforms: function() {
        const searchInput = document.getElementById('platform-search');
        const filterSelect = document.getElementById('platform-filter');
        
        if (!searchInput || !filterSelect) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        
        // تصفية المنصات
        let filteredPlatforms = [...this.state.platforms];
        
        // تطبيق البحث
        if (searchTerm) {
            filteredPlatforms = filteredPlatforms.filter(platform => 
                platform.name.toLowerCase().includes(searchTerm) || 
                platform.slug.toLowerCase().includes(searchTerm) ||
                platform.description?.toLowerCase().includes(searchTerm)
            );
        }
        
        // تطبيق الفلتر
        if (filterValue && filterValue !== 'all') {
            if (filterValue === 'active') {
                filteredPlatforms = filteredPlatforms.filter(platform => platform.active);
            } else if (filterValue === 'inactive') {
                filteredPlatforms = filteredPlatforms.filter(platform => !platform.active);
            } else {
                filteredPlatforms = filteredPlatforms.filter(platform => platform.type === filterValue);
            }
        }
        
        // عرض المنصات المصفاة
        this.renderPlatformTable(filteredPlatforms);
    },
    
    // فتح النافذة المنبثقة للمنصة للإضافة أو التعديل
    openPlatformModal: function(mode, platformId = null) {
        const platformModal = document.getElementById('add-platform-modal');
        const platformForm = document.getElementById('add-platform-form');
        const modalTitle = platformModal.querySelector('.text-xl');
        
        // إعادة تعيين النموذج
        platformForm.reset();
        
        // تعيين وضع النافذة المنبثقة
        this.state.modalMode = mode;
        platformForm.dataset.mode = mode;
        
        // تعبئة قائمة أنواع المنصات إذا كانت فارغة
        const platformTypeSelect = document.getElementById('platform-type');
        if (platformTypeSelect && platformTypeSelect.options.length === 0) {
            platformTypeSelect.innerHTML = `
                <option value="social">منصة تواصل اجتماعي</option>
                <option value="video">منصة فيديو</option>
                <option value="messaging">منصة مراسلة</option>
                <option value="other">أخرى</option>
            `;
        }
        
        // تعبئة أزرار الموافقة والإلغاء إذا كانت فارغة
        const cancelButton = document.getElementById('cancel-platform');
        if (cancelButton && !cancelButton.textContent.trim()) {
            cancelButton.innerHTML = 'إلغاء';
        }
        
        const saveButton = document.getElementById('save-platform');
        if (saveButton && !saveButton.textContent.trim()) {
            saveButton.innerHTML = mode === 'add' ? 
                '<i class="fas fa-plus mr-1"></i> إضافة المنصة' : 
                '<i class="fas fa-save mr-1"></i> حفظ التغييرات';
        }
        
        if (mode === 'add') {
            modalTitle.textContent = 'إضافة منصة جديدة';
            
            // تعيين القيم الافتراضية
            document.getElementById('platform-active').checked = true;
            document.getElementById('platform-color').value = '#1DA1F2';
            document.getElementById('platform-color-hex').value = '#1DA1F2';
            
            // تحديث معاينة الأيقونة
            this.updateIconPreview();
        } else if (mode === 'edit') {
            modalTitle.textContent = 'تعديل المنصة';
            
            // البحث عن المنصة المراد تعديلها
            const platform = this.state.platforms.find(p => p.id === platformId);
            if (!platform) return;
            
            this.state.activePlatform = platform;
            
            // ملء النموذج ببيانات المنصة
            document.getElementById('platform-name').value = platform.name;
            document.getElementById('platform-slug').value = platform.slug;
            document.getElementById('platform-description').value = platform.description || '';
            document.getElementById('platform-type').value = platform.type || 'social';
            document.getElementById('platform-icon').value = platform.icon || '';
            document.getElementById('platform-website').value = platform.website || '';
            document.getElementById('platform-color').value = platform.color || '#1DA1F2';
            document.getElementById('platform-color-hex').value = platform.color || '#1DA1F2';
            document.getElementById('platform-active').checked = platform.active;
            
            // تحديث معاينة الأيقونة
            this.updateIconPreview();
        }
        
        // إظهار النافذة المنبثقة
        platformModal.classList.remove('hidden');
    },
    
    // إغلاق النافذة المنبثقة للمنصة
    closePlatformModal: function() {
        const platformModal = document.getElementById('add-platform-modal');
        if (platformModal) {
            platformModal.classList.add('hidden');
        }
        this.state.activePlatform = null;
    },
    
    // تحديث معاينة الأيقونة بناءً على إدخال الأيقونة
    updateIconPreview: function() {
        const iconInput = document.getElementById('platform-icon');
        const iconPreview = document.getElementById('platform-icon-preview');
        
        if (iconInput && iconPreview) {
            const iconValue = iconInput.value.trim();
            
            // إزالة أي فئات قديمة
            iconPreview.className = '';
            
            // إضافة فئات الأيقونة الجديدة
            if (iconValue) {
                iconPreview.className = `fab fa-${iconValue} flex items-center justify-center h-full w-full text-2xl`;
            } else {
                iconPreview.className = 'fab fa-globe flex items-center justify-center h-full w-full text-2xl text-gray-400';
            }
        }
    },
    
    // معالجة نقرة زر حفظ المنصة
    handleSavePlatform: function() {
        // الحصول على قيم النموذج
        const nameInput = document.getElementById('platform-name');
        const slugInput = document.getElementById('platform-slug');
        const descriptionInput = document.getElementById('platform-description');
        const typeInput = document.getElementById('platform-type');
        const iconInput = document.getElementById('platform-icon');
        const websiteInput = document.getElementById('platform-website');
        const colorInput = document.getElementById('platform-color');
        const activeInput = document.getElementById('platform-active');
        
        if (!nameInput || !slugInput) {
            console.error('لم يتم العثور على عناصر النموذج المطلوبة');
            return;
        }
        
        const name = nameInput.value.trim();
        let slug = slugInput.value.trim();
        const description = descriptionInput ? descriptionInput.value.trim() : '';
        const type = typeInput ? typeInput.value : 'social';
        const icon = iconInput ? iconInput.value.trim() : '';
        const website = websiteInput ? websiteInput.value.trim() : '';
        const color = colorInput ? colorInput.value : '#1DA1F2';
        const active = activeInput ? activeInput.checked : true;
        
        // التحقق من الحقول المطلوبة
        if (!name) {
            alert('يرجى إدخال اسم المنصة');
            return;
        }
        
        // توليد الاسم المختصر إذا كان فارغاً
        if (!slug) {
            slug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        
        const platformData = {
            name,
            slug,
            description,
            type,
            icon,
            website,
            color,
            active
        };
        
        if (this.state.modalMode === 'add') {
            // إضافة منصة جديدة
            this.addPlatform(platformData);
        } else {
            // تعديل منصة موجودة
            this.editPlatform(platformData);
        }
        
        // إغلاق النافذة المنبثقة
        this.closePlatformModal();
        
        // تحديث الواجهة في الصفحة الرئيسية إذا كانت موجودة
        if (typeof updateIndexPlatforms === 'function') {
            updateIndexPlatforms();
        }
    },
      // إضافة منصة جديدة
    addPlatform: function(platformData) {
        // تحقق من وجود المنصة بناءً على الاسم المختصر (slug)
        const slug = platformData.slug || this.slugify(platformData.name);
        const existingPlatform = this.state.platforms.find(p => p.slug === slug);
        
        // إذا كانت المنصة موجودة بالفعل، نعرض إشعارًا ونخرج من الوظيفة
        if (existingPlatform) {
            console.log(`منصة بنفس الاسم المختصر (${slug}) موجودة بالفعل. لن تتم إضافتها مرة أخرى.`);
            this.showNotification(`المنصة ${platformData.name} موجودة بالفعل`, 'warning');
            return;
        }
        
        // توليد معرف فريد بناءً على الاسم المختصر والطابع الزمني
        const id = `${slug}-${Date.now()}`;
        
        // إنشاء كائن المنصة مع المعرف
        const platform = {
            id,
            slug,
            ...platformData,
            createdAt: new Date().toISOString()
        };
        
        // إضافة إلى مصفوفة المنصات
        this.state.platforms.push(platform);
        
        // حفظ في localStorage
        this.savePlatforms();
        
        // عرض جدول المنصات
        this.renderPlatformTable();
        
        console.log(`تم إضافة منصة جديدة: ${platformData.name}`);
        
        // عرض رسالة نجاح
        this.showNotification('تم إضافة المنصة بنجاح', 'success');
    },
    
    // تعديل منصة موجودة
    editPlatform: function(platformData) {
        if (!this.state.activePlatform) return;
        
        // البحث عن فهرس المنصة
        const index = this.state.platforms.findIndex(p => p.id === this.state.activePlatform.id);
        if (index === -1) return;
        
        // تحديث بيانات المنصة
        this.state.platforms[index] = {
            ...this.state.platforms[index],
            ...platformData,
            updatedAt: new Date().toISOString()
        };
        
        // حفظ في localStorage
        this.savePlatforms();
        
        // عرض جدول المنصات
        this.renderPlatformTable();
        
        console.log(`تم تحديث المنصة: ${platformData.name}`);
        
        // عرض رسالة نجاح
        this.showNotification('تم تحديث المنصة بنجاح', 'success');
    },
    
    // حذف منصة
    deletePlatform: function(id) {
        // طلب التأكيد
        if (!confirm('هل أنت متأكد من حذف هذه المنصة؟')) return;
        
        // البحث عن المنصة
        const platform = this.state.platforms.find(p => p.id === id);
        if (!platform) return;
        
        // إزالة المنصة
        this.state.platforms = this.state.platforms.filter(p => p.id !== id);
        
        // حفظ في localStorage
        this.savePlatforms();
        
        // عرض جدول المنصات
        this.renderPlatformTable();
        
        console.log(`تم حذف المنصة: ${platform.name}`);
        
        // عرض رسالة نجاح
        this.showNotification('تم حذف المنصة بنجاح', 'warning');
        
        // تحديث الواجهة في الصفحة الرئيسية إذا كانت موجودة
        if (typeof updateIndexPlatforms === 'function') {
            updateIndexPlatforms();
        }
    },
    
    // تبديل حالة تفعيل المنصة
    togglePlatformStatus: function(id) {
        // البحث عن المنصة
        const index = this.state.platforms.findIndex(p => p.id === id);
        if (index === -1) return;
        
        // تبديل الحالة
        this.state.platforms[index].active = !this.state.platforms[index].active;
        
        // حفظ في localStorage
        this.savePlatforms();
        
        // عرض جدول المنصات
        this.renderPlatformTable();
        
        // عرض رسالة نجاح
        const status = this.state.platforms[index].active ? 'تفعيل' : 'تعطيل';
        this.showNotification(`تم ${status} المنصة: ${this.state.platforms[index].name}`, 'info');
    },
      // عرض إشعار نجاح/فشل
    showNotification: function(message, type = 'success') {
        // استخدام مكتبة الإشعارات إذا كانت متوفرة
        if (typeof notificationHelper !== 'undefined') {
            notificationHelper.show(message, type);
            return;
        }
        
        // التحقق من وجود دالة عرض الإشعارات العامة
        if (typeof showNotification === 'function') {
            showNotification(message, type);
            return;
        }
        
        // الحل البديل إذا لم تكن دالة الإشعار متاحة
        const notificationColors = {
            success: 'bg-green-100 text-green-800 border-green-200',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            error: 'bg-red-100 text-red-800 border-red-200',
            info: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        
        const notificationColor = notificationColors[type] || notificationColors.info;
        
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg border ${notificationColor} shadow-lg z-50 transition-all duration-500 opacity-0`;
        notification.innerHTML = message;
        
        // إضافة إلى الصفحة
        document.body.appendChild(notification);
        
        // إظهار الإشعار
        setTimeout(() => {
            notification.classList.replace('opacity-0', 'opacity-100');
        }, 10);
        
        // إزالة الإشعار بعد 3 ثوانٍ
        setTimeout(() => {
            notification.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    },
      // عرض جدول المنصات (أو عرض المنصات المصفاة)
    renderPlatformTable: function(platformsToRender = null) {
        const platformsContainer = document.getElementById('platforms-container');
        if (!platformsContainer) {
            console.error('لم يتم العثور على حاوية المنصات!');
            return;
        }
        
        console.log('جاري عرض بطاقات المنصات المفصلة...');
        
        // تنظيف الحاوية
        platformsContainer.innerHTML = '';
        
        // تحديد المنصات التي سيتم عرضها
        const platforms = platformsToRender || this.state.platforms;
        
        if (platforms.length === 0) {
            // إظهار رسالة إذا لم تكن هناك منصات
            platformsContainer.innerHTML = `
                <div class="col-span-3 py-20 text-center text-gray-500">
                    <i class="fas fa-globe text-5xl mb-4 opacity-30"></i>
                    <p class="text-lg">لا توجد منصات معرفة بعد</p>
                    <button id="add-platform-empty" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        <i class="fas fa-plus mr-1"></i> إضافة منصة جديدة
                    </button>
                </div>
            `;
            
            // إضافة مستمع حدث لزر إضافة منصة
            const addPlatformEmptyBtn = document.getElementById('add-platform-empty');
            if (addPlatformEmptyBtn) {
                addPlatformEmptyBtn.addEventListener('click', () => this.openPlatformModal('add'));
            }
            
            return;
        }
        
        // إنشاء بطاقات المنصات لكل منصة
        platforms.forEach(platform => {
            const platformCard = document.createElement('div');
            platformCard.className = 'bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:border-blue-300 hover:shadow-lg transition duration-300';
            
            // تحديد فئة الأيقونة
            const iconClass = platform.icon ? `fab fa-${platform.icon}` : 'fas fa-globe';
            
            // تحديد شارة الحالة
            const statusBadge = platform.active
                ? '<span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">مفعلة</span>'
                : '<span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">معطلة</span>';
            
            platformCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ml-4" style="background-color: ${platform.color || '#e5e7eb'}">
                            <i class="${iconClass} text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">${platform.name}</h3>
                            <p class="text-sm text-gray-600">@${platform.slug}</p>
                        </div>
                    </div>
                    <div>
                        ${statusBadge}
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-4">${platform.description || 'لا يوجد وصف'}</p>
                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-xs text-gray-500">${platform.type || 'social'}</span>
                    </div>                    <div class="flex space-x-2 gap-1">
                        <button class="toggle-platform p-2 ${platform.active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'} rounded-full" title="${platform.active ? 'تعطيل المنصة' : 'تفعيل المنصة'}" data-id="${platform.id}">
                            <i class="fas fa-${platform.active ? 'toggle-off' : 'toggle-on'}"></i>
                        </button>
                        <button class="edit-platform p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="تعديل المنصة" data-id="${platform.id}">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="delete-platform p-2 text-red-600 hover:bg-red-50 rounded-full" title="حذف المنصة" data-id="${platform.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // إضافة بطاقة المنصة إلى الحاوية
            platformsContainer.appendChild(platformCard);
              // إضافة مستمعي أحداث للأزرار
            const editBtn = platformCard.querySelector('.edit-platform');
            const deleteBtn = platformCard.querySelector('.delete-platform');
            const toggleBtn = platformCard.querySelector('.toggle-platform');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this.openPlatformModal('edit', platform.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deletePlatform(platform.id));
            }
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.togglePlatformStatus(platform.id));
            }
        });
    },
    
    // الحصول على قائمة المنصات
    getPlatforms: function() {
        return this.state.platforms;
    },
    
    // الحصول على منصة بواسطة المعرف
    getPlatformById: function(id) {
        return this.state.platforms.find(p => p.id === id) || null;
    },
    
    // الحصول على منصة بواسطة الاسم المختصر
    getPlatformBySlug: function(slug) {
        return this.state.platforms.find(p => p.slug === slug) || null;
    }
};

// تهيئة مدير المنصات عند تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    // التحقق مما إذا كنا في علامة تبويب المنصات أو إذا كان العنصر موجودًا
    const platformsContainer = document.getElementById('platforms-container');
    if (platformsContainer) {
        platformsManager.init();
    }
    
    // إنشاء واجهة مستخدم API للواجهة الخارجية
    window.platformsAPI = {
        getPlatforms: platformsManager.getPlatforms.bind(platformsManager),
        getPlatformById: platformsManager.getPlatformById.bind(platformsManager),
        getPlatformBySlug: platformsManager.getPlatformBySlug.bind(platformsManager)
    };
});

// تصدير مدير المنصات للاستخدام في الملفات الأخرى
window.platformsManager = platformsManager;
