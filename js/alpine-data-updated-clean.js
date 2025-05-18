// Updated Alpine.js data component for the order form
function orderFormData() {
    return {
        // UI State
        step: 1,         // Current step in the order process (1: form, 2: payment, 3: confirmation)
        isLoading: true, // Loading state for data initialization
        orderId: null,   // ID of the created order
        
        // Form Fields
        selectedPlatform: '',   // Selected social platform ID
        selectedService: '',    // Selected service ID
        quantity: 1000,         // Default quantity
        accountUrl: '',         // User's social account URL
        link: '',               // Alias for accountUrl for legacy support
        
        // Data Collections
        platforms: [],          // Available platforms
        services: [],           // Available services
        
        // Pricing & Currency
        basePrice: 0,           // Base price before calculations
        totalPrice: 0,          // Total calculated price
        currency: 'USD',        // Selected currency
        customPricingData: {},  // Custom pricing overrides
        
        // Currency mapping
        currencySymbols: {
            USD: '$',
            EUR: '€',
            GBP: '£',
            SAR: '﷼',
            AED: 'د.إ',
            KWD: 'د.ك',
            BHD: 'د.ب',
            QAR: 'ر.ق',
            OMR: 'ر.ع',
            EGP: 'ج.م'
        },
        
        // Computed properties
        get availablePlatforms() {
            return this.platforms.filter(p => p.active === true);
        },
        
        get availableServices() {
            if (!this.selectedPlatform) {
                return [];
            }
            
            return this.services.filter(
                service => service.platformId === this.selectedPlatform && service.active === true
            );
        },
        
        get selectedPlatformDetails() {
            return this.platforms.find(p => p.id === this.selectedPlatform) || { name: '', icon: 'globe', color: '#3b82f6' };
        },
        
        get selectedServiceDetails() {
            return this.services.find(s => s.id === this.selectedService) || { name: '', minQuantity: 1000 };
        },
        
        // Initialization method
        init() {
            // Backward compatibility for link parameter
            if (this.link) {
                this.accountUrl = this.link;
            }
            
            // Initialize the component
            this.loadPlatforms();
            this.loadServices();
            this.loadCustomPricing();
            this.setDefaultPlatformAndService();
            this.setupEventListeners();
            this.updatePrice();
            
            // Mark as loaded
            this.isLoading = false;
        },
        
        // Load platforms from localStorage.social_platforms
        loadPlatforms() {
            try {
                const platformsData = localStorage.getItem('social_platforms');
                if (platformsData) {
                    const allPlatforms = JSON.parse(platformsData);
                    this.platforms = allPlatforms.map(platform => ({
                        id: platform.id,
                        name: platform.name,
                        icon: platform.icon || 'globe',
                        color: platform.color || '#3b82f6',
                        active: platform.active === true
                    }));
                } else {
                    this.platforms = [];
                }
            } catch (error) {
                this.platforms = [];
            }
        },
        
        // Load services from localStorage.social_services
        loadServices() {
            try {
                const servicesData = localStorage.getItem('social_services');
                if (!servicesData) {
                    this.services = [];
                    return;
                }
                
                // Parse all services
                const allServices = JSON.parse(servicesData);
                
                // Get valid platform IDs
                const validPlatformIds = this.platforms
                    .filter(p => p.active === true)
                    .map(p => p.id);
                
                // Filter services by active status and valid platformId
                this.services = allServices.filter(service => 
                    service.active === true && 
                    validPlatformIds.includes(service.platformId)
                );
            } catch (error) {
                this.services = [];
            }
        },
        
        // Set default platform and service if available
        setDefaultPlatformAndService() {
            // If no platforms are available, nothing to do
            if (this.platforms.length === 0 || !this.availablePlatforms.length) {
                return;
            }
            
            // Set first active platform as default
            const firstPlatform = this.availablePlatforms[0];
            if (firstPlatform) {
                this.selectedPlatform = firstPlatform.id;
                
                // Find a service for this platform
                const servicesForPlatform = this.services.filter(
                    service => service.platformId === firstPlatform.id && service.active === true
                );
                
                if (servicesForPlatform.length > 0) {
                    this.selectedService = servicesForPlatform[0].id;
                }
            }
        },
        
        // Load custom pricing data
        loadCustomPricing() {
            try {
                const customPricingData = localStorage.getItem('pricing_data_for_index');
                if (customPricingData) {
                    this.customPricingData = JSON.parse(customPricingData);
                }
            } catch (error) {
                this.customPricingData = {};
            }
        },
        
        // Set up event listeners
        setupEventListeners() {
            // Platform selection
            document.addEventListener('platformSelected', (event) => {
                if (event.detail && event.detail.platformId) {
                    this.selectedPlatform = event.detail.platformId;
                    
                    // Find a service for this platform
                    const servicesForPlatform = this.availableServices;
                    if (servicesForPlatform.length > 0) {
                        this.selectedService = servicesForPlatform[0].id;
                    } else {
                        this.selectedService = '';
                    }
                    
                    this.updatePrice();
                }
            });
            
            // Service selection
            document.addEventListener('serviceSelected', (event) => {
                if (event.detail && event.detail.serviceId) {
                    this.selectedService = event.detail.serviceId;
                    this.updatePrice();
                }
            });
        },
        
        // Get platform icon
        getPlatformIcon(platformId) {
            const platform = this.platforms.find(p => p.id === platformId);
            return platform ? `fab fa-${platform.icon || 'globe'}` : 'fab fa-globe';
        },
        
        // Reset form fields
        resetForm() {
            // Keep platform and service selections
            this.quantity = 1000;
            this.accountUrl = '';
            this.link = '';
            this.step = 1;
            this.orderId = null;
            this.updatePrice();
        },
        
        // Update quantity based on service minimum
        updateQuantityBasedOnService() {
            if (this.selectedService) {
                const service = this.services.find(s => s.id === this.selectedService);
                if (service && service.minQuantity) {
                    this.quantity = service.minQuantity;
                    this.updatePrice();
                }
            }
        },
        
        // Calculate and update price based on selection
        updatePrice() {
            // Default base price
            let basePrice = 10; // Default price if no service is selected
            
            // Get service price if one is selected
            if (this.selectedService) {
                const service = this.services.find(s => s.id === this.selectedService);
                if (service) {
                    basePrice = service.pricePerThousand || service.price || 10;
                }
            }
            
            // Check for custom pricing override
            if (this.customPricingData && this.selectedService) {
                const customPrice = this.customPricingData[this.selectedService];
                if (customPrice !== undefined && !isNaN(customPrice)) {
                    basePrice = parseFloat(customPrice);
                }
            }
            
            // Get the quantity (minimum 1000)
            const quantity = Math.max(1000, this.quantity || 1000);
            
            // Calculate price based on quantity (per 1000 units)
            let finalPrice = basePrice * (quantity / 1000);
            
            // Apply currency conversion if needed
            const currencyRates = {
                EUR: 0.85,
                GBP: 0.73,
                SAR: 3.75,
                AED: 3.67,
                KWD: 0.31,
                QAR: 3.64,
                BHD: 0.38,
                OMR: 0.38,
                EGP: 30.90
            };
            
            const rate = currencyRates[this.currency] || 1;
            finalPrice = finalPrice / rate;
            
            // Round to 2 decimal places and update total price
            this.totalPrice = Math.round(finalPrice * 100) / 100;
            
            return this.totalPrice;
        },
        
        // Format price with currency symbol
        formatPrice(price) {
            if (typeof price !== 'number') {
                price = 0;
            }
            
            const formattedPrice = price.toFixed(2);
            const currencySymbol = this.currencySymbols[this.currency] || '$';
            return `${currencySymbol}${formattedPrice}`;
        },
        
        // Go to payment step
        goToPayment() {
            // Validate form fields
            if (!this.selectedPlatform) {
                document.getElementById('platform-selection').classList.add('border-red-500');
                this.showError('الرجاء اختيار منصة أولاً');
                return;
            }
            
            if (!this.selectedService) {
                document.getElementById('service-selection').classList.add('border-red-500');
                this.showError('الرجاء اختيار خدمة أولاً');
                return;
            }
            
            if (!this.accountUrl) {
                document.getElementById('account-url').classList.add('border-red-500');
                this.showError('الرجاء إدخال رابط أو اسم الحساب');
                return;
            }
            
            this.step = 2;
            window.scrollTo(0, 0);
            
            // Initialize payment if needed
            if (typeof window.renderPayPalButton === 'function') {
                window.renderPayPalButton();
            }
        },
        
        // Show error message
        showError(message) {
            const errorDiv = document.getElementById('form-error-message');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.classList.remove('hidden');
                setTimeout(() => {
                    errorDiv.classList.add('hidden');
                }, 5000);
            }
        },
        
        // Process payment
        processPayment() {
            // Validate customer info
            const name = document.getElementById('customer-name')?.value;
            const email = document.getElementById('customer-email')?.value;
            
            if (!name || !email) {
                this.showError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            // Save order
            this.saveOrder({
                name,
                email,
                platformId: this.selectedPlatform,
                serviceId: this.selectedService,
                quantity: this.quantity,
                price: this.totalPrice,
                accountUrl: this.accountUrl
            });
            
            // Proceed to confirmation step
            this.step = 3;
            window.scrollTo(0, 0);
        },
        
        // Save order to localStorage
        saveOrder(orderDetails) {
            try {
                // Generate order ID
                const orderId = 'ORD-' + Date.now();
                this.orderId = orderId;
                
                // Create order object
                const order = {
                    id: orderId,
                    customerName: orderDetails.name,
                    customerEmail: orderDetails.email,
                    platformId: orderDetails.platformId,
                    serviceId: orderDetails.serviceId,
                    quantity: orderDetails.quantity,
                    price: orderDetails.price,
                    currency: this.currency,
                    accountUrl: orderDetails.accountUrl,
                    status: 'paid',
                    createdAt: new Date().toISOString()
                };
                
                // Get existing orders
                let orders = [];
                const existingOrders = localStorage.getItem('dashboard_orders');
                
                if (existingOrders) {
                    orders = JSON.parse(existingOrders);
                }
                
                // Add new order
                orders.push(order);
                
                // Save back to localStorage
                localStorage.setItem('dashboard_orders', JSON.stringify(orders));
                
                return true;
            } catch (error) {
                return false;
            }
        }
    };
}
