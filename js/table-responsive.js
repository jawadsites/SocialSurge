/**
 * Table responsiveness enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for horizontal overflow in tables and add appropriate classes
    const checkTablesOverflow = () => {
        const tableDivs = document.querySelectorAll('.responsive-table');
        
        tableDivs.forEach(tableDiv => {
            // Check if content is wider than container
            const hasOverflow = tableDiv.scrollWidth > tableDiv.clientWidth;
            
            // Add/remove class based on overflow status
            if (hasOverflow) {
                tableDiv.classList.add('has-overflow');
            } else {
                tableDiv.classList.remove('has-overflow');
            }
        });
    };
    
    // Initial check
    setTimeout(checkTablesOverflow, 500);
    
    // Check on resize
    window.addEventListener('resize', checkTablesOverflow);
    
    // Also check when tab content becomes active as dimensions might have changed
    const tabLinks = document.querySelectorAll('.tab-link, .tab-link-mobile');
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(checkTablesOverflow, 300);
        });
    });
    
    // Add data-label attributes to table cells that don't have them
    const tables = document.querySelectorAll('table.dashboard-table');
    tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => 
            th.textContent.trim()
        );
        
        if (headers.length > 0) {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                
                cells.forEach((cell, index) => {
                    // Only add data-label if it doesn't exist
                    if (!cell.hasAttribute('data-label') && headers[index]) {
                        cell.setAttribute('data-label', headers[index]);
                    }
                });
            });
        }
    });
    
    // Make tables with many columns horizontally scrollable on all devices
    const wideTableContainers = document.querySelectorAll('.table-container');
    wideTableContainers.forEach(container => {
        const table = container.querySelector('table');
        if (table && table.querySelectorAll('th').length > 4) {
            if (!container.classList.contains('responsive-table')) {
                container.classList.add('responsive-table');
            }
        }
    });
});
