/**
 * Notification Helper Utility
 * Provides standardized notification functions and utilities for the dashboard
 */

const notificationHelper = {
    // Track last notification time to prevent duplicates
    lastNotificationTime: 0,
    
    // Map to store notifications that were shown to prevent duplicates
    recentNotifications: new Map(),
    
    // Notification options
    options: {
        enabled: true,
        position: 'top-right',
        timeout: 5000, // Auto-close timeout in ms
        maxNotifications: 5,
        animation: true
    },
    
    // Container element for notifications
    container: null,
    
    /**
     * Initialize the notification system
     */
    init: function() {
        // Create notification container if it doesn't exist
        if (!this.container) {
            this.createContainer();
        }
    },
    
    /**
     * Create notification container
     */
    createContainer: function() {
        // Check if container already exists
        if (document.getElementById('notification-container')) {
            this.container = document.getElementById('notification-container');
            return;
        }
        
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container ' + this.options.position;
        document.body.appendChild(this.container);
        
        // Add custom styling if not already in the document
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    z-index: 9999;
                    max-width: 320px;
                    display: flex;
                    flex-direction: column;
                }
                
                .notification-container.top-right {
                    top: 20px;
                    right: 20px;
                }
                
                .notification-container.top-left {
                    top: 20px;
                    left: 20px;
                }
                
                .notification-container.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }
                
                .notification-container.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }
                
                .notification {
                    background-color: white;
                    color: #333;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: flex-start;
                    max-width: 100%;
                    position: relative;
                    animation: notification-fade-in 0.3s ease-out;
                }
                
                .notification.removing {
                    animation: notification-fade-out 0.3s ease-out forwards;
                }
                
                .notification-icon {
                    margin-left: 10px;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-content {
                    flex-grow: 1;
                }
                
                .notification-title {
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                
                .notification-close {
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                .notification.info {
                    border-right: 4px solid #3498db;
                }
                
                .notification.success {
                    border-right: 4px solid #2ecc71;
                }
                
                .notification.warning {
                    border-right: 4px solid #f39c12;
                }
                
                .notification.error {
                    border-right: 4px solid #e74c3c;
                }
                
                .notification .info-icon {
                    color: #3498db;
                }
                
                .notification .success-icon {
                    color: #2ecc71;
                }
                
                .notification .warning-icon {
                    color: #f39c12;
                }
                
                .notification .error-icon {
                    color: #e74c3c;
                }
                
                @keyframes notification-fade-in {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes notification-fade-out {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(50px); }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    /**
     * Show a notification
     * @param {string} message - Message to show
     * @param {string} type - Notification type (info, success, warning, error)
     * @param {object} options - Optional settings for this notification
     */
    show: function(message, type = 'info', options = {}) {
        // Skip if notifications are disabled
        if (!this.options.enabled) {
            console.log('Notifications disabled:', message);
            return;
        }
        
        // Initialize if needed
        if (!this.container) {
            this.init();
        }
        
        // Prevent duplicate or rapid-fire notifications
        const now = Date.now();
        
        // Check for duplicate message in recent history
        const recentKey = `${message}:${type}`;
        if (this.recentNotifications.has(recentKey) && 
            now - this.recentNotifications.get(recentKey) < 5000) {
            console.log('Duplicate notification prevented:', message);
            return;
        }
        
        // Check for throttling (any notification too soon)
        if (now - this.lastNotificationTime < 1000) {
            console.log('Notification throttled:', message);
            return;
        }
        
        // Update tracking variables
        this.lastNotificationTime = now;
        this.recentNotifications.set(recentKey, now);
        
        // Clean up old entries from the Map (older than 10 seconds)
        this.recentNotifications.forEach((timestamp, key) => {
            if (now - timestamp > 10000) {
                this.recentNotifications.delete(key);
            }
        });
        
        // Limit the number of notifications
        const existingNotifications = this.container.querySelectorAll('.notification');
        if (existingNotifications.length >= this.options.maxNotifications) {
            // Remove the oldest notification
            this.container.removeChild(existingNotifications[0]);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Get icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
            case 'error':
                icon = 'times-circle';
                break;
            default:
                icon = 'info-circle';
        }
        
        // Build notification content
        notification.innerHTML = `
            <div class="notification-icon ${type}-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${this.getTitle(type)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <div class="notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // Add notification to container
        this.container.appendChild(notification);
        
        // Add click handler for close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Auto-close after timeout
        const timeout = options.timeout || this.options.timeout;
        if (timeout > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    this.removeNotification(notification);
                }
            }, timeout);
        }
    },
    
    /**
     * Remove a notification with animation
     * @param {HTMLElement} notification - The notification element to remove
     */
    removeNotification: function(notification) {
        // Add removing class for animation
        notification.classList.add('removing');
        
        // Remove after animation completes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },
    
    /**
     * Get notification title based on type
     * @param {string} type - Notification type
     * @returns {string} - Title text
     */
    getTitle: function(type) {
        switch (type) {
            case 'success':
                return 'نجاح';
            case 'warning':
                return 'تنبيه';
            case 'error':
                return 'خطأ';
            default:
                return 'معلومات';
        }
    },
    
    /**
     * Enable or disable notifications
     * @param {boolean} enabled - Whether notifications should be enabled
     */
    setEnabled: function(enabled) {
        this.options.enabled = !!enabled;
    },
    
    /**
     * Set notification position
     * @param {string} position - Position (top-right, top-left, bottom-right, bottom-left)
     */
    setPosition: function(position) {
        if (['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(position)) {
            this.options.position = position;
            
            // Update container position if it exists
            if (this.container) {
                this.container.className = 'notification-container ' + position;
            }
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    notificationHelper.init();
});

// Make available globally
window.notificationHelper = notificationHelper;