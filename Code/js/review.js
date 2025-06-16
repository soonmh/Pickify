<<<<<<< HEAD
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
        const directorEl = document.querySelector('.item-director');
        const durationEl = document.querySelector('.item-duration');

        // Handle image URL
        let imageUrl = details.poster_path;
        if (imageUrl) {
            if (imageUrl.startsWith('/')) {
                imageUrl = `${TMDB_IMAGE_BASE_URL}${imageUrl}`;
            }
            // No else if needed - use the URL directly from DB
        }

        // Update DOM elements with data
        if (posterEl) posterEl.src = imageUrl || '';  // Use empty string as fallback instead of placeholder
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
        console.log('Entertainment ID:', entertainmentData._id);  // Log the MongoDB _id

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

        // Then fetch the reviews using the MongoDB _id
        const reviewId = entertainmentData._id || entertainmentData.id;
        if (entertainmentData && reviewId) {
            console.log('Fetching reviews for ID:', reviewId);
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${reviewId}`);
            const reviewsResult = await reviewsResponse.json();

            if (reviewsResult.success) {
                updateReviewStats(reviewsResult.data);
                displayReviews(reviewsResult.data);
            }
        } else {
            console.warn('No valid ID found for fetching reviews. Data:', entertainmentData);
            // Initialize with empty reviews
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
});

async function fetchEntertainmentDetails(type, id) {
    try {
        const apiUrl = `${API_BASE_URL}/entertainment/${type}/${id}`;
        console.log('🎬 Frontend request:', {
            url: apiUrl,
            type,
            id,
            timestamp: new Date().toISOString()
        });
        
        const response = await fetch(apiUrl);
        console.log('📡 Response received:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', {
                status: response.status,
                message: errorText,
                url: apiUrl
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', {
            success: data.success,
            type: data.data?.type,
            id: data.data?.tmdbId || data.data?.id,
            title: data.data?.title
        });
        
        if (data.success && data.data) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch entertainment details');
        }
    } catch (error) {
        console.error('❌ Error in fetchEntertainmentDetails:', {
            error: error.message,
            type,
            id,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

/**
 * Format movie data from MongoDB to match frontend expectations
 */
function formatMovieData(movie) {
    const baseImageUrl = movie.poster_path ? 
        `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 
        './assests/default-poster.png';
        
    return {
        id: movie.id,
        title: movie.title || 'Unknown Title',
        type: "movie",
        genre: movie.genres && movie.genres.length > 0 ? 
            movie.genres[0].name.toLowerCase() : 'unknown',
        rating: Math.round(movie.vote_average /2 * 10) /10|| 0,
        views: formatViews(movie.popularity ? Math.round(movie.popularity * 1000) : Math.floor(Math.random() * 1000000)),
        image: baseImageUrl,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
        genres: movie.genres || [],
        tmdbId: movie.tmdbId ,
        popularity: movie.popularity || 0,
        vote_count: movie.vote_count || 0
    };
}

/**
 * Format music data from the API response
 */
function formatMusicData(music) {
    const convertedRating = music.popularity ? 
        parseFloat((music.popularity / 20).toFixed(1)) : 0;
    return {
        type: 'music',
        tmdbId: music.id,
        title: music.title || music.name || 'Unknown Title',
        image: music.poster_url || './assets/default-music.png',
        rating: convertedRating || 'N/A',
        views: `${music.popularity}  `,
        year: music.release ? new Date(music.release).getFullYear() : 'Unknown Year'
    };
}

/**
 * Format book data from the API response
 */
function formatBookData(book) {
    return {
        type: 'book',
        tmdbId: book._id,
        title: book.title,
        image: book.image,
        rating: book.rating || 'N/A',
        views: formatViews(book.popularity ? Math.round(book.popularity * 1000) : Math.floor(Math.random() * 1000000)),
        year: book.year || 'Unknown Year'
    };
}

// Update the displayEntertainmentDetails function to use the new formatting
function displayEntertainmentDetails(data) {
    console.log('Displaying entertainment details:', data);
    
    let formattedData;
    switch(data.type.toLowerCase()) {
        case 'movie':
            formattedData = formatMovieData(data);
            break;
        case 'music':
            formattedData = formatMusicData(data);
            break;
        case 'book':
            formattedData = formatBookData(data);
            break;
        default:
            console.error('Unknown entertainment type:', data.type);
            return;
    }

    // Debug item data
    console.log('Debug item data:', {
        genre: formattedData.genre,
        genres: formattedData.genres,
        id: formattedData.id,
        image: formattedData.image,
        popularity: formattedData.popularity,
        rating: formattedData.rating,
        title: formattedData.title,
        tmdbId: formattedData.tmdbId,
        type: formattedData.type,
        views: formattedData.views,
        vote_count: formattedData.vote_count,
        year: formattedData.year
    });

    // Update the page title
    document.title = `${formattedData.title} - Review | Pickify`;

    // Update the header
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) {
        headerTitle.textContent = formattedData.title;
    }

    // Update the poster
    const posterImg = document.querySelector('.poster img');
    if (posterImg) {
        posterImg.src = formattedData.image;
        posterImg.alt = formattedData.title;
    }

    // Update the details
    const detailsContainer = document.querySelector('.details');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <h2>${formattedData.title}</h2>
            <div class="meta-info">
                <span class="year">${formattedData.year}</span>
                <span class="genre">${formattedData.genre}</span>
                ${formattedData.type === 'movie' ? `<span class="director">Director: ${formattedData.director}</span>` : ''}
                ${formattedData.type === 'music' ? `<span class="artist">Artist: ${formattedData.artist}</span>` : ''}
                ${formattedData.type === 'book' ? `<span class="author">Author: ${formattedData.author}</span>` : ''}
            </div>
            <div class="description">
                <p>${formattedData.description}</p>
            </div>
            <div class="stats">
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${formattedData.rating}</span>
                </div>
                <div class="views">
                    <i class="fas fa-eye"></i>
                    <span>${formattedData.views}</span>
                </div>
            </div>
        `;
    }

    // Update the review form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.dataset.tmdbId = formattedData.tmdbId;
        reviewForm.dataset.type = formattedData.type;
    }
}
=======
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
        let imageUrl = details.image;
        if (imageUrl) {
            if (imageUrl.startsWith('/')) {
                imageUrl = `${TMDB_IMAGE_BASE_URL}${imageUrl}`;
            }
        }

        // Update DOM elements with data
        if (posterEl) posterEl.src = imageUrl || '';  // Use empty string as fallback instead of placeholder
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
        console.log('Entertainment ID:', entertainmentData._id);  // Log the MongoDB _id

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

        // Then fetch the reviews using the MongoDB _id
        const reviewId = entertainmentData._id || entertainmentData.id;
        if (entertainmentData && reviewId) {
            console.log('Fetching reviews for ID:', reviewId);
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/${reviewId}`);
            const reviewsResult = await reviewsResponse.json();

            if (reviewsResult.success) {
                updateReviewStats(reviewsResult.data);
                displayReviews(reviewsResult.data);
            }
        } else {
            console.warn('No valid ID found for fetching reviews. Data:', entertainmentData);
            // Initialize with empty reviews
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
});
>>>>>>> f087eac58523e6053d31e57878cd7c39189ee849
