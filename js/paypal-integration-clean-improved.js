/**
 * Updated PayPal Integration (Clean Version)
 * Creates payment requests based on Alpine.js component total price
 * Verifies payment success and shows user messages
 */

// PayPal Button Initialization Function
function initializePayPalButton() {
    console.log("Initializing PayPal button");
    
    // Check for PayPal container and SDK
    if (!document.getElementById('paypal-button-container') || !window.paypal) {
        console.error("PayPal container or SDK not found");
        return;
    }

    // Get Alpine.js component
    let alpineComponent;
    try {
        if (window.Alpine) {
            const element = document.querySelector('[x-data]');
            if (element) {
                alpineComponent = Alpine.$data(element);
                console.log("Found Alpine component:", alpineComponent.step ? "valid" : "invalid");
                
                // Verify we have access to the required properties
                if (!(alpineComponent && alpineComponent.totalPrice !== undefined)) {
                    console.error("Alpine component missing totalPrice property");
                    return;
                }
            } else {
                console.error("No Alpine x-data element found");
                return;
            }
        } else {
            console.error("Alpine.js not available");
            return;
        }
    } catch (error) {
        console.error("Error accessing Alpine.js component:", error);
        return;
    }

    // Create PayPal buttons
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'pill',
            label: 'pay',
            height: 45
        },
        
        // Create order with final price
        createOrder: function(data, actions) {
            // Try to update price before using it
            try {
                if (alpineComponent && typeof alpineComponent.updatePrice === 'function') {
                    alpineComponent.updatePrice();
                }
            } catch (error) {
                // Silent fail if price update fails
            }
            
            // Get final price through different methods
            let finalPrice;
            
            try {
                // Attempt 1: Get price from visible element on the page
                const priceElements = document.querySelectorAll('[x-text="formatPrice(totalPrice)"]');
                if (priceElements && priceElements.length > 0) {
                    for (const element of priceElements) {
                        const priceMatch = element.textContent.match(/[0-9]+(\.[0-9]+)?/);
                        if (priceMatch) {
                            finalPrice = parseFloat(priceMatch[0]);
                            break;
                        }
                    }
                }
                
                // Attempt 2: Get price directly from Alpine
                if (!finalPrice || isNaN(finalPrice)) {
                    if (alpineComponent && alpineComponent.totalPrice !== undefined) {
                        finalPrice = parseFloat(alpineComponent.totalPrice);
                    }
                }
                
                // Attempt 3: Look for price in any element that displays the price
                if (!finalPrice || isNaN(finalPrice)) {
                    const allPriceElements = document.querySelectorAll('.text-indigo-700');
                    for (const element of allPriceElements) {
                        const priceMatch = element.textContent.match(/[0-9]+(\.[0-9]+)?/);
                        if (priceMatch) {
                            finalPrice = parseFloat(priceMatch[0]);
                            break;
                        }
                    }
                }
                
                // If all attempts fail, use default value for testing (1.00)
                if (!finalPrice || isNaN(finalPrice) || finalPrice <= 0) {
                    finalPrice = 1.00;
                }
            } catch (error) {
                // Use default price in case of error
                finalPrice = 1.00;
            }

            // Final verification of price validity
            if (!finalPrice || isNaN(finalPrice) || finalPrice <= 0) {
                finalPrice = 1.00; // Fallback to default price
            }
            
            // Currency used
            const currency = (alpineComponent && alpineComponent.currency) ? alpineComponent.currency : 'USD';
            
            // Create order in PayPal system
            return actions.order.create({
                purchase_units: [{
                    description: (alpineComponent && alpineComponent.selectedServiceDetails) ? 
                        alpineComponent.selectedServiceDetails.name : 'Social Media Services',
                    amount: {
                        value: finalPrice.toFixed(2),
                        currency_code: currency
                    }
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING'
                }
            });
        },
        
        // Handle successful payment
        onApprove: function(data, actions) {
            // Show loading indicator
            document.getElementById('paypal-button-container').innerHTML = 
                '<div class="text-center py-3"><i class="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>' +
                '<p class="mt-2 text-gray-600">Processing payment...</p></div>';
            
            // Execute payment
            return actions.order.capture().then(function(details) {
                // Check if payment was successful
                if (details.status !== 'COMPLETED') {
                    document.getElementById('paypal-button-container').innerHTML = 
                        '<div class="text-center py-3 text-red-500"><i class="fas fa-exclamation-circle text-2xl"></i>' +
                        '<p class="mt-2">Payment not completed. Please try again.</p></div>';
                    return;
                }
                
                // Get transaction details
                const transactionId = details.id;
                const payerName = details.payer.name ? 
                    (details.payer.name.given_name || 'Dear Customer') : 'Dear Customer';
                
                try {
                    // Create success message
                    const successMessage = `
                        <div class="text-center py-4">
                            <i class="fas fa-check-circle text-green-500 text-5xl mb-3"></i>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Payment Successful</h3>
                            <p class="text-gray-600 mb-1">Thank you ${payerName}!</p>
                            <p class="text-gray-600 mb-3">Transaction ID: ${transactionId}</p>
                            <a href="dashboard.html" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-block transition-colors">
                                View Orders
                            </a>
                        </div>
                    `;
                    
                    document.getElementById('paypal-button-container').innerHTML = successMessage;
                    
                    // Update Alpine component state if available
                    if (alpineComponent) {
                        alpineComponent.orderId = transactionId;
                        
                        // Move to confirmation step
                        if (alpineComponent.step !== undefined) {
                            alpineComponent.step = 3; // Confirmation step
                        }
                    }
                    
                    // Show notification if notification system is available
                    if (window.notificationHelper && typeof notificationHelper.success === 'function') {
                        notificationHelper.success("Payment processed successfully!", "Order Confirmed");
                    }
                } catch (error) {
                    // Show simple success message in case of error processing data
                    const simpleSuccessMessage = `
                        <div class="text-center py-4">
                            <i class="fas fa-check-circle text-green-500 text-5xl mb-3"></i>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Payment Successful</h3>
                            <p class="text-gray-600 mb-3">Transaction ID: ${transactionId}</p>
                        </div>
                    `;
                    
                    document.getElementById('paypal-button-container').innerHTML = simpleSuccessMessage;
                }
            }).catch(function(error) {
                // Show error message in case of payment failure
                document.getElementById('paypal-button-container').innerHTML = 
                    '<div class="text-center py-3 text-red-500"><i class="fas fa-times-circle text-2xl"></i>' +
                    '<p class="mt-2">An error occurred while processing your payment. Please try again.</p></div>';
            });
        },
        
        // Handle errors
        onError: function(err) {
            document.getElementById('paypal-button-container').innerHTML = 
                '<div class="text-center py-3 text-red-500"><i class="fas fa-exclamation-triangle text-2xl"></i>' +
                '<p class="mt-2">An error occurred while connecting to PayPal. Please try again.</p>' +
                '<button class="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onclick="initializePayPalButton()">Try Again</button></div>';
        },
        
        // Handle user cancellation
        onCancel: function() {
            document.getElementById('paypal-button-container').innerHTML = 
                '<div class="text-center py-3 text-gray-500"><i class="fas fa-ban text-2xl"></i>' +
                '<p class="mt-2">Payment was cancelled. You can try again whenever you\'re ready.</p>' +
                '<button class="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded" onclick="initializePayPalButton()">Try Again</button></div>';
        }
    }).render('#paypal-button-container');
}

// Initialize button on page load
document.addEventListener('DOMContentLoaded', function() {
    // Try to initialize PayPal button if container exists
    if (document.getElementById('paypal-button-container')) {
        if (window.paypal) {
            initializePayPalButton();
        } else {
            // Retry after 1 second if PayPal SDK is not available yet
            setTimeout(function() {
                if (window.paypal) {
                    initializePayPalButton();
                } else {
                    document.getElementById('paypal-button-container').innerHTML = 
                        '<div class="text-center py-3 text-red-500"><i class="fas fa-exclamation-triangle text-2xl"></i>' +
                        '<p class="mt-2">Failed to load PayPal. Please refresh the page and try again.</p></div>';
                }
            }, 1000);
        }
    }
});
