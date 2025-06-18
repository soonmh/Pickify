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

    nameElement.textContent = user.name || 'Username'; 
    console.log(user.userId);

    const response = await fetch(`http://localhost:3000/user/getImage?userId=${user.userId}`);
    const result = await response.json();
    if (!result.success) {
        console.log('Failed to get image');
        return;
    }
    console.log('backgorund id: ' + result.background);
    console.log('profile id: ' + result.profile);
    

    headerImgElement.src = result.background 
        ? `http://localhost:3000/image/background_pictures/${result.background}` 
        : 'assests/foster-lake.jpg';
    profilePicElement.src = result.profile  
        ? `http://localhost:3000/image/profile_pictures/${result.profile}` 
        : 'assests/blank-profile-picture.webp';
});