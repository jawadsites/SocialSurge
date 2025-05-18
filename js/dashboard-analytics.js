/**
 * Dashboard Analytics Module
 * This script handles analytics and visualization functions for the dashboard
 */

// Main dashboard analytics module
const dashboardAnalytics = {
    // State for tracking analytics data
    state: {
        services: [],
        orders: [],
        topServices: [],
        lastRefresh: null
    },
    
    // Initialize the analytics module
    init: function() {
        this.loadData();
        this.setupEventListeners();
        this.initializeTopServices();
    },
    
    // Load data from localStorage or other data sources
    loadData: function() {
        this.loadServices();
        this.loadOrders();
        this.calculateTopServices();
    },      // Load services from serviceUtils or fallback to localStorage
    loadServices: function() {
        try {
            // Try to use serviceUtils first (preferred method)
            if (typeof serviceUtils !== 'undefined') {
                const services = serviceUtils.getAllServices();
                if (services && services.length > 0) {
                    this.state.services = services;
                    console.log(`تم تحميل ${services.length} خدمة من التخزين الموحد`);
                    return;
                }
            }
            
            // Fallback: Try localStorage
            const storedServices = localStorage.getItem('dashboard_services');
            if (storedServices) {
                this.state.services = JSON.parse(storedServices);
                
                // Migrate to unified storage if possible
                if (typeof serviceUtils !== 'undefined') {
                    serviceUtils.migrateOldData();
                }
            } else if (typeof dashboardApp !== 'undefined' && 
                      dashboardApp.state && 
                      dashboardApp.state.services) {
                this.state.services = [...dashboardApp.state.services];
            }
            
            // If no services found, generate mock data
            if (!this.state.services || this.state.services.length === 0) {
                this.generateMockData();
            }
        } catch (e) {
            console.error('Error loading services:', e);
            this.state.services = [];
            this.generateMockData();
        }
    },
    
    // Generate mock data for demonstration when no real data exists
    generateMockData: function() {
        // Set default services if none exist
        if (!this.state.services || this.state.services.length === 0) {
            this.state.services = [
                {
                    id: 1,
                    name: 'متابعين انستغرام',
                    description: 'زيادة عدد المتابعين على انستغرام بشكل آمن',
                    platforms: ['instagram'],
                    basePrice: 5.00,
                    minQuantity: 100,
                    maxQuantity: 10000,
                    active: true
                },
                {
                    id: 2,
                    name: 'متابعين تيك توك',
                    description: 'زيادة متابعين على تيك توك',
                    platforms: ['tiktok'],
                    basePrice: 6.00,
                    minQuantity: 100,
                    maxQuantity: 5000,
                    active: true
                },
                {
                    id: 3,
                    name: 'مشاهدات يوتيوب',
                    description: 'زيادة عدد المشاهدات للفيديوهات',
                    platforms: ['youtube'],
                    basePrice: 2.50,
                    minQuantity: 500,
                    maxQuantity: 50000,
                    active: true
                },
                {
                    id: 4,
                    name: 'إعجابات فيسبوك',
                    description: 'زيادة الإعجابات للمنشورات',
                    platforms: ['facebook'],
                    basePrice: 3.50,
                    minQuantity: 100,
                    maxQuantity: 5000,
                    active: true
                }
            ];
              // Save mock services using serviceUtils or fallback to localStorage
            if (typeof serviceUtils !== 'undefined') {
                serviceUtils.saveServices(this.state.services);
            } else {
                localStorage.setItem('dashboard_services', JSON.stringify(this.state.services));
            }
        }
        
        // Generate sample orders if none exist
        if (!this.state.orders || this.state.orders.length === 0) {
            const customers = ['محمد أحمد', 'سارة علي', 'أحمد محمود', 'فاطمة محمد', 'عمر خالد'];
            const today = new Date();
            this.state.orders = [];
            
            // Generate 20 sample orders over the last 30 days
            for (let i = 0; i < 20; i++) {
                const serviceIndex = Math.floor(Math.random() * this.state.services.length);
                const service = this.state.services[serviceIndex];
                const orderDate = new Date(today);
                orderDate.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
                
                const quantity = Math.floor(Math.random() * (service.maxQuantity - service.minQuantity)) + service.minQuantity;
                const unitPrice = service.basePrice / 100; // Price per unit
                const amount = unitPrice * quantity;
                
                this.state.orders.push({
                    id: 'TX' + Math.floor(Math.random() * 1000000000),
                    customerName: customers[Math.floor(Math.random() * customers.length)],
                    service: service.name,
                    platform: service.platforms[0],
                    amount: amount,
                    quantity: quantity,
                    date: orderDate.toISOString().split('T')[0],
                    status: Math.random() > 0.2 ? 'completed' : 'pending'
                });
            }
            
            // Save mock orders to localStorage
            localStorage.setItem('dashboard_orders', JSON.stringify(this.state.orders));
        }
    },
    
    // Load orders from localStorage
    loadOrders: function() {
        try {
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                this.state.orders = JSON.parse(storedOrders);
            } else if (typeof dashboardApp !== 'undefined' && 
                      dashboardApp.state && 
                      dashboardApp.state.orders) {
                this.state.orders = [...dashboardApp.state.orders];
            }
        } catch (e) {
            console.error('Error loading orders:', e);
            this.state.orders = [];
        }
    },
    
    // Setup all event listeners
    setupEventListeners: function() {
        // Add event listener for refresh buttons
        const refreshTopServicesBtn = document.getElementById('refresh-top-services');
        if (refreshTopServicesBtn) {
            refreshTopServicesBtn.addEventListener('click', this.handleRefreshClick.bind(this));
        }
    },
    
    // Handle refresh button click
    handleRefreshClick: function(e) {
        // Add spinning animation to the refresh icon
        const icon = e.currentTarget.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }
        
        // Reload fresh data
        this.loadData();
        
        // Update UI with real data
        setTimeout(() => {
            this.updateTopServicesStats();
            
            // Remove spinning animation
            if (icon) {
                icon.classList.remove('fa-spin');
            }
            
            // Show success notification
            this.showNotification('تم تحديث البيانات بنجاح', 'success');
            
            // Update timestamp
            this.state.lastRefresh = new Date();
        }, 800); // Short delay for animation effect
    },

    /**
     * Initialize top services data and styling
     */
    initializeTopServices: function() {
        // Set transition for all progress bars
        const progressBars = document.querySelectorAll('.progress-bar-68, .progress-bar-56, .progress-bar-42, .progress-bar-35');
        progressBars.forEach(bar => {
            bar.style.transition = 'width 0.8s ease-in-out';
        });
        
        // Update with real data on page load
        this.updateTopServicesStats();
    },
    
    // Calculate top selling services based on orders
    calculateTopServices: function() {
        // Create a map to track sales by service and platform
        const serviceMetrics = new Map();
        
        // Process all orders to calculate service popularity
        this.state.orders.forEach(order => {
            const serviceName = order.service;
            const platform = order.platform || this.getPlatformFromService(serviceName);
            const amount = parseFloat(order.amount) || 0;
            const quantity = parseInt(order.quantity) || 0;
            
            const key = `${serviceName}_${platform}`;
            
            if (!serviceMetrics.has(key)) {
                serviceMetrics.set(key, {
                    name: serviceName,
                    platform: platform,
                    count: 0,
                    totalAmount: 0,
                    totalQuantity: 0
                });
            }
            
            const metrics = serviceMetrics.get(key);
            metrics.count += 1;
            metrics.totalAmount += amount;
            metrics.totalQuantity += quantity;
        });
        
        // Convert map to array and sort by count
        this.state.topServices = Array.from(serviceMetrics.values())
            .sort((a, b) => b.count - a.count);
    },
    
    // Get platform from service name if not specified in order
    getPlatformFromService: function(serviceName) {
        if (!serviceName) return 'other';
        
        const serviceLower = serviceName.toLowerCase();
        
        if (serviceLower.includes('انستغرام') || serviceLower.includes('instagram')) {
            return 'instagram';
        } else if (serviceLower.includes('فيسبوك') || serviceLower.includes('facebook')) {
            return 'facebook';
        } else if (serviceLower.includes('تويتر') || serviceLower.includes('twitter')) {
            return 'twitter';
        } else if (serviceLower.includes('يوتيوب') || serviceLower.includes('youtube')) {
            return 'youtube';
        } else if (serviceLower.includes('تيك توك') || serviceLower.includes('tiktok')) {
            return 'tiktok';
        }
        
        return 'other';
    },    /**
     * Update top services statistics with real data
     */    updateTopServicesStats: function() {
        // Get all service items
        const serviceItems = document.querySelectorAll('.space-y-4 > div');
        if (!serviceItems.length) return;
        
        // Calculate percentages from real data
        const topFourServices = this.state.topServices.slice(0, 4);
        
        // If we don't have enough data, pad with placeholders
        while (topFourServices.length < 4) {
            topFourServices.push({
                name: '-',
                platform: 'other',
                count: 0,
                totalAmount: 0
            });
        }
        
        // Calculate total count for percentage calculation
        const totalCount = topFourServices.reduce((sum, service) => sum + service.count, 0);
        
        // Calculate percentages
        const percentages = topFourServices.map(service => {
            if (totalCount === 0) return 25; // Equal distribution if no data
            return Math.round((service.count / totalCount) * 100);
        });
        
        // Store previous data for trend calculation
        const previousData = this.getPreviousServicesData();
        
        // Apply to each service item
        serviceItems.forEach((item, index) => {
            if (index < percentages.length) {
                const service = topFourServices[index];
                const percentage = percentages[index];
                
                // Calculate trend
                let trendIcon = '';
                let trendClass = '';
                
                // Check if we have previous data for comparison
                if (previousData.length > 0 && service.name !== '-') {
                    const prevService = previousData.find(s => s.name === service.name);
                    if (prevService) {
                        const prevPercentage = prevService.percentage;
                        if (percentage > prevPercentage) {
                            trendIcon = '<i class="fas fa-arrow-up text-green-500 ml-1"></i>';
                            trendClass = 'text-green-500';
                        } else if (percentage < prevPercentage) {
                            trendIcon = '<i class="fas fa-arrow-down text-red-500 ml-1"></i>';
                            trendClass = 'text-red-500';
                        }
                    }
                }
                
                // Update service name if we have real data
                if (service.count > 0) {
                    const serviceNameElem = item.querySelector('.text-sm.font-medium');
                    if (serviceNameElem) {
                        serviceNameElem.textContent = service.name;
                    }
                }
                
                // Update percentage text with trend
                const percentText = item.querySelector('.text-xs.text-gray-500');
                if (percentText) {
                    percentText.className = `text-xs ${trendClass || 'text-gray-500'}`;
                    percentText.innerHTML = `${percentage}% ${trendIcon || ''}`;
                }
                
                // Update progress bar with animation
                const progressBar = item.querySelector('.bg-purple-600, .bg-blue-600, .bg-red-600, .bg-indigo-600');
                if (progressBar) {
                    // Set inline style for precise width with transition
                    progressBar.style.width = '0%'; // Reset for animation
                    setTimeout(() => {
                        progressBar.style.width = percentage + '%';
                    }, 50);
                }
            }
        });
        
        // Save current data for future trend comparison
        this.saveCurrentServicesData(topFourServices.map((service, index) => ({
            name: service.name,
            percentage: percentages[index]
        })));
    },
    
    // Get previously stored services data for trend comparison
    getPreviousServicesData: function() {
        try {
            const stored = localStorage.getItem('dashboard_previous_services');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading previous services data:', e);
            return [];
        }
    },
    
    // Save current services data for future trend comparison
    saveCurrentServicesData: function(data) {
        try {
            localStorage.setItem('dashboard_previous_services', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving services data:', e);
        }
    },
      /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning, info)
     */
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white flex items-center';
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600');
                break;
            case 'error':
                notification.classList.add('bg-red-600');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-600');
                break;
        }
        
        // Add content
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} mr-2"></i>
            <span>${message}</span>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {            notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    },
      // Get statistics for dashboard
    getStats: function() {
        // Calculate stats from orders
        const stats = {
            totalSales: 0,
            newOrdersCount: 0,
            uniqueCustomersCount: 0,
            revenueGrowth: 0,
            ordersByPlatform: {}
        };
        
        // Process orders
        if (this.state.orders.length > 0) {
            const uniqueCustomers = new Set();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            
            let currentWeekSales = 0;
            let previousWeekSales = 0;
            
            this.state.orders.forEach(order => {
                // Sum total sales
                const amount = parseFloat(order.amount) || 0;
                stats.totalSales += amount;
                
                // Check if recent order (last 7 days)
                const orderDate = new Date(order.date);
                if (orderDate > oneWeekAgo) {
                    stats.newOrdersCount++;
                    currentWeekSales += amount;
                } else if (orderDate > twoWeeksAgo) {
                    previousWeekSales += amount;
                }
                
                // Count unique customers
                if (order.customerName) {
                    uniqueCustomers.add(order.customerName);
                }
                
                // Track orders by platform
                const platform = order.platform || 'other';
                if (!stats.ordersByPlatform[platform]) {
                    stats.ordersByPlatform[platform] = 0;
                }
                stats.ordersByPlatform[platform]++;
            });
            
            // Calculate revenue growth
            if (previousWeekSales > 0) {
                stats.revenueGrowth = ((currentWeekSales - previousWeekSales) / previousWeekSales) * 100;
            }
            
            stats.uniqueCustomersCount = uniqueCustomers.size;
            
            // Add calculated metrics
            stats.currentWeekSales = currentWeekSales;
            stats.previousWeekSales = previousWeekSales;
            stats.avgOrderValue = stats.totalSales / this.state.orders.length;
        }
        
        return stats;
    },
    
    // Fetch data from API if available (for future implementation)
    fetchDataFromAPI: async function() {
        try {
            // Check if we have an API endpoint configured
            const apiEndpoint = localStorage.getItem('dashboard_api_endpoint');
            if (!apiEndpoint) return false;
            
            // In the future, this would make actual API calls
            console.log('Will fetch data from API: ' + apiEndpoint);
            
            /* 
            Example API call for future implementation:
            const response = await fetch(apiEndpoint + '/stats');
            const data = await response.json();
            if (data && data.success) {
                // Process and store the retrieved data
                this.processAPIData(data);
                return true;
            }
            */
            
            return false;
        } catch (e) {
            console.error('Error fetching data from API:', e);
            return false;
        }
    },
    
    // Process API data for future implementation
    processAPIData: function(data) {
        // Update services and orders with API data
        if (data.services) {
            this.state.services = data.services;
            localStorage.setItem('dashboard_services', JSON.stringify(data.services));
        }
        
        if (data.orders) {
            this.state.orders = data.orders;
            localStorage.setItem('dashboard_orders', JSON.stringify(data.orders));
        }
        
        // Update UI
        this.calculateTopServices();
        this.updateTopServicesStats();
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    dashboardAnalytics.init();
});
}
