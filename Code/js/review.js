const API_BASE_URL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Global variable to store entertainment ID for review submission
let currentEntertainmentId = null;

// Function to submit a review
async function submitReview(entertainmentId, user, rating, text, userAvatar) {
    try {
        console.log('Submitting review with data:', { entertainmentId, user, rating, text, userAvatar });
        
        // Get the current user's actual profile picture URL
        const actualUserAvatar = await getCurrentUserProfilePictureUrl();
        
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entertainmentId,
                user,
                rating: parseInt(rating),
                text,
                userAvatar: actualUserAvatar
            })
        });

        console.log('🚨 Response status:', response.status);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('❌ Non-JSON response received:', textResponse);
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🚨 Response result:', result);
        
        if (result.success) {
            console.log('Review submitted successfully');
            
            // Fetch updated rating statistics from database
            const ratingStats = await fetchRatingStats(entertainmentId);
            if (ratingStats) {
                // Update rating display with database statistics
                updateRatingDisplayWithDatabaseStats(ratingStats);
            } else {
                // Fallback to immediate local update if database fetch fails
                updateRatingWithNewReview(parseInt(rating));
                updateRatingBreakdownWithNewReview(parseInt(rating));
            }
            
            // Clear the form
            const reviewText = document.getElementById('review-text');
            if (reviewText) {
                reviewText.value = '';
            }
            
            // Clear the star rating
            const starInputs = document.querySelectorAll('.star-rating-bar input');
            starInputs.forEach(input => {
                input.checked = false;
            });
            
            // Update the rating value display
            const ratingValue = document.querySelector('.rating-value');
            if (ratingValue) {
                ratingValue.textContent = 'Select rating';
            }
            
            // Get current user's profile picture for immediate display
            const currentUserProfilePic = await getCurrentUserProfilePictureUrl();
            
            // Get current reviews and add the new review immediately
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${entertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            
            if (reviewsResult.success) {

                window.currentReviews = reviewsResult.data;
                

                displayReviewsWithImmediateProfilePic(reviewsResult.data, user, currentUserProfilePic);
            }
            
            alert('Review submitted successfully!');
        } else {
            // Handle specific error for already reviewed
            if (result.message && result.message.includes('already reviewed')) {
                alert('You already reviewed this entertainment');
                // Optionally hide the review form or show a message
                const reviewForm = document.querySelector('.review-form');
                if (reviewForm) {
                    const existingMessage = reviewForm.querySelector('.already-reviewed-message');
                    if (!existingMessage) {
                        const message = document.createElement('div');
                        message.className = 'already-reviewed-message';
                        message.style.cssText = 'color: #ff6b6b; text-align: center; padding: 10px; margin: 10px 0; background: #ffe6e6; border-radius: 5px;';
                        message.textContent = 'You already reviewed this entertainment';
                        reviewForm.insertBefore(message, reviewForm.firstChild);
                    }
                }
            } else {
                alert(result.message || 'Failed to submit review');
            }
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert(error.message || 'Failed to submit review. Please try again.');
    }
}

// Function to update the main entertainment rating display with user reviews
function updateEntertainmentRatingDisplay(reviews, entertainmentDetails) {
    const voteAverageEl = document.querySelector('.vote-average');
    if (!voteAverageEl) return;

    // Calculate user review statistics
    let userVoteAverage = 0;
    let userVoteCount = 0;
    
    if (reviews && reviews.length > 0) {
        let totalRating = 0;
        reviews.forEach(review => {
            const rating = parseFloat(review.rating);
            if (rating >= 1 && rating <= 5) {
                totalRating += rating;
                userVoteCount++;
            }
        });
        userVoteAverage = userVoteCount > 0 ? (totalRating / userVoteCount) : 0;
    }

    // Get original entertainment rating
    let originalVoteAverage = 0;
    let originalVoteCount = 0;
    
    if (entertainmentDetails) {
        if (entertainmentDetails.type === 'book' || entertainmentDetails.type === 'books') {
            originalVoteAverage = parseFloat(entertainmentDetails.vote_average || 0);
            originalVoteCount = Math.floor((entertainmentDetails.popularity || 0) / 100);
        } else if (entertainmentDetails.type === 'movie' || entertainmentDetails.type === 'movies') {
            originalVoteAverage = entertainmentDetails.vote_average ? (entertainmentDetails.vote_average / 2) : 0;
            originalVoteCount = Math.max(1, entertainmentDetails.vote_count ? Math.floor(entertainmentDetails.vote_count) : 
                Math.floor((entertainmentDetails.popularity || 0) / 2));
        } else if (entertainmentDetails.type === 'music') {
            originalVoteAverage = entertainmentDetails.popularity ? 
                parseFloat((entertainmentDetails.popularity / 20).toFixed(1)) : 0;
            originalVoteCount = Math.floor(entertainmentDetails.popularity) || 0;
        }
    }

    // Calculate combined rating (weighted average)
    let combinedVoteAverage = 0;
    let combinedVoteCount = 0;
    
    if (userVoteCount > 0) {
        // If we have user reviews, use them as the primary rating
        combinedVoteAverage = userVoteAverage;
        combinedVoteCount = userVoteCount;
    } else {
        // If no user reviews, use the original rating
        combinedVoteAverage = originalVoteAverage;
        combinedVoteCount = originalVoteCount;
    }

    // Format the rating
    const formattedVoteAverage = combinedVoteAverage.toFixed(1);
    const fullStars = Math.round(combinedVoteAverage);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    
    // Create rating text
    let ratingText;
    if (userVoteCount > 0) {
        ratingText = `User Rating: ${formattedVoteAverage}/5 (${combinedVoteCount} reviews)`;
    } else {
        ratingText = `Average Rating: ${formattedVoteAverage}/5 (${combinedVoteCount} rated)`;
    }
    
    // If rating is 0, show "0 rated"
    if (combinedVoteAverage === 0) {
        ratingText = '0 rated';
    }

    voteAverageEl.innerHTML = `
        <div class="tmdb-rating">
            <span class="tmdb-rating-text">${ratingText}</span>
            <div class="tmdb-stars">${stars}</div>
        </div>
    `;
}

