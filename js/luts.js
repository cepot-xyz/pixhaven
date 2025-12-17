// ===== LUTS LIBRARY =====
document.addEventListener('DOMContentLoaded', function() {
    const lutsPreview = document.getElementById('lutsPreview');
    const lutsFilterBtns = document.querySelectorAll('.luts-filter-btn');

    // LUTS Filter click handler
    lutsFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterName = this.dataset.filter;
            
            // Update preview image
            lutsPreview.src = `assets/images/Azalea-LUTS/${filterName}.png`;
            lutsPreview.alt = this.querySelector('.luts-filter-name').textContent;
            
            // Update active state
            lutsFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Log for debugging
            console.log('LUTS filter selected:', filterName);
        });
    });

    // Import LUTS button
    const btnImport = document.querySelector('.btn-import');
    if (btnImport) {
        btnImport.addEventListener('click', function() {
            console.log('Impor LUTS clicked');
            showNotification('Import LUTS - Coming soon');
        });
    }

    // Export button
    const btnExport = document.querySelector('.btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', function() {
            // Get currently active filter button
            const activeFilter = document.querySelector('.luts-filter-btn.active');
            
            if (activeFilter && activeFilter.classList.contains('premium')) {
                // Show premium modal
                const premiumModal = document.getElementById('premiumModal');
                premiumModal.style.display = 'flex';
            } else {
                // Show free export notification
                showNotificationModal('Foto di ekspor');
            }
        });
    }

    // Premium modal close button
    const premiumModalClose = document.getElementById('premiumModalClose');
    if (premiumModalClose) {
        premiumModalClose.addEventListener('click', function() {
            const premiumModal = document.getElementById('premiumModal');
            premiumModal.style.display = 'none';
        });
    }

    // Premium modal overlay click to close
    const premiumModal = document.getElementById('premiumModal');
    if (premiumModal) {
        premiumModal.addEventListener('click', function(e) {
            if (e.target === premiumModal || e.target.classList.contains('premium-modal-overlay')) {
                premiumModal.style.display = 'none';
            }
        });
    }

    // Notification function using modal
    function showNotificationModal(message) {
        const notificationModal = document.getElementById('notificationModal');
        const notificationMessage = document.getElementById('notificationMessage');
        
        if (notificationModal && notificationMessage) {
            notificationMessage.textContent = message;
            notificationModal.classList.add('show');
            
            setTimeout(() => {
                notificationModal.classList.remove('show');
            }, 3000);
        }
    }
});
