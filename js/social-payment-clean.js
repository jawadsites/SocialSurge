/**
 * Social Media Payment Module
 * Handles payment processing for the social media services
 */

const socialPayment = {
    // Payment state
    state: {
        orderId: null,
        orderDetails: null,
        paymentMethod: 'paypal',
        isProcessing: false,
        paypalInitialized: false,
        debug: false // Set to true only in development
    },

    /**
     * Initialize payment system
     */
    init: function() {
        // Get current order ID from localStorage
        this.state.orderId = localStorage.getItem('current_order_id');
        
        // Set debug mode based on environment
        this.state.debug = (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1');
        
        // Load order details if we have an order ID
        if (this.state.orderId) {
            this.loadOrderDetails();
            this.displayOrderDetails();
        }

        // Initialize PayPal button if needed
        if (document.getElementById('paypal-button-container')) {
            this.initializePayPal();
        }

        // Initialize success page if we're on it
        if (document.getElementById('order-success-details')) {
            this.initializeSuccessPage();
        }
    },
    
    /**
     * Load order details from localStorage
     */
    loadOrderDetails: function() {
        const orderId = this.state.orderId;
        this.logDebug('Loading order details for ID:', orderId);
        
        if (!orderId) {
            this.handleError('No order ID found in localStorage');
            return;
        }

        try {
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                this.logDebug('Found', orders.length, 'orders in localStorage');
                
                this.state.orderDetails = orders.find(order => order.id === orderId);
                
                if (this.state.orderDetails) {
                    this.logDebug('Order details loaded successfully');
                } else {
                    this.handleError('Order not found with ID: ' + orderId);
                }
            } else {
                this.handleError('No orders found in localStorage');
            }
        } catch (e) {
            this.handleError('Error loading order details', e);
        }
    },

    /**
     * Display order details on the payment page
     */
    displayOrderDetails: function() {
        const order = this.state.orderDetails;
        if (!order) return;

        // Update order summary elements
        const elements = {
            'order-id': order.id,
            'order-service': order.service,
            'order-platform': this.getPlatformName(order.platform),
            'order-quantity': this.formatNumber(order.quantity),
            'order-price': `${this.formatPrice(order.amount)} ${order.currency}`
        };

        // Update elements if they exist
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    },

    /**
     * Initialize PayPal button
     */
    initializePayPal: function() {
        if (this.state.paypalInitialized || !window.paypal) return;

        const order = this.state.orderDetails;
        if (!order) return;

        const self = this;
        
        // Render PayPal button
        window.paypal.Buttons({
            createOrder: function(data, actions) {
                // Set processing state
                self.state.isProcessing = true;
                self.updateProcessingUI(true);
                
                // Create the order
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: order.amount,
                            currency_code: order.currency.toUpperCase()
                        },
                        description: order.service + ' - ' + order.quantity
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Get payer name for the receipt
                    const payerName = details.payer.name?.given_name || 'Customer';
                    const transactionId = details.id;
                    
                    // Update order status
                    self.updateOrderStatus('completed', transactionId);
                    
                    // Show success message and proceed to success page
                    self.proceedToSuccessPage(payerName, transactionId);
                });
            },
            onCancel: function() {
                // Reset processing state
                self.state.isProcessing = false;
                self.updateProcessingUI(false);
                
                // Show cancellation message
                self.showNotification('Payment cancelled', 'warning');
            },
            onError: function(err) {
                // Reset processing state
                self.state.isProcessing = false;
                self.updateProcessingUI(false);
                
                // Show error
                self.handleError('Error processing payment', err);
                self.showNotification('Payment failed. Please try again.', 'error');
            },
            style: {
                color: 'blue',
                shape: 'rect',
                label: 'paypal',
                height: 40
            }
        }).render('#paypal-button-container');
        
        this.state.paypalInitialized = true;
    },

    /**
     * Proceed to success page after payment
     * @param {string} payerName - Name of the person who made the payment
     * @param {string} transactionId - Transaction ID from payment provider
     */
    proceedToSuccessPage: function(payerName, transactionId) {
        // Store transaction information
        localStorage.setItem('payment_transaction_id', transactionId);
        localStorage.setItem('payment_payer_name', payerName);
        
        // Show success message
        this.showNotification('Payment successful!', 'success');
        
        // Redirect to success page
        window.location.href = 'success.html';
    },

    /**
     * Update order status in localStorage
     * @param {string} status - New status of the order
     * @param {string} transactionId - Transaction ID from payment provider 
     */
    updateOrderStatus: function(status, transactionId) {
        const orderId = this.state.orderId;
        if (!orderId) return;

        try {
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                const orderIndex = orders.findIndex(order => order.id === orderId);
                
                if (orderIndex !== -1) {
                    orders[orderIndex].status = status;
                    if (transactionId) {
                        orders[orderIndex].transactionId = transactionId;
                    }
                    localStorage.setItem('dashboard_orders', JSON.stringify(orders));
                }
            }
        } catch (e) {
            this.handleError('Error updating order status', e);
        }
    },
    
    /**
     * Initialize success page
     */
    initializeSuccessPage: function() {
        this.logDebug('Initializing success page');
        const order = this.state.orderDetails;
        
        if (!order) {
            this.handleError('No order details found for ID: ' + this.state.orderId);
            return;
        }

        // Mark the order as completed if it's pending
        if (order.status === 'pending') {
            // Get the orders array to update the order
            try {
                const storedOrders = localStorage.getItem('dashboard_orders');
                if (storedOrders) {
                    const orders = JSON.parse(storedOrders);
                    const orderIndex = orders.findIndex(o => o.id === order.id);
                    
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = 'completed';
                        localStorage.setItem('dashboard_orders', JSON.stringify(orders));
                        
                        // Update local state as well
                        this.state.orderDetails.status = 'completed';
                    }
                }
            } catch (e) {
                this.handleError('Error updating order status', e);
            }
        }

        // Update success page elements
        const elements = {
            'success-order-id': order.id,
            'success-service': order.service,
            'success-quantity': this.formatNumber(order.quantity),
            'success-amount': `${this.formatPrice(order.amount)} ${order.currency}`,
            'success-date': this.formatDate(order.date),
            'success-account': order.accountUrl
        };

        // Update elements if they exist
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    },

    /**
     * Update UI during payment processing
     * @param {boolean} isProcessing - Whether payment is currently processing 
     */
    updateProcessingUI: function(isProcessing) {
        const processingOverlay = document.getElementById('payment-processing');
        if (processingOverlay) {
            if (isProcessing) {
                processingOverlay.classList.remove('hidden');
            } else {
                processingOverlay.classList.add('hidden');
            }
        }
    },

    /**
     * Show error message
     * @param {string} message - Error message to display 
     */
    showError: function(message) {
        const errorElement = document.getElementById('payment-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },
    
    /**
     * Show notification
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, warning, error)
     */
    showNotification: function(message, type = 'info') {
        // If notification system is available, use it
        if (typeof showNotification === 'function') {
            showNotification(message, type);
            return;
        }
        
        // Fallback to simple notification
        const notificationElement = document.getElementById('notification');
        if (notificationElement) {
            notificationElement.textContent = message;
            notificationElement.className = `notification ${type}`;
            notificationElement.classList.remove('hidden');
            
            setTimeout(() => {
                notificationElement.classList.add('hidden');
            }, 5000);
        }
    },
    
    /**
     * Get platform name from platform ID
     * @param {string} platformId - Platform ID
     * @return {string} Platform name
     */
    getPlatformName: function(platformId) {
        // Get platform name from platformId
        try {
            const platforms = localStorage.getItem('social_platforms');
            if (platforms) {
                const platformsList = JSON.parse(platforms);
                const platform = platformsList.find(p => p.id === platformId);
                if (platform) {
                    return platform.name;
                }
            }
        } catch (e) {
            this.handleError('Error getting platform name', e);
        }
        return platformId; // Fallback to ID if name not found
    },
    
    /**
     * Format number with thousands separator
     * @param {number} num - Number to format
     * @return {string} Formatted number
     */
    formatNumber: function(num) {
        return new Intl.NumberFormat().format(num);
    },
    
    /**
     * Format price with two decimal places
     * @param {number} price - Price to format
     * @return {string} Formatted price
     */
    formatPrice: function(price) {
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    },
    
    /**
     * Format date in local format
     * @param {string} dateStr - Date string
     * @return {string} Formatted date
     */
    formatDate: function(dateStr) {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat().format(date);
    },
    
    /**
     * Handle errors consistently
     * @param {string} message - Error message
     * @param {Error} error - Optional error object
     */
    handleError: function(message, error = null) {
        // In development, log to console
        if (this.state.debug) {
            if (error) {
                console.error(message, error);
            } else {
                console.error(message);
            }
        }
        
        // Log error for analytics
        if (typeof errorMonitor !== 'undefined' && errorMonitor.logError) {
            errorMonitor.logError('Payment', message, error);
        }
    },
    
    /**
     * Log debug messages (only in development)
     */
    logDebug: function(...args) {
        if (this.state.debug) {
            console.log(...args);
        }
    }
};

// Initialize payment system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    socialPayment.init();
});