// Function to update rating display with a new review (for immediate updates)
function updateRatingWithNewReview(newRating) {
    const voteAverageEl = document.querySelector('.vote-average');
    if (!voteAverageEl) return;

    // Get current reviews from the DOM
    const currentReviews = window.currentReviews || [];
    
    // Add the new review temporarily for calculation
    const tempReviews = [...currentReviews, { rating: newRating }];
    
    // Calculate new average
    let totalRating = 0;
    let reviewCount = 0;
    
    tempReviews.forEach(review => {
        const rating = parseFloat(review.rating);
        if (rating >= 1 && rating <= 5) {
            totalRating += rating;
            reviewCount++;
        }
    });
    
    const newAverage = reviewCount > 0 ? (totalRating / reviewCount) : 0;
    const formattedAverage = newAverage.toFixed(1);
    const fullStars = Math.round(newAverage);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    
    const ratingText = `User Rating: ${formattedAverage}/5 (${reviewCount} reviews)`;
    
    voteAverageEl.innerHTML = `
        <div class="tmdb-rating">
            <span class="tmdb-rating-text">${ratingText}</span>
            <div class="tmdb-stars">${stars}</div>
        </div>
    `;
}

// Function to populate entertainment details
function populateEntertainmentDetails(review) {
    if (!review.entertainmentDetails) {
        console.error('No entertainment details provided');
        return;
    }

    const details = review.entertainmentDetails;
    console.log('Populating details:', details);
    
    try {
        // Set basic details with null checks
        const posterEl = document.querySelector('.item-poster');
        const titleEl = document.querySelector('.item-title');
        const typeEl = document.querySelector('.item-type');
        const yearEl = document.querySelector('.item-year');
        const genreEl = document.querySelector('.item-genre');
        const descriptionEl = document.querySelector('.item-description');
        const directorEl = document.querySelector('.item-director');
        const durationEl = document.querySelector('.item-duration');
        const voteAverageEl = document.querySelector('.vote-average');

        let imageUrl = details.poster_path;
        if (imageUrl) {
            if (imageUrl.startsWith('/')) {
                imageUrl = `${TMDB_IMAGE_BASE_URL}${imageUrl}`;
            }
        }
        if (posterEl) posterEl.src = imageUrl || '';
        if (titleEl) {
            const year = details.year || (details.release_date ? details.release_date.split('-')[0] : 'Unknown Year');
            const type = (details.type || "").charAt(0).toUpperCase() + (details.type || "").slice(1);
            let genreText = 'No Genre';
            if (details.genres && Array.isArray(details.genres)) {
                genreText = details.genres.map(g => typeof g === 'object' ? g.name : g).join(', ');
            } else if (details.genre) {
                genreText = details.genre;
            }
            titleEl.innerHTML = `${details.title || 'Untitled'}<br><span class="subtitle" style="font-size: 0.7em; color: #666;">${year} | ${type} | ${genreText}</span>`;
        }
        
        if (descriptionEl) descriptionEl.textContent = details.description || details.overview || 'No description available';

        [directorEl, durationEl].forEach(el => {
            if (el) el.style.display = 'none';
        });

        if (details.type?.toLowerCase() === 'movie') {
            if (directorEl && details.director) {
                directorEl.style.display = 'block';
                directorEl.textContent = `Director: ${details.director}`;
            }
            if (durationEl && (details.duration || details.runtime)) {
                durationEl.style.display = 'block';
                durationEl.textContent = `Duration: ${details.duration || details.runtime} minutes`;
            }
        }
    } catch (error) {
        console.error('Error populating entertainment details:', error);
        const summaryContainer = document.querySelector('.summary-container');
        if (summaryContainer) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Failed to load entertainment details. Please try refreshing the page.';
            summaryContainer.prepend(errorMessage);
        }
    }
}

function updateRatingBreakdownWithNewReview(newRating) {
    console.log('🔍 updateRatingBreakdownWithNewReview called with rating:', newRating);
    

    const currentReviews = window.currentReviews || [];
    console.log('🔍 Current reviews:', currentReviews);
    

    const tempReviews = [...currentReviews, { rating: newRating }];
    console.log('🔍 Temp reviews with new rating:', tempReviews);
    

    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let totalRating = 0;

    tempReviews.forEach(review => {
        const rating = Math.round(parseFloat(review.rating));
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
            totalRating += rating;
        }
    });

    console.log('🔍 Rating counts:', ratingCounts);
    console.log('🔍 Total rating:', totalRating);

    const totalReviews = tempReviews.length;
    console.log('🔍 Total reviews:', totalReviews);

    for (let i = 1; i <= 5; i++) {
        const ratingEl = document.querySelector(`.rating-${i}`);
        if (ratingEl) {
            const percentage = totalReviews > 0 ? Math.round((ratingCounts[i] / totalReviews) * 100) : 0;
            ratingEl.textContent = `${percentage}%`;
            console.log(`🔍 Updated rating-${i} to ${percentage}%`);
        } else {
            console.log(`❌ Rating element .rating-${i} not found`);
        }
    }
}

// Function to update review statistics
function updateReviewStats(reviews) {
    console.log('Updating review stats with:', reviews);
    
    // Initialize rating counts
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let totalRating = 0;

    // Count ratings from reviews
    if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
            const rating = Math.round(parseFloat(review.rating));
            if (rating >= 1 && rating <= 5) {
                ratingCounts[rating]++;
                totalRating += rating;
            }
        });
    }

    const totalReviews = reviews ? reviews.length : 0;
    
    // Update rating breakdown - only update the elements that actually exist
    for (let i = 1; i <= 5; i++) {
        const ratingEl = document.querySelector(`.rating-${i}`);
        if (ratingEl) {
            const percentage = totalReviews > 0 ? Math.round((ratingCounts[i] / totalReviews) * 100) : 0;
            ratingEl.textContent = `${percentage}%`;
            console.log(`Updated rating-${i} to ${percentage}%`);
        }
    }
}

