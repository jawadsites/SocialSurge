// تكوين Stripe
// يجب استبدال 'your_publishable_key' بمفتاح Stripe العام الخاص بك
const stripePublishableKey = 'pk_test_TYooMQauvdEDq54NiTphI7jx';
let stripe;

// تهيئة Stripe بطريقة آمنة تتوافق مع البيئات المعزولة
document.addEventListener('DOMContentLoaded', function() {
    try {
        stripe = Stripe(stripePublishableKey);
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        // إظهار رسالة خطأ للمستخدم
        showError('لا يمكن تهيئة بوابة الدفع. يرجى التأكد من تفعيل JavaScript والسماح بوصول المنشأ نفسه.');
    }
    
    // تهيئة حقول بيانات البطاقة وإضافة المستمعين
    initCardInputs();
    
    // تهيئة زر الدفع
    initCheckoutButton();
});

// تهيئة حقول بيانات البطاقة
function initCardInputs() {
    // إضافة تنسيق لرقم البطاقة (إضافة مسافات كل 4 أرقام)
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = '';
            
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            
            e.target.value = formattedValue;
        });
    }
    
    // تنسيق تاريخ انتهاء الصلاحية (MM/YY)
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            
            e.target.value = value;
        });
    }
    
    // التحقق من رمز الأمان (CVC) - فقط أرقام
    const cardCvcInput = document.getElementById('card-cvc');
    if (cardCvcInput) {
        cardCvcInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/gi, '');
        });
    }
}

// إظهار رسالة خطأ للمستخدم
function showError(message) {
    const errorContainer = document.getElementById('card-errors');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.add('visible');
    }
}

// إخفاء رسالة الخطأ
function hideError() {
    const errorContainer = document.getElementById('card-errors');
    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.classList.remove('visible');
    }
}

// التحقق من بيانات البطاقة قبل الإرسال
function validateCardDetails() {
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvc = document.getElementById('card-cvc').value;
    
    if (!cardName) {
        showError('يرجى إدخال الاسم على البطاقة');
        return false;
    }
    
    if (cardNumber.length < 16) {
        showError('يرجى إدخال رقم بطاقة صحيح');
        return false;
    }
    
    if (!cardExpiry || cardExpiry.length < 5) {
        showError('يرجى إدخال تاريخ انتهاء الصلاحية بالصيغة MM/YY');
        return false;
    }
    
    if (!cardCvc || cardCvc.length < 3) {
        showError('يرجى إدخال رمز الأمان CVC');
        return false;
    }
    
    hideError();
    return true;
}

// تهيئة زر الدفع
function initCheckoutButton() {
    const checkoutButton = document.getElementById('checkout-button');
    
    if (!checkoutButton) return;
    
    checkoutButton.addEventListener('click', function() {
        // التحقق من اختيار جميع الخيارات المطلوبة
        const selectedService = document.getElementById('service').value;
        const selectedPlatform = document.getElementById('platform').value;
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const selectedCurrency = document.getElementById('currency').value;
        
        if (!selectedService || !selectedPlatform || quantity < 1) {
            showError('يرجى اختيار جميع خيارات المنتج المطلوبة');
            return;
        }
        
        // التحقق من بيانات البطاقة
        if (!validateCardDetails()) {
            return;
        }
        
        // استخراج بيانات السعر
        const basePrice = appData.services[selectedService].basePrice;
        const platformFactor = appData.services[selectedService].platforms[selectedPlatform].factor;
        const currencyRate = appData.currencies[selectedCurrency].rate;
        
        // حساب السعر النهائي
        const price = basePrice * platformFactor * quantity;
        const convertedPrice = price * currencyRate;
        const formattedPrice = convertedPrice.toFixed(2);
        
        // إنشاء الطلب من خلال Stripe Checkout
        createCheckoutSession(
            selectedService, 
            selectedPlatform, 
            quantity, 
            formattedPrice, 
            selectedCurrency
        );
    });
}

// إنشاء جلسة دفع باستخدام Stripe Checkout
function createCheckoutSession(serviceId, platformId, quantity, amount, currency) {
    // استخراج أسماء الخدمة والمنصة
    const serviceName = appData.services[serviceId].name;
    const platformName = appData.services[serviceId].platforms[platformId].name;
    
    // استخراج بيانات البطاقة
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
    const cardExpiry = document.getElementById('card-expiry').value.split('/');
    const cardCvc = document.getElementById('card-cvc').value;
    
    const cardData = {
        name: cardName,
        number: cardNumber,
        expMonth: cardExpiry[0],
        expYear: cardExpiry[1],
        cvc: cardCvc
    };
    
    // طباعة بيانات الدفع في وحدة التحكم للتصحيح
    console.log('إنشاء جلسة دفع...');
    console.log({
        service: serviceName,
        platform: platformName,
        quantity: quantity,
        amount: amount,
        currency: currency
    });
    
    // إظهار رسالة تحميل للمستخدم
    const button = document.getElementById('checkout-button');
    const originalText = button.textContent;
    button.textContent = 'جاري معالجة الدفع...';
    button.disabled = true;
    
    // محاكاة التحقق من البطاقة
    setTimeout(function() {
        // في بيئة الإنتاج، سيتم استخدام Stripe.js للتحقق من البطاقة
        // هنا نقوم بمحاكاة نجاح عملية الدفع فقط
        
        // إنشاء معرّف عملية وهمي
        const transactionId = 'txn_' + Math.random().toString(36).substr(2, 9);
        
        // توجيه المستخدم إلى صفحة النجاح
        window.location.href = `success.html?transaction_id=${transactionId}&amount=${amount}&currency=${currency}`;
    }, 1500);
    
    // ملاحظة: في بيئة الإنتاج، سيتم استخدام التعليمات التالية:
    /*
    stripe.createToken('card', {
        name: cardName,
        number: cardNumber,
        exp_month: cardExpiry[0],
        exp_year: cardExpiry[1],
        cvc: cardCvc
    }).then(function(result) {
        if (result.error) {
            showError(result.error.message);
            button.textContent = originalText;
            button.disabled = false;
        } else {
            // إرسال الرمز إلى الخادم للمعالجة
            fetch('/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: result.token.id,
                    amount: amount,
                    currency: currency,
                    description: `${serviceName} - ${platformName} (${quantity})`
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `success.html?transaction_id=${data.transactionId}&amount=${amount}&currency=${currency}`;
                } else {
                    showError(data.error || 'حدث خطأ أثناء معالجة الدفع');
                    button.textContent = originalText;
                    button.disabled = false;
                }
            });
        }
    });
    */
}

// التنفيذ الحقيقي لإنشاء جلسة دفع Stripe (معطل حاليًا - للتوضيح فقط)
function createRealStripeSession(serviceId, platformId, quantity, amount, currency) {
    // هذه الوظيفة معطلة لأنها تتطلب خادمًا خلفيًا حقيقيًا
    
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            service: appData.services[serviceId].name,
            platform: appData.services[serviceId].platforms[platformId].name,
            quantity: quantity,
            amount: amount,
            currency: currency
        }),
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(session) {
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function(result) {
        if (result.error) {
            alert(result.error.message);
        }
    })
    .catch(function(error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.');
    });
}