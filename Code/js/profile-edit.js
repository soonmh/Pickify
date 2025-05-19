document.addEventListener('DOMContentLoaded', () => {
    const editProfilePageBtn = document.querySelector('.edit-profile-button button');
    const editOptionsModalOverlay = document.getElementById('editProfileOptionsModal');

    if (!editProfilePageBtn || !editOptionsModalOverlay) {
        console.warn('Edit Profile button or its modal overlay not found.');
        return;
    }

    
    // Modal elements
    const closeModalBtn = editOptionsModalOverlay.querySelector('.edit-profile-options-modal-close-btn');
    const editModalProfilePicBtn = document.getElementById('editModalProfilePicBtn');
    const modalProfilePicPreview = document.getElementById('modalProfilePicPreview');
    const editModalBackgroundBtn = document.getElementById('editModalBackgroundBtn');
    const modalBackgroundPreview = document.getElementById('modalBackgroundPreview');
    const modalUsernameInput = document.getElementById('modalUsernameInput');
    const saveProfileEditsBtn = document.getElementById('saveProfileEditsBtn');
    const cancelProfileEditsBtn = document.getElementById('cancelProfileEditsBtn');

    // Main page elements to update
    const mainProfilePic = document.querySelector('.profile-section .profile-pic');
    const mainHeaderImg = document.querySelector('.profile-section .header-img');
    const mainUsernameDisplay = document.querySelector('.profile-info .name');

    // Hidden file inputs
    const profilePicFileInput = document.createElement('input');
    profilePicFileInput.type = 'file';
    profilePicFileInput.accept = 'image/*';

    // Function to load profile data from local storage
    const loadProfileData = () => {
        const savedProfilePic = localStorage.getItem('profilePic');
        const savedBackgroundPic = localStorage.getItem('backgroundPic');
        const savedUsername = localStorage.getItem('username');

        if (savedProfilePic && mainProfilePic) {
            mainProfilePic.src = savedProfilePic;
            modalProfilePicPreview.src = savedProfilePic; // Also update modal preview
        }
        if (savedBackgroundPic && mainHeaderImg) {
            mainHeaderImg.src = savedBackgroundPic;
            modalBackgroundPreview.src = savedBackgroundPic; // Also update modal preview
        }
        if (savedUsername && mainUsernameDisplay) {
            mainUsernameDisplay.textContent = savedUsername;
            modalUsernameInput.value = savedUsername; // Also update modal input
        }
    };

    const backgroundPicFileInput = document.createElement('input');
    backgroundPicFileInput.type = 'file';
    backgroundPicFileInput.accept = 'image/*';

    const showModal = () => {
        // Pre-fill username from main page
        if (mainUsernameDisplay && modalUsernameInput) {
            modalUsernameInput.value = mainUsernameDisplay.textContent || '';
        }
        // Reset previews to current main images when modal opens
        if (mainProfilePic && modalProfilePicPreview) {
            modalProfilePicPreview.src = mainProfilePic.src || 'assests/blank-profile-picture.webp';
        }
        if (mainHeaderImg && modalBackgroundPreview) {
            modalBackgroundPreview.src = mainHeaderImg.src || 'assests/foster-lake.jpg';
        }
        editOptionsModalOverlay.classList.add('active');
    };

    const hideModal = () => {
        editOptionsModalOverlay.classList.remove('active');
        // Clear file input values to allow re-selection of the same file if needed
        profilePicFileInput.value = '';
        backgroundPicFileInput.value = '';
    };

    editProfilePageBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showModal();
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    if (cancelProfileEditsBtn) {
        cancelProfileEditsBtn.addEventListener('click', hideModal);
    }

    
    editOptionsModalOverlay.addEventListener('click', (event) => {
        if (event.target === editOptionsModalOverlay) { // Clicked on the overlay itself
            hideModal();
        }
    });

    // Handle Profile Picture Edit
    if (editModalProfilePicBtn) {
        editModalProfilePicBtn.addEventListener('click', () => {
            profilePicFileInput.click(); // Trigger hidden file input
        });
    }
    profilePicFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && modalProfilePicPreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                modalProfilePicPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Background Picture Edit
    if (editModalBackgroundBtn) {
        editModalBackgroundBtn.addEventListener('click', () => {
            backgroundPicFileInput.click(); // Trigger hidden file input
        });
    }
    backgroundPicFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && modalBackgroundPreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                modalBackgroundPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Save Changes
    if (saveProfileEditsBtn) {
        saveProfileEditsBtn.addEventListener('click', () => {
            // Update main profile picture
            if (mainProfilePic && modalProfilePicPreview.src !== mainProfilePic.src) {
                mainProfilePic.src = modalProfilePicPreview.src;
                localStorage.setItem('profilePic', modalProfilePicPreview.src);
            }
            // Update main background image
            if (mainHeaderImg && modalBackgroundPreview.src !== mainHeaderImg.src) {
                mainHeaderImg.src = modalBackgroundPreview.src;
                localStorage.setItem('backgroundPic', modalBackgroundPreview.src);
            }
            // Update main username
            if (mainUsernameDisplay && modalUsernameInput) {
                const newUsername = modalUsernameInput.value.trim();
                mainUsernameDisplay.textContent = newUsername;
                localStorage.setItem('username', newUsername);
            }
            console.log('Profile changes saved (simulated).');
            // In a real app, you'd send this data to a server.
            // For now, we just update the page and close the modal.
            hideModal();
        });
    }

    // Load existing data from local storage when the page loads
    // localStorage.clear();
    loadProfileData();
});