// تكوين البيانات الأساسية للتطبيق
const appData = {
    // أسعار الخدمات الأساسية بالدولار الأمريكي
    services: {
        'followers': {
            name: 'متابعين',
            basePrice: 5,
            platforms: {
                'instagram': { name: 'انستغرام', factor: 1.0 },
                'twitter': { name: 'تويتر', factor: 0.8 },
                'facebook': { name: 'فيسبوك', factor: 0.9 },
                'tiktok': { name: 'تيك توك', factor: 1.2 },
                'youtube': { name: 'يوتيوب', factor: 1.5 }
            }
        },
        'comments': {
            name: 'تعليقات',
            basePrice: 10,
            platforms: {
                'instagram': { name: 'انستغرام', factor: 1.0 },
                'youtube': { name: 'يوتيوب', factor: 1.2 },
                'facebook': { name: 'فيسبوك', factor: 0.9 },
                'tiktok': { name: 'تيك توك', factor: 1.1 }
            }
        },
        'likes': {
            name: 'إعجابات',
            basePrice: 3,
            platforms: {
                'instagram': { name: 'انستغرام', factor: 1.0 },
                'twitter': { name: 'تويتر', factor: 0.8 },
                'facebook': { name: 'فيسبوك', factor: 0.7 },
                'youtube': { name: 'يوتيوب', factor: 1.1 },
                'tiktok': { name: 'تيك توك', factor: 1.0 }
            }
        },
        'views': {
            name: 'مشاهدات',
            basePrice: 2,
            platforms: {
                'youtube': { name: 'يوتيوب', factor: 1.0 },
                'instagram': { name: 'انستغرام', factor: 0.9 },
                'tiktok': { name: 'تيك توك', factor: 0.8 },
                'facebook': { name: 'فيسبوك', factor: 0.7 }
            }
        },
        'shares': {
            name: 'مشاركات',
            basePrice: 8,
            platforms: {
                'facebook': { name: 'فيسبوك', factor: 1.0 },
                'twitter': { name: 'تويتر', factor: 1.1 },
                'linkedin': { name: 'لينكد إن', factor: 1.5 }
            }
        },
        'premium': {
            name: 'حسابات موثقة',
            basePrice: 100,
            platforms: {
                'instagram': { name: 'انستغرام', factor: 1.5 },
                'twitter': { name: 'تويتر', factor: 1.2 },
                'facebook': { name: 'فيسبوك', factor: 1.3 },
                'tiktok': { name: 'تيك توك', factor: 1.4 }
            }
        }
    },
    
    // معاملات تحويل العملات (النسبة من الدولار الأمريكي)
    currencies: {
        'USD': { name: 'دولار أمريكي', rate: 1.0 },
        'EUR': { name: 'يورو', rate: 0.85 },
        'SAR': { name: 'ريال سعودي', rate: 3.75 },
        'AED': { name: 'درهم إماراتي', rate: 3.67 },
        'KWD': { name: 'دينار كويتي', rate: 0.31 },
        'QAR': { name: 'ريال قطري', rate: 3.64 },
        'BHD': { name: 'دينار بحريني', rate: 0.38 },
        'OMR': { name: 'ريال عماني', rate: 0.38 },
        'EGP': { name: 'جنيه مصري', rate: 15.70 },
        'JOD': { name: 'دينار أردني', rate: 0.71 }
    }
};

// حساب السعر النهائي وتحديث ملخص الطلب
function calculatePrice() {
    const selectedService = document.getElementById('service').value;
    const selectedPlatform = document.getElementById('platform').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 100; // الحد الأدنى 100
    const selectedCurrency = document.getElementById('currency').value;
    
    // التأكد من أن الكمية لا تقل عن 100
    if (quantity < 100) {
        document.getElementById('quantity').value = 100;
    }
    
    if (selectedService && selectedPlatform) {
        // استخراج بيانات السعر
        const basePrice = appData.services[selectedService].basePrice;
        const platformFactor = appData.services[selectedService].platforms[selectedPlatform].factor;
        const currencyRate = appData.currencies[selectedCurrency].rate;
        
        // حساب السعر
        const price = basePrice * platformFactor * quantity;
        // تحويل السعر للعملة المختارة
        const convertedPrice = price * currencyRate;
        
        // تحديث عرض السعر
        document.getElementById('price-amount').textContent = convertedPrice.toFixed(2);
        document.getElementById('price-currency').textContent = selectedCurrency;
        
        // تحديث ملخص الطلب
        updateOrderSummary(selectedService, selectedPlatform, quantity, convertedPrice.toFixed(2), selectedCurrency);
    } else {
        document.getElementById('price-amount').textContent = '0.00';
        
        // إعادة تعيين ملخص الطلب
        resetOrderSummary();
    }
}

// تحديث ملخص الطلب
function updateOrderSummary(serviceId, platformId, quantity, price, currency) {
    // استخراج أسماء الخدمة والمنصة
    const serviceName = appData.services[serviceId].name;
    const platformName = appData.services[serviceId].platforms[platformId].name;
    
    // تحديث عناصر ملخص الطلب
    document.getElementById('summary-service').textContent = serviceName;
    document.getElementById('summary-platform').textContent = platformName;
    document.getElementById('summary-quantity').textContent = quantity;
    document.getElementById('summary-price').textContent = `${price} ${currency}`;
    
    // إظهار ملخص الطلب بعد اكتمال كل المعلومات
    document.getElementById('order-summary').style.display = 'block';
}

// إعادة تعيين ملخص الطلب
function resetOrderSummary() {
    document.getElementById('summary-service').textContent = '-';
    document.getElementById('summary-platform').textContent = '-';
    document.getElementById('summary-quantity').textContent = '-';
    document.getElementById('summary-price').textContent = '-';
    
    // إخفاء ملخص الطلب
    document.getElementById('order-summary').style.display = 'none';
}

// تحديث خيارات المنصات بناءً على الخدمة المختارة
function updatePlatforms() {
    const serviceSelect = document.getElementById('service');
    const platformSelect = document.getElementById('platform');
    const selectedService = serviceSelect.value;
    
    // إفراغ قائمة المنصات
    platformSelect.innerHTML = '<option value="">-- اختر المنصة --</option>';
    
    // إذا تم اختيار خدمة، قم بإضافة المنصات المتاحة
    if (selectedService) {
        const platforms = appData.services[selectedService].platforms;
        
        for (const [platformId, platformData] of Object.entries(platforms)) {
            const option = document.createElement('option');
            option.value = platformId;
            option.textContent = platformData.name;
            platformSelect.appendChild(option);
        }
    }
    
    // تحديث السعر
    calculatePrice();
}

// تعيين مستمعي الأحداث
document.addEventListener('DOMContentLoaded', function() {
    // تحديث المنصات عند تغيير الخدمة
    document.getElementById('service').addEventListener('change', updatePlatforms);
    
    // تحديث السعر عند تغيير أي من الخيارات
    document.getElementById('platform').addEventListener('change', calculatePrice);
    document.getElementById('quantity').addEventListener('input', calculatePrice);
    document.getElementById('currency').addEventListener('change', calculatePrice);
    
    // تحديث المنصات أول مرة
    updatePlatforms();
});