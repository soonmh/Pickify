document.addEventListener('DOMContentLoaded', () => {
    const changePasswordBtn = document.querySelector('.change-password-button button');
    const modalOverlay = document.getElementById('changePasswordModal'); // This ID still targets the overlay

    if (!changePasswordBtn || !modalOverlay) {
        console.warn('Change password button or its modal overlay not found.');
        return;
    }

    const closeModalBtn = modalOverlay.querySelector('.change-password-modal-close-btn');
    const cancelChangeBtn = modalOverlay.querySelector('#cancelChangePasswordBtn'); // Use ID for specific button
    const saveChangesBtn = modalOverlay.querySelector('#savePasswordBtn');

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    const passwordForm = document.getElementById('changePasswordForm');

    // Success Modal Elements
    const successModalOverlay = document.getElementById('successMessageModal');
    const successModalOkBtn = document.getElementById('successModalOkBtn');

    // Password complexity regex: At least 8 chars, 1 uppercase, 1 symbol
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    const showError = (inputElement, errorElement, message) => {
        if (errorElement) errorElement.textContent = message;
        if (inputElement) inputElement.classList.add('input-error');
    };

    const clearError = (inputElement, errorElement) => {
        if (errorElement) errorElement.textContent = '';
        if (inputElement) inputElement.classList.remove('input-error');
    };

    const validatePasswords = () => {
        let isValid = true;

        // Clear previous errors
        clearError(currentPasswordInput, currentPasswordError);
        clearError(newPasswordInput, newPasswordError);
        clearError(confirmNewPasswordInput, confirmNewPasswordError);

        // 1. All inputs must be filled
        if (currentPasswordInput.value.trim() === '') {
            // showError(currentPasswordInput, currentPasswordError, 'Current password is required.');
            isValid = false;
        }
        if (newPasswordInput.value.trim() === '') {
            // showError(newPasswordInput, newPasswordError, 'New password is required.');
            isValid = false;
        } else if (!passwordRegex.test(newPasswordInput.value)) {
            // 2. New password must meet complexity requirements
            showError(newPasswordInput, newPasswordError, 'Password must be at least 8 characters with 1 uppercase letter and 1 symbol.');
            isValid = false;
        }
        if (confirmNewPasswordInput.value.trim() === '') {
            // showError(confirmNewPasswordInput, confirmNewPasswordError, 'Confirm new password is required.');
            isValid = false;
        } else if (newPasswordInput.value !== confirmNewPasswordInput.value) {
            // 3. Confirm password must be the same as new password
            showError(confirmNewPasswordInput, confirmNewPasswordError, 'Passwords do not match.');
            isValid = false;
        }

        // 4. Update save button state
        if (isValid) {
            saveChangesBtn.disabled = false;
            saveChangesBtn.classList.remove('disabled');
        } else {
            saveChangesBtn.disabled = true;
            saveChangesBtn.classList.add('disabled');
        }
        return isValid;
    };

    const showModal = () => {
        modalOverlay.classList.add('active');
        validatePasswords(); // Validate on show to set initial button state
    };

    const hideModal = () => {
        modalOverlay.classList.remove('active');
        if (passwordForm) {
            passwordForm.reset(); // Clears input values
            // Clear all error messages and input styles manually after reset
            clearError(currentPasswordInput, currentPasswordError);
            clearError(newPasswordInput, newPasswordError);
            clearError(confirmNewPasswordInput, confirmNewPasswordError);
        }
        validatePasswords(); // Re-validate to set button state (should be disabled)
    };

    const showSuccessModal = () => {
        if (successModalOverlay) {
            successModalOverlay.classList.add('active');
        }
    };

    const hideSuccessModal = () => {
        if (successModalOverlay) {
            successModalOverlay.classList.remove('active');
        }
    };
    changePasswordBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showModal();
    });


    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (cancelChangeBtn) cancelChangeBtn.addEventListener('click', hideModal);

    if (modalOverlay) modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) hideModal(); // Close if overlay is clicked
    });

    // Add input event listeners for real-time validation
    [currentPasswordInput, newPasswordInput, confirmNewPasswordInput].forEach(input => {
        if (input) {
            input.addEventListener('input', validatePasswords);
        }
    });

    if (saveChangesBtn) saveChangesBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent form submission for now
        // Simulate successful password change
        if (validatePasswords()) {
            console.log('Password change submitted. Implement actual logic here.');
            // In a real app, you'd wait for a success response from the server here.
            hideModal(); // Hide the change password modal
            showSuccessModal(); // Show the success message
        }
    });

    // Event listener for the OK button on the success modal
    if (successModalOkBtn) successModalOkBtn.addEventListener('click', hideSuccessModal);
});
