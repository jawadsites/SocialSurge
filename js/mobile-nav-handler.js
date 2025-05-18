/**
 * Enhanced mobile navigation handlers
 */
document.addEventListener('DOMContentLoaded', function() {
    // Setup mobile bottom navigation with animations and ripple effect
    const mobileBottomNav = document.querySelector('.mobile-bottom-nav');
    if (mobileBottomNav) {
        const mobileTabLinks = mobileBottomNav.querySelectorAll('.tab-link-mobile');
        
        // Show active tab on load
        const activeTabId = document.querySelector('.tab-content.active')?.id;
        if (activeTabId) {
            mobileTabLinks.forEach(link => {
                if (link.getAttribute('data-tab') === activeTabId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        // Add ripple effect and enhanced UX to mobile nav items
        mobileTabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                this.appendChild(ripple);
                
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all mobile links
                mobileTabLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked mobile link
                this.classList.add('active');
                
                // Trigger click on corresponding sidebar link
                document.querySelector(`.tab-link[data-tab="${tabId}"]`).click();
                
                // Scroll to top when changing tabs on mobile
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });
        
        // Update bottom nav when sidebar links are clicked
        const sidebarLinks = document.querySelectorAll('.sidebar .tab-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update mobile nav active state
                mobileTabLinks.forEach(mLink => {
                    if (mLink.getAttribute('data-tab') === tabId) {
                        mLink.classList.add('active');
                    } else {
                        mLink.classList.remove('active');
                    }
                });
            });
        });
        
        // Fix iOS Safari bottom navigation issues with safe area
        if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            document.body.classList.add('ios-device');
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (viewportMeta) {
                viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
            }
        }
    }
    
    // Enhanced table responsiveness
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // Add data-label attributes to table cells based on header text if not already present
        const headers = table.querySelectorAll('th');
        if (headers.length) {
            const headerTexts = Array.from(headers).map(header => header.textContent.trim());
            
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, i) => {
                    if (i < headerTexts.length && !cell.hasAttribute('data-label')) {
                        cell.setAttribute('data-label', headerTexts[i]);
                    }
                });
            });
        }
    });
    
    // Fix modal positioning on mobile
    const modals = document.querySelectorAll('[id$="-modal"]');
    modals.forEach(modal => {
        const modalContent = modal.querySelector('.bg-white');
        if (modalContent) {
            // Adjust modal content max-height on small screens
            const checkModalHeight = () => {
                if (window.innerWidth <= 640) {
                    modalContent.style.maxHeight = (window.innerHeight * 0.85) + 'px';
                } else {
                    modalContent.style.maxHeight = '';
                }
            };
            
            // Check on modal open
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!modal.classList.contains('hidden')) {
                            checkModalHeight();
                        }
                    }
                });
            });
            
            observer.observe(modal, { attributes: true });
            
            // Also check on window resize
            window.addEventListener('resize', () => {
                if (!modal.classList.contains('hidden')) {
                    checkModalHeight();
                }
            });
        }
    });
});
