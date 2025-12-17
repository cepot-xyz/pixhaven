// Logout functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get all logout buttons
    const logoutButtons = document.querySelectorAll('.footer-link.logout');
    const logoutModal = document.getElementById('logoutModal');
    const logoutConfirmBtn = document.querySelector('.logout-confirm-btn');
    const logoutCancelBtn = document.querySelector('.logout-cancel-btn');

    // Add click event to all logout buttons
    if (logoutButtons.length > 0) {
        logoutButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if (logoutModal) {
                    logoutModal.classList.add('show');
                }
            });
        });
    }

    // Logout confirm button
    if (logoutConfirmBtn) {
        logoutConfirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // User can replace this href with actual logout route
            // window.location.href = '#'; // Replace with actual logout URL
            console.log('Logout confirmed');
        });
    }

    // Logout cancel button
    if (logoutCancelBtn) {
        logoutCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (logoutModal) {
                logoutModal.classList.remove('show');
            }
        });
    }

    // Close modal when clicking outside
    if (logoutModal) {
        logoutModal.addEventListener('click', function(e) {
            if (e.target === logoutModal) {
                logoutModal.classList.remove('show');
            }
        });
    }
});
