document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    const user = JSON.parse(isLoggedIn)|| undefined;

    const nameElement = document.querySelector('.profile-section .profile-info .name');
    const headerImgElement = document.querySelector('.profile-section .header-img');
    const profilePicElement = document.querySelector('.profile-section .profile-pic');

    if (!nameElement || !headerImgElement || !profilePicElement) {
        console.error('Profile elements not found on the page.');
        return;
    }

    nameElement.textContent = user.name || 'Username'; // Use textContent for safety
    console.log(user.userId);

    const response = await fetch(`http://localhost:3000/user/getImage?userId=${user.userId}`);
    const result = await response.json();
    if (!result.success) {
        console.log('Failed to get image');
        return;
    }
    console.log('backgorund id: ' + result.background);
    console.log('profile id: ' + result.profile);
    

    // Construct image URLs using the File IDs from GridFS
    headerImgElement.src = result.background 
        ? `http://localhost:3000/image/background_pictures/${result.background}` 
        : 'assests/foster-lake.jpg';
    profilePicElement.src = result.profile  
        ? `http://localhost:3000/image/profile_pictures/${result.profile}` 
        : 'assests/blank-profile-picture.webp';

    // console.log('Attempting to fetch user data for profile page...');
    // fetch('http://localhost:3000/getUser', {
    //     method: 'GET',
    //     credentials: 'include' // Crucial for sending session cookies
    // })
    // .then(response => {
    //     if (!response.ok) {
    //         // If response is not OK (e.g., 401 Not logged in), throw an error
    //         return response.json().then(errData => { // Try to parse error message from backend
    //             throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
    //         }).catch(() => { // Fallback if error body isn't JSON
    //             throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    //         });
    //     }
    //     return response.json(); // If response is OK, parse JSON
    // })
    // .then(userData => {
    //     console.log('User data received for profile:', userData);
    //     nameElement.textContent = userData.name || 'Username'; // Use textContent for safety

    //     // Construct image URLs using the File IDs from GridFS
    //     headerImgElement.src = userData.backgroundPicId 
    //         ? `http://localhost:3000/image/background_pictures/${userData.backgroundPicId}` 
    //         : 'assests/foster-lake.jpg';
    //     profilePicElement.src = userData.profilePicId 
    //         ? `http://localhost:3000/image/profile_pictures/${userData.profilePicId}` 
    //         : 'assests/blank-profile-picture.webp';
    // })
    // .catch(error => {
    //     console.error('Error fetching user data for profile:', error.message);
    //     nameElement.textContent = 'Error loading profile';
    //     // Optionally, redirect to login if it's an authentication error
    //     if (error.message.includes('401') || error.message.toLowerCase().includes('not logged in')) {
    //         // window.location.href = 'login.html'; // Uncomment to redirect
    //     }
    // });
});