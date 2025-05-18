/**
 * إصلاح نهائي وبسيط لمشكلة تسجيل الدخول
 */
(function() {
  // تنفيذ الكود عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة نظام تسجيل الدخول الجديد...');
    
    // إلغاء جميع معالجات الأحداث الموجودة سابقًا
    removeExistingHandlers();
    
    // إضافة المعالجات الجديدة
    setupNewLoginHandlers();
    
    // التحقق من حالة تسجيل الدخول
    checkLoginState();
  });
  
  // إلغاء معالجات الأحداث السابقة
  function removeExistingHandlers() {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    
    if (loginForm) {
      // إنشاء نسخة جديدة من النموذج لإلغاء جميع المستمعات السابقة
      const newForm = loginForm.cloneNode(true);
      loginForm.parentNode.replaceChild(newForm, loginForm);
    }
    
    if (loginButton) {
      // إنشاء نسخة جديدة من الزر لإلغاء جميع المستمعات السابقة
      const newButton = loginButton.cloneNode(true);
      loginButton.parentNode.replaceChild(newButton, loginButton);
    }
  }
  
  // إضافة معالجات جديدة لتسجيل الدخول
  function setupNewLoginHandlers() {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    
    if (!loginForm || !loginButton) {
      console.error('لم يتم العثور على عناصر تسجيل الدخول المطلوبة');
      return;
    }
    
    // معالج واحد للنموذج
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('تم تقديم نموذج تسجيل الدخول');
      processLogin();
      return false;
    });
    
    // معالج آخر للزر (للسلامة)
    loginButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('تم النقر على زر تسجيل الدخول');
      processLogin();
      return false;
    });
  }
  
  // معالجة تسجيل الدخول
  function processLogin() {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    if (!username || !password || !loginScreen || !dashboard) {
      console.error('لم يتم العثور على بعض العناصر المطلوبة لتسجيل الدخول');
      return;
    }
    
    // التحقق من بيانات الاعتماد
    if (username.value === 'admin' && password.value === 'admin123') {
      console.log('تم تسجيل الدخول بنجاح!');
      
      // إخفاء شاشة تسجيل الدخول وإظهار لوحة التحكم
      loginScreen.classList.add('hidden');
      dashboard.classList.remove('hidden');
      
      // تخزين حالة تسجيل الدخول
      localStorage.setItem('dashboard_logged_in', 'true');
      
      // إضافة فئة للجسم للتمييز بين حالتي تسجيل الدخول
      document.body.classList.add('logged-in');
      document.body.classList.remove('logged-out');
      
      // ضبط الشريط الجانبي والمحتوى الرئيسي
      setTimeout(adjustLayout, 50);
      setTimeout(adjustLayout, 200);
      setTimeout(adjustLayout, 500);
    } else {
      // عرض رسالة خطأ
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  }
  
  // التحقق من حالة تسجيل الدخول
  function checkLoginState() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    if (!loginScreen || !dashboard) return;
    
    // التحقق من LocalStorage
    if (localStorage.getItem('dashboard_logged_in') === 'true') {
      console.log('تم العثور على جلسة تسجيل دخول سابقة');
      
      // إخفاء شاشة تسجيل الدخول وإظهار لوحة التحكم
      loginScreen.classList.add('hidden');
      dashboard.classList.remove('hidden');
      
      // إضافة فئة للجسم للتمييز بين حالتي تسجيل الدخول
      document.body.classList.add('logged-in');
      document.body.classList.remove('logged-out');
      
      // ضبط الشريط الجانبي والمحتوى الرئيسي
      setTimeout(adjustLayout, 50);
      setTimeout(adjustLayout, 200);
      setTimeout(adjustLayout, 500);
    } else {
      // لا توجد جلسة تسجيل دخول، أضف فئة للجسم
      document.body.classList.add('logged-out');
      document.body.classList.remove('logged-in');
    }
  }
  
  // ضبط تخطيط الصفحة بعد تسجيل الدخول
  function adjustLayout() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.w-4/5');
    
    if (window.innerWidth >= 1025) {
      if (sidebar) {
        sidebar.style.cssText = 'display: block !important; width: 20% !important; transform: translateX(0) !important; position: relative !important; z-index: 10;';
      }
      
      if (mainContent) {
        mainContent.style.cssText = 'width: 80% !important;';
      }
    }
  }
})();