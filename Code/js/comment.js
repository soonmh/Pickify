// Get current user from storage
function getCurrentUser() {
    const userData = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser');
    if (userData) {
        return JSON.parse(userData);
    }
    return null;
}

// Get the correct API URL based on the current protocol
function getApiUrl() {
    return 'http://localhost:3000';
}

// Function to refresh reviews
async function refreshReviews(entertainmentId) {
    try {
        const response = await fetch(`${getApiUrl()}/api/reviews/${entertainmentId}`);
        const result = await response.json();
        
        if (result.success) {
            // Update review stats and display
            if (typeof updateReviewStats === 'function') {
                updateReviewStats(result.data);
            }
            if (typeof displayReviews === 'function') {
                displayReviews(result.data);
            }
        }
    } catch (error) {
        console.error('Error refreshing reviews:', error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".review-list").addEventListener("click", (event) => {
        if (event.target.classList.contains("comment-btn")) {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                alert("Please log in to post a comment");
                return;
            }

            const reviewElement = event.target.closest(".review");
            console.log('Review element:', reviewElement);
            console.log('Review element ID:', reviewElement.id);
            
            // Extract the MongoDB ID from the review element ID
            const reviewId = reviewElement.id.replace('review-', '');
            console.log('Extracted review ID:', reviewId);
            
            const commentSection = event.target.closest(".comment-section");
            const input = commentSection.querySelector(".comment-input");
            const commentList = commentSection.querySelector(".comments");
            
            const commentText = input.value.trim();
            if (commentText !== "") {
                // Create comment data
                const commentData = {
                    user: currentUser.username || currentUser.name,
                    userAvatar: currentUser.profilePicture || "./assests/profilepic3.png",
                    comment: commentText
                };

                const apiUrl = `${getApiUrl()}/api/reviews/${reviewId}/comment`;
                console.log('Sending comment data:', commentData);
                console.log('Review ID:', reviewId);
                console.log('API URL:', apiUrl);

                // Send comment to server
                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(commentData)
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Server response data:', data);
                    if (!data.success) {
                        throw new Error(data.message || 'Failed to add comment');
                    }

                    // Get the entertainment ID from the URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const entertainmentId = urlParams.get('tmdbId');
                    
                    // Refresh all reviews to show updated profile pictures
                    refreshReviews(entertainmentId);
                    
                    // Clear the input
                    input.value = "";
                })
                .catch(error => {
                    console.error('Error posting comment:', error)
                });
            }
        }
    });
});
