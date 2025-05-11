(function () {
    const protectedPages = [
        'mainpage.html',
        'watchList.html',
        'chart.html',
        'profile.html',
        'review.html',
        'searchresults.html',
        // Add more pages here if needed
        
    ];

    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {
        let userData = sessionStorage.getItem('loggedInUser');

        // If session is empty, try restore from localStorage (Remember Me)
        if (!userData) {
            const localData = localStorage.getItem('loggedInUser');
            if (localData) {
                sessionStorage.setItem('loggedInUser', localData);
                userData = localData;
            }
        }

        if (!userData) {
            alert("Please log in to access this page.");
            window.location.href = "homepage.html";
        }
    }
})();