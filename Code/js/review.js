const API_BASE_URL = 'http://localhost:5000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Function to populate entertainment details
function populateEntertainmentDetails(review) {
    if (!review.entertainmentDetails) {
        console.error('No entertainment details provided');
        return;
    }

    const details = review.entertainmentDetails;
    console.log('Populating details:', details);
    
    try {
        // Set basic details
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
            } else if (!imageUrl.startsWith('http')) {
                imageUrl = `./assets/${imageUrl}`;
            }
        } else {
            imageUrl = './assets/placeholder.png';
        }

        // Update DOM elements with data
        if (posterEl) posterEl.src = imageUrl;
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
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Failed to load entertainment details. Please try refreshing the page.';
        document.querySelector('.summary-container').prepend(errorMessage);
    }
}

// Function to update review statistics
function updateReviewStats(reviews) {
    if (!reviews || reviews.length === 0) return;

    const totalReviews = reviews.length;
    const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    let totalRating = 0;

    reviews.forEach(review => {
        ratingCounts[review.rating]++;
        totalRating += review.rating;
    });

    const averageRating = (totalRating / totalReviews).toFixed(1);
    
    // Update DOM
    document.querySelector('.average-rating').textContent = averageRating;
    document.querySelector('.total-reviews').textContent = totalReviews;
    
    // Update rating breakdown
    for (let i = 1; i <= 5; i++) {
        const percentage = ((ratingCounts[i] / totalReviews) * 100).toFixed(0);
        document.querySelector(`.rating-${i}`).textContent = `${percentage}%`;
    }

    // Update star rating display
    const starRating = document.querySelector('.star-rating');
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    starRating.textContent = '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
}

// Function to display reviews
function displayReviews(reviews) {
    const reviewList = document.querySelector('.review-list');
    reviewList.innerHTML = '';

    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.id = `review-${review._id}`;
        reviewElement.dataset.user = review.user;

        reviewElement.innerHTML = `
            <div class="user-info">
                <img src="${review.userAvatar || './assets/profilepic3.png'}" alt="User Profile">
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

        if (!entertainmentData) {
            console.error('No entertainment data received');
            return;
        }

        // Create a review object with the entertainment details
        const review = {
            entertainmentDetails: entertainmentData
        };

        // Populate the entertainment details
        populateEntertainmentDetails(review);

        // Then fetch the reviews
        const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${tmdbId}`);
        const reviewsResult = await reviewsResponse.json();

        if (reviewsResult.success) {
            updateReviewStats(reviewsResult.data);
            displayReviews(reviewsResult.data);
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to load entertainment details: ${error.message}. Please try refreshing the page.`;
        document.querySelector('.summary-container').prepend(errorMessage);
    }
});