/**
 * Sidebar toggle fix for RTL and mobile layouts
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix sidebar toggle behavior
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Function to check if we're on a mobile/small screen
    const isMobileView = () => window.innerWidth < 1025;
      // Function to ensure toggle button visibility matches current screen size
    const updateToggleVisibility = () => {
        if (sidebarToggle) {
            const currentWidth = window.innerWidth;
            console.log(`Window width: ${currentWidth}px - Mobile view: ${isMobileView()}`);
            
            if (isMobileView()) {
                // On mobile, make sure toggle is visible
                sidebarToggle.style.display = 'flex';
                console.log('Setting sidebar toggle to display:flex (mobile view)');
            } else {
                // On desktop, ensure toggle is hidden
                sidebarToggle.style.display = 'none';
                console.log('Setting sidebar toggle to display:none (desktop view)');
            }
        }
    };
    
    // Initialize toggle visibility
    updateToggleVisibility();
    
    if (sidebar && sidebarToggle) {
        console.log('Sidebar and toggle elements found - applying fix');
        
        // Override existing click handler with fixed version
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Sidebar toggle clicked (from fix)');
            
            // Make sure sidebar is visible
            sidebar.style.display = 'block';
            
            // Fix for RTL layout
            const isRtl = document.dir === 'rtl' || document.documentElement.getAttribute('dir') === 'rtl';
            
            if (isRtl) {
                console.log('RTL layout detected');
                
                // For RTL, manually set transform styles
                if (!sidebar.classList.contains('open')) {
                    // Opening the sidebar
                    sidebar.style.transform = 'translateX(0)';
                    sidebar.style.webkitTransform = 'translateX(0)';
                    sidebar.classList.add('open');
                } else {
                    // Closing the sidebar
                    sidebar.style.transform = 'translateX(100%)';
                    sidebar.style.webkitTransform = 'translateX(100%)';
                    sidebar.classList.remove('open');
                }
            } else {
                // Regular LTR behavior
                if (!sidebar.classList.contains('open')) {
                    sidebar.style.transform = 'translateX(0)';
                    sidebar.style.webkitTransform = 'translateX(0)';
                    sidebar.classList.add('open');
                } else {
                    sidebar.style.transform = 'translateX(-100%)';
                    sidebar.style.webkitTransform = 'translateX(-100%)';
                    sidebar.classList.remove('open');
                }
            }
            
            // Handle overlay
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
            
            // Prevent scrolling when sidebar is open
            if (sidebar.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            
            console.log('Sidebar open state:', sidebar.classList.contains('open'));
        }, true); // Use capture to ensure our handler runs first
        
        // Add touchstart listener for better mobile experience
        sidebarToggle.addEventListener('touchstart', function(e) {
            // Add visual feedback
            this.classList.add('active');
            setTimeout(() => {
                this.classList.remove('active');
            }, 200);
        });
        
        // Make sure overlay works
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                const isRtl = document.dir === 'rtl' || document.documentElement.getAttribute('dir') === 'rtl';
                
                sidebar.classList.remove('open');
                
                // Apply correct transform based on RTL setting
                if (isRtl) {
                    sidebar.style.transform = 'translateX(100%)';
                    sidebar.style.webkitTransform = 'translateX(100%)';
                } else {
                    sidebar.style.transform = 'translateX(-100%)';
                    sidebar.style.webkitTransform = 'translateX(-100%)';
                }
                
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }    } else {
        console.warn('Sidebar or toggle element not found');
    }
      // Add window resize handler to manage sidebar state on screen size changes
    window.addEventListener('resize', function() {
        // Update toggle button visibility
        updateToggleVisibility();
        
        if (!isMobileView() && sidebar && sidebar.classList.contains('open')) {
            // Close sidebar when switching to desktop view
            sidebar.classList.remove('open');
            
            // Reset transforms
            sidebar.style.transform = '';
            sidebar.style.webkitTransform = '';
            
            // Hide overlay
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            
            // Restore scrolling
            document.body.style.overflow = '';
        }
    });
});