// Function to delete a review
async function deleteReview(reviewId, user) {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('🗑️ Review deleted successfully, fetching updated stats...');
            console.log('🗑️ Current entertainment ID:', currentEntertainmentId);
            
            // Get current reviews and update display
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            
            if (reviewsResult.success) {
                // Store current reviews globally for future updates
                window.currentReviews = reviewsResult.data;
                
                // Fetch updated rating statistics from database
                const ratingStats = await fetchRatingStats(currentEntertainmentId);
                console.log('🗑️ Rating stats after deletion:', ratingStats);
                
                if (ratingStats) {
                    // Update rating display with database statistics
                    updateRatingDisplayWithDatabaseStats(ratingStats);
                    console.log('🗑️ Rating display updated with database stats');
                } else {
                    console.log('❌ Failed to fetch rating stats after deletion, using fallback');
                    // Fallback: update using local calculation
                    updateEntertainmentRatingDisplay(reviewsResult.data, window.currentEntertainmentDetails);
                    updateReviewStats(reviewsResult.data);
                }
                
                // Get current user's profile picture for immediate display
                const currentUserProfilePic = await getCurrentUserProfilePictureUrl();
                
                // Display reviews with immediate profile picture update
                displayReviewsWithImmediateProfilePic(reviewsResult.data, user, currentUserProfilePic);
                
                // Show the review form again since user can now submit a new review
                const reviewForm = document.querySelector('.review-form');
                if (reviewForm) {
                    reviewForm.style.display = 'block';
                }
                
                // Remove any "already reviewed" messages
                const existingMessages = document.querySelectorAll('.already-reviewed-message');
                existingMessages.forEach(msg => msg.remove());
            }
            
            alert('Review deleted successfully!');
        } else {
            throw new Error(result.message || 'Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert(error.message || 'Failed to delete review. Please try again.');
    }
}

// Function to create star rating HTML
function createStarRatingHTML(currentRating = 0, isEditForm = false) {
    return `
        <div class="rating-container">
            <div class="star-rating-bar">
                ${[5,4,3,2,1].map(num => `
                    <input type="radio" id="star${num}${isEditForm ? '-edit' : ''}" name="rating" value="${num}" ${num === currentRating ? 'checked' : ''}>
                    <label for="star${num}${isEditForm ? '-edit' : ''}">★</label>
                `).join('')}
            </div>
            <div class="rating-value">${currentRating ? currentRating + ' stars' : 'Select rating'}</div>
        </div>
    `;
}

// Function to show edit form
function showEditForm(reviewId, currentRating, currentText) {
    console.log('Showing edit form for review:', { reviewId, currentRating, currentText });
    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (!reviewElement) {
        console.error('Review element not found:', reviewId);
        return;
    }
    
    const reviewContent = reviewElement.querySelector('.review-content');
    const originalContent = reviewContent.innerHTML;

    // Store the original content in a data attribute
    reviewElement.dataset.originalContent = originalContent;

    const editForm = `
        <div class="edit-form">
            <div class="rating-input">
                <label>Rating:</label>
                ${createStarRatingHTML(parseInt(currentRating), true)}
            </div>
            <textarea id="edit-text" rows="4">${currentText}</textarea>
            <div class="edit-buttons">
                <button class="save-edit-btn" onclick="saveEdit('${reviewId}')">Save</button>
                <button class="cancel-edit-btn" onclick="cancelEdit('${reviewId}')">Cancel</button>
            </div>
        </div>
    `;

    reviewContent.innerHTML = editForm;

    // Add event listeners for star rating
    const starInputs = reviewContent.querySelectorAll('.star-rating-bar input');
    const ratingValue = reviewContent.querySelector('.rating-value');
    
    starInputs.forEach(input => {
        input.addEventListener('change', () => {
            ratingValue.textContent = input.value + ' stars';
        });
    });
}

// Function to save edit
async function saveEdit(reviewId) {
    const reviewEl = document.getElementById(`review-${reviewId}`);
    if (!reviewEl) {
        console.error('Review element not found');
        return;
    }

    const rating = reviewEl.querySelector('.star-rating-bar input:checked')?.value;
    const text = reviewEl.querySelector('#edit-text')?.value;

    if (!rating) {
        alert('Please select a rating');
        return;
    }

    if (!text) {
        alert('Please write a review');
        return;
    }

    // Get current user
    let userData = sessionStorage.getItem('loggedInUser');
    if (!userData) {
        userData = localStorage.getItem('loggedInUser');
    }
    
    if (!userData) {
        alert('Please log in to edit your review');
        return;
    }

    const currentUser = JSON.parse(userData).username || JSON.parse(userData).name;

    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: currentUser,
                rating,
                text
            })
        });

        const data = await response.json();
        if (data.success) {
            // Fetch updated rating statistics from database
            const ratingStats = await fetchRatingStats(currentEntertainmentId);
            if (ratingStats) {
                // Update rating display with database statistics
                updateRatingDisplayWithDatabaseStats(ratingStats);
            }
            
            // Get current reviews and update display
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            
            if (reviewsResult.success) {
                // Store current reviews globally for future updates
                window.currentReviews = reviewsResult.data;
                
                // Get current user's profile picture for immediate display
                const currentUserProfilePic = await getCurrentUserProfilePictureUrl();
                
                // Display reviews with immediate profile picture update
                displayReviewsWithImmediateProfilePic(reviewsResult.data, currentUser, currentUserProfilePic);
            }
            
            alert('Review updated successfully!');
        } else {
            alert(data.message || 'Failed to update review');
        }
    } catch (err) {
        console.error('Error updating review:', err);
        alert('Failed to update review');
    }
}

