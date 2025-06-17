const API_BASE_URL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Global variable to store entertainment ID for review submission
let currentEntertainmentId = null;

// Function to submit a review
async function submitReview(entertainmentId, user, rating, text) {
    try {
        console.log('Submitting review with data:', { entertainmentId, user, rating, text });
        
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entertainmentId,
                user,
                rating: parseInt(rating),
                text
            })
        });

        const result = await response.json();
        console.log('Submit review response:', result);
        
        if (result.success) {
            console.log('Review submitted successfully');
            // Clear the form
            document.getElementById('rating').value = 0;
            document.getElementById('review-text').value = '';
            
            // Refresh the reviews
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${entertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            
            if (reviewsResult.success) {
                updateReviewStats(reviewsResult.data);
                displayReviews(reviewsResult.data);
            }
            
            alert('Review submitted successfully!');
        } else {
            throw new Error(result.message || 'Failed to submit review');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
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

        // Handle image URL
        let imageUrl = details.poster_path;
        if (imageUrl) {
            if (imageUrl.startsWith('/')) {
                imageUrl = `${TMDB_IMAGE_BASE_URL}${imageUrl}`;
            }
        }

        // Update DOM elements with data (with null checks)
        if (posterEl) posterEl.src = imageUrl || '';
        if (titleEl) titleEl.textContent = details.title || 'Untitled';
        if (typeEl) typeEl.textContent = (details.type || 'unknown').charAt(0).toUpperCase() + (details.type || 'unknown').slice(1);
        if (yearEl) yearEl.textContent = details.year || (details.release_date ? details.release_date.split('-')[0] : 'Unknown Year');
        if (genreEl) genreEl.textContent = details.genre || details.genres || 'No Genre';
        if (descriptionEl) descriptionEl.textContent = details.description || details.overview || 'No description available';

        // Show/hide and populate type-specific details
        [directorEl, durationEl].forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Show and populate movie-specific details
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

// Function to update review statistics
function updateReviewStats(reviews) {
    console.log('Updating review stats with:', reviews);
    
    // Get DOM elements with error checking
    const averageRatingEl = document.querySelector('.average-rating');
    const totalReviewsEl = document.querySelector('.total-reviews');
    const starRatingEl = document.querySelector('.star-rating');
    
    // Check if required elements exist
    if (!averageRatingEl || !totalReviewsEl || !starRatingEl) {
        console.error('Required DOM elements not found:', {
            averageRating: !!averageRatingEl,
            totalReviews: !!totalReviewsEl,
            starRating: !!starRatingEl
        });
        return;
    }
    
    if (!reviews || reviews.length === 0) {
        // Set default values when no reviews
        averageRatingEl.textContent = '0.0';
        totalReviewsEl.textContent = '0';
        
        // Reset rating breakdown
        for (let i = 1; i <= 5; i++) {
            const ratingEl = document.querySelector(`.rating-${i}`);
            if (ratingEl) {
                ratingEl.textContent = '0%';
            } else {
                console.warn(`Rating element .rating-${i} not found`);
            }
        }
        
        // Reset star rating display
        starRatingEl.textContent = '☆☆☆☆☆';
        return;
    }

    const totalReviews = reviews.length;
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let totalRating = 0;

    reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating]++;
            totalRating += review.rating;
        }
    });

    const averageRating = (totalRating / totalReviews).toFixed(1);
    
    // Update DOM
    averageRatingEl.textContent = averageRating;
    totalReviewsEl.textContent = totalReviews;
    
    // Update rating breakdown
    for (let i = 1; i <= 5; i++) {
        const ratingEl = document.querySelector(`.rating-${i}`);
        if (ratingEl) {
            const percentage = ((ratingCounts[i] / totalReviews) * 100).toFixed(0);
            ratingEl.textContent = `${percentage}%`;
        } else {
            console.warn(`Rating element .rating-${i} not found`);
        }
    }

    // Update star rating display
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    starRatingEl.textContent = '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
}

// Function to display reviews
function displayReviews(reviews) {
    const reviewList = document.querySelector('.review-list');
    reviewList.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        reviewList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to write a review!</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.id = `review-${review._id}`;
        reviewElement.dataset.user = review.user;

        reviewElement.innerHTML = `
            <div class="user-info">
                <img src="${review.userAvatar || './assests/profilepic3.png'}" alt="User Profile">
            </div>
            <div class="review-content">
                <strong>${review.user}</strong>
                <span class="star-rating" data-rating="${review.rating}">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                <p class="review-text">${review.text}</p>
                <div class="comment-section">
                    <div class="comments">
                        ${review.comments ? review.comments.map(comment => `
                            <div class="comment">
                                <img src="${comment.userAvatar || './assests/profilepic3.png'}" alt="User Profile">
                                <div class="comment-content">
                                    <strong>${comment.user}</strong>
                                    <p>${comment.comment}</p>
                                </div>
                            </div>
                        `).join('') : ''}
                    </div>
                    <input type="text" class="comment-input" placeholder="Write a comment...">
                    <button class="comment-btn">Post</button>
                </div>
            </div>
        `;

        reviewList.appendChild(reviewElement);
    });
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
        console.log('Entertainment ID:', entertainmentData._id);

        if (!entertainmentData) {
            console.error('No entertainment data received');
            return;
        }

        // Store the entertainment ID globally for review submission
        currentEntertainmentId = entertainmentData._id || entertainmentData.id;
        console.log('Set currentEntertainmentId to:', currentEntertainmentId);

        // Create a review object with the entertainment details
        const review = {
            entertainmentDetails: entertainmentData
        };

        // Populate the entertainment details
        populateEntertainmentDetails(review);

        // Then fetch the reviews using the MongoDB _id
        if (currentEntertainmentId) {
            console.log('Fetching reviews for ID:', currentEntertainmentId);
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${currentEntertainmentId}`);
            const reviewsResult = await reviewsResponse.json();
            console.log('Reviews response:', reviewsResult);

            if (reviewsResult.success) {
                updateReviewStats(reviewsResult.data);
                displayReviews(reviewsResult.data);
            } else {
                console.warn('Failed to fetch reviews:', reviewsResult.message);
                updateReviewStats([]);
                displayReviews([]);
            }
        } else {
            console.warn('No valid ID found for fetching reviews. Data:', entertainmentData);
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

    // Add event listener for submit button - MOVED INSIDE DOMContentLoaded
    const submitButton = document.getElementById('submit-review');
    if (submitButton) {
        submitButton.addEventListener('click', async () => {
            console.log('Submit button clicked!');
            
            const rating = document.getElementById('rating').value;
            const reviewText = document.getElementById('review-text').value.trim();
            
            console.log('Form values:', { rating, reviewText, currentEntertainmentId });
            
            // Validate input
            if (!rating || rating < 1 || rating > 5) {
                alert('Please select a rating between 1 and 5');
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
            
            // Get current user (you'll need to implement user authentication)
            // For now, using localStorage or a placeholder
            let currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                // If no user is logged in, prompt for a name or use Anonymous
                currentUser = prompt('Please enter your name:') || 'Anonymous User';
            }
            
            console.log('Submitting review as:', currentUser);
            
            await submitReview(currentEntertainmentId, currentUser, rating, reviewText);
        });
    } else {
        console.error('Submit button not found!');
    }
});