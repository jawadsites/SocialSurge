/**
 * Social Media Dashboard Module
 * Main controller for the dashboard functionality
 */

const socialDashboard = {
    // App state
    state: {
        currentTab: 'dashboard-summary',
        isLoggedIn: false,
        userData: null,
        notifications: [
            {
                id: 1,
                title: 'طلب جديد',
                message: 'تم استلام طلب جديد من أحمد محمد',
                type: 'order',
                read: false,
                date: new Date().toISOString()
            },
            {
                id: 2,
                title: 'إشعار نظام',
                message: 'تم تحديث النظام إلى الإصدار 2.1',
                type: 'system',
                read: false,
                date: new Date().toISOString()
            },
            {
                id: 3,
                title: 'تنبيه',
                message: 'مخزون الخدمات منخفض، يرجى إضافة المزيد',
                type: 'alert',
                read: false,
                date: new Date().toISOString()
            }
        ],
        analyticsData: {
            sales: {
                daily: [120, 150, 180, 145, 190, 210, 240],
                monthly: [2800, 3200, 3800, 3600, 4200, 4500]
            },
            orders: {
                daily: [8, 12, 15, 10, 14, 18, 22],
                monthly: [220, 280, 320, 290, 350, 400]
            },
            platforms: {
                instagram: 45,
                facebook: 20,
                twitter: 15,
                youtube: 12,
                tiktok: 8
            }
        }
    },    // Initialize the dashboard
    init: function() {
        this.setupEventListeners();
        this.loadInitialData();
        
        // Check if user is already logged in (from localStorage)
        const isLoggedIn = localStorage.getItem('dashboard_isLoggedIn') === 'true';
        if (isLoggedIn) {
            this.loginSuccess();
              // Initialize dashboard visualizations
            this.renderServicesSummary();
            this.renderTopServicesChart();
            this.renderCurrencyDistribution();
            this.renderSalesChart();
            
            // Check for new orders since last visit
            this.checkForNewOrders();
        }
        
        // Initialize child modules
        this.initializeModules();
    },

    // Initialize all related dashboard modules
    initializeModules: function() {
        // Initialize services dashboard
        if (typeof servicesDashboard !== 'undefined' && typeof servicesDashboard.init === 'function') {
            servicesDashboard.init();
        }
        
        // Initialize orders dashboard
        if (typeof ordersDashboard !== 'undefined' && typeof ordersDashboard.init === 'function') {
            ordersDashboard.init();
        }
        
        // Initialize notification system
        if (typeof notificationSystem !== 'undefined' && typeof notificationSystem.init === 'function') {
            notificationSystem.init();
        }
    },

    // Load initial dashboard data
    loadInitialData: function() {
        this.loadStats();
        this.loadRecentOrders();
        this.updateNotificationCount();
    },    // Setup event listeners
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
        
        // Refresh dashboard button
        const refreshButton = document.getElementById('refresh-dashboard');
        if (refreshButton) {
            refreshButton.addEventListener('click', this.refreshDashboard.bind(this));
        }        // Refresh stats button
        const refreshStatsButton = document.getElementById('refresh-stats');
        if (refreshStatsButton) {
            refreshStatsButton.addEventListener('click', () => {
                this.loadStats();
                this.loadRecentOrders();
                this.renderServicesSummary();
                this.renderTopServicesChart();
                console.log('Stats refreshed!');
            });
        }
          // Refresh services button
        const refreshServicesButton = document.getElementById('refresh-services');
        if (refreshServicesButton) {
            refreshServicesButton.addEventListener('click', () => {
                this.renderServicesSummary();
                this.renderTopServicesChart();
                console.log('Services refreshed!');
                this.showNotification('تم تحديث بيانات الخدمات بنجاح', 'success');
            });
        }
          // Refresh currency distribution button
        const refreshCurrencyButton = document.getElementById('refresh-currency-data');
        if (refreshCurrencyButton) {
            refreshCurrencyButton.addEventListener('click', () => {
                this.renderCurrencyDistribution();
                console.log('Currency distribution refreshed!');
                this.showNotification('تم تحديث توزيع العملات بنجاح', 'success');
            });
        }
        
        // Add test data button
        const addTestDataButton = document.getElementById('add-test-data');
        if (addTestDataButton) {
            addTestDataButton.addEventListener('click', () => {
                // Add test service data
                this.addTestServiceData();
                
                // Add test currency data
                this.addTestCurrencyData();
                
                // Update all visualizations
                this.loadStats();
                this.loadRecentOrders();
                this.renderServicesSummary();
                this.renderTopServicesChart();
                this.renderCurrencyDistribution();
                
                console.log('Test data added!');
                this.showNotification('تم إضافة بيانات تجريبية بنجاح', 'success');
            });
        }

        // Tab system
        this.setupTabSystem();
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
                e.currentTarget.classList.remove('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
                e.currentTarget.classList.add('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show selected tab content
                const tabId = e.currentTarget.getAttribute('data-tab');
                const selectedTab = document.getElementById(tabId);
                if (selectedTab) {
                    selectedTab.classList.add('active');
                    this.state.currentTab = tabId;
                    
                    // Initialize specific tab data if needed
                    this.initializeTabData(tabId);
                }
            });
        });
    },    // Initialize specific tab data when switched to
    initializeTabData: function(tabId) {
        switch (tabId) {            case 'dashboard-summary':
                this.loadStats();
                this.loadRecentOrders();
                this.renderServicesSummary();
                this.renderTopServicesChart();
                this.renderCurrencyDistribution();
                this.renderSalesChart();
                break;
            case 'orders':
                if (typeof ordersDashboard !== 'undefined' && typeof ordersDashboard.loadOrders === 'function') {
                    ordersDashboard.loadOrders();
                }
                break;
            case 'analytics':
                this.initializeAnalytics();
                break;
            case 'platforms':
                if (document.getElementById('platforms-container').innerHTML === '') {
                    this.initializePlatforms();
                }
                break;
            case 'pricing':
                if (document.getElementById('pricing-container').innerHTML === '') {
                    this.initializePricing();
                }
                break;
            case 'settings':
                if (document.getElementById('settings-container').innerHTML === '') {
                    this.initializeSettings();
                }
                break;
        }
    },

    // Handle login form submission
    handleLogin: function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple validation (in a real app, this would be a server API call)
        if (username === 'admin' && password === 'admin123') {
            this.loginSuccess();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    },

    // Handle successful login
    loginSuccess: function() {
        // Hide login screen, show dashboard
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Set login state
        this.state.isLoggedIn = true;
        localStorage.setItem('dashboard_isLoggedIn', 'true');
        
        // Load dashboard data
        this.loadInitialData();
    },

    // Handle logout
    handleLogout: function() {
        this.state.isLoggedIn = false;
        localStorage.setItem('dashboard_isLoggedIn', 'false');
        
        // Show login screen, hide dashboard
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    },    // Load dashboard statistics from real data
    loadStats: function() {
        const totalSales = document.getElementById('total-sales');
        const newOrders = document.getElementById('new-orders');
        const customersCount = document.getElementById('customers-count');
        const conversionRate = document.getElementById('conversion-rate');
        
        // Elements for trend indicators
        const salesTrend = document.getElementById('total-sales-trend');
        const ordersTrend = document.getElementById('new-orders-trend');
        const customersTrend = document.getElementById('customers-trend');
        const conversionTrend = document.getElementById('conversion-trend');
        
        if (totalSales) {
            // Get orders from localStorage
            const storedOrders = localStorage.getItem('dashboard_orders');
            let orders = [];
            
            if (storedOrders) {
                try {
                    orders = JSON.parse(storedOrders);
                } catch (e) {
                    console.error('Error parsing stored orders:', e);
                }
            }
            
            // Get historical data from localStorage or create it if it doesn't exist
            let historicalData = this.getHistoricalData();
            const currentData = this.calculateCurrentMetrics(orders);
            
            // Calculate trend percentages (compare with last period)
            const trends = this.calculateTrends(currentData, historicalData);
            
            // Update UI elements with current values
            totalSales.textContent = '$' + currentData.sales.toFixed(2);
            newOrders.textContent = currentData.newOrdersCount;
            customersCount.textContent = currentData.uniqueCustomers;
            conversionRate.textContent = currentData.conversionRate.toFixed(1) + '%';
            
            // Update trend indicators
            this.updateTrendIndicator(salesTrend, trends.salesTrend);
            this.updateTrendIndicator(ordersTrend, trends.ordersTrend);
            this.updateTrendIndicator(customersTrend, trends.customersTrend);
            this.updateTrendIndicator(conversionTrend, trends.conversionTrend);
            
            // Save current data as historical for next comparison
            this.saveHistoricalData(currentData);
        }
    },
    
    // Get historical data for trend calculations
    getHistoricalData: function() {
        const storedData = localStorage.getItem('dashboard_historical_data');
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch (e) {
                console.error('Error parsing historical data:', e);
            }
        }
        
        // Default historical data if none exists
        return {
            sales: 0,
            newOrdersCount: 0,
            uniqueCustomers: 0,
            conversionRate: 0,
            timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
        };
    },
    
    // Save current metrics as historical data for future trend calculations
    saveHistoricalData: function(currentData) {
        // Only update historical data if it's been at least a day since last update
        const storedData = localStorage.getItem('dashboard_historical_data');
        if (storedData) {
            try {
                const historicalData = JSON.parse(storedData);
                const lastUpdate = new Date(historicalData.timestamp);
                const today = new Date();
                
                // If last update was less than a day ago, don't update
                if (today.getDate() === lastUpdate.getDate() && 
                    today.getMonth() === lastUpdate.getMonth() && 
                    today.getFullYear() === lastUpdate.getFullYear()) {
                    return;
                }
            } catch (e) {
                console.error('Error checking historical data timestamp:', e);
            }
        }
        
        // Add timestamp and save
        currentData.timestamp = Date.now();
        localStorage.setItem('dashboard_historical_data', JSON.stringify(currentData));
    },
    
    // Calculate current metrics from orders data    calculateCurrentMetrics: function(orders) {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        // Initialize metrics
        let metrics = {
            sales: 0,
            prevPeriodSales: 0,
            newOrdersCount: 0,
            prevPeriodOrdersCount: 0,
            uniqueCustomers: 0,
            prevPeriodUniqueCustomers: 0,
            visitorsCount: parseInt(localStorage.getItem('dashboard_visitors_count') || '0'),
            prevPeriodVisitorsCount: parseInt(localStorage.getItem('dashboard_prev_visitors_count') || '0'),
            conversionRate: 0,
            prevPeriodConversionRate: 0,
            currencies: {} // Track currency distribution
        };
        
        // Count unique customers
        const uniqueCustomers = new Set();
        const prevPeriodUniqueCustomers = new Set();
        
        // Process each order
        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const orderAmount = parseFloat(order.amount) || 0;
            
            // Track currency distribution
            const currency = order.currency || 'USD';
            if (!metrics.currencies[currency]) {
                metrics.currencies[currency] = 0;
            }
            metrics.currencies[currency] += orderAmount;
            
            // Last 7 days
            if (orderDate >= sevenDaysAgo) {
                metrics.newOrdersCount++;
                metrics.sales += orderAmount;
                
                if (order.customerEmail || order.email) {
                    uniqueCustomers.add(order.customerEmail || order.email);
                }
            }
            // Previous period (7-30 days ago)
            else if (orderDate >= thirtyDaysAgo) {
                metrics.prevPeriodOrdersCount++;
                metrics.prevPeriodSales += orderAmount;
                
                if (order.customerEmail || order.email) {
                    prevPeriodUniqueCustomers.add(order.customerEmail || order.email);
                }
            }
        });
        
        // Calculate unique customers count
        metrics.uniqueCustomers = uniqueCustomers.size;
        metrics.prevPeriodUniqueCustomers = prevPeriodUniqueCustomers.size;
        
        // Calculate conversion rate (assuming 15 visitors per order as a baseline)
        const totalVisitors = metrics.newOrdersCount * 15;  // Estimate
        const prevTotalVisitors = metrics.prevPeriodOrdersCount * 15; // Estimate
        
        metrics.conversionRate = totalVisitors > 0 ? (metrics.newOrdersCount / totalVisitors) * 100 : 0;
        metrics.prevPeriodConversionRate = prevTotalVisitors > 0 ? (metrics.prevPeriodOrdersCount / prevTotalVisitors) * 100 : 0;
        
        return metrics;
    },
    
    // Calculate trends by comparing current metrics with historical data
    calculateTrends: function(currentData, historicalData) {
        // Calculate percentage change for each metric
        const salesTrend = historicalData.sales > 0 ? 
            ((currentData.sales - historicalData.sales) / historicalData.sales) * 100 : 0;
            
        const ordersTrend = historicalData.newOrdersCount > 0 ? 
            ((currentData.newOrdersCount - historicalData.newOrdersCount) / historicalData.newOrdersCount) * 100 : 0;
            
        const customersTrend = historicalData.uniqueCustomers > 0 ? 
            ((currentData.uniqueCustomers - historicalData.uniqueCustomers) / historicalData.uniqueCustomers) * 100 : 0;
            
        const conversionTrend = historicalData.conversionRate > 0 ? 
            ((currentData.conversionRate - historicalData.conversionRate) / historicalData.conversionRate) * 100 : 0;
        
        return {
            salesTrend: salesTrend,
            ordersTrend: ordersTrend,
            customersTrend: customersTrend,
            conversionTrend: conversionTrend
        };
    },
    
    // Update trend indicator with the calculated trend percentage
    updateTrendIndicator: function(element, trendValue) {
        if (!element) return;
        
        const iconElement = element.querySelector('i');
        const textElement = element.querySelector('span');
        
        // Round to 1 decimal place and ensure it's not NaN
        const displayValue = isNaN(trendValue) ? 0 : Math.abs(trendValue).toFixed(1);
        
        // Update the text
        textElement.textContent = displayValue + '%';
        
        // Update the icon and color based on trend direction
        if (trendValue > 0) {
            element.className = 'text-green-500 text-sm mt-2';
            iconElement.className = 'fas fa-arrow-up mr-1';
        } else if (trendValue < 0) {
            element.className = 'text-red-500 text-sm mt-2';
            iconElement.className = 'fas fa-arrow-down mr-1';
        } else {
            element.className = 'text-gray-500 text-sm mt-2';
            iconElement.className = 'fas fa-minus mr-1';
        }
    },

    // Load recent orders for dashboard
    loadRecentOrders: function() {
        const recentOrdersTable = document.getElementById('recent-orders-table');
        if (!recentOrdersTable) return;
        
        // Get orders from localStorage or use defaults
        let orders = [];
        const storedOrders = localStorage.getItem('dashboard_orders');
        
        if (storedOrders) {
            try {
                orders = JSON.parse(storedOrders);
            } catch (e) {
                console.error('Error parsing orders:', e);
                orders = this.getDefaultOrders();
            }
        } else {
            orders = this.getDefaultOrders();
        }
        
        // Sort by date and get most recent
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentOrders = orders.slice(0, 5);
        
        // Build table HTML
        const tbody = recentOrdersTable.querySelector('tbody');
        if (tbody) {
            let html = '';
            
            recentOrders.forEach(order => {
                const statusClass = this.getStatusClass(order.status);
                const statusText = this.getStatusText(order.status);
                
                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">${order.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${order.customerName}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <i class="${this.getPlatformIcon(order.platform)} text-blue-600 ml-2"></i>
                                ${order.service}
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap font-medium">$${order.amount.toFixed(2)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(order.date)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <a href="#" class="text-blue-600 hover:text-blue-900" onclick="socialDashboard.viewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </a>
                        </td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }
    },

    // View order details
    viewOrderDetails: function(orderId) {
        // In a real app, this would show a modal with order details
        // For demo, we'll switch to orders tab and alert
        
        const ordersTabLink = document.querySelector('.tab-link[data-tab="orders"]');
        if (ordersTabLink) {
            ordersTabLink.click();
        }
        
        setTimeout(() => {
            alert(`عرض تفاصيل الطلب: ${orderId}`);
        }, 100);
    },

    // Get default orders
    getDefaultOrders: function() {
        return [
            {
                id: 'TX983712648',
                customerName: 'أحمد محمد',
                service: 'متابعين انستغرام',
                amount: 25.00,
                quantity: 500,
                date: '2025-05-14',
                status: 'completed',
                platform: 'instagram'
            },
            {
                id: 'TX983712647',
                customerName: 'سارة أحمد',
                service: 'لايكات فيسبوك',
                amount: 15.00,
                quantity: 500,
                date: '2025-05-14',
                status: 'inProgress',
                platform: 'facebook'
            },
            {
                id: 'TX983712646',
                customerName: 'خالد عبدالله',
                service: 'مشاهدات يوتيوب',
                amount: 40.00,
                quantity: 4000,
                date: '2025-05-13',
                status: 'processing',
                platform: 'youtube'
            },
            {
                id: 'TX983712645',
                customerName: 'فاطمة علي',
                service: 'متابعين تويتر',
                amount: 20.00,
                quantity: 400,
                date: '2025-05-12',
                status: 'completed',
                platform: 'twitter'
            },
            {
                id: 'TX983712644',
                customerName: 'محمد أحمد',
                service: 'متابعين تيك توك',
                amount: 35.00,
                quantity: 700,
                date: '2025-05-11',
                status: 'completed',
                platform: 'tiktok'
            }
        ];
    },

    // Initialize platforms tab
    initializePlatforms: function() {
        const platformsContainer = document.getElementById('platforms-container');
        if (!platformsContainer) return;
        
        const platforms = [
            { id: 'instagram', name: 'انستغرام', icon: 'instagram', class: 'bg-gradient-to-r from-purple-500 to-pink-500', users: '2+ مليار', growth: '+12%' },
            { id: 'facebook', name: 'فيسبوك', icon: 'facebook-f', class: 'bg-blue-600', users: '3+ مليار', growth: '+5%' },
            { id: 'twitter', name: 'تويتر', icon: 'twitter', class: 'bg-blue-400', users: '500+ مليون', growth: '+8%' },
            { id: 'youtube', name: 'يوتيوب', icon: 'youtube', class: 'bg-red-600', users: '2.5+ مليار', growth: '+15%' },
            { id: 'tiktok', name: 'تيك توك', icon: 'tiktok', class: 'bg-black', users: '1.5+ مليار', growth: '+25%' }
        ];
        
        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        `;
        
        platforms.forEach(platform => {
            html += `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full ${platform.class} text-white flex items-center justify-center mr-4">
                                <i class="fab fa-${platform.icon} text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">${platform.name}</h3>
                                <p class="text-gray-500">${platform.users} مستخدم</p>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-gray-700">معدل النمو</span>
                                    <span class="text-green-600 font-medium">${platform.growth}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-600 h-2 rounded-full" style="width: ${platform.growth.replace('+', '').replace('%', '')}%"></div>
                                </div>
                            </div>
                            
                            <div class="flex justify-between text-sm text-gray-500">
                                <span>متوسط سعر 1000 متابع: $${(3 + Math.random() * 5).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-6 py-3 flex justify-between">
                        <button class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            <i class="fas fa-cog ml-1"></i> الإعدادات
                        </button>
                        <button class="text-green-600 hover:text-green-800 font-medium text-sm">
                            <i class="fas fa-chart-line ml-1"></i> التحليلات
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        platformsContainer.innerHTML = html;
    },

    // Initialize pricing tab
    initializePricing: function() {
        const pricingContainer = document.getElementById('pricing-container');
        if (!pricingContainer) return;
        
        const currencies = [
            { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 1.00, isDefault: true },
            { code: 'EUR', name: 'يورو', symbol: '€', rate: 0.93, isDefault: false },
            { code: 'GBP', name: 'جنيه إسترليني', symbol: '£', rate: 0.78, isDefault: false },
            { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 3.67, isDefault: false },
            { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 3.75, isDefault: false },
            { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rate: 30.90, isDefault: false },
            { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', rate: 0.31, isDefault: false },
            { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق', rate: 3.64, isDefault: false },
            { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', rate: 0.38, isDefault: false },
            { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع', rate: 0.38, isDefault: false }
        ];
        
        let html = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">إدارة العملات وأسعار الصرف</h3>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرمز</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العملة</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرمز المختصر</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الصرف مقابل الدولار</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
        `;
        
        currencies.forEach(currency => {
            html += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-medium">${currency.code}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${currency.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${currency.symbol}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${currency.rate.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currency.isDefault ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                            ${currency.isDefault ? 'العملة الافتراضية' : 'مفعلة'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2 space-x-reverse">
                        <button class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!currency.isDefault ? `
                        <button class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        ` : ''}
                        ${!currency.isDefault ? `
                        <button class="text-green-600 hover:text-green-900">
                            <i class="fas fa-star"></i>
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">تخصيص أسعار الخدمات حسب العملة</h3>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">اختر الخدمة</label>
                        <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option>متابعين انستغرام</option>
                            <option>لايكات فيسبوك</option>
                            <option>مشاهدات يوتيوب</option>
                            <option>متابعين تيك توك</option>
                        </select>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer currency-item">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <span class="text-blue-600 font-bold">$</span>
                                </div>
                                <div>
                                    <p class="font-medium">دولار أمريكي (USD)</p>
                                    <p class="text-sm text-gray-500">السعر الأساسي</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <input type="number" value="5.00" step="0.01" class="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <span class="mr-2">$ لكل 1000</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer currency-item">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <span class="text-blue-600 font-bold">€</span>
                                </div>
                                <div>
                                    <p class="font-medium">يورو (EUR)</p>
                                    <p class="text-sm text-gray-500">تحويل تلقائي: 1 EUR = 0.93 USD</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <input type="number" value="4.65" step="0.01" class="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <span class="mr-2">€ لكل 1000</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer currency-item">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <span class="text-blue-600 font-bold">ر.س</span>
                                </div>
                                <div>
                                    <p class="font-medium">ريال سعودي (SAR)</p>
                                    <p class="text-sm text-gray-500">تحويل تلقائي: 1 SAR = 0.27 USD</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <input type="number" value="18.75" step="0.01" class="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <span class="mr-2">ر.س لكل 1000</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                            <i class="fas fa-save ml-1"></i> حفظ التغييرات
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        pricingContainer.innerHTML = html;
    },

    // Initialize settings tab
    initializeSettings: function() {
        const settingsContainer = document.getElementById('settings-container');
        if (!settingsContainer) return;
        
        const settingsHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">إعدادات عامة</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">اسم الموقع</label>
                                <input type="text" value="خدمات التواصل الاجتماعي" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">شعار الموقع</label>
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                                        <i class="fas fa-hashtag text-gray-600 text-2xl"></i>
                                    </div>
                                    <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                                        تغيير الشعار
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">العملة الافتراضية</label>
                                <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="USD" selected>دولار أمريكي (USD)</option>
                                    <option value="EUR">يورو (EUR)</option>
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="AED">درهم إماراتي (AED)</option>
                                </select>
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="enable-notifications" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked>
                                <label for="enable-notifications" class="mr-2 text-gray-700">تفعيل الإشعارات</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">إعدادات بوابة الدفع</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">PayPal Client ID</label>
                                <input type="text" value="AeAK1HSgtUTaOIWew8Hw5Ts-fcAXRJbEkhDsmwUNhoAtThAUFer3s5vXQYnM_GeKGuJhRQ6rMSu_8OzJ" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <p class="text-xs text-gray-500 mt-1">معرف العميل الخاص بحساب PayPal للمطورين</p>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">PayPal Secret</label>
                                <input type="password" value="****************************************" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">وضع PayPal</label>
                                <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="sandbox" selected>Sandbox (اختبار)</option>
                                    <option value="live">Live (مباشر)</option>
                                </select>
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="enable-paypal" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" checked>
                                <label for="enable-paypal" class="mr-2 text-gray-700">تفعيل الدفع عبر PayPal</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">إعدادات المستخدم</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">اسم المستخدم</label>
                                <input type="text" value="admin" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">البريد الإلكتروني</label>
                                <input type="email" value="admin@example.com" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">كلمة المرور الجديدة</label>
                                <input type="password" placeholder="اترك فارغاً إذا لم ترغب بالتغيير" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 text-sm font-bold mb-2">تأكيد كلمة المرور</label>
                                <input type="password" placeholder="اترك فارغاً إذا لم ترغب بالتغيير" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">إعدادات الإشعارات</h3>
                        
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p class="font-medium">إشعارات الطلبات الجديدة</p>
                                    <p class="text-sm text-gray-500">استلام إشعار عند إنشاء طلب جديد</p>
                                </div>
                                <div class="relative inline-block w-10 ml-2 align-middle select-none">
                                    <input type="checkbox" id="toggle-1" class="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked>
                                    <label for="toggle-1" class="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p class="font-medium">إشعارات المبيعات</p>
                                    <p class="text-sm text-gray-500">استلام إشعار عند اكتمال عملية بيع</p>
                                </div>
                                <div class="relative inline-block w-10 ml-2 align-middle select-none">
                                    <input type="checkbox" id="toggle-2" class="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked>
                                    <label for="toggle-2" class="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p class="font-medium">إشعارات النظام</p>
                                    <p class="text-sm text-gray-500">تحديثات النظام والتنبيهات الهامة</p>
                                </div>
                                <div class="relative inline-block w-10 ml-2 align-middle select-none">
                                    <input type="checkbox" id="toggle-3" class="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked>
                                    <label for="toggle-3" class="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p class="font-medium">التقارير الأسبوعية</p>
                                    <p class="text-sm text-gray-500">إرسال تقرير أسبوعي عبر البريد الإلكتروني</p>
                                </div>
                                <div class="relative inline-block w-10 ml-2 align-middle select-none">
                                    <input type="checkbox" id="toggle-4" class="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer">
                                    <label for="toggle-4" class="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        settingsContainer.innerHTML = settingsHTML;
    },

    // Initialize analytics tab with charts
    initializeAnalytics: function() {
        const analyticsContainer = document.getElementById('analytics-container');
        if (!analyticsContainer) return;
        
        const analyticsHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">المبيعات الشهرية</h3>
                    <div class="h-80">
                        <canvas id="sales-chart"></canvas>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">الطلبات حسب المنصة</h3>
                    <div class="h-80">
                        <canvas id="platforms-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 gap-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold text-gray-800">تفاصيل المبيعات</h3>
                        <div class="flex space-x-2">
                            <select class="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>آخر 7 أيام</option>
                                <option>آخر 30 يوم</option>
                                <option selected>آخر 90 يوم</option>
                                <option>العام الحالي</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الطلبات</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي المبيعات</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">متوسط قيمة الطلب</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النمو</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">مايو 2025</td>
                                    <td class="px-6 py-4 whitespace-nowrap">284</td>
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">$12,628</td>
                                    <td class="px-6 py-4 whitespace-nowrap">$44.46</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-green-600">+12.3%</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">أبريل 2025</td>
                                    <td class="px-6 py-4 whitespace-nowrap">253</td>
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">$11,245</td>
                                    <td class="px-6 py-4 whitespace-nowrap">$44.45</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-green-600">+8.7%</td>
                                </tr>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">مارس 2025</td>
                                    <td class="px-6 py-4 whitespace-nowrap">215</td>
                                    <td class="px-6 py-4 whitespace-nowrap font-medium">$9,870</td>
                                    <td class="px-6 py-4 whitespace-nowrap">$45.91</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-green-600">+5.2%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        analyticsContainer.innerHTML = analyticsHTML;
        
        // Check if Chart.js is loaded
        if (typeof Chart !== 'undefined') {
            this.renderCharts();
        } else {
            // Load Chart.js dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = this.renderCharts.bind(this);
            document.head.appendChild(script);
        }
    },

    // Render charts for analytics
    renderCharts: function() {
        if (typeof Chart === 'undefined') return;
        
        // Sales Chart
        const salesCtx = document.getElementById('sales-chart');
        if (salesCtx) {
            new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                    datasets: [{
                        label: 'المبيعات ($)',
                        data: [8500, 9200, 9870, 11245, 12628, 13500],
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Platforms Chart
        const platformsCtx = document.getElementById('platforms-chart');
        if (platformsCtx) {
            new Chart(platformsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['انستغرام', 'يوتيوب', 'تيك توك', 'فيسبوك', 'تويتر'],
                    datasets: [{
                        label: 'الطلبات',
                        data: [45, 25, 15, 10, 5],
                        backgroundColor: [
                            'rgba(138, 58, 185, 0.8)',
                            'rgba(255, 0, 0, 0.8)',
                            'rgba(0, 0, 0, 0.8)',
                            'rgba(24, 119, 242, 0.8)',
                            'rgba(29, 161, 242, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
    },

    // Update notification count
    updateNotificationCount: function() {
        const unreadCount = this.state.notifications.filter(n => !n.read).length;
        const countElement = document.querySelector('#notification-container .rounded-full');
        
        if (countElement) {
            countElement.textContent = unreadCount;
            
            if (unreadCount === 0) {
                countElement.classList.add('hidden');
            } else {
                countElement.classList.remove('hidden');
            }
        }
    },

    // Toggle notification panel
    toggleNotifications: function() {
        // This would typically show/hide a notification panel
        // For demo purposes, we'll just show an alert
        alert(`لديك ${this.state.notifications.filter(n => !n.read).length} إشعارات غير مقروءة`);
    },

    // Toggle user menu
    toggleUserMenu: function() {
        // This would typically show/hide a user dropdown menu
        // For demo purposes, we'll just show an alert
        alert('قائمة المستخدم');
    },

    // Get status class for order status
    getStatusClass: function(status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'inProgress':
                return 'bg-indigo-100 text-indigo-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    },

    // Get status text for order status
    getStatusText: function(status) {
        switch (status) {
            case 'completed':
                return 'مكتمل';
            case 'processing':
                return 'قيد المعالجة';
            case 'pending':
                return 'معلق';
            case 'inProgress':
                return 'قيد التنفيذ';
            case 'cancelled':
                return 'ملغي';
            default:
                return 'غير محدد';
        }
    },

    // Get platform icon class
    getPlatformIcon: function(platform) {
        const icons = {
            'instagram': 'fab fa-instagram',
            'facebook': 'fab fa-facebook-f',
            'twitter': 'fab fa-twitter',
            'youtube': 'fab fa-youtube',
            'tiktok': 'fab fa-tiktok'
        };
        return icons[platform] || 'fas fa-globe';
    },

    // Format date for display
    formatDate: function(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    },

    // Show notification    // Show notification    showNotification: function(message, type = 'info') {
        // Prevent duplicate or rapid-fire notifications
        const now = Date.now();
        if (this.lastNotificationTime && now - this.lastNotificationTime < 1000) {
            console.log('Notification throttled:', message);
            return; // Throttle notifications that happen too quickly
        }
        
        this.lastNotificationTime = now;
        
        // Use simple alert to avoid any circular reference issues
        alert(message);
    },

    // Update dashboard data
    updateDashboardData: function() {
        this.loadStats();
        this.loadRecentOrders();
        this.renderServicesSummary();
        this.renderSalesChart();
    },
      // Update dashboard data from all sources
    updateDashboardData: function() {
        // Update statistics
        this.loadStats();
        
        // Update recent orders
        this.loadRecentOrders();
        
        // Update services summary and visualizations
        this.renderServicesSummary();
        this.renderTopServicesChart();
        this.renderSalesChart();
        
        // Update notification count
        this.updateNotificationCount();
    },
    
    // Render top services chart with percentage bars
    renderTopServicesChart: function() {
        // Check if we're on the dashboard tab
        if (this.state.currentTab !== 'dashboard-summary') return;
        
        // Get container
        const container = document.getElementById('top-services-chart');
        if (!container) return;
        
        // Load services and orders
        const services = this.loadServices();
        const orders = this.loadOrders();
        
        // Calculate service metrics
        const serviceMetrics = this.calculateServiceMetrics(services, orders);
        
        // Sort by sales count
        serviceMetrics.sort((a, b) => b.salesCount - a.salesCount);
        
        // Take top 4
        const topServices = serviceMetrics.slice(0, 4);
        
        // Find max sales count to calculate percentages
        const maxSales = topServices.length > 0 ? topServices[0].salesCount : 0;
        
        // Render HTML
        let html = '';
        
        topServices.forEach(service => {
            const percentage = maxSales > 0 ? Math.round((service.salesCount / maxSales) * 100) : 0;
            const platformIcon = this.getPlatformIcon(service.platform);
            
            html += `
                <div class="flex items-center">
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <i class="${platformIcon} text-blue-600 text-xl"></i>
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between mb-1">
                            <span class="text-gray-700 font-medium">${service.name}</span>
                            <span class="text-gray-600">${percentage}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // If no services, show a message
        if (topServices.length === 0) {
            html = '<div class="text-center text-gray-500 py-4">لا توجد خدمات متاحة حالياً</div>';
        }
        
        container.innerHTML = html;
    },    // Refresh dashboard with latest data
    refreshDashboard: function() {
        // Reload data from localStorage
        this.loadStats();
        this.loadRecentOrders();
        
        // Reload and update module data
        if (typeof ordersDashboard !== 'undefined') {
            ordersDashboard.loadOrders();
            ordersDashboard.renderOrders();
        }
        
        if (typeof servicesDashboard !== 'undefined') {
            servicesDashboard.loadServices();
            servicesDashboard.renderServices();
        }
          // Update visualization data
        this.renderServicesSummary();
        this.renderTopServicesChart();
        this.renderCurrencyDistribution();
        this.renderSalesChart();
        
        // Show a notification
        this.showToastNotification('تم تحديث البيانات بنجاح', 'success');
    },    // Render currency distribution chart based on real data
    renderCurrencyDistribution: function() {
        // Check if we're on the dashboard tab
        if (this.state.currentTab !== 'dashboard-summary') return;
        
        const orders = this.loadOrders();
        const currencyContainer = document.getElementById('currency-distribution');
        
        if (!currencyContainer || orders.length === 0) {
            if (currencyContainer) {
                currencyContainer.innerHTML = '<p class="text-center text-gray-500">لا توجد بيانات متاحة</p>';
            }
            return;
        }
        
        // Calculate currency distribution
        const currencyDistribution = {};
        let totalAmount = 0;
        
        orders.forEach(order => {
            const currency = order.currency || 'USD';
            const amount = parseFloat(order.amount) || 0;
            
            if (!currencyDistribution[currency]) {
                currencyDistribution[currency] = 0;
            }
            
            currencyDistribution[currency] += amount;
            totalAmount += amount;
        });
        
        // Convert to percentage and create an array
        const distributionArray = [];
        for (const currency in currencyDistribution) {
            distributionArray.push({
                currency: currency,
                amount: currencyDistribution[currency],
                percentage: (currencyDistribution[currency] / totalAmount) * 100
            });
        }
        
        // Sort by percentage (highest first)
        distributionArray.sort((a, b) => b.percentage - a.percentage);
        
        // Generate HTML
        let html = '';
        
        // Get currency symbols and names
        const currencyInfo = {
            'USD': { symbol: '$', name: 'دولار أمريكي (USD)' },
            'EUR': { symbol: '€', name: 'يورو (EUR)' },
            'SAR': { symbol: 'ر.س', name: 'ريال سعودي (SAR)' },
            'AED': { symbol: 'د.إ', name: 'درهم إماراتي (AED)' },
            'EGP': { symbol: 'ج.م', name: 'جنيه مصري (EGP)' },
            'GBP': { symbol: '£', name: 'جنيه إسترليني (GBP)' }
        };
        
        distributionArray.forEach(item => {
            // Get currency info or use defaults
            const info = currencyInfo[item.currency] || { 
                symbol: item.currency, 
                name: item.currency 
            };
            
            html += `
                <div class="flex items-center">
                    <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <span class="text-green-600 font-bold">${info.symbol}</span>
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between mb-1">
                            <span class="text-gray-700 font-medium">${info.name}</span>
                            <span class="text-gray-600">${item.percentage.toFixed(1)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${item.percentage.toFixed(1)}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // If no currencies found, show a message
        if (distributionArray.length === 0) {
            html = '<p class="text-center text-gray-500">لا توجد بيانات متاحة</p>';
        }
        
        currencyContainer.innerHTML = html;
    },
        if (!servicesContainer) return;
        
        // Load services and orders
        const services = this.loadServices();
        const orders = this.loadOrders();
        
        // If no services, show default message
        if (!services.length) {
            servicesContainer.innerHTML = '<div class="text-center text-gray-500 py-4">لا توجد خدمات متاحة حالياً</div>';
            return;
        }
        
        // Calculate service metrics from orders data
        const serviceMetrics = this.calculateServiceMetrics(services, orders);
        
        // Sort services by sales count
        serviceMetrics.sort((a, b) => b.salesCount - a.salesCount);
        
        // Take top 4 services
        const topServices = serviceMetrics.slice(0, 4);
        
        // Render HTML with service information
        let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">';
        
        topServices.forEach(service => {
            const platformIcon = this.getPlatformIcon(service.platform || 'other');
            const salesCount = service.salesCount || 0;
            
            html += `
                <div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center">
                        <div class="text-2xl text-${this.getPlatformColor(service.platform || 'other')}">
                            <i class="${platformIcon}"></i>
                        </div>
                        <div class="ml-3 flex-1">
                            <h4 class="font-bold text-gray-800 text-sm">${service.name}</h4>
                            <div class="flex items-center">
                                <span class="text-gray-600 text-sm">${salesCount} مبيعات</span>
                                <span class="mr-2 text-xs ${service.trend === 'up' ? 'text-green-600' : 'text-red-600'}">
                                    <i class="fas fa-${service.trend === 'up' ? 'arrow-up' : 'arrow-down'}"></i> ${service.trendPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        servicesContainer.innerHTML = html;
    },
    
    // Calculate service metrics from orders data
    calculateServiceMetrics: function(services, orders) {
        // Initialize metrics object
        const metrics = [];
        const currentDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(currentDate.getDate() - 60);
        
        // Create a base metrics object for each service
        services.forEach(service => {
            metrics.push({
                id: service.id,
                name: service.name,
                platform: service.platforms && service.platforms.length > 0 ? service.platforms[0] : 'other',
                salesCount: 0,
                salesAmount: 0,
                currentPeriodCount: 0, // Last 30 days
                previousPeriodCount: 0, // 30-60 days ago
                trend: 'up',
                trendPercentage: 0
            });
        });
        
        // Count orders for each service
        orders.forEach(order => {
            // Find the service metrics object that matches this order
            const serviceMetric = metrics.find(metric => {
                // Sometimes the service name in orders doesn't exactly match the services list
                // So we do a partial match - if the order service string contains the service name
                return order.service && order.service.includes(metric.name);
            });
            
            if (serviceMetric) {
                // Increment total sales count and amount
                serviceMetric.salesCount++;
                serviceMetric.salesAmount += parseFloat(order.amount) || 0;
                
                // Check which time period this order belongs to
                const orderDate = new Date(order.date);
                if (orderDate >= thirtyDaysAgo) {
                    serviceMetric.currentPeriodCount++;
                } else if (orderDate >= sixtyDaysAgo) {
                    serviceMetric.previousPeriodCount++;
                }
            }
        });
        
        // Calculate trend for each service
        metrics.forEach(metric => {
            if (metric.previousPeriodCount > 0) {
                // Calculate percentage change
                const change = ((metric.currentPeriodCount - metric.previousPeriodCount) / metric.previousPeriodCount) * 100;
                metric.trendPercentage = Math.abs(Math.round(change));
                metric.trend = change >= 0 ? 'up' : 'down';
            } else if (metric.currentPeriodCount > 0) {
                // If no previous sales, but current sales exist, it's 100% up
                metric.trendPercentage = 100;
                metric.trend = 'up';
            } else {
                // Default values if there are no sales in either period
                metric.trendPercentage = 0;
                metric.trend = 'up';
            }
        });
        
        return metrics;
    },
      // Get platform icon
    getPlatformIcon: function(platform) {
        // Ensure platform is a string and convert to lowercase
        platform = String(platform).toLowerCase();
        
        const icons = {
            'instagram': 'fab fa-instagram',
            'facebook': 'fab fa-facebook-f',
            'twitter': 'fab fa-twitter',
            'youtube': 'fab fa-youtube',
            'tiktok': 'fab fa-tiktok',
            'other': 'fas fa-globe'
        };
        
        // Check if the platform contains any of our keys
        for (const key in icons) {
            if (platform.includes(key)) {
                return icons[key];
            }
        }
        
        return icons.other;
    },
      // Get platform color
    getPlatformColor: function(platform) {
        // Ensure platform is a string and convert to lowercase
        platform = String(platform).toLowerCase();
        
        const colors = {
            'instagram': 'purple-600',
            'facebook': 'blue-600',
            'twitter': 'blue-400',
            'youtube': 'red-600',
            'tiktok': 'gray-800',
            'other': 'gray-600'
        };
        
        // Check if the platform contains any of our keys
        for (const key in colors) {
            if (platform.includes(key)) {
                return colors[key];
            }
        }
        
        return colors.other;
    },
      // Sales chart visualization
    renderSalesChart: function() {
        // Check if we're on the dashboard tab
        if (this.state.currentTab !== 'dashboard-summary') return;
        
        // Get sales chart container
        const container = document.getElementById('sales-chart-container');
        if (!container) return;
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            container.innerHTML = '<div class="text-center text-gray-500 py-4">تعذر تحميل الرسم البياني</div>';
            return;
        }
        
        // Clear previous chart
        container.innerHTML = '<canvas id="sales-chart"></canvas>';
        
        // Get canvas
        const canvas = document.getElementById('sales-chart');
        if (!canvas) return;
        
        // Get sales data - either from state or calculate from orders
        let salesData = this.state.analyticsData?.sales?.daily || [0, 0, 0, 0, 0, 0, 0];
        
        // Try to calculate from real orders if no data is present
        if (salesData.every(value => value === 0)) {
            salesData = this.calculateSalesDataFromOrders();
        }
        
        // Get labels for the past 7 days
        const labels = this.getLast7DaysLabels();
        
        // Create chart
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'المبيعات',
                    data: salesData,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },
    
    // Calculate sales data from stored orders
    calculateSalesDataFromOrders: function() {
        const orders = this.loadOrders();
        const salesData = [0, 0, 0, 0, 0, 0, 0];
        
        // Create date objects for the past 7 days
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            dates.push(date);
        }
        
        // Group orders by date and sum amounts
        orders.forEach(order => {
            // Skip orders without proper date or amount
            if (!order.date || !order.amount) return;
            
            // Convert order date to Date object
            const orderDate = new Date(order.date);
            orderDate.setHours(0, 0, 0, 0);
            
            // Check if date falls within the past 7 days
            for (let i = 0; i < dates.length; i++) {
                if (orderDate.getTime() === dates[i].getTime()) {
                    // Add to sales data
                    salesData[i] += parseFloat(order.amount);
                    break;
                }
            }
        });
        
        // Round to 2 decimal places
        return salesData.map(amount => parseFloat(amount.toFixed(2)));
    },
    
    // Get labels for the last 7 days
    getLast7DaysLabels: function() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('ar-EG', { weekday: 'short' }));
        }
        return days;
    },    // Load services from serviceUtils or localStorage
    loadServices: function() {
        let services = [];
        
        // Try to use serviceUtils first (preferred method)
        if (typeof serviceUtils !== 'undefined') {
            services = serviceUtils.getAllServices();
            if (services && services.length > 0) {
                console.log(`تم تحميل ${services.length} خدمة من التخزين الموحد`);
                return services;
            }
        }
        
        // Fallback: Try to get from localStorage
        const storedServices = localStorage.getItem('dashboard_services');
        if (storedServices) {
            try {
                services = JSON.parse(storedServices);
                console.log(`تم تحميل ${services.length} خدمة من التخزين القديم`);
                
                // Try to migrate data if serviceUtils is available
                if (services.length > 0 && typeof serviceUtils !== 'undefined') {
                    serviceUtils.migrateOldData();
                }
            } catch (e) {
                console.error('خطأ في تحليل الخدمات المخزنة:', e);
                services = [];
            }
        }
        
        // If no services in localStorage and servicesDashboard exists, try getting from there
        if (!services.length && typeof servicesDashboard !== 'undefined' && 
            servicesDashboard.state && servicesDashboard.state.services) {
            services = servicesDashboard.state.services;
            console.log(`تم تحميل ${services.length} خدمة من servicesDashboard`);
        }
        
        return services;
    },

    // Load orders from localStorage
    loadOrders: function() {
        let orders = [];
        
        // Try to get from localStorage
        const storedOrders = localStorage.getItem('dashboard_orders');
        if (storedOrders) {
            try {
                orders = JSON.parse(storedOrders);
            } catch (e) {
                console.error('Error parsing stored orders:', e);
                orders = [];
            }
        }
        
        // If no orders in localStorage and ordersDashboard exists, try getting from there
        if (!orders.length && typeof ordersDashboard !== 'undefined' && 
            ordersDashboard.state && ordersDashboard.state.orders) {
            orders = ordersDashboard.state.orders;
        }
        
        return orders;
    },

    // Check for new orders since last visit
    checkForNewOrders: function() {
        try {
            // Get last visit timestamp
            const lastVisit = localStorage.getItem('dashboard_last_visit') || '0';
            
            // Update last visit timestamp
            localStorage.setItem('dashboard_last_visit', Date.now().toString());
            
            // Check for new orders
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                
                // Filter orders created after last visit
                const newOrders = orders.filter(order => {
                    const orderDate = new Date(order.date).getTime();
                    return orderDate > parseInt(lastVisit);
                });
                
                // If we have new orders, show notification
                if (newOrders.length > 0) {
                    newOrders.forEach(order => {
                        // Add notification if notification system is available
                        if (typeof notificationSystem !== 'undefined') {
                            const notification = {
                                title: 'طلب جديد',
                                message: `تم استلام طلب جديد: ${order.service} (${order.customerName})`,
                                type: 'order',
                                data: { orderId: order.id }
                            };
                            notificationSystem.addNotification(notification);
                        }
                    });
                    
                    // Update dashboard if function exists
                    if (typeof this.updateDashboardData === 'function') {
                        this.updateDashboardData();
                    }
                }
            }
        } catch (e) {
            console.error('Error checking for new orders:', e);
        }
    },
};

// Initialize the dashboard when document is ready
document.addEventListener('DOMContentLoaded', function() {
    socialDashboard.init();
});

// Social dashboard functionality without status column

const socialDashboard = {
    init: function() {
        console.log('Initializing social dashboard...');
        this.loadDashboardData();
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        // Setup any global event listeners
        document.addEventListener('click', function(e) {
            if (e.target.matches('[data-tab="orders"]') || e.target.closest('[data-tab="orders"]')) {
                // Handle navigation to orders tab
                const tabLinks = document.querySelectorAll('.tab-link');
                const tabContents = document.querySelectorAll('.tab-content');
                
                tabLinks.forEach(link => {
                    link.classList.remove('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
                    link.classList.add('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
                });
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const ordersTabLink = document.querySelector('[data-tab="orders"].tab-link');
                const ordersTab = document.getElementById('orders');
                
                if (ordersTabLink && ordersTab) {
                    ordersTabLink.classList.add('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
                    ordersTabLink.classList.remove('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
                    ordersTab.classList.add('active');
                    
                    // Initialize orders dashboard if needed
                    if (typeof ordersDashboard !== 'undefined') {
                        ordersDashboard.init();
                    }
                }
                
                e.preventDefault();
            }
        });
    },
    
    loadDashboardData: function() {
        // Update the recent orders table in the dashboard summary
        this.updateRecentOrdersTable();
    },
    
    updateRecentOrdersTable: function() {
        const recentOrdersTable = document.getElementById('recent-orders-table');
        if (!recentOrdersTable) return;
        
        const tbody = recentOrdersTable.querySelector('tbody');
        if (!tbody) return;
        
        // For demonstration, we'll keep using the existing data
        // In a real app, this would fetch recent orders from an API
    }
};

// Remove status column from tables
const tableTemplate = `
    <table class="min-w-full divide-y divide-gray-200" id="recent-orders-table">
        <thead>
            <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
        </thead>
        <tbody>
            <!-- Orders will be loaded dynamically -->
        </tbody>
    </table>
`;