// Function to cancel edit
function cancelEdit(reviewId) {
    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (!reviewElement) return;

    const reviewContent = reviewElement.querySelector('.review-content');
    const originalContent = reviewElement.dataset.originalContent;
    
    if (originalContent) {
        reviewContent.innerHTML = originalContent;
    }
}

// Function to show report form
function showReportForm(reviewId, commentId = null) {
    const contentType = commentId ? 'comment' : 'review';
    const defaultReason = 'Inappropriate content';
    
    // Automatically submit report with default reason
    submitReport(reviewId, commentId, defaultReason);
}

// Function to submit report
async function submitReport(reviewId, commentId = null, reason) {
    try {
        console.log('🚨 Submitting report:', { reviewId, commentId, reason });
        console.log('🚨 API_BASE_URL:', API_BASE_URL);
        
        // Get current user
        let userData = sessionStorage.getItem('loggedInUser');
        if (!userData) {
            userData = localStorage.getItem('loggedInUser');
        }
        
        if (!userData) {
            alert('Please log in to report content');
            return;
        }

        const user = JSON.parse(userData).username || JSON.parse(userData).name;
        console.log('🚨 Reporting user:', user);

        const requestBody = { 
            reviewId, 
            commentId, 
            user, 
            reason 
        };
        console.log('🚨 Request body:', requestBody);
        console.log('🚨 Full URL being called:', `${API_BASE_URL}/reports`);

        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('🚨 Response status:', response.status);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('❌ Non-JSON response received:', textResponse);
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🚨 Response result:', result);
        
        if (result.success) {
            const contentType = commentId ? 'comment' : 'review';
            alert(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} reported successfully. Thank you for helping keep our community safe.`);
        } else {
            throw new Error(result.message || 'Failed to submit report');
        }
    } catch (error) {
        console.error('❌ Error submitting report:', error);
        alert(error.message || 'Failed to submit report. Please try again.');
    }
}

// Function to delete comment
async function deleteComment(reviewId, commentId) {
    try {
        console.log('🗑️ Attempting to delete comment:', { reviewId, commentId });
        
        // Get current user
        let userData = sessionStorage.getItem('loggedInUser');
        if (!userData) {
            userData = localStorage.getItem('loggedInUser');
        }
        
        if (!userData) {
            alert('Please log in to delete your comment');
            return;
        }

        const user = JSON.parse(userData).username || JSON.parse(userData).name;
        console.log('Current user:', user);

        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user })
        });

        console.log('Delete comment response status:', response.status);
        const result = await response.json();
        console.log('Delete comment response:', result);
        
        if (result.success) {
            // Immediately remove the comment from the UI
            const commentElement = document.querySelector(`#comment-${commentId}`);
            if (commentElement) {
                commentElement.remove();
                console.log('✅ Comment element removed from UI immediately');
                alert('Comment deleted successfully!');
            } else {
                console.warn('⚠️ Comment element not found in UI, refreshing all reviews');
                // Fallback: refresh all reviews
                const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
                const reviewsResult = await reviewsResponse.json();
                
                if (reviewsResult.success) {
                    updateReviewStats(reviewsResult.data);
                    displayReviews(reviewsResult.data);
                }
                alert('Comment deleted successfully!');
            }
        } else {
            throw new Error(result.message || 'Failed to delete comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert(error.message || 'Failed to delete comment. Please try again.');
    }
}

// Function to edit comment
function showEditCommentForm(reviewId, commentId, currentComment) {
    const commentElement = document.querySelector(`#comment-${commentId}`);
    if (!commentElement) return;

    const commentContent = commentElement.querySelector('.comment-content');
    const originalContent = commentContent.innerHTML;

    // Store the original content
    commentElement.dataset.originalContent = originalContent;

    const editForm = `
        <div class="edit-comment-form">
            <textarea class="edit-comment-text">${currentComment}</textarea>
            <div class="edit-comment-buttons">
                <button onclick="saveCommentEdit('${reviewId}', '${commentId}')">Save</button>
                <button onclick="cancelCommentEdit('${commentId}')">Cancel</button>
            </div>
        </div>
    `;

    commentContent.innerHTML = editForm;
}

// Function to save edited comment
async function saveCommentEdit(reviewId, commentId) {
    try {
        const commentElement = document.querySelector(`#comment-${commentId}`);
        if (!commentElement) return;

        const newComment = commentElement.querySelector('.edit-comment-text').value.trim();
        
        if (!newComment) {
            alert('Comment cannot be empty');
            return;
        }

        // Get current user
        let userData = sessionStorage.getItem('loggedInUser');
        if (!userData) {
            userData = localStorage.getItem('loggedInUser');
        }
        
        if (!userData) {
            alert('Please log in to edit your comment');
            return;
        }

        const user = JSON.parse(userData).username || JSON.parse(userData).name;

        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, comment: newComment })
        });

        const result = await response.json();
        
        if (result.success) {
            // Refresh the reviews
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            
            if (reviewsResult.success) {
                updateReviewStats(reviewsResult.data);
                displayReviews(reviewsResult.data);
            }
            
            alert('Comment updated successfully!');
        } else {
            throw new Error(result.message || 'Failed to update comment');
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        alert(error.message || 'Failed to update comment. Please try again.');
    }
}

// Function to cancel comment edit
function cancelCommentEdit(commentId) {
    const commentElement = document.querySelector(`#comment-${commentId}`);
    if (!commentElement) return;

    const commentContent = commentElement.querySelector('.comment-content');
    const originalContent = commentElement.dataset.originalContent;
    
    if (originalContent) {
        commentContent.innerHTML = originalContent;
    }
}

