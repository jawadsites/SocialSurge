/**
 * Dashboard Management System for Social Media Services
 * This script handles all the dashboard interactions, tab switching, and data management
 */

// Main module for dashboard functionality

const dashboardApp = {    // Initial state
    state: {
        currentTab: 'dashboard-summary',
        isLoggedIn: false,
        activeModals: [],
        userData: null,
        services: [],
        platforms: [
            { id: 'instagram', name: 'انستغرام', icon: 'instagram' },
            { id: 'facebook', name: 'فيسبوك', icon: 'facebook' },
            { id: 'twitter', name: 'تويتر', icon: 'twitter' },
            { id: 'youtube', name: 'يوتيوب', icon: 'youtube' },
            { id: 'tiktok', name: 'تيك توك', icon: 'tiktok' }
        ],
        orders: [],
        currencies: [
            { code: 'USD', symbol: '$', name: 'دولار أمريكي' },
            { code: 'EUR', symbol: '€', name: 'يورو' },
            { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
            { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' }
        ],
        currentCurrency: { code: 'USD', symbol: '$', name: 'دولار أمريكي' }
    },    // Initialize the dashboard
    init: function() {
        this.setupEventListeners();
        this.loadDataFromStorage();
        this.checkAuthentication();
        this.setupTabSystem();
        this.setupModals();
        
        // Load initial data
        this.loadStats();
        this.loadRecentOrders();
    },
      // Load data from localStorage
    loadDataFromStorage: function() {
        // Load services using serviceUtils if available
        if (typeof serviceUtils !== 'undefined') {
            const services = serviceUtils.getAllServices();
            if (services && services.length > 0) {
                this.state.services = services;

            } else {
                this.state.services = this.getDefaultServices();
                serviceUtils.saveServices(this.state.services);
            }
        } else {
            // Fallback to direct localStorage
            const storedServices = localStorage.getItem('dashboard_services');
            if (storedServices) {
                try {
                    this.state.services = JSON.parse(storedServices);
                } catch (e) {
                    this.state.services = this.getDefaultServices();
                    this.state.services = this.getDefaultServices();
                }
            } else {
                // Set default services for first-time users
                this.state.services = this.getDefaultServices();
                this.saveServicesToStorage();
            }
        }
        
        // Load orders
        const storedOrders = localStorage.getItem('dashboard_orders');
        if (storedOrders) {
            try {
                this.state.orders = JSON.parse(storedOrders);
            } catch (e) {
                console.error('Error parsing stored orders data:', e);
                this.state.orders = this.getDefaultOrders();
            }
        } else {
            // Set default orders for first-time users
            this.state.orders = this.getDefaultOrders();
            this.saveOrdersToStorage();
        }
    },
    
    // Get default services data
    getDefaultServices: function() {
        return [
            {
                id: 1,
                name: 'متابعين',
                description: 'إضافة متابعين حقيقيين لحسابات التواصل الاجتماعي بشكل آمن.',
                platforms: ['instagram', 'twitter', 'facebook', 'tiktok', 'youtube'],
                basePrice: 5.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                dateCreated: new Date().toISOString()
            },
            {
                id: 2,
                name: 'إعجابات',
                description: 'زيادة الإعجابات على المنشورات والصور والفيديوهات.',
                platforms: ['instagram', 'twitter', 'facebook', 'youtube'],
                basePrice: 3.00,
                minQuantity: 50,
                maxQuantity: 5000,
                active: true,
                dateCreated: new Date().toISOString()
            },
            {
                id: 3,
                name: 'تعليقات',
                description: 'إضافة تعليقات إيجابية ذات صلة بالمحتوى.',
                platforms: ['instagram', 'facebook', 'youtube', 'tiktok'],
                basePrice: 10.00,
                minQuantity: 10,
                maxQuantity: 1000,
                active: true,
                dateCreated: new Date().toISOString()
            }
        ];
    },
    
    // Get default orders data
    getDefaultOrders: function() {
        return [
            {
                id: 'TX983712648',
                customerName: 'أحمد محمد',
                service: 'متابعين انستغرام',
                amount: 25.00,
                quantity: 500,
                date: '2025-05-14',
                platform: 'instagram'
            },
            {
                id: 'TX983712647',
                customerName: 'سارة أحمد',
                service: 'لايكات فيسبوك',
                amount: 15.00,
                quantity: 500,
                date: '2025-05-14',
                platform: 'facebook'
            },
            {
                id: 'TX983712646',
                customerName: 'خالد عبدالله',
                service: 'مشاهدات يوتيوب',
                amount: 40.00,
                quantity: 4000,
                date: '2025-05-13',
                platform: 'youtube'
            },
            {
                id: 'TX983712645',
                customerName: 'فاطمة علي',
                service: 'متابعين تويتر',
                amount: 20.00,
                quantity: 400,
                date: '2025-05-12',
                platform: 'twitter'
            }
        ];
    },
      // Save services to storage
    saveServicesToStorage: function() {
        // Use serviceUtils if available
        if (typeof serviceUtils !== 'undefined') {
            serviceUtils.saveServices(this.state.services);
        } else {
            // Fallback to direct localStorage
            localStorage.setItem('dashboard_services', JSON.stringify(this.state.services));
        }
    },
    
    // Save orders to localStorage
    saveOrdersToStorage: function() {
        localStorage.setItem('dashboard_orders', JSON.stringify(this.state.orders));
    },    // Setup all event listeners
    setupEventListeners: function() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Logout button click
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // User menu toggle
        const userMenuButton = document.getElementById('user-menu-button');
        if (userMenuButton) {
            userMenuButton.addEventListener('click', this.toggleUserMenu.bind(this));
        }
        
        // Service search and filter
        const serviceSearch = document.getElementById('service-search');
        if (serviceSearch) {
            serviceSearch.addEventListener('input', (e) => {
                const query = e.target.value;
                const filteredServices = this.searchServices(query);
                this.renderServices(filteredServices);
            });
        }
        
        const serviceFilter = document.getElementById('service-filter');
        if (serviceFilter) {
            serviceFilter.addEventListener('change', (e) => {
                const platform = e.target.value;
                const filteredServices = this.filterServicesByPlatform(platform);
                this.renderServices(filteredServices);
            });
        }
        
        // Add Order button
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', () => {
                this.addNewOrder();
            });
        }
        
        // Global click event delegation
        document.addEventListener('click', (e) => {
            // Edit service button
            if (e.target.closest('.edit-service-btn')) {
                const serviceId = e.target.closest('.edit-service-btn').getAttribute('data-id');
                this.editService(serviceId);
            }
            
            // Delete service button
            if (e.target.closest('.delete-service-btn')) {
                const serviceId = e.target.closest('.delete-service-btn').getAttribute('data-id');
                this.deleteService(serviceId);
            }
            
            // Order management
            if (e.target.closest('.view-order-btn')) {
                const orderId = e.target.closest('.view-order-btn').getAttribute('data-id');
                this.viewOrder(orderId);
            }
            
            if (e.target.closest('.complete-order-btn')) {
                const orderId = e.target.closest('.complete-order-btn').getAttribute('data-id');
                this.completeOrder(orderId);
            }
              // Export data buttons
            if (e.target.closest('#export-services-btn')) {
                this.exportServicesCSV();
            }
            
            if (e.target.closest('#export-orders-btn')) {
                // استخدام ordersDashboard إذا كان متاحًا وفي السياق المناسب
                if (typeof ordersDashboard !== 'undefined' && 
                    ordersDashboard.exportOrders && 
                    this.state.currentTab === 'orders') {

                    // لا داعي للقيام بأي شيء هنا، سيتم التعامل مع الحدث بواسطة مستمع ordersDashboard
                    return;
                } else {
                    // استخدام السلوك الافتراضي فقط إذا كنا لسنا في صفحة الطلبات
                    // أو إذا كان ordersDashboard غير متاح
                    if (this.state.currentTab !== 'orders') {
                        this.exportOrdersCSV();
                    }
                }
            }
            
            // Tab links with data-tab attribute
            if (e.target.closest('[data-tab]')) {
                const tabId = e.target.closest('[data-tab]').getAttribute('data-tab');
                if (tabId) {
                    // Find the tab link element
                    const tabLink = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
                    if (tabLink) {
                        // Trigger a click on the tab link
                        tabLink.click();
                    }
                }
            }
        });
    },
    
    // Check if user is authenticated
    checkAuthentication: function() {
        // In a real application, this would validate a token or check a session
        // For now, we'll simulate authentication
        const storedUser = localStorage.getItem('dashboard_user');
        if (storedUser) {
            try {
                this.state.userData = JSON.parse(storedUser);
                this.state.isLoggedIn = true;
                this.showDashboard();
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                this.state.isLoggedIn = false;
            }
        } else {
            this.state.isLoggedIn = false;
        }
    },
    
    // Setup tab navigation system
    setupTabSystem: function() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');

        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active state from all links
                tabLinks.forEach(el => {
                    el.classList.remove('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
                    el.classList.add('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
                });
                
                // Activate current link
                link.classList.remove('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
                link.classList.add('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
                
                // Hide all contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show selected content
                const tabId = link.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                
                // Update current tab in state
                this.state.currentTab = tabId;
                
                // Load tab-specific data if needed
                this.loadTabData(tabId);
            });
        });
    },
      // Setup modal dialogs
    setupModals: function() {
        // Add Service Modal
        const addServiceBtn = document.getElementById('add-service-btn');
        const addServiceModal = document.getElementById('add-service-modal');
        const closeServiceModal = document.getElementById('close-service-modal');
        const cancelService = document.getElementById('cancel-service');
        const saveServiceBtn = document.getElementById('save-service');
        const serviceForm = document.getElementById('add-service-form');

        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                // Reset form for new service
                if (serviceForm) {
                    serviceForm.reset();
                    serviceForm.setAttribute('data-mode', 'add');
                    serviceForm.removeAttribute('data-id');
                }
                
                addServiceModal.classList.remove('hidden');
                this.state.activeModals.push('add-service-modal');
            });
        }

        if (closeServiceModal) {
            closeServiceModal.addEventListener('click', () => {
                addServiceModal.classList.add('hidden');
                this.state.activeModals = this.state.activeModals.filter(
                    modal => modal !== 'add-service-modal'
                );
            });
        }

        if (cancelService) {
            cancelService.addEventListener('click', () => {
                addServiceModal.classList.add('hidden');
                this.state.activeModals = this.state.activeModals.filter(
                    modal => modal !== 'add-service-modal'
                );
            });
        }

        if (saveServiceBtn) {
            saveServiceBtn.addEventListener('click', () => {
                // Get form data and save the service
                this.saveService();
                
                // Close the modal
                addServiceModal.classList.add('hidden');
                this.state.activeModals = this.state.activeModals.filter(
                    modal => modal !== 'add-service-modal'
                );
            });
        }
        
        // Add event listener for closing modals with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.activeModals.length > 0) {
                const modalId = this.state.activeModals[this.state.activeModals.length - 1];
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('hidden');
                    this.state.activeModals.pop();
                }
            }
        });
    },
    
    // Handle login form submission
    handleLogin: function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // In a real application, this would make an API request
        // For now, we'll simulate a successful login with admin/admin123
        if (username === 'admin' && password === 'admin123') {
            this.state.userData = {
                username: username,
                role: 'admin',
                name: 'المسؤول',
                id: 1
            };
            
            this.state.isLoggedIn = true;
            
            // Store user data in localStorage (would be a token in a real app)
            localStorage.setItem('dashboard_user', JSON.stringify(this.state.userData));
            
            // Show the dashboard
            this.showDashboard();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    },
    
    // Handle logout button click
    handleLogout: function(e) {
        e.preventDefault();
        
        // Clear user data
        this.state.userData = null;
        this.state.isLoggedIn = false;
        
        // Remove from localStorage
        localStorage.removeItem('dashboard_user');
        
        // Hide dashboard and show login
        this.showLogin();    },
    
    // Toggle user menu
    toggleUserMenu: function() {
        // In a full implementation, this would show a dropdown with user options

    },
    
    // Show dashboard, hide login
    showDashboard: function() {
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen && dashboard) {
            loginScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
        }
    },
    
    // Show login, hide dashboard
    showLogin: function() {
        const loginScreen = document.getElementById('login-screen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen && dashboard) {
            loginScreen.classList.remove('hidden');
            dashboard.classList.add('hidden');
        }
    },      // Load dashboard statistics
    loadStats: function() {
        let totalSales = 0;
        let newOrders = 0;
        let customers = new Set();
        let conversionRate = '0.0%';
        let revenueGrowth = 0;
        
        // Use the analytics module if available
        if (typeof dashboardAnalytics !== 'undefined') {
            const stats = dashboardAnalytics.getStats();
            totalSales = stats.totalSales;
            newOrders = stats.newOrdersCount;
            customers = new Set(Array(stats.uniqueCustomersCount).fill(1));
            revenueGrowth = stats.revenueGrowth;
            
            // Calculate a realistic conversion rate
            const visitorsCount = parseInt(localStorage.getItem('dashboard_visitors_count') || '1000');
            conversionRate = ((stats.uniqueCustomersCount / visitorsCount) * 100).toFixed(1) + '%';
        } else {
            // Fall back to basic calculation from orders
            this.state.orders.forEach(order => {
                totalSales += order.amount;
                if (new Date(order.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
                    newOrders++;
                }
                customers.add(order.customerName);
            });
            
            // Calculate a random conversion rate as fallback
            conversionRate = (Math.random() * 10).toFixed(1) + '%';
            // Generate random growth between -15% and +25%
            revenueGrowth = (Math.random() * 40) - 15;
        }
        
        // Update the DOM with stats
        const totalSalesElement = document.getElementById('total-sales');
        if (totalSalesElement) {
            totalSalesElement.innerText = '$' + totalSales.toFixed(2);
            
            // Add growth indicator if we have revenue growth data
            const growthIndicator = totalSalesElement.parentElement.querySelector('.growth-indicator');
            if (!growthIndicator && revenueGrowth !== 0) {
                const indicator = document.createElement('span');
                indicator.className = `growth-indicator text-sm ml-2 ${revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`;
                indicator.innerHTML = `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% <i class="fas fa-${revenueGrowth > 0 ? 'arrow-up' : 'arrow-down'}"></i>`;
                totalSalesElement.parentElement.appendChild(indicator);
            } else if (growthIndicator && revenueGrowth !== 0) {
                growthIndicator.className = `growth-indicator text-sm ml-2 ${revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`;
                growthIndicator.innerHTML = `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% <i class="fas fa-${revenueGrowth > 0 ? 'arrow-up' : 'arrow-down'}"></i>`;
            }
        }
        
        if (document.getElementById('new-orders')) {
            document.getElementById('new-orders').innerText = newOrders;
        }
        
        if (document.getElementById('customers-count')) {
            document.getElementById('customers-count').innerText = customers.size;
        }
        
        if (document.getElementById('conversion-rate')) {
            document.getElementById('conversion-rate').innerText = conversionRate;
        }
        
        // Load best services stats
        this.loadBestSellingServices();
        

    },
      // Load best selling services statistics
    loadBestSellingServices: function() {
        // Use the dashboardAnalytics module if available
        if (typeof dashboardAnalytics !== 'undefined') {
            dashboardAnalytics.loadData();
            dashboardAnalytics.updateTopServicesStats();
        } else {
            // Fallback to the simple animation effect
            const servicesBars = document.querySelectorAll('.space-y-4 .bg-purple-600, .space-y-4 .bg-blue-600, .space-y-4 .bg-red-600, .space-y-4 .bg-indigo-600');
            servicesBars.forEach(bar => {
                bar.style.transition = 'width 0.8s ease-in-out';
            });
        }
        

    },
      // Load recent orders
    loadRecentOrders: function() {
        const ordersTable = document.getElementById('recent-orders-table');
        if (!ordersTable) return;
        
        // Sort by date (newest first)
        const recentOrders = [...this.state.orders].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        }).slice(0, 5); // Get top 5 latest orders
        
        const tbody = ordersTable.querySelector('tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        recentOrders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customerName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.service}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${order.amount.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.date).toLocaleDateString('ar-EG')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 view-order-btn" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                    ${order.status !== 'completed' ? `<button class="text-green-600 hover:text-green-900 complete-order-btn" data-id="${order.id}"><i class="fas fa-check-circle"></i></button>` : ''}
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        

    },
      // Load data specific to the current tab
    loadTabData: function(tabId) {
        switch (tabId) {
            case 'services':
                // Load services data
                this.loadServicesData();
                break;
            case 'platforms':
                // Load platforms data
                this.loadPlatformsData();
                break;
            case 'pricing':
                // Load pricing data
                this.loadPricingData();
                break;
            case 'orders':
                // Load orders data
                this.loadOrdersData();
                break;
            case 'analytics':
                // Load analytics data
                this.loadAnalyticsData();
                break;
            case 'settings':
                // Load settings data
                this.loadSettingsData();
                break;
        }
    },
      // Load services data
    loadServicesData: function() {
        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;
        
        // Render all services initially
        this.renderServices(this.state.services);
        

    },
    
    // Load platforms data
    loadPlatformsData: function() {
        const platformsContainer = document.getElementById('platforms-container');        if (!platformsContainer) {
            return;
        }
        
        platformsContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">المنصات المدعومة</h3>
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                        <i class="fas fa-plus mr-1"></i> إضافة منصة
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.state.platforms.map(platform => `
                        <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                            <div class="flex items-center mb-4">
                                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <i class="fab fa-${platform.icon} text-blue-600 text-xl"></i>
                                </div>
                                <h3 class="text-lg font-bold text-gray-800">${platform.name}</h3>
                            </div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="text-sm text-gray-500">عدد الخدمات: 
                                        <span class="font-semibold">${this.countServicesByPlatform(platform.id)}</span>
                                    </p>
                                </div>
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" class="sr-only peer" checked>
                                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        

    },
    
    // Load pricing data
    loadPricingData: function() {
        const pricingContainer = document.getElementById('pricing-container');
        if (!pricingContainer) {            return;
        }
        
        pricingContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">العملات المدعومة</h3>
                    <div>
                        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                            <i class="fas fa-plus mr-1"></i> إضافة عملة
                        </button>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رمز العملة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم العملة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرمز</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الصرف (مقابل الدولار)</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.state.currencies.map((currency, index) => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${currency.code}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${currency.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${currency.symbol}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${currency.code === 'USD' ? '1.00' : (Math.random() * (4 - 0.5) + 0.5).toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${index < 2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${index < 2 ? 'مفعلة' : 'غير مفعلة'}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button class="text-blue-600 hover:text-blue-900 mr-3"><i class="fas fa-edit"></i></button>
                                        <button class="text-red-600 hover:text-red-900"><i class="fas fa-trash-alt"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">إعدادات الأسعار العامة</h3>
                    <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300">
                        <i class="fas fa-save mr-1"></i> حفظ التغييرات
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 mb-2">العملة الافتراضية</label>
                        <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            ${this.state.currencies.map(currency => `
                                <option value="${currency.code}" ${currency.code === 'USD' ? 'selected' : ''}>
                                    ${currency.name} (${currency.symbol})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">وحدة السعر الافتراضية</label>
                        <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="1000" selected>لكل 1000 وحدة</option>
                            <option value="100">لكل 100 وحدة</option>
                            <option value="10">لكل 10 وحدات</option>
                            <option value="1">لكل وحدة</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        

    },
    
    // Load orders data
    loadOrdersData: function() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) {

            return;
        }
        
        ordersContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-filter text-gray-500 mr-2"></i>
                        <span class="text-gray-700">تصفية:</span>
                        <select class="mr-4 bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">جميع الطلبات</option>
                            <option value="completed">مكتملة</option>
                            <option value="inProgress">قيد التنفيذ</option>
                            <option value="processing">قيد المعالجة</option>
                            <option value="canceled">ملغية</option>
                        </select>
                    </div>
                    <div class="relative">
                        <input type="text" placeholder="بحث عن طلب..." class="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-500"></i>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto mt-4">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.state.orders.map(order => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.id}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customerName}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.service}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.quantity}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${order.amount.toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(order.date).toLocaleDateString('ar-EG')}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button class="text-blue-600 hover:text-blue-900 mr-3 view-order-btn" data-id="${order.id}"><i class="fas fa-eye"></i></button>
                                        ${order.status !== 'completed' ? `<button class="text-green-600 hover:text-green-900 complete-order-btn" data-id="${order.id}"><i class="fas fa-check-circle"></i></button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        

    },
    
    // Load analytics data
    loadAnalyticsData: function() {
        const analyticsContainer = document.getElementById('analytics-container');
        if (!analyticsContainer) {

            return;
        }
        
        analyticsContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">تحليلات المبيعات</h3>
                    <select class="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option>آخر 7 أيام</option>
                        <option>آخر 30 يوم</option>
                        <option>آخر 90 يوم</option>
                        <option>العام الحالي</option>
                    </select>
                </div>
                
                <div class="w-full h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                    <p class="text-gray-500">الرسم البياني للمبيعات سيظهر هنا</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="text-gray-700 font-semibold mb-2">إجمالي المبيعات</h4>
                        <p class="text-2xl font-bold text-blue-700">$12,628</p>
                        <p class="text-sm text-green-600 mt-1">+23.5% من الشهر الماضي</p>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="text-gray-700 font-semibold mb-2">متوسط قيمة الطلب</h4>
                        <p class="text-2xl font-bold text-green-700">$42.83</p>
                        <p class="text-sm text-green-600 mt-1">+5.2% من الشهر الماضي</p>
                    </div>
                    
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="text-gray-700 font-semibold mb-2">معدل العملاء الجدد</h4>
                        <p class="text-2xl font-bold text-purple-700">24.8%</p>
                        <p class="text-sm text-red-600 mt-1">-2.1% من الشهر الماضي</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">أكثر الخدمات طلباً</h3>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                <i class="fab fa-instagram text-blue-600 text-xl"></i>
                            </div>
                            <div class="flex-grow">
                                <div class="flex justify-between mb-1">
                                    <span class="text-gray-700 font-medium">متابعين انستغرام</span>
                                    <span class="text-gray-600">68%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 68%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                <i class="fab fa-tiktok text-blue-600 text-xl"></i>
                            </div>
                            <div class="flex-grow">
                                <div class="flex justify-between mb-1">
                                    <span class="text-gray-700 font-medium">متابعين تيك توك</span>
                                    <span class="text-gray-600">56%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 56%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-center">
                            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                <i class="fab fa-youtube text-blue-600 text-xl"></i>
                            </div>
                            <div class="flex-grow">
                                <div class="flex justify-between mb-1">
                                    <span class="text-gray-700 font-medium">مشاهدات يوتيوب</span>
                                    <span class="text-gray-600">42%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: 42%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">توزيع المبيعات جغرافياً</h3>
                    <div class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p class="text-gray-500">خريطة توزيع المبيعات ستظهر هنا</p>
                    </div>
                </div>
            </div>
        `;
        

    },
    
    // Load settings data
    loadSettingsData: function() {
        const settingsContainer = document.getElementById('settings-container');
        if (!settingsContainer) {

            return;
        }
        
        settingsContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-lg font-bold text-gray-800 mb-6">إعدادات الحساب</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-gray-700 mb-2">اسم المستخدم</label>
                        <input type="text" value="admin" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">البريد الإلكتروني</label>
                        <input type="email" value="admin@example.com" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">كلمة المرور الحالية</label>
                        <input type="password" placeholder="••••••••" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">كلمة المرور الجديدة</label>
                        <input type="password" placeholder="••••••••" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
                
                <div class="mt-6">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                        حفظ التغييرات
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-6">إعدادات الموقع</h3>
                
                <div class="space-y-6">
                    <div>
                        <label class="block text-gray-700 mb-2">اسم الموقع</label>
                        <input type="text" value="خدمات التواصل الاجتماعي" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">شعار الموقع</label>
                        <div class="flex items-center">
                            <div class="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
                                <i class="fas fa-image text-gray-400 text-2xl"></i>
                            </div>
                            <button class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300">
                                تغيير الشعار
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 mb-2">وضع الصيانة</label>
                        <div class="flex items-center">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" class="sr-only peer">
                                <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span class="mr-3 text-sm font-medium text-gray-700">تفعيل وضع الصيانة</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                        حفظ الإعدادات
                    </button>
                </div>
            </div>
        `;
        

    },
    
    // Function to count services by platform
    countServicesByPlatform: function(platformId) {
        return this.state.services.filter(service => 
            service.platforms.includes(platformId)
        ).length;
    },
      // Save a new service
    saveService: function() {
        // Get form data
        const form = document.getElementById('add-service-form');
        if (!form) return;
        
        const formMode = form.getAttribute('data-mode') || 'add';
        const serviceId = form.getAttribute('data-id');
        
        const serviceName = form.querySelector('input[placeholder="أدخل اسم الخدمة"]').value;
        const serviceDescription = form.querySelector('textarea[placeholder="أدخل وصفاً مختصراً للخدمة"]').value;
        const basePrice = parseFloat(form.querySelector('input[placeholder="5.00"]').value) || 5.00;
        const minQuantity = parseInt(form.querySelector('input[placeholder="100"]').value) || 100;
        const maxQuantity = parseInt(form.querySelector('input[placeholder="10000"]').value) || 10000;
        const isActive = form.querySelector('#service-active').checked;
        
        // Get selected platforms
        const platforms = [];
        const platformCheckboxes = form.querySelectorAll('input[type="checkbox"][id$="-platform"]');
        platformCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                platforms.push(checkbox.id.replace('-platform', ''));
            }
        });
        
        if (formMode === 'edit' && serviceId) {
            // Edit existing service
            const serviceIndex = this.state.services.findIndex(s => s.id == serviceId);
            if (serviceIndex !== -1) {
                this.state.services[serviceIndex] = {
                    ...this.state.services[serviceIndex],
                    name: serviceName,
                    description: serviceDescription,
                    platforms: platforms,
                    basePrice: basePrice,
                    minQuantity: minQuantity,
                    maxQuantity: maxQuantity,
                    active: isActive,
                };
                

            }
        } else {
            // Add new service
            const newService = {
                id: Date.now(),
                name: serviceName,
                description: serviceDescription,
                platforms: platforms,
                basePrice: basePrice,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity,
                active: isActive,
                dateCreated: new Date().toISOString()
            };
            
            this.state.services.push(newService);

        }
        
        // Save to localStorage
        this.saveServicesToStorage();
        
        // Reload services data to refresh the UI
        if (this.state.currentTab === 'services') {
            this.loadServicesData();
        }
        
        // Show a success message
        alert(formMode === 'edit' ? 'تم تحديث الخدمة بنجاح!' : 'تم إضافة الخدمة بنجاح!');
    },
    
    // Edit service
    editService: function(serviceId) {
        // Find the service
        const service = this.state.services.find(s => s.id == serviceId);
        if (!service) {
            console.error('Service not found:', serviceId);
            return;
        }
        
        // Get the form
        const form = document.getElementById('add-service-form');
        if (!form) return;
        
        // Set form mode to edit
        form.setAttribute('data-mode', 'edit');
        form.setAttribute('data-id', serviceId);
        
        // Fill form with service data
        form.querySelector('input[placeholder="أدخل اسم الخدمة"]').value = service.name;
        form.querySelector('textarea[placeholder="أدخل وصفاً مختصراً للخدمة"]').value = service.description;
        form.querySelector('input[placeholder="5.00"]').value = service.basePrice.toFixed(2);
        form.querySelector('input[placeholder="100"]').value = service.minQuantity;
        form.querySelector('input[placeholder="10000"]').value = service.maxQuantity;
        form.querySelector('#service-active').checked = service.active;
        
        // Reset all platform checkboxes
        const platformCheckboxes = form.querySelectorAll('input[type="checkbox"][id$="-platform"]');
        platformCheckboxes.forEach(checkbox => {
            const platformId = checkbox.id.replace('-platform', '');
            checkbox.checked = service.platforms.includes(platformId);
        });
        
        // Open the modal
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.state.activeModals.push('add-service-modal');
        }
    },
    
    // Delete service
    deleteService: function(serviceId) {
        // Confirm deletion
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            return;
        }
        
        // Find the service index
        const serviceIndex = this.state.services.findIndex(s => s.id == serviceId);
        if (serviceIndex === -1) {
            console.error('Service not found:', serviceId);
            return;
        }
        
        // Remove the service
        this.state.services.splice(serviceIndex, 1);
        
        // Save to localStorage
        this.saveServicesToStorage();
        
        // Reload services data
        this.loadServicesData();
        
        // Show success message
        alert('تم حذف الخدمة بنجاح!');
    },
    
    // View order details
    viewOrder: function(orderId) {
        // Find the order
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order) {
            console.error('Order not found:', orderId);
            return;
        }
        
        // In a real application, this would open an order details modal
        // For now, we'll just alert the details
        alert(`
            رقم الطلب: ${order.id}
            العميل: ${order.customerName}
            الخدمة: ${order.service}
            الكمية: ${order.quantity}
            المبلغ: $${order.amount.toFixed(2)}
            التاريخ: ${new Date(order.date).toLocaleDateString('ar-EG')}
        `);
    },
    
    // Complete an order
    completeOrder: function(orderId) {
        // Find the order
        const orderIndex = this.state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) {
            console.error('Order not found:', orderId);
            return;
        }
        
        // Update the status to completed
        this.state.orders[orderIndex].status = 'completed';
        
        // Save to localStorage
        this.saveOrdersToStorage();
        
        // Reload orders data
        if (this.state.currentTab === 'orders') {
            this.loadOrdersData();
        } else if (this.state.currentTab === 'dashboard-summary') {
            this.loadRecentOrders();
        }
        
        // Show success message
        alert('تم تحديث حالة الطلب إلى "مكتمل" بنجاح!');
    },
    
    // Export services data as CSV
    exportServicesCSV: function() {
        // Create CSV content
        let csvContent = 'ID,Name,Description,Platforms,Base Price,Min Quantity,Max Quantity,Status,Date Created\n';
        
        this.state.services.forEach(service => {
            // Format data for CSV
            const row = [
                service.id,
                '"' + service.name.replace(/"/g, '""') + '"', // Escape quotes
                '"' + service.description.replace(/"/g, '""') + '"', // Escape quotes
                '"' + service.platforms.join(', ') + '"',
                service.basePrice,
                service.minQuantity,
                service.maxQuantity,
                service.active ? 'Active' : 'Inactive',
                service.dateCreated
            ].join(',');
            
            csvContent += row + '\n';
        });
        
        // Create a Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'services_export_' + new Date().toISOString().split('T')[0] + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Export orders data as CSV
    exportOrdersCSV: function() {
        // Create CSV content
        let csvContent = 'Order ID,Customer,Service,Platform,Quantity,Amount,Date,Status\n';
        
        this.state.orders.forEach(order => {
            // Format data for CSV
            const row = [
                order.id,
                '"' + order.customerName.replace(/"/g, '""') + '"', // Escape quotes
                '"' + order.service.replace(/"/g, '""') + '"', // Escape quotes
                order.platform,
                order.quantity,
                order.amount,
                order.date
            ].join(',');
            
            csvContent += row + '\n';
        });
        
        // Create a Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'orders_export_' + new Date().toISOString().split('T')[0] + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // Add new order
    addNewOrder: function() {
        // Get current date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Generate a random order ID
        const orderId = 'TX' + Math.floor(Math.random() * 10000000);
        
        // Create a new order object
        const newOrder = {
            id: orderId,
            customerName: 'عميل جديد',
            service: 'متابعين انستغرام',
            amount: 25.00,
            quantity: 500,
            date: today,
            platform: 'instagram'
        };
        
        // Add to orders array
        this.state.orders.unshift(newOrder);
        
        // Save to localStorage
        this.saveOrdersToStorage();
        
        // Reload orders data if on orders tab
        if (this.state.currentTab === 'orders') {
            this.loadOrdersData();
        } else if (this.state.currentTab === 'dashboard-summary') {
            // Update stats and recent orders on the dashboard
            this.loadStats();
            this.loadRecentOrders();
        }
        
        // Show a success message
        alert('تم إضافة الطلب الجديد بنجاح!');
        
        return newOrder;
    },
    
    // Search services
    searchServices: function(query) {
        if (!query || query.trim() === '') {
            return this.state.services;
        }
        
        query = query.toLowerCase().trim();
        
        return this.state.services.filter(service => 
            service.name.toLowerCase().includes(query) || 
            service.description.toLowerCase().includes(query) ||
            service.platforms.some(platform => platform.toLowerCase().includes(query))
        );
    },
    
    // Search orders
    searchOrders: function(query) {
        if (!query || query.trim() === '') {
            return this.state.orders;
        }
        
        query = query.toLowerCase().trim();
        
        return this.state.orders.filter(order => 
            order.id.toLowerCase().includes(query) || 
            order.customerName.toLowerCase().includes(query) ||
            order.service.toLowerCase().includes(query) ||
            order.platform.toLowerCase().includes(query)
        );
    },
    
    // Filter orders by status
    filterOrdersByStatus: function(status) {
        if (!status || status === 'all') {
            return this.state.orders;
        }
        
        return this.state.orders.filter(order => order.status === status);
    },
    
    // Filter services by platform
    filterServicesByPlatform: function(platform) {
        if (!platform || platform === 'all') {
            return this.state.services;
        }
        
        return this.state.services.filter(service => 
            service.platforms.includes(platform)
        );
    },
    
    // Render services to the DOM
    renderServices: function(services) {
        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;
        
        servicesContainer.innerHTML = '';
        
        if (services.length === 0) {
            servicesContainer.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <div class="text-gray-400 text-5xl mb-4"><i class="fas fa-search"></i></div>
                    <h3 class="text-lg font-medium text-gray-500">لم يتم العثور على أي خدمات</h3>
                    <p class="text-gray-400 mt-2">حاول تغيير معايير البحث أو الفلتر</p>
                </div>
            `;
            return;
        }
        
        services.forEach(service => {
            // Create platform tags HTML
            let platformTags = '';
            service.platforms.forEach(platformId => {
                const platform = this.state.platforms.find(p => p.id === platformId);
                if (platform) {
                    platformTags += `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full platform-tag">${platform.name}</span>`;
                }
            });
            
            // Create service card
            const serviceCard = document.createElement('div');
            serviceCard.className = 'bg-white border border-gray-200 rounded-lg shadow-sm p-6 service-card transition-all duration-300';
            serviceCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold text-gray-800">${service.name}</h3>
                    <div class="flex space-x-1">
                        <button class="text-blue-600 hover:text-blue-900 p-1 edit-service-btn" data-id="${service.id}" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button class="text-red-600 hover:text-red-900 p-1 delete-service-btn" data-id="${service.id}" title="حذف"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-3">${service.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${platformTags}
                </div>
                <div class="border-t border-gray-200 pt-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-500">السعر الأساسي:</span>
                        <span class="font-semibold text-gray-700">$${service.basePrice.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-sm mt-2">
                        <span class="text-gray-500">الحالة:</span>
                        <span class="${service.active ? 'text-green-600' : 'text-red-600'} font-medium">${service.active ? 'مفعلة' : 'معطلة'}</span>
                    </div>
                </div>
            `;
            
            servicesContainer.appendChild(serviceCard);
        });
    },
};

// Initialize the dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    dashboardApp.init();
});

// Export for potential reuse in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dashboardApp;
}