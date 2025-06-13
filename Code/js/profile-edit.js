document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    const user = JSON.parse(isLoggedIn) || undefined;

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

    const backgroundPicFileInput = document.createElement('input');
    backgroundPicFileInput.type = 'file';
    backgroundPicFileInput.accept = 'image/*';

    const checkUsernameAndToggleButtonState = () => {
        if (modalUsernameInput && saveProfileEditsBtn) {
            const isUsernameEmpty = modalUsernameInput.value.trim().length === 0;
            saveProfileEditsBtn.disabled = isUsernameEmpty;
        }
    };

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
        checkUsernameAndToggleButtonState(); // Set initial button state when modal opens
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

    // Add event listener to username input to enable/disable save button
    if (modalUsernameInput) {
        modalUsernameInput.addEventListener('input', () => {
            checkUsernameAndToggleButtonState();
        });
    }

    // Handle Save Changes
    if (saveProfileEditsBtn) {
        saveProfileEditsBtn.addEventListener('click', async () => {
            saveProfileEditsBtn.disabled = true; // Prevent multiple clicks
            saveProfileEditsBtn.textContent = 'Saving...';

            const profilePicFile = profilePicFileInput.files[0];
            const backgroundFile = backgroundPicFileInput.files[0];
            const newUsername = modalUsernameInput.value.trim();

            let profilePicUpdated = false;
            let backgroundPicUpdated = false;
            let usernameUpdated = false;

            try {
                // 1. Upload Profile Picture if changed
                if (profilePicFile && mainProfilePic) {
                    const formData = new FormData();
                    formData.append('profileImageFile', profilePicFile);

                    const response = await fetch(`http://localhost:3000/user/profile-picture?userId=${user.userId}`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) {
                        throw new Error(result.error || 'Failed to upload profile picture.');
                    }
                    mainProfilePic.src = `http://localhost:3000/image/profile_pictures/${result.fileId}`;
                    profilePicUpdated = true;
                    console.log('Profile picture updated successfully.');
                }

                // 2. Upload Background Picture if changed
                if (backgroundFile && mainHeaderImg) {
                    const formData = new FormData();
                    formData.append('backgroundImageFile', backgroundFile);

                    const response = await fetch(`http://localhost:3000/user/background-picture?userId=${user.userId}`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) {
                        throw new Error(result.error || 'Failed to upload background picture.');
                    }
                    mainHeaderImg.src = `http://localhost:3000/image/background_pictures/${result.fileId}`;
                    backgroundPicUpdated = true;
                    console.log('Background picture updated successfully.');
                }

                // 3. Update Username (locally for now, backend update would be similar)
                if (mainUsernameDisplay && newUsername !== mainUsernameDisplay.textContent) {
                    const usernameResponse = await fetch(`http://localhost:3000/user/username?userId=${user.userId}`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include', // Send cookies
                        body: JSON.stringify({ newUsername: newUsername })
                    });
                    const usernameResult = await usernameResponse.json();
                    console.log('usernameResponse '+usernameResponse.ok);
                    console.log('usernameResult '+usernameResult.success);
                    if (!usernameResponse.ok || !usernameResult.success) {
                        throw new Error(usernameResult.error || 'Failed to update username.');
                    }
                    mainUsernameDisplay.textContent = usernameResult.username; // Update with username from server response
                    user.name = usernameResult.username;
                    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                    console.log('name in session:' + JSON.stringify(user));
                    
                    
                    usernameUpdated = true;
                    console.log('Username updated successfully via backend.');
                }

                if (profilePicUpdated || backgroundPicUpdated || usernameUpdated) {
                    let messages = [];
                    if (profilePicUpdated) messages.push('Profile picture updated.');
                    if (backgroundPicUpdated) messages.push('Background picture updated.');
                    if (usernameUpdated) messages.push('Username updated.');
                    alert(messages.join('\n') || 'Profile updated successfully!');
                } else {
                    alert('No changes were made.');
                }

            } catch (error) {
                console.error('Error saving profile changes:', error);
                alert(`Error saving changes: ${error.message}`);
            } finally {
                saveProfileEditsBtn.disabled = false;
                saveProfileEditsBtn.textContent = 'Save Changes';
                hideModal();
            }
        });
    }
});