async function submitComment(reviewId, user, comment, userAvatar) {
    try {
        if (!comment.trim()) {
            alert('Please write a comment');
            return;
        }

        if (!user) {
            alert('Please log in to post a comment');
            return;
        }

        console.log('Submitting comment with data:', { reviewId, user, comment, userAvatar });
        
        // Get the current user's actual profile picture URL
        const actualUserAvatar = await getCurrentUserProfilePictureUrl();
        
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user,
                comment,
                userAvatar: actualUserAvatar
            })
        });

        const result = await response.json();
        console.log('Submit comment response:', result);
        
        if (result.success) {
            console.log('Comment submitted successfully');
            
            // Clear the comment input
            const commentInput = document.querySelector(`#review-${reviewId} .comment-input`);
            if (commentInput) {
                commentInput.value = '';
            }
            
            // Refresh the reviews
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            
            if (reviewsResult.success) {
                updateReviewStats(reviewsResult.data);
                displayReviews(reviewsResult.data);
            }
        } else {
            alert(result.message || 'Failed to post comment');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Failed to post comment. Please try again.');
    }
}

// Function to check if user has already reviewed this entertainment item
function hasUserReviewed(reviews, currentUser) {
    if (!reviews || !currentUser) return false;
    return reviews.some(review => review.user === currentUser);
}

