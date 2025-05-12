(function () {
    const MAX_INACTIVITY_MS = 30 * 60 * 1000; // 30 mins
    const WARNING_TIME_MS = 29 * 60 * 1000;   // 29 mins

    let logoutTimer, warningTimer;

    function createWarningBanner() {
        let existingBanner = document.getElementById('inactivity-warning');
        if (existingBanner) return;

        const banner = document.createElement('div');
        banner.id = 'inactivity-warning';
        banner.textContent = "You’ll be logged out in 1 minute due to inactivity.";
        banner.style.position = 'fixed';
        banner.style.bottom = '20px';
        banner.style.right = '20px';
        banner.style.padding = '10px 20px';
        banner.style.backgroundColor = '#f56565'; // red
        banner.style.color = 'white';
        banner.style.borderRadius = '8px';
        banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        banner.style.zIndex = '9999';
        banner.style.fontSize = '14px';

        document.body.appendChild(banner);
    }

    function removeWarningBanner() {
        const banner = document.getElementById('inactivity-warning');
        if (banner) banner.remove();
    }

    function resetTimer() {
        clearTimeout(logoutTimer);
        clearTimeout(warningTimer);
        removeWarningBanner();

        warningTimer = setTimeout(() => {
            createWarningBanner();
        }, WARNING_TIME_MS);

        logoutTimer = setTimeout(() => {
            sessionStorage.removeItem('loggedInUser');
            localStorage.removeItem('loggedInUser');
            alert("You have been logged out due to inactivity.");
            window.location.href = "signin.html";
        }, MAX_INACTIVITY_MS);
    }

    function setupInactivityTimer() {
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer(); // start on page load
    }

    // Only run on protected pages if user is logged in
    const protectedPages = [
        'homepage.html',
        'watchList.html',
        'chart.html',
        'profile.html',
        'review.html',
        'searchresults.html',
        // Add more pages here if needed
    ];

    const currentPage = window.location.pathname.split("/").pop();
    const userData = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');

    if (userData && protectedPages.includes(currentPage)) {
        setupInactivityTimer();
    }
})();
