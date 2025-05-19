document.addEventListener('DOMContentLoaded', () => {
    const deleteAccountBtn = document.querySelector('.delete-button button');
    const modalOverlay = document.getElementById('deleteAccountModal');
    const closeModalBtn = modalOverlay.querySelector('.delete-account-modal-close-btn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (deleteAccountBtn && modalOverlay) {
        deleteAccountBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent any default button action
            modalOverlay.classList.add('active');
        });
    }

    const hideModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('active');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideModal);
    if (modalOverlay) modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) hideModal(); // Close if overlay is clicked
    });

    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => {
        console.log('Account deletion confirmed. Implement actual deletion logic here.');
        hideModal(); // For now, just hide the modal
        window.location.replace('landingpage.html'); // Redirect to landingpage
    });
});