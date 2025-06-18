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
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = '5501';
    return `${protocol}//${hostname}:${port}`;
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
            const reviewId = reviewElement.id.split("-")[1];
            const commentSection = event.target.closest(".comment-section");
            const input = commentSection.querySelector(".comment-input");
            const commentList = commentSection.querySelector(".comments");
            
            const commentText = input.value.trim();
            if (commentText !== "") {
                // Create comment data
                const commentData = {
                    user: currentUser.name,
                    userAvatar: currentUser.picture || "./assests/profilepic3.png",
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
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    mode: 'cors',
                    credentials: 'include',
                    body: JSON.stringify(commentData)
                })
                .then(async response => {
                    console.log('Server response status:', response.status);
                    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                    
                    const contentType = response.headers.get('content-type');
                    console.log('Content-Type:', contentType);
                    
                    if (!contentType || !contentType.includes('application/json')) {
                        const text = await response.text();
                        console.error('Non-JSON response:', text);
                        throw new Error('Server response was not JSON');
                    }
                    
                    const data = await response.json();
                    console.log('Parsed response data:', data);
                    
                    if (!response.ok) {
                        throw new Error(data.message || `HTTP error! status: ${response.status}`);
                    }
                    return data;
                })
                .then(data => {
                    console.log('Server response data:', data);
                    if (!data.success) {
                        throw new Error(data.message || 'Failed to add comment');
                    }

                    // Create comment element
                    const comment = document.createElement("div");
                    comment.className = "comment";

                    const userInfo = document.createElement("div");
                    userInfo.className = "user-info";

                    const profilePic = document.createElement("img");
                    profilePic.src = currentUser.picture || "./assests/profilepic3.png";
                    profilePic.alt = "User Profile";
                    userInfo.appendChild(profilePic);

                    const commentContent = document.createElement("div");
                    commentContent.className = "comment-content";

                    const username = document.createElement("strong");
                    username.textContent = currentUser.name;

                    const text = document.createElement("p");
                    text.className = "comment-text";
                    text.textContent = commentText;

                    const reportBtn = document.createElement("a");
                    reportBtn.className = "report-btn edit-btn";
                    reportBtn.innerText = "Report";
                    reportBtn.href = "#";

                    commentContent.appendChild(username);
                    commentContent.appendChild(text);
                    commentContent.appendChild(reportBtn);

                    comment.appendChild(userInfo);
                    comment.appendChild(commentContent);

                    commentList.appendChild(comment);
                    input.value = "";
                })
                .catch(error => {
                    console.error('Error posting comment:', error);
                    alert('Failed to post comment: ' + error.message);
                });
            }
        }
    });
});
