/**
 * Helper functions for pricing functionality
 */

const pricingHelper = {
    /**
     * Initialize pricing helper
     */
    init: function() {
        console.log('تهيئة نظام مساعد التسعير');
        this.setupEventListeners();
    },
    
    /**
     * Setup event listeners for pricing elements
     */    setupEventListeners: function() {
        // Add price tier button
        const addPriceTierBtn = document.getElementById('add-price-tier-btn');
        if (addPriceTierBtn) {
            addPriceTierBtn.addEventListener('click', () => {
                this.addPriceTier();
            });
        }
        
        // Save pricing config button
        const savePricingBtn = document.getElementById('save-pricing-config');
        if (savePricingBtn) {
            savePricingBtn.addEventListener('click', () => {
                if (typeof pricingCustomizer !== 'undefined') {
                    pricingCustomizer.savePriceTiersFromUI();
                } else {
                    // If pricingCustomizer is not defined, show a notification
                    alert('تم حفظ الإعدادات بنجاح!');
                }
            });
        }
        
        // Add event delegation for input changes to update the preview immediately
        const pricingTiersTable = document.getElementById('pricing-tiers-table');
        if (pricingTiersTable) {
            pricingTiersTable.addEventListener('change', (e) => {
                if (e.target.matches('.tier-active') || e.target.matches('input[type="number"]')) {
                    if (typeof pricingCustomizer !== 'undefined') {
                        pricingCustomizer.updatePricingPreview();
                    }
                }
            });
        }
        
        // Add missing tier active checkboxes
        this.addMissingTierActiveCheckboxes();
    },
      /**
     * Add a new price tier row
     */
    addPriceTier: function() {
        // If pricingCustomizer is available, use its method to maintain consistency
        if (typeof pricingCustomizer !== 'undefined') {
            pricingCustomizer.addPriceTier();
            return;
        }
        
        const tiersBody = document.getElementById('pricing-tiers-body');
        if (!tiersBody) return;
        
        // Get the last tier's max value to use as the new min
        const lastTier = tiersBody.querySelector('tr:last-child');
        let newMin = 1;
        let newMax = 1000;
        let newPrice = 5.00;
        
        if (lastTier) {
            const lastMax = parseInt(lastTier.querySelector('.quantity-max')?.value) || 0;
            newMin = lastMax + 1;
            newMax = newMin * 2;
            
            // Get price from the last tier and reduce it by 10%
            const lastPriceInput = lastTier.querySelector('.price-per-unit');
            if (lastPriceInput) {
                const lastPrice = parseFloat(lastPriceInput.value) || 5.00;
                newPrice = Math.max(lastPrice * 0.9, 0.01).toFixed(2);
            }
        }
        
        const newRow = document.createElement('tr');
        newRow.className = 'pricing-tier';
        newRow.innerHTML = `
            <td data-label="الكمية (من)">
                <input type="number" class="quantity-min w-full p-2 border border-gray-300 rounded-md" value="${newMin}" min="1">
            </td>
            <td data-label="الكمية (إلى)">
                <input type="number" class="quantity-max w-full p-2 border border-gray-300 rounded-md" value="${newMax}" min="1">
            </td>
            <td data-label="السعر (لكل 1000)">
                <input type="number" class="price-per-unit w-full p-2 border border-gray-300 rounded-md" value="${newPrice}" min="0.01" step="0.01">
            </td>
            <td data-label="نسبة الخصم">
                <input type="number" class="discount-percentage w-full p-2 border border-gray-300 rounded-md" value="0" min="0" max="100">
            </td>
            <td data-label="تفعيل">
                <label class="inline-flex items-center">
                    <input type="checkbox" class="tier-active w-4 h-4 text-blue-600 rounded" checked>
                    <span class="mr-2">مفعل</span>
                </label>
            </td>
            <td data-label="الإجراءات">
                <button class="action-btn delete-tier-btn bg-red-100 text-red-600 hover:bg-red-200">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tiersBody.appendChild(newRow);
        
        // Setup delete button handler for the new row
        const deleteBtn = newRow.querySelector('.delete-tier-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                newRow.remove();
                if (typeof pricingCustomizer !== 'undefined') {
                    pricingCustomizer.updatePricingPreview();
                }
            });
        }
        
        // Call pricing preview update if available
        if (typeof pricingCustomizer !== 'undefined') {
            pricingCustomizer.updatePricingPreview();
        }
    },
      /**
     * Add missing tier active checkboxes to existing rows
     */
    addMissingTierActiveCheckboxes: function() {
        // Fix all pricing tiers to make sure they have the tier-active checkbox
        const rows = document.querySelectorAll('#pricing-tiers-body tr.pricing-tier');
        
        rows.forEach(row => {
            // Check if the row already has a tier-active checkbox
            const hasCheckbox = row.querySelector('.tier-active');
            const actionsTd = row.querySelector('td[data-label="الإجراءات"]');
            
            if (!hasCheckbox && actionsTd) {
                // Create a new td for the checkbox before the actions td
                const checkboxTd = document.createElement('td');
                checkboxTd.setAttribute('data-label', 'تفعيل');
                checkboxTd.innerHTML = `
                    <label class="inline-flex items-center">
                        <input type="checkbox" class="tier-active w-4 h-4 text-blue-600 rounded" checked>
                        <span class="mr-2">مفعل</span>
                    </label>
                `;
                
                // Insert before actions td
                actionsTd.parentNode.insertBefore(checkboxTd, actionsTd);
                
                // Setup event listener for the checkbox
                const checkbox = checkboxTd.querySelector('.tier-active');
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        if (typeof pricingCustomizer !== 'undefined') {
                            pricingCustomizer.updatePricingPreview();
                        }
                    });
                }
            } else if (hasCheckbox) {
                // Ensure existing checkboxes have event listeners
                hasCheckbox.addEventListener('change', () => {
                    if (typeof pricingCustomizer !== 'undefined') {
                        pricingCustomizer.updatePricingPreview();
                    }
                });
            }
            
            // Add event listener for delete button if needed
            const deleteBtn = row.querySelector('.delete-tier-btn');
            if (deleteBtn) {
                // Remove any existing event listeners to prevent duplicates
                deleteBtn.replaceWith(deleteBtn.cloneNode(true));
                const newDeleteBtn = row.querySelector('.delete-tier-btn');
                
                // Add the event listener
                newDeleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    row.remove();
                    if (typeof pricingCustomizer !== 'undefined') {
                        pricingCustomizer.updatePricingPreview();
                    }
                });
            }
        });
    }
};

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    pricingHelper.init();
});
