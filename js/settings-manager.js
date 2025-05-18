/**
 * settings-manager.js
 * مدير إعدادات النظام - يربط جميع الخدمات والإعدادات بالمكان المناسب
 */

const settingsManager = {
    // حالة الإعدادات
    state: {
        initialized: false,
        settings: {
            admin: {
                username: 'admin',
                password: 'admin123'
            },
            siteLogo: null
        }
    },
    
    // تهيئة مدير الإعدادات
    init: function() {
        if (this.state.initialized) return;
        
        console.log('تهيئة مدير الإعدادات...');
        
        // تحميل الإعدادات من التخزين المحلي
        this.loadSettings();
        
        // إعداد مستمعي الأحداث
        this.setupEventListeners();
        
        // تحديث اسم المستخدم في الواجهة
        this.updateUsernameInUI();
        
        // تحديث الشعار في الواجهة
        this.updateLogoInUI();
        
        this.state.initialized = true;
    },
    
    // الحصول على بيانات المسؤول
    getAdminSettings: function() {
        return this.state.settings.admin;
    },
    
    // الحصول على شعار الموقع
    getSiteLogo: function() {
        return this.state.settings.siteLogo;
    },
    
    // تحميل الإعدادات من التخزين المحلي
    loadSettings: function() {
        try {
            // تحميل بيانات المسؤول
            const adminCredentials = localStorage.getItem('admin_credentials');
            if (adminCredentials) {
                this.state.settings.admin = { ...this.state.settings.admin, ...JSON.parse(adminCredentials) };
            }
            
            // تحميل شعار الموقع
            const siteLogo = localStorage.getItem('site_logo');
            if (siteLogo) {
                this.state.settings.siteLogo = siteLogo;
            }
            
            console.log('تم تحميل الإعدادات بنجاح');
        } catch (err) {
            console.error('خطأ في تحميل الإعدادات:', err);
        }
    },
    
    // حفظ الإعدادات في التخزين المحلي
    saveSettings: function() {
        try {
            // حفظ بيانات المسؤول
            localStorage.setItem('admin_credentials', JSON.stringify(this.state.settings.admin));
            
            // حفظ شعار الموقع
            if (this.state.settings.siteLogo) {
                localStorage.setItem('site_logo', this.state.settings.siteLogo);
            }
            
            // إرسال حدث تحديث الإعدادات
            document.dispatchEvent(new CustomEvent('settingsUpdated', {
                detail: { source: 'settingsManager' }
            }));
            
            console.log('تم حفظ الإعدادات بنجاح');
            return true;
        } catch (err) {
            console.error('خطأ في حفظ الإعدادات:', err);
            return false;
        }
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        // الاستماع لتحديثات إعدادات المسؤول
        document.addEventListener('adminSettingsUpdated', (event) => {
            if (event.detail && event.detail.admin) {
                this.state.settings.admin = { ...this.state.settings.admin, ...event.detail.admin };
                this.saveSettings();
                this.updateUsernameInUI();
            }
        });
        
        // الاستماع لتحديثات شعار الموقع
        document.addEventListener('siteLogoUpdated', (event) => {
            if (event.detail && event.detail.logo) {
                this.state.settings.siteLogo = event.detail.logo;
                this.saveSettings();
                this.updateLogoInUI();
            }
        });
    },
    
    // تحديث اسم المستخدم في واجهة المستخدم
    updateUsernameInUI: function() {
        const usernameElement = document.querySelector('#user-menu-button span');
        if (usernameElement && this.state.settings.admin.username) {
            usernameElement.textContent = this.state.settings.admin.username;
        }
    },
      // تحديث الشعار في واجهة المستخدم
    updateLogoInUI: function() {
        if (!this.state.settings.siteLogo) return;
        
        // إضافة الشعار في رأس الصفحة
        const navLogo = document.querySelector('nav .flex.items-center i.fas.fa-chart-line');
        if (navLogo) {
            // استبدال الأيقونة بشعار الموقع
            const logoImg = document.createElement('img');
            logoImg.src = this.state.settings.siteLogo;
            logoImg.alt = 'شعار الموقع';
            logoImg.classList.add('h-12', 'w-auto', 'mr-2');
            logoImg.id = 'site-logo';
            logoImg.style.maxHeight = '48px';
            
            // إذا كان شعار الموقع موجود بالفعل، استبدله
            const existingLogo = document.getElementById('site-logo');
            if (existingLogo) {
                existingLogo.src = this.state.settings.siteLogo;
                existingLogo.classList.add('h-12');
                existingLogo.style.maxHeight = '48px';
            } else {
                navLogo.parentNode.replaceChild(logoImg, navLogo);
            }
        }
    },
    
    // تحديث قسم الإعدادات في لوحة التحكم
    renderSettingsUI: function() {
        const settingsContainer = document.getElementById('settings-container');
        if (!settingsContainer) {
            console.error('لم يتم العثور على حاوية الإعدادات');
            return;
        }
        
        console.log('جاري تحديث واجهة الإعدادات...');
        
        settingsContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="section-header">
                    <h3 class="section-title">إعدادات الحساب</ه3>
                    <p class="section-subtitle">تغيير بيانات الدخول وشعار الموقع</p>
                </div>
                
                <form id="admin-settings-form" class="space-y-6">
                    <div class="space-y-6">
                        <div>
                            <label class="block text-gray-700 mb-2">اسم المستخدم</label>
                            <input type="text" id="admin-username" value="${this.state.settings.admin.username}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="border-t pt-6">
                            <h4 class="font-bold text-gray-800 mb-4">تغيير كلمة المرور</h4>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">كلمة المرور الحالية</label>
                                    <input type="password" id="current-password" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">كلمة المرور الجديدة</label>
                                    <input type="password" id="new-password" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                                    <input type="password" id="confirm-new-password" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                        </div>
                        
                        <div class="border-t pt-6">
                            <h4 class="font-bold text-gray-800 mb-4">شعار الموقع</h4>
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <div class="logo-preview ml-4 border rounded-lg overflow-hidden h-16 w-32 flex items-center justify-center bg-gray-100">
                                        ${this.state.settings.siteLogo ? 
                                            `<img src="${this.state.settings.siteLogo}" alt="شعار الموقع" class="max-h-full max-w-full">` : 
                                            `<i class="fas fa-image text-gray-400 text-3xl"></i>`}
                                    </div>
                                    <div>
                                        <label for="logo-upload" class="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg cursor-pointer hover:bg-gray-300 transition duration-300">
                                            اختيار شعار
                                        </label>
                                        <input type="file" id="logo-upload" accept="image/*" class="hidden">
                                        <p class="text-xs text-gray-500 mt-1">الحد الأقصى للحجم: 2 ميجابايت. الأبعاد الموصى بها: 200×100 بكسل.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="button" id="save-settings" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300 font-bold">
                            حفظ الإعدادات
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // إضافة مستمعي الأحداث بعد إنشاء العناصر
        this.setupSettingsUIEventListeners();
    },
    
    // إعداد مستمعي الأحداث لواجهة الإعدادات
    setupSettingsUIEventListeners: function() {
        // معالجة زر حفظ الإعدادات
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveAdminSettings();
            });
        }
        
        // معالجة تحميل الشعار
        const logoUpload = document.getElementById('logo-upload');
        if (logoUpload) {
            logoUpload.addEventListener('change', (e) => {
                this.handleLogoUpload(e);
            });
        }
    },
    
    // معالجة تحميل الشعار
    handleLogoUpload: function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // التحقق من حجم الملف (الحد الأقصى 2 ميجابايت)
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('حجم الملف أكبر من 2 ميجابايت!', 'error');
            return;
        }
        
        // التحقق من نوع الملف (يجب أن يكون صورة)
        if (!file.type.startsWith('image/')) {
            this.showNotification('يجب تحميل ملف صورة فقط!', 'error');
            return;
        }
        
        // قراءة الملف كـ Data URL
        const reader = new FileReader();
        reader.onload = (event) => {
            const logoPreview = document.querySelector('.logo-preview');
            if (logoPreview) {
                logoPreview.innerHTML = `<img src="${event.target.result}" alt="شعار الموقع" class="max-h-full max-w-full">`;
            }
            
            this.state.settings.siteLogo = event.target.result;
            
            // إرسال حدث تحديث الشعار
            document.dispatchEvent(new CustomEvent('siteLogoUpdated', {
                detail: { logo: event.target.result }
            }));
        };
        reader.readAsDataURL(file);
    },
    
    // حفظ إعدادات المسؤول
    saveAdminSettings: function() {
        const username = document.getElementById('admin-username')?.value;
        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmNewPassword = document.getElementById('confirm-new-password')?.value;
        
        // التحقق من اسم المستخدم
        if (!username || username.trim() === '') {
            this.showNotification('يجب إدخال اسم مستخدم صحيح!', 'error');
            return;
        }
        
        // تحديث اسم المستخدم
        if (username !== this.state.settings.admin.username) {
            this.state.settings.admin.username = username;
            this.updateUsernameInUI();
        }
        
        // التحقق من كلمة المرور إذا أراد المستخدم تغييرها
        if (currentPassword || newPassword || confirmNewPassword) {
            // التحقق من أن كلمة المرور الحالية صحيحة
            if (currentPassword !== this.state.settings.admin.password) {
                this.showNotification('كلمة المرور الحالية غير صحيحة!', 'error');
                return;
            }
            
            // التحقق من أن كلمة المرور الجديدة غير فارغة
            if (!newPassword || newPassword.trim() === '') {
                this.showNotification('يجب إدخال كلمة مرور جديدة!', 'error');
                return;
            }
            
            // التحقق من تطابق كلمة المرور الجديدة مع تأكيدها
            if (newPassword !== confirmNewPassword) {
                this.showNotification('كلمة المرور الجديدة غير متطابقة مع التأكيد!', 'error');
                return;
            }
            
            // تحديث كلمة المرور
            this.state.settings.admin.password = newPassword;
        }
        
        // حفظ الإعدادات
        if (this.saveSettings()) {
            // تحديث حالة تسجيل الدخول في localStorage بعد تغيير بيانات المسؤول
            localStorage.setItem('admin_credentials', JSON.stringify(this.state.settings.admin));
            
            // عرض رسالة نجاح
            this.showNotification('تم حفظ الإعدادات بنجاح!', 'success');
            
            // إعادة تعيين حقول كلمة المرور
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-new-password').value = '';
        } else {
            this.showNotification('حدث خطأ أثناء حفظ الإعدادات.', 'error');
        }
    },
    
    // عرض إشعار
    showNotification: function(message, type = 'info') {
        if (typeof notificationHelper !== 'undefined' && typeof notificationHelper.show === 'function') {
            // استخدام نظام الإشعارات إذا كان متاحًا
            notificationHelper.show(message, type);
        } else {
            // إشعار بسيط إذا لم يكن نظام الإشعارات متاحًا
            alert(message);
        }
    }
};