// Function to update review form visibility based on user's review status
function updateReviewFormVisibility(reviews, currentUser) {
    const reviewForm = document.querySelector('.review-form');
    if (!reviewForm) return;
    
    const hasReviewed = hasUserReviewed(reviews, currentUser);
    const existingMessage = reviewForm.querySelector('.already-reviewed-message');
    
    if (hasReviewed) {
        // Hide the review form and show message
        reviewForm.style.display = 'none';
        
        // Add a prominent paragraph message below the review list
        const reviewList = document.querySelector('.review-list');
        if (reviewList) {
            const message = document.createElement('div');
            message.className = 'already-reviewed-message';
            message.style.cssText = ' text-align: center; padding: 20px; margin: 20px 0; border-radius: 10px; font-size: 16px; line-height: 1.5;';
            message.innerHTML = `
            
                <p style="margin: 0; color: #636e72;">
                    You have previously submitted a review for this entertainment item. 
                </p>
            `;
            
            // Remove any existing message first
            const existingMessage = reviewList.parentElement.querySelector('.already-reviewed-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            // Insert the message after the review list
            reviewList.parentElement.insertBefore(message, reviewList.nextSibling);
        }
    } else {
        // Show the review form and remove any existing messages
        reviewForm.style.display = 'block';
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Remove section message if it exists
        const existingSectionMessage = document.querySelector('.already-reviewed-message');
        if (existingSectionMessage) {
            existingSectionMessage.remove();
        }
    }
}

// Function to get user ID from username
async function getUserIdFromUsername(username) {
    try {
        const response = await fetch(`http://localhost:3000/user/getUserId?username=${encodeURIComponent(username)}`);
        const result = await response.json();
        
        if (result.success && result.userId) {
            return result.userId;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user ID from username:', error);
        return null;
    }
}

// Function to get user's profile picture URL
async function getUserProfilePictureUrl(userId) {
    try {
        const response = await fetch(`http://localhost:3000/user/getImage?userId=${userId}`);
        const result = await response.json();
        
        if (result.success && result.profile) {
            return `http://localhost:3000/image/profile_pictures/${result.profile}`;
        } else {
            return './assests/blank-profile-picture.webp';
        }
    } catch (error) {
        console.error('Error fetching user profile picture:', error);
        return './assests/blank-profile-picture.webp';
    }
}

// Function to get profile picture URL from username
async function getUserProfilePictureUrlFromUsername(username) {
    try {
        const userId = await getUserIdFromUsername(username);
        if (userId) {
            return await getUserProfilePictureUrl(userId);
        } else {
            return './assests/blank-profile-picture.webp';
        }
    } catch (error) {
        console.error('Error getting profile picture from username:', error);
        return './assests/blank-profile-picture.webp';
    }
}

// Function to get current user's profile picture URL
async function getCurrentUserProfilePictureUrl() {
    try {
        // Get current user
        let userData = sessionStorage.getItem('loggedInUser');
        if (!userData) {
            userData = localStorage.getItem('loggedInUser');
        }
        
        if (!userData) {
            return './assests/blank-profile-picture.webp';
        }

        const user = JSON.parse(userData);
        const userId = user.userId || user._id || user.id;
        
        if (!userId) {
            return './assests/blank-profile-picture.webp';
        }

        return await getUserProfilePictureUrl(userId);
    } catch (error) {
        console.error('Error getting current user profile picture:', error);
        return './assests/blank-profile-picture.webp';
    }
}

function displayReviews(reviews) {
    const reviewList = document.querySelector('.review-list');
    reviewList.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        reviewList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to write a review!</p>';
        return;
    }

    // Get current user
    let userData = sessionStorage.getItem('loggedInUser');
    if (!userData) {
        userData = localStorage.getItem('loggedInUser');
    }
    const currentUser = userData ? JSON.parse(userData).username || JSON.parse(userData).name : null;

    // Update review form visibility based on whether user has already reviewed
    updateReviewFormVisibility(reviews, currentUser);

    // Display reviews with async profile picture loading
    displayReviewsWithProfilePictures(reviews, currentUser);
}

// Function to display reviews with profile pictures loaded asynchronously
async function displayReviewsWithProfilePictures(reviews, currentUser) {
    const reviewList = document.querySelector('.review-list');
    
    for (const review of reviews) {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.id = `review-${review._id}`;
        reviewElement.dataset.user = review.user;
        reviewElement.dataset.reviewId = review._id;

        // Escape special characters in the review text
        const escapedText = review.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');

        // Add edit, delete, and report buttons
        const actionButtons = `
            <div class="review-actions">
                ${currentUser === review.user ? `
                    <button class="edit-review-btn" onclick="showEditForm('${review._id}', ${review.rating}, '${escapedText}')">Edit</button>
                    <button class="delete-review-btn" onclick="deleteReview('${review._id}', '${review.user}')">Delete</button>
                ` : ''}
                ${currentUser !== review.user ? `
                    <button class="report-btn" onclick="showReportForm('${review._id}')">Report</button>
                ` : ''}
            </div>`;

        // Get the reviewer's profile picture URL - use stored URL if available, otherwise fetch dynamically
        let reviewerProfilePic = review.userAvatar || './assests/blank-profile-picture.webp';
        if (!review.userAvatar || review.userAvatar === './assests/blank-profile-picture.webp') {
            reviewerProfilePic = await getUserProfilePictureUrlFromUsername(review.user);
        }

        reviewElement.innerHTML = `
            <div class="review-content">
                <div class="user-info">
                    <img src="${reviewerProfilePic}" alt="User Profile" onerror="this.src='./assests/blank-profile-picture.webp'">
                    <strong>${review.user}</strong>
                </div>
                <div class="review-header">
                    <div class="star-rating-bar">
                        ${[1,2,3,4,5].map(num => `
                            <span class="star ${num <= review.rating ? 'filled' : ''}">★</span>
                        `).join('')}
                    </div>
                    ${actionButtons}
                </div>
                <p class="review-text">${review.text}</p>
                <div class="comment-section">
                    <div class="comments">
                        ${review.comments ? await Promise.all(review.comments.map(async comment => {
                            // Get commenter's profile picture URL - use stored URL if available, otherwise fetch dynamically
                            let commenterProfilePic = comment.userAvatar || './assests/blank-profile-picture.webp';
                            if (!comment.userAvatar || comment.userAvatar === './assests/blank-profile-picture.webp') {
                                commenterProfilePic = await getUserProfilePictureUrlFromUsername(comment.user);
                            }
                            
                            return `
                                <div class="comment" id="comment-${comment._id}">
                                    <div class="user-info">
                                        <img src="${commenterProfilePic}" alt="User Profile" onerror="this.src='./assests/blank-profile-picture.webp'">
                                        <strong>${comment.user}</strong>
                                    </div>
                                    <div class="comment-content">
                                        <p>${comment.comment}</p>
                                        <div class="comment-actions">
                                            ${currentUser === comment.user ? `
                                                <button class="edit-comment-btn" onclick="showEditCommentForm('${review._id}', '${comment._id}', '${comment.comment.replace(/'/g, "\\'")}')">Edit</button>
                                                <button class="delete-comment-btn" onclick="deleteComment('${review._id}', '${comment._id}')">Delete</button>
                                            ` : ''}
                                            ${currentUser !== comment.user ? `
                                                <button class="report-comment-btn" onclick="showReportForm('${review._id}', '${comment._id}')">Report</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        })).then(comments => comments.join('')) : ''}
                    </div>
                    <div class="comment-input-section">
                        <input type="text" class="comment-input" placeholder="Write a comment...">
                        <button class="comment-btn" onclick="submitCommentWithProfilePic('${review._id}', '${currentUser}')">Post</button>
                    </div>
                </div>
            </div>
        `;

        reviewList.appendChild(reviewElement);
    }
}

// Wrapper function to submit comment with current user's profile picture
async function submitCommentWithProfilePic(reviewId, currentUser) {
    const commentInput = document.querySelector(`#review-${reviewId} .comment-input`);
    const commentText = commentInput ? commentInput.value : '';
    await submitComment(reviewId, currentUser, commentText);
}

// Function to refresh profile pictures for current user's reviews and comments
async function refreshCurrentUserProfilePictures() {
    try {
        // Get current user
        let userData = sessionStorage.getItem('loggedInUser');
        if (!userData) {
            userData = localStorage.getItem('loggedInUser');
        }
        
        if (!userData) {
            return;
        }

        const user = JSON.parse(userData);
        const currentUser = user.username || user.name;
        const currentUserProfilePic = await getCurrentUserProfilePictureUrl();

        // Update profile pictures in all reviews by current user
        const currentUserReviews = document.querySelectorAll(`[data-user="${currentUser}"]`);
        currentUserReviews.forEach(reviewElement => {
            const profileImg = reviewElement.querySelector('.user-info img');
            if (profileImg) {
                profileImg.src = currentUserProfilePic;
            }
        });

        // Update profile pictures in all comments by current user
        const currentUserComments = document.querySelectorAll('.comment');
        currentUserComments.forEach(commentElement => {
            const commentUser = commentElement.querySelector('strong');
            if (commentUser && commentUser.textContent === currentUser) {
                const profileImg = commentElement.querySelector('.user-info img');
                if (profileImg) {
                    profileImg.src = currentUserProfilePic;
                }
            }
        });
    } catch (error) {
        console.error('Error refreshing profile pictures:', error);
    }
}

// Global function to be called when profile picture is updated
window.refreshReviewProfilePictures = refreshCurrentUserProfilePictures;

// Listen for storage changes (when user data is updated in other tabs/windows)
window.addEventListener('storage', (event) => {
    if (event.key === 'loggedInUser' || event.key === 'profilePictureUpdated') {
        // Refresh profile pictures when user data changes
        setTimeout(() => {
            refreshCurrentUserProfilePictures();
        }, 500);
    }
});

// Function to display reviews with immediate profile picture updates
async function displayReviewsWithImmediateProfilePic(reviews, currentUser, currentUserProfilePic) {
    const reviewList = document.querySelector('.review-list');
    reviewList.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        reviewList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to write a review!</p>';
        return;
    }

    // Get current user from storage
    let userData = sessionStorage.getItem('loggedInUser');
    if (!userData) {
        userData = localStorage.getItem('loggedInUser');
    }
    const currentUserFromStorage = userData ? JSON.parse(userData).username || JSON.parse(userData).name : null;

    // Update review form visibility based on whether user has already reviewed
    updateReviewFormVisibility(reviews, currentUserFromStorage);

    // Display reviews with profile pictures
    for (const review of reviews) {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.id = `review-${review._id}`;
        reviewElement.dataset.user = review.user;
        reviewElement.dataset.reviewId = review._id;

        // Escape special characters in the review text
        const escapedText = review.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');

        // Add edit, delete, and report buttons
        const actionButtons = `
            <div class="review-actions">
                ${currentUserFromStorage === review.user ? `
                    <button class="edit-review-btn" onclick="showEditForm('${review._id}', ${review.rating}, '${escapedText}')">Edit</button>
                    <button class="delete-review-btn" onclick="deleteReview('${review._id}', '${review.user}')">Delete</button>
                ` : ''}
                ${currentUserFromStorage !== review.user ? `
                    <button class="report-btn" onclick="showReportForm('${review._id}')">Report</button>
                ` : ''}
            </div>`;

        // Get the reviewer's profile picture URL - use current user's profile pic if it's their review
        let reviewerProfilePic = review.userAvatar || './assests/blank-profile-picture.webp';
        if (review.user === currentUserFromStorage && currentUserProfilePic) {
            reviewerProfilePic = currentUserProfilePic;
        } else if (!review.userAvatar || review.userAvatar === './assests/blank-profile-picture.webp') {
            reviewerProfilePic = await getUserProfilePictureUrlFromUsername(review.user);
        }

        reviewElement.innerHTML = `
            <div class="review-content">
                <div class="user-info">
                    <img src="${reviewerProfilePic}" alt="User Profile" onerror="this.src='./assests/blank-profile-picture.webp'">
                    <strong>${review.user}</strong>
                </div>
                <div class="review-header">
                    <div class="star-rating-bar">
                        ${[1,2,3,4,5].map(num => `
                            <span class="star ${num <= review.rating ? 'filled' : ''}">★</span>
                        `).join('')}
                    </div>
                    ${actionButtons}
                </div>
                <p class="review-text">${review.text}</p>
                <div class="comment-section">
                    <div class="comments">
                        ${review.comments ? await Promise.all(review.comments.map(async comment => {
                            // Get commenter's profile picture URL - use current user's profile pic if it's their comment
                            let commenterProfilePic = comment.userAvatar || './assests/blank-profile-picture.webp';
                            if (comment.user === currentUserFromStorage && currentUserProfilePic) {
                                commenterProfilePic = currentUserProfilePic;
                            } else if (!comment.userAvatar || comment.userAvatar === './assests/blank-profile-picture.webp') {
                                commenterProfilePic = await getUserProfilePictureUrlFromUsername(comment.user);
                            }
                            
                            return `
                                <div class="comment" id="comment-${comment._id}">
                                    <div class="user-info">
                                        <img src="${commenterProfilePic}" alt="User Profile" onerror="this.src='./assests/blank-profile-picture.webp'">
                                        <strong>${comment.user}</strong>
                                    </div>
                                    <div class="comment-content">
                                        <p>${comment.comment}</p>
                                        <div class="comment-actions">
                                            ${currentUserFromStorage === comment.user ? `
                                                <button class="edit-comment-btn" onclick="showEditCommentForm('${review._id}', '${comment._id}', '${comment.comment.replace(/'/g, "\\'")}')">Edit</button>
                                                <button class="delete-comment-btn" onclick="deleteComment('${review._id}', '${comment._id}')">Delete</button>
                                            ` : ''}
                                            ${currentUserFromStorage !== comment.user ? `
                                                <button class="report-comment-btn" onclick="showReportForm('${review._id}', '${comment._id}')">Report</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        })).then(comments => comments.join('')) : ''}
                    </div>
                    <div class="comment-input-section">
                        <input type="text" class="comment-input" placeholder="Write a comment...">
                        <button class="comment-btn" onclick="submitCommentWithProfilePic('${review._id}', '${currentUserFromStorage}')">Post</button>
                    </div>
                </div>
            </div>
        `;

        reviewList.appendChild(reviewElement);
    }
}

// Function to fetch rating statistics from database
async function fetchRatingStats(entertainmentId) {
    try {
        console.log('📊 Fetching rating stats from database for:', entertainmentId);
        const url = `${API_BASE_URL}/reviews/${entertainmentId}/stats`;
        console.log('📊 API URL:', url);
        
        const response = await fetch(url);
        console.log('📊 Response status:', response.status);
        
        const result = await response.json();
        console.log('📊 Response result:', result);
        
        if (result.success) {
            console.log('📊 Rating stats from database:', result.data);
            return result.data;
        } else {
            console.error('❌ Failed to fetch rating stats:', result.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching rating stats:', error);
        return null;
    }
}

// Function to update rating display with database statistics
function updateRatingDisplayWithDatabaseStats(stats) {
    if (!stats) return;
    
    const voteAverageEl = document.querySelector('.vote-average');
    if (!voteAverageEl) return;

    const { totalReviews, averageRating, ratingBreakdown } = stats;
    
    // Format the rating
    const formattedAverage = averageRating.toFixed(1);
    const fullStars = Math.round(averageRating);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    
    // Create rating text
    let ratingText;
    if (totalReviews > 0) {
        ratingText = `User Rating: ${formattedAverage}/5 (${totalReviews} reviews)`;
    } else {
        ratingText = '0 rated';
    }

    voteAverageEl.innerHTML = `
        <div class="tmdb-rating">
            <span class="tmdb-rating-text">${ratingText}</span>
            <div class="tmdb-stars">${stars}</div>
        </div>
    `;
    
    // Update rating breakdown
    for (let i = 1; i <= 5; i++) {
        const ratingEl = document.querySelector(`.rating-${i}`);
        if (ratingEl) {
            const count = ratingBreakdown[i] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            ratingEl.textContent = `${percentage}%`;
            console.log(`📊 Updated rating-${i} to ${percentage}% (${count} reviews)`);
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('Full URL:', window.location.href);
    console.log('All URL parameters:', Object.fromEntries(urlParams.entries()));
    
    const tmdbId = urlParams.get('tmdbId');
    let type = urlParams.get('type');

    console.log('Page loaded with params:', { tmdbId, type });

    if (!tmdbId || !type) {
        console.error('Missing parameters:', { tmdbId, type });
        alert('Missing entertainment ID or type');
        return;
    }

    // Map the type to match server expectations
    type = type === 'movies' ? 'movie' : 
           type === 'books' ? 'book' : 
           type;

    try {
        // First, fetch the entertainment details
        const apiUrl = `${API_BASE_URL}/entertainment/${type}/${tmdbId}`;
        console.log('Fetching entertainment details from:', apiUrl);
        
        const entertainmentResponse = await fetch(apiUrl);
        console.log('Response status:', entertainmentResponse.status);
        
        if (!entertainmentResponse.ok) {
            const errorText = await entertainmentResponse.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${entertainmentResponse.status}, message: ${errorText}`);
        }
        
        const entertainmentResult = await entertainmentResponse.json();
        console.log('Entertainment API response:', entertainmentResult);

        if (!entertainmentResult.success) {
            throw new Error(entertainmentResult.message || 'Failed to fetch entertainment details');
        }

        const entertainmentData = entertainmentResult.data;
        console.log('Entertainment data:', entertainmentData);
        console.log('Entertainment type:', entertainmentData.type);

        if (!entertainmentData) {
            console.error('No entertainment data received');
            return;
        }

        // Store the entertainment ID and details globally for review submission
        currentEntertainmentId = entertainmentData._id || entertainmentData.id;
        window.currentEntertainmentDetails = entertainmentData; // Store globally
        console.log('Set currentEntertainmentId to:', currentEntertainmentId);
        console.log('Entertainment data _id:', entertainmentData._id);
        console.log('Entertainment data id:', entertainmentData.id);

        // Create a review object with the entertainment details
        const review = {
            entertainmentDetails: {
                ...entertainmentData,
                type: type  // Ensure type is set correctly
            }
        };

        console.log('Review object with details:', review);

        // Populate the entertainment details
        populateEntertainmentDetails(review);

        // Then fetch the reviews using the entertainment's MongoDB _id
        if (currentEntertainmentId) {
            console.log('Fetching reviews for entertainment ID:', currentEntertainmentId);
            console.log('Type of currentEntertainmentId:', typeof currentEntertainmentId);
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            console.log('Reviews response:', reviewsResult);

            if (reviewsResult.success) {
                // Store current reviews globally for immediate updates
                window.currentReviews = reviewsResult.data;
                
                // Fetch and display rating statistics from database
                const ratingStats = await fetchRatingStats(currentEntertainmentId);
                if (ratingStats) {
                    updateRatingDisplayWithDatabaseStats(ratingStats);
                } else {
                    // Fallback to local calculation if database fetch fails
                    updateEntertainmentRatingDisplay(reviewsResult.data, entertainmentData);
                    updateReviewStats(reviewsResult.data);
                }
                
                displayReviews(reviewsResult.data);
                
                // Refresh profile pictures for current user after reviews are loaded
                setTimeout(() => {
                    refreshCurrentUserProfilePictures();
                }, 1000);
            } else {
                console.warn('Failed to fetch reviews:', reviewsResult.message);
                // Store empty reviews array globally
                window.currentReviews = [];
                
                // Fetch rating statistics even if no reviews
                const ratingStats = await fetchRatingStats(currentEntertainmentId);
                if (ratingStats) {
                    updateRatingDisplayWithDatabaseStats(ratingStats);
                } else {
                    // Fallback to local calculation
                    updateEntertainmentRatingDisplay([], entertainmentData);
                    updateReviewStats([]);
                }
                
                displayReviews([]);
            }
        } else {
            console.warn('No valid entertainment ID found for fetching reviews. Data:', entertainmentData);
            // Store empty reviews array globally
            window.currentReviews = [];
            // Update the main entertainment rating display with no reviews
            updateEntertainmentRatingDisplay([], entertainmentData);
            updateReviewStats([]);
            displayReviews([]);
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to load entertainment details: ${error.message}. Please try refreshing the page.`;
        document.querySelector('.summary-container').prepend(errorMessage);
    }

    // Set up periodic profile picture refresh (every 30 seconds)
    setInterval(() => {
        refreshCurrentUserProfilePictures();
    }, 30000);

    // Add event listener for submit button
    const submitButton = document.getElementById('submit-review');
    if (submitButton) {
        // Replace the rating select with star rating bar
        const ratingInput = document.getElementById('rating');
        if (ratingInput) {
            const ratingContainer = ratingInput.parentElement;
            ratingContainer.innerHTML = `
                <label>Rating:</label>
                ${createStarRatingHTML()}
            `;

            // Add event listeners for star rating
            const starInputs = ratingContainer.querySelectorAll('.star-rating-bar input');
            const ratingValue = ratingContainer.querySelector('.rating-value');
            
            starInputs.forEach(input => {
                input.addEventListener('change', () => {
                    ratingValue.textContent = input.value + ' stars';
                });
            });
        }

        submitButton.addEventListener('click', async () => {
            console.log('Submit button clicked!');
            
            const rating = document.querySelector('.star-rating-bar input:checked')?.value;
            const reviewText = document.getElementById('review-text').value.trim();
            
            console.log('Form values:', { rating, reviewText, currentEntertainmentId });
            
            // Validate input
            if (!rating) {
                alert('Please select a rating');
                return;
            }
            
            if (!reviewText) {
                alert('Please write a review');
                return;
            }
            
            if (!currentEntertainmentId) {
                alert('Entertainment ID not found. Please refresh the page and try again.');
                return;
            }
            
            // Get current user from storage
            let userData = sessionStorage.getItem('loggedInUser');
            if (!userData) {
                userData = localStorage.getItem('loggedInUser');
            }
            
            if (!userData) {
                alert('Please log in to submit a review');
                return;
            }
            
            const user = JSON.parse(userData);
            const currentUser = user.username || user.name;
            const userAvatar = user.profilePicture || './assests/profilepic3.png';
            
            console.log('Submitting review as:', currentUser);
            
            await submitReview(currentEntertainmentId, currentUser, rating, reviewText, userAvatar);
        });
    } else {
        console.error('Submit button not found!');
    }
});
