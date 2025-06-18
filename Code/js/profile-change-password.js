document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    if(isLoggedIn){
        user = JSON.parse(isLoggedIn);
        userId = user.userId;
    }

    const changePasswordBtn = document.querySelector('.change-password-button button');
    const modalOverlay = document.getElementById('changePasswordModal'); 

    if (!changePasswordBtn || !modalOverlay) {
        console.warn('Change password button or its modal overlay not found.');
        return;
    }

    const closeModalBtn = modalOverlay.querySelector('.change-password-modal-close-btn');
    const cancelChangeBtn = modalOverlay.querySelector('#cancelChangePasswordBtn'); 
    const saveChangesBtn = modalOverlay.querySelector('#savePasswordBtn');

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

    const passwordForm = document.getElementById('changePasswordForm');

    const successModalOverlay = document.getElementById('successMessageModal');
    const successModalOkBtn = document.getElementById('successModalOkBtn');

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

        clearError(currentPasswordInput, currentPasswordError);
        clearError(newPasswordInput, newPasswordError);
        clearError(confirmNewPasswordInput, confirmNewPasswordError);

        if (currentPasswordInput.value.trim() === '') {
            // showError(currentPasswordInput, currentPasswordError, 'Current password is required.');
            isValid = false;
        }
        if (newPasswordInput.value.trim() === '') {
            // showError(newPasswordInput, newPasswordError, 'New password is required.');
            isValid = false;
        } else if (!passwordRegex.test(newPasswordInput.value)) {
            showError(newPasswordInput, newPasswordError, 'Password must be at least 8 characters with 1 uppercase letter and 1 symbol.');
            isValid = false;
        }
        if (confirmNewPasswordInput.value.trim() === '') {
            // showError(confirmNewPasswordInput, confirmNewPasswordError, 'Confirm new password is required.');
            isValid = false;
        } else if (newPasswordInput.value !== confirmNewPasswordInput.value) {
            showError(confirmNewPasswordInput, confirmNewPasswordError, 'Passwords do not match.');
            isValid = false;
        }

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
        validatePasswords(); 
    };

    const hideModal = () => {
        modalOverlay.classList.remove('active');
        if (passwordForm) {
            passwordForm.reset(); 
            clearError(currentPasswordInput, currentPasswordError);
            clearError(newPasswordInput, newPasswordError);
            clearError(confirmNewPasswordInput, confirmNewPasswordError);
        }
        validatePasswords(); 
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
        if (event.target === modalOverlay) hideModal(); 
    });

    [currentPasswordInput, newPasswordInput, confirmNewPasswordInput].forEach(input => {
        if (input) {
            input.addEventListener('input', validatePasswords);
        }
    });

    if (saveChangesBtn) saveChangesBtn.addEventListener('click', async (event) => {
        event.preventDefault(); 
        const vp = validatePasswords();
        const op = await validateOldPassword(currentPasswordInput.value);
        console.log(`vp ${vp} op ${op}`);
        if (vp && op === true) {
            clearError(currentPasswordInput, currentPasswordError);
            fetch(`http://localhost:3000/user/changePassword?userId=${userId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({password: confirmNewPasswordInput.value})
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log('Password change submitted. Implement actual logic here.');
                    hideModal(); 
                    showSuccessModal(); 
                }
                else {
                    alert('Passwowrd is not updated');
                }
            })
            .catch(err => console.log(err));
        }
        else if (op === false) {
            showError(currentPasswordInput, currentPasswordError, 'Current password is incorrect.');
        }
    });

    if (successModalOkBtn) successModalOkBtn.addEventListener('click', hideSuccessModal);
});

const validateOldPassword = async oldPassword => {
    try {
        const response = await fetch(`http://localhost:3000/user/getPassword?userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password: oldPassword})
        })
        const data = await response.json();
        console.log('data.success in op ' + data.success);
        return data.success;
    }catch (err) {
        console.error('Error validating old password:', err);
        try {
            const errorDetails = await err.json(); 
            console.error('Error details:', errorDetails);
        } catch (parseError) {
            console.error('Error details:', parseError);
        }
        return false;
    }
};
