const API_BASE_URL = 'http://localhost:3000/api';
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

        // Handle image URL
        let imageUrl = details.image;
        if (imageUrl && !imageUrl.startsWith('http')) {
            if (imageUrl.startsWith('/')) {
                imageUrl = `https://image.tmdb.org/t/p/w500${imageUrl}`;
            } else {
                imageUrl = `./assets/${imageUrl}`;
            }
        }

        if (posterEl) posterEl.src = imageUrl;
        if (titleEl) titleEl.textContent = details.title;
        if (typeEl) typeEl.textContent = details.type.charAt(0).toUpperCase() + details.type.slice(1);
        if (yearEl) yearEl.textContent = details.year;
        if (genreEl) genreEl.textContent = details.genre;
        if (descriptionEl) descriptionEl.textContent = details.description;

        // Show/hide and populate type-specific details
        const authorEl = document.querySelector('.item-author');
        const directorEl = document.querySelector('.item-director');
        const artistEl = document.querySelector('.item-artist');
        const durationEl = document.querySelector('.item-duration');

        if (authorEl) authorEl.style.display = 'none';
        if (directorEl) directorEl.style.display = 'none';
        if (artistEl) artistEl.style.display = 'none';
        if (durationEl) durationEl.style.display = 'none';

        // Map type to match schema
        const type = details.type === 'movie' ? 'movies' : 
                    details.type === 'book' ? 'books' : 
                    details.type;

        if (type === 'books' && details.author) {
            if (authorEl) {
                authorEl.style.display = 'block';
                authorEl.textContent = `Author: ${details.author}`;
            }
        } else if (type === 'movies') {
            if (details.director && directorEl) {
                directorEl.style.display = 'block';
                directorEl.textContent = `Director: ${details.director}`;
            }
            if (details.duration && durationEl) {
                durationEl.style.display = 'block';
                durationEl.textContent = `Duration: ${details.duration} minutes`;
            }
        } else if (type === 'music' && details.artist) {
            if (artistEl) {
                artistEl.style.display = 'block';
                artistEl.textContent = `Artist: ${details.artist}`;
            }
        }
    } catch (error) {
        console.error('Error populating entertainment details:', error);
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
    const entertainmentId = urlParams.get('id');
    const type = urlParams.get('type');

    console.log('Page loaded with params:', { entertainmentId, type });

    if (!entertainmentId || !type) {
        alert('Missing entertainment ID or type');
        return;
    }

    try {
        // First, fetch the entertainment details
        console.log('Fetching entertainment details...', {
            url: `${API_BASE_URL}/entertainment/${type}/${entertainmentId}`,
            type,
            id: entertainmentId
        });
        
        const entertainmentResponse = await fetch(`${API_BASE_URL}/entertainment/${type}/${entertainmentId}`);
        console.log('Response status:', entertainmentResponse.status);
        
        if (!entertainmentResponse.ok) {
            throw new Error(`HTTP error! status: ${entertainmentResponse.status}`);
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

        // Create a temporary review object with the entertainment details
        const tempReview = {
            entertainmentDetails: {
                title: entertainmentData.title || 'Unknown Title',
                type: type,
                genre: entertainmentData.genre || 'Unknown Genre',
                image: entertainmentData.image || './assets/placeholder.png',
                year: entertainmentData.year || new Date().getFullYear(),
                description: entertainmentData.description || 'No description available',
                views: entertainmentData.views || 0,
                rating: entertainmentData.rating || 0
            }
        };

        // Add type-specific fields
        if (type === 'book') {
            tempReview.entertainmentDetails.author = entertainmentData.author || 'Unknown Author';
        } else if (type === 'movie') {
            tempReview.entertainmentDetails.director = entertainmentData.director || 'Unknown Director';
            tempReview.entertainmentDetails.duration = entertainmentData.duration || 0;
        } else if (type === 'music') {
            tempReview.entertainmentDetails.artist = entertainmentData.artist || 'Unknown Artist';
        }

        console.log('Populating entertainment details:', tempReview);
        // Populate the page with entertainment details
        populateEntertainmentDetails(tempReview);

        // Then fetch reviews
        console.log('Fetching reviews...', {
            url: `${API_BASE_URL}/reviews/${entertainmentId}`
        });
        const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${entertainmentId}`);
        console.log('Reviews response status:', reviewsResponse.status);
        
        if (!reviewsResponse.ok) {
            throw new Error(`HTTP error! status: ${reviewsResponse.status}`);
        }
        
        const reviews = await reviewsResponse.json();
        console.log('Reviews:', reviews);

        if (reviews && reviews.length > 0) {
            updateReviewStats(reviews);
            displayReviews(reviews);
        } else {
            // If no reviews, show empty state
            document.querySelector('.review-summary').innerHTML = `
                <h2>No Reviews Yet</h2>
                <p>Be the first to review this ${type}!</p>
            `;
            document.querySelector('.review-list').innerHTML = `
                <p class="no-reviews">No reviews yet. Be the first to share your thoughts!</p>
            `;
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load entertainment details. Please try again later.');
    }
});