// تهيئة مدير الإعدادات عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تحقق من أننا في صفحة لوحة التحكم
    const settingsTab = document.getElementById('settings');
    if (settingsTab) {
        // تهيئة مدير الإعدادات
        settingsManager.init();
        
        // عرض واجهة الإعدادات إذا كنا في تبويب الإعدادات
        if (settingsTab.classList.contains('active')) {
            console.log('تبويب الإعدادات نشط، يتم تحديث الواجهة...');
            setTimeout(() => {
                settingsManager.renderSettingsUI();
            }, 100);
        }
        
        // إضافة مستمع لتحميل واجهة الإعدادات عند النقر على تبويب الإعدادات
        const settingsTabLink = document.querySelector('a[data-tab="settings"]');
        if (settingsTabLink) {
            settingsTabLink.addEventListener('click', function() {
                console.log('تم النقر على تبويب الإعدادات (من settings-manager)');
                setTimeout(() => {
                    settingsManager.renderSettingsUI();
                }, 100);
            });
        }
        
        // إضافة مستمع للنقر على زر حفظ الإعدادات
        document.addEventListener('click', function(e) {
            const saveSettingsBtn = document.getElementById('save-settings');
            if (e.target === saveSettingsBtn || saveSettingsBtn && saveSettingsBtn.contains(e.target)) {
                console.log('تم النقر على زر حفظ الإعدادات (من settings-manager)');
                settingsManager.saveAdminSettings();
            }
        });
    }
});
