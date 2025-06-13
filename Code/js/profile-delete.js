document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    const user = JSON.parse(isLoggedIn) || undefined;

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

    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', async () => {
        confirmDeleteBtn.disable = true;
        confirmDeleteBtn.textContent = 'Deleting...';

        try {
            const res = await fetch(`http://localhost:3000/user/getImage?userId=${user.userId}`)
            const picture = await res.json();
            if (!picture) {
                console.log('Failed to get image');
                return;
            }

            const response = await fetch(`http://localhost:3000/user/delete?userId=${user.userId}&profileId=${picture.profile}&backgroundId=${picture.background}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Account deleted successfully.');
                // Clear any local/session storage related to the user
                localStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('loggedInUser');
                window.location.replace('landingpage.html'); // Redirect to landing page
            }
            else {
                alert(`Failed to delete account: ${result.error || 'Unknown error'}`);
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.textContent = 'Confirm Delete';
            }
        }
        catch (error) {
            console.error('Error sending delete request:', error);
            alert('An error occurred while trying to delete your account. Please try again.');
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Confirm Delete';
        }
        finally {
            hideModal();
        }
        
    });
});