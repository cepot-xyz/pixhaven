/* ===== MENU INTERACTIONS ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Menu item click handler - handle active state only for # links
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Only prevent default and manage active state for # links
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Remove active class from all items
                menuItems.forEach(el => el.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
            }
            // For proper URLs, let default navigation happen
        });
    });

    // Search input interaction
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.style.borderColor = '#00a896';
        });

        searchInput.addEventListener('blur', function() {
            this.style.borderColor = '#e0e0e0';
        });
    }

    // Button interactions
    const primaryButton = document.querySelector('.btn-primary');
    if (primaryButton) {
        primaryButton.addEventListener('click', function() {
            const changelogModal = document.getElementById('changelogModal');
            if (changelogModal) {
                changelogModal.classList.add('show');
            }
        });
    }

    // Changelog Modal interactions
    const changelogModal = document.getElementById('changelogModal');
    if (changelogModal) {
        // Close on outside click
        changelogModal.addEventListener('click', function(e) {
            if (e.target === changelogModal) {
                changelogModal.classList.remove('show');
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && changelogModal.classList.contains('show')) {
                changelogModal.classList.remove('show');
            }
        });
    }

    // Card interactions (only for # href cards)
    const cardLinks = document.querySelectorAll('.card-link');
    cardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const cardLabel = this.querySelector('.card-label')?.textContent;
                console.log('Card clicked:', cardLabel);
            }
        });
    });

    // Footer links - handle active state only for # links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                console.log('Footer link clicked:', this.textContent.trim());
            }
        });
    });
});

/* ===== UTILITY FUNCTIONS ===== */

function handleSearch(query) {
    console.log('Searching for:', query);
}

function navigateToCard(cardName) {
    console.log('Navigating to:', cardName);
}

function handleLogout() {
    console.log('Logging out...');
}