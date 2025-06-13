// Configuration for API
const API_BASE_URL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// State to maintain search history
let searchHistory = [];

document.addEventListener('DOMContentLoaded', function () {
    loadSearchHistoryFromStorage();
    initializeCollectionDropdowns();
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchHistoryList = document.getElementById('search-history-list');
    const searchResultsContainer = document.getElementById('search-results-container'); 
    const recommendationsContainer = document.getElementById('recommendations-container');
    const top10MoviesContainer = document.getElementById('top10-movies');
    const top10MusicContainer = document.getElementById('top10-music');
    const top10BooksContainer = document.getElementById('top10-books');

    initializePage();

    // Add event listeners for search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    /**
     * Initialize page with data from MongoDB
     */
    async function initializePage() {
        console.log('🚀 Initializing homepage with MongoDB data...');
        
        try {
            // Check if backend is available
            await checkBackendHealth();
            
            // Show loading states
            showLoadingState();
            
            // Load data from MongoDB
            await Promise.all([
                loadTopMoviesByPopularity(),
                loadTopMusicByPopularity(),
                loadTopBookByPopularity(),
                renderRecommendations() // Use dummy data for recommendations
            ]);
            
            setupCustomScrollbars();
            renderSearchHistory();
            
            console.log('✅ Homepage initialized successfully with MongoDB data');
        } catch (error) {
            console.error('❌ Error loading MongoDB data:', error);
            console.log('🔄 Falling back to dummy data...');
            loadFallbackData();
        }
    }

    

    /**
     * Check if backend is running
     */
    async function checkBackendHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (!response.ok) {
                throw new Error(`Backend health check failed: ${response.status}`);
            }
            const health = await response.json();
            console.log('💚 Backend is healthy:', health);
            return health;
        } catch (error) {
            console.error('💔 Backend health check failed:', error);
            throw error;
        }
    }

    /**
     * Show loading state for all sections
     */
    function showLoadingState() {
        const loadingHTML = `
            <div class="loading-placeholder" style="display: flex; align-items: center; justify-content: center; height: 200px; background: #f8f9fa; border-radius: 8px;">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #007bff; margin-bottom: 10px;"></i>
                    <p style="margin: 0; color: #666;">Loading movies from database...</p>
                </div>
            </div>
        `;
        
        top10MoviesContainer.innerHTML = loadingHTML;
        top10MusicContainer.innerHTML = loadingHTML;
        top10BooksContainer.innerHTML = loadingHTML;
    }

    /**
     * Load top movies by popularity from MongoDB
     */
    async function loadTopMoviesByPopularity() {
        try {
            console.log('📊 Fetching top movies by popularity...');
            
            const response = await fetch(`${API_BASE_URL}/movies/top?limit=10`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch movies');
            }
            
            console.log(`✅ Loaded ${result.count} popular movies from database`);
            
            const formattedMovies = result.data.map((movie, index) => formatMovieData(movie, index));
            renderScrollingList(top10MoviesContainer, formattedMovies, 'movie');
            
        } catch (error) {
            console.error('❌ Error loading popular movies:', error);
            throw error;
        }
    }

    /**
     * Load top music
     */
    async function loadTopMusicByPopularity() {
        try {
            console.log('🎬 Fetching top music...');
            
            const response = await fetch(`${API_BASE_URL}/music/top?limit=10`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch music');
            }
            
            console.log(`✅ Loaded ${result.count} music from database`);
            
            const formattedMusics = result.data.map(formatMusicData);
            renderScrollingList(top10MusicContainer, formattedMusics, 'music');
            
        } catch (error) {
            console.error('❌ Error loading musics:', error);
            throw error;
        }
    }

    /**
     * Load top drama movies (for books section)
     */
    async function loadTopBookByPopularity() {
        try {
            console.log('🎭 Fetching top drama movies...');
            
            const response = await fetch(`${API_BASE_URL}/books/top?limit=10`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch books');
            }
            
            console.log(`✅ Loaded ${result.count} books from database`);
            
            const formattedBooks = result.data.map(formatBookData);
            renderScrollingList(top10BooksContainer, formattedBooks, 'books');
            
        } catch (error) {
            console.error('❌ Error loading books:', error);
            throw error;
        }
    }

    /**
     * Format movie data from MongoDB to match frontend expectations
     */
    function formatMovieData(movie, index = 0) {
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
        id: music.id,
        title: music.name,
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
        id: book._id,
        title: book.title,
        image: book.image,
        rating: book.rating || 'N/A',
        views: formatViews(book.popularity ? Math.round(book.popularity * 1000) : Math.floor(Math.random() * 1000000)),
        year: book.year || 'Unknown Year'
    };
}

    /**
     * Load fallback data if MongoDB is unavailable
     */
    function loadFallbackData() {
        console.log('🔄 Loading fallback dummy data...');
        
        // Your existing dummy data arrays
        const top10Movies = [
            { id: 3, title: "The Dark Knight", image: "./assests/TheDarkKnight.png", rating: 4.9, views: "1.5M", type: "movie" },
            { id: 4, title: "Interstellar", image: "./assests/Interstellar.png", rating: 4.7, views: "1.1M", type: "movie" },
            { id: 2, title: "Inception", image: "./assests/Inception.png", rating: 4.7, views: "48.7K", type: "movie" },
            { id: 5, title: "Fight Club", image: "./assests/FightClub.png", rating: 4.8, views: "800K", type: "movie" },
            { id: 6, title: "Pulp Fiction", image: "./assests/PulpFiction.png", rating: 4.6, views: "900K", type: "movie" },
            { id: 14, title: "The Matrix", image: "./assests/TheMatrix.png", rating: 4.8, views: "1.0M", type: "movie" },
            { id: 15, title: "Forrest Gump", image: "./assests/ForrestGump.png", rating: 4.9, views: "1.3M", type: "movie" },
            { id: 16, title: "The Shawshank Redemption", image: "./assests/ShawshankRedemption.png", rating: 4.9, views: "1.6M", type: "movie" },
            { id: 17, title: "The Godfather", image: "./assests/TheGodfather.png", rating: 4.9, views: "1.7M", type: "movie" },
            { id: 18, title: "Avengers: Endgame", image: "./assests/movieposter.png", rating: 4.7, views: "2.1M", type: "movie" },
        ];

        const top10Music = [
            { id: 7, title: "Blinding Lights", image: "./assests/BlindingLights.png", rating: 4.9, views: "2.0M", type: "music" },
            { id: 8, title: "Shape of You", image: "./assests/ShapeOfYou.png", rating: 4.8, views: "1.8M", type: "music" },
            { id: 9, title: "Rolling in the Deep", image: "./assests/RollingInTheDeep.png", rating: 4.7, views: "1.5M", type: "music" },
            { id: 10, title: "Bohemian Rhapsody", image: "./assests/BohemianRhapsody.png", rating: 4.9, views: "1.9M", type: "music" },
            { id: 19, title: "Someone Like You", image: "./assests/SomeoneLikeYou.png", rating: 4.8, views: "1.6M", type: "music" },
            { id: 20, title: "Let It Be", image: "./assests/LetItBe.png", rating: 4.9, views: "1.7M", type: "music" },
            { id: 21, title: "Bad Guy", image: "./assests/badguy.png", rating: 4.6, views: "1.4M", type: "music" },
            { id: 22, title: "Hotel California", image: "./assests/HotelCalifornia.png", rating: 4.9, views: "1.9M", type: "music" },
            { id: 23, title: "Hey Jude", image: "./assests/HeyJude.png", rating: 4.9, views: "2.0M", type: "music" },
            { id: 24, title: "Stairway to Heaven", image: "./assests/StairwayToHeaven.png", rating: 4.8, views: "1.8M", type: "music" },
        ];

        const top10Books = [
            { id: 1, title: "The Midnight Library", image: "./assests/MidnightLibrary.png", rating: 4.8, views: "12.4K", type: "book" },
            { id: 11, title: "Atomic Habits", image: "./assests/AtomicHabits.png", rating: 4.8, views: "600K", type: "book" },
            { id: 12, title: "The Alchemist", image: "./assests/TheAlchemist.png", rating: 4.9, views: "700K", type: "book" },
            { id: 13, title: "1984", image: "./assests/1984.png", rating: 4.8, views: "650K", type: "book" },
            { id: 25, title: "To Kill a Mockingbird", image: "./assests/ToKillAMockingbird.png", rating: 4.9, views: "800K", type: "book" },
            { id: 26, title: "The Great Gatsby", image: "./assests/TheGreatGatsby.png", rating: 4.6, views: "550K", type: "book" },
            { id: 27, title: "The Catcher in the Rye", image: "./assests/TheCatcherInTheRye.png", rating: 4.7, views: "500K", type: "book" },
            { id: 28, title: "Sapiens", image: "./assests/Sapiens.png", rating: 4.8, views: "700K", type: "book" },
            { id: 29, title: "Harry Potter and the Philosopher's Stone", image: "./assests/HarryPotter1.png", rating: 4.9, views: "1.0M", type: "book" },
            { id: 30, title: "Pride and Prejudice", image: "./assests/PrideAndPrejudice .png", rating: 4.8, views: "750K", type: "book" },
        ];

        // Render fallback data
        renderScrollingList(top10MoviesContainer, top10Movies, 'movie');
        renderScrollingList(top10MusicContainer, top10Music, 'music');
        renderScrollingList(top10BooksContainer, top10Books, 'book');
        setupCustomScrollbars();
        renderSearchHistory();
        renderRecommendations([]);
        
        console.log('✅ Fallback data loaded successfully');
    }



    /**
     * Find all horizontal lists and add custom scrollbars
     */
    function setupCustomScrollbars() {
        // Get all horizontal list containers
        const containers = document.querySelectorAll('.horizontal-list-container');
        
        containers.forEach(container => {
            const list = container.querySelector('.horizontal-list');
            if (!list) return;
            
            // Create a wrapper for the list and scrollbar
            const wrapper = document.createElement('div');
            wrapper.className = 'horizontal-list-wrapper';
            
            // Insert wrapper before container
            container.parentNode.insertBefore(wrapper, container);
            
            // Move container into wrapper
            wrapper.appendChild(container);
            
            // Create custom scrollbar
            const scrollbar = document.createElement('div');
            scrollbar.className = 'custom-scrollbar';
            
            const scrollThumb = document.createElement('div');
            scrollThumb.className = 'scrollbar-thumb';
            
            scrollbar.appendChild(scrollThumb);
            wrapper.appendChild(scrollbar);
            
            // Initialize scrollbar functionality
            initScrollbar(list, scrollbar, scrollThumb);
        });
    }
    
    /**
     * Initialize scrollbar functionality for a list
     * @param {HTMLElement} list - The horizontal list element
     * @param {HTMLElement} scrollbar - The scrollbar track element
     * @param {HTMLElement} thumb - The scrollbar thumb element
     */
    function initScrollbar(list, scrollbar, thumb) {
        // Update thumb size and position based on list content
        function updateThumb() {
            // Calculate ratio of visible width to total width
            const ratio = list.clientWidth / list.scrollWidth;
            
            // Set thumb width based on this ratio
            const thumbWidth = Math.max(ratio * 100, 10); // Minimum 10% width
            thumb.style.width = thumbWidth + '%';
            
            // Calculate position percentage
            const scrollLeftMax = list.scrollWidth - list.clientWidth;
            const scrollRatio = scrollLeftMax > 0 ? list.scrollLeft / scrollLeftMax : 0;
            const thumbPosition = scrollRatio * (100 - thumbWidth);
            
            // Set thumb position using left property for simplicity
            thumb.style.left = thumbPosition + '%';
            
            // Hide scrollbar if content fits without scrolling
            scrollbar.style.display = ratio >= 1 ? 'none' : 'block';
        }
        
        // Initialize thumb size and position
        updateThumb();
        
        // Update when list scrolls
        list.addEventListener('scroll', updateThumb);
        
        // Update on window resize
        window.addEventListener('resize', updateThumb);
        
        // Enable direct list scrolling with mouse
        let isListDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        
        // Mouse down on list - start dragging
        list.addEventListener('mousedown', function(e) {
            isListDragging = true;
            startX = e.pageX - list.offsetLeft;
            scrollLeft = list.scrollLeft;
            list.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        // Mouse leave/up on document - stop dragging
        document.addEventListener('mouseup', function() {
            isListDragging = false;
            list.style.cursor = 'grab';
        });
        
        document.addEventListener('mouseleave', function() {
            isListDragging = false;
            list.style.cursor = 'grab';
        });
        
        // Mouse move - scroll the list if dragging
        document.addEventListener('mousemove', function(e) {
            if(!isListDragging) return;
            e.preventDefault();
            const x = e.pageX - list.offsetLeft;
            const walk = (x - startX) * -1; // Reverse direction
            list.scrollLeft = scrollLeft + walk;
        });
        
        // Enable thumb dragging
        let isThumbDragging = false;
        let thumbStartX = 0;
        let thumbScrollLeft = 0;
        
        thumb.addEventListener('mousedown', function(e) {
            isThumbDragging = true;
            thumbStartX = e.pageX;
            thumbScrollLeft = list.scrollLeft;
            document.body.style.userSelect = 'none'; // Prevent text selection during drag
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if(!isThumbDragging) return;
            
            const deltaX = e.pageX - thumbStartX;
            const scrollRatio = (list.scrollWidth - list.clientWidth) / (scrollbar.clientWidth - thumb.clientWidth);
            list.scrollLeft = thumbScrollLeft + (deltaX * scrollRatio);
        });
        
        document.addEventListener('mouseup', function() {
            isThumbDragging = false;
            document.body.style.userSelect = '';
        });
        
        // Click on track to jump
        scrollbar.addEventListener('click', function(e) {
            // Ignore if clicked on thumb
            if(e.target === thumb) return;
            
            const clickPosition = e.offsetX;
            const thumbCenter = thumb.clientWidth / 2;
            const availableTrack = scrollbar.clientWidth - thumbCenter * 2;
            const targetRatio = Math.max(0, Math.min(1, (clickPosition - thumbCenter) / availableTrack));
            
            // Calculate target scroll position
            const scrollTarget = targetRatio * (list.scrollWidth - list.clientWidth);
            
            // Smooth scroll to target
            list.scrollTo({
                left: scrollTarget,
                behavior: 'smooth'
            });
        });
        
        // Add keyboard controls when list is focused
        list.tabIndex = 0; // Make list focusable
        list.addEventListener('keydown', function(e) {
            // Left/right arrows to scroll
            if(e.key === 'ArrowLeft') {
                e.preventDefault();
                list.scrollBy({left: -100, behavior: 'smooth'});
            }
            if(e.key === 'ArrowRight') {
                e.preventDefault();
                list.scrollBy({left: 100, behavior: 'smooth'});
            }
        });
        
        // Add wheel support for horizontal scrolling
        list.addEventListener('wheel', function(e) {
            if(e.deltaY !== 0) {
                e.preventDefault();
                list.scrollBy({
                    left: e.deltaY,
                    behavior: 'smooth'
                });
            }
        });
    }

    /**
     * Render a horizontally scrolling list with numbered badges
     * @param {HTMLElement} container - Container element 
     * @param {Array} data - Data array
     * @param {string} mediaType - Type of media (movie, music, book)
     */
    function renderScrollingList(container, data, mediaType) {
        // Clear the container first
    container.innerHTML = '';
    
    // Render each item in the data array
    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        // Create badge class based on position (special for top 3)
        const positionNumber = index + 1;
        const badgeClass = positionNumber <= 3 ? `no${positionNumber}` : '';
        
        // Add the badge HTML with position number and media type
        const badgeHTML = `<div class="numbered-badge ${badgeClass} ${mediaType}">No ${positionNumber}</div>`;
        
        card.innerHTML = `
            ${badgeHTML}
            <img src="${item.image}" alt="${item.title}">
            <div class="result-body">
                <h5 class="result-title">${item.title}</h5>
                <div class="result-meta">
                    <div class="result-rating"><i class="fas fa-star"></i> ${item.rating}</div>
                    <div class="result-views"><i class="fas fa-eye"></i> ${item.views}</div>
                </div>
            </div>
        `;
        
        // Add collection dropdown
        addCollectionDropdown(card, item);
        
        // Add click handler for the card (excluding dropdown area)
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking on dropdown
            if (!e.target.closest('.collection-dropdown')) {
                console.log(`Clicked on ${mediaType} item: ${item.title}`);
            }
        });
        
        container.appendChild(card);
    });
    }

    /**
     * Handle search button click or enter key press
     */
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();

        // If query is empty, clear the search results
        if (!query) {
            searchResultsContainer.innerHTML = `
                <p class="no-results-message">Please enter a search query.</p>
            `;
            return;
        }
        // Add query to search history
        addToSearchHistory(query);
        // Redirect to searchresult.js with the query as a URL parameter
        window.location.href = `searchresult.html?query=${encodeURIComponent(query)}`;
    }

    /**
     * Add a search query to the search history
     * @param {string} query - The search query to add
     */
    function addToSearchHistory(query) {
        // Prevent duplicate entries
        if (!searchHistory.includes(query)) {
            searchHistory.unshift(query); // Add to the beginning of the history
            if (searchHistory.length > 5) {
                searchHistory.pop(); // Keep only the last 5 entries
            }
        }
        saveSearchHistoryToStorage();
        renderSearchHistory();

        
    }

    /**
     * Save search history to localStorage
     */
    function saveSearchHistoryToStorage() {
        localStorage.setItem('pickifySearchHistory', JSON.stringify(searchHistory));
    }
    /**
     * Load search history from localStorage
     */
    function loadSearchHistoryFromStorage() {
        const savedHistory = localStorage.getItem('pickifySearchHistory');
        if (savedHistory) {
            searchHistory = JSON.parse(savedHistory);
        }
    }

    /**
     * Render the search history
     */
    function renderSearchHistory() {
        // Clear the current search history
        searchHistoryList.innerHTML = '';

        // If no search history, show a placeholder message
        if (searchHistory.length === 0) {
            searchHistoryList.innerHTML = '<li class="no-history">No recent searches.</li>';
            return;
        }

        // Render each search history item
        searchHistory.forEach(query => {
            const li = document.createElement('li');
            li.className = 'search-history-item';
            li.textContent = query;

            // Allow user to re-trigger a search by clicking on a history item
            li.addEventListener('click', () => {
                searchInput.value = query;
                handleSearch();
            });

            searchHistoryList.appendChild(li);
        });
    }


    /**
     * Render recommendations in the recommendations container
     */
    async function renderRecommendations() {
    recommendationsContainer.innerHTML = '';
    
    try {
        // Get user ID from localStorage/sessionStorage
        userId = getCurrentUserId();
        
        if (!userId) {
            recommendationsContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-user fa-3x" style="color: #e0e0e0; margin-bottom: 1rem;"></i>
                        <h5 style="color: #666;">Login Required</h5>
                        <p class="mb-0" style="color: #888;">Please log in to see personalized recommendations.</p>
                        <a href="login.html" class="btn btn-primary mt-2">Login</a>
                    </div>
                </div>
            `;
            return;
        }

        // Show loading state
        recommendationsContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #007bff; margin-bottom: 10px;"></i>
                    <p style="margin: 0; color: #666;">Loading personalized recommendations...</p>
                </div>
            </div>
        `;

        console.log(`🎯 Fetching recommendations for user: ${userId}`);
        console.log(`Making API call to: ${API_BASE_URL}/recommendation/${userId}?limit=4`);

        // Fetch personalized recommendations
        const response = await fetch(`${API_BASE_URL}/recommendation/${userId}?limit=4`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📥 Received recommendations:', result);
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch recommendations');
        }

        const recommendations = result.data || [];

        // Clear loading state
        recommendationsContainer.innerHTML = '';

        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="col-12">
            <div style="display: flex; justify-content: center; align-items: center; min-height: 200px; text-align: center;">
                <div style="padding: 2rem;">
                    <i class="fas fa-heart fa-3x" style="color:rgb(223, 41, 41); margin-bottom: 1rem;"></i>
                    <h5 style="color: #666;">No recommendations yet</h5>
                    <p class="mb-0" style="color: #888;">Add items to your collections to get personalized recommendations!</p>
                </div>
            </div>
        </div>
            `;
            return;
        }

        console.log(`✅ Loaded ${recommendations.length} recommendations`);
        console.log(`🎭 Recommendation type: ${result.type}`);
        

        // Render recommendations
        recommendations.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col';
            col.setAttribute('data-id', item.id || item.tmdbId);

            // Format the item data consistently
            const formattedItem = formatRecommendationData(item);

            // Add recommendation reason based on type
            let reason = '';
            if (result.type === 'personalized' && result.userPreferences?.preferredGenres?.length > 0) {
                const movieGenres = item.genres?.map(g => g.name) || [];
                const matchingGenre = movieGenres.find(genre => 
                    result.userPreferences.preferredGenres.includes(genre)
                );
                if (matchingGenre) {
                    reason = `Because you like ${matchingGenre}`;
                } else {
                    reason = 'Highly rated';
                }
            } else if (result.type === 'general') {
                reason = 'Popular choice';
            }

            col.innerHTML = `
                <div class="result-card recommendation-card" onclick="handleRecommendationClick('${formattedItem.id}', '${formattedItem.type}')">
                    <div class="recommendation-badge">${result.type === 'personalized' ? 'For You' : 'Popular'}</div>
                    <img src="${formattedItem.image}" 
                         class="result-img" 
                         alt="${formattedItem.title}"
                         onerror="this.src='./assests/default-poster.png'">
                    <div class="result-body">
                        <span class="result-type ${formattedItem.type}">${formattedItem.type.charAt(0).toUpperCase() + formattedItem.type.slice(1)}</span>
                        <h5 class="result-title">${formattedItem.title}</h5>
                        <div class="result-meta">
                            <div class="result-rating">
                                <i class="fas fa-star"></i> ${formattedItem.rating}
                            </div>
                            <div class="result-views">
                                <i class="fas fa-eye"></i> ${formattedItem.views}
                            </div>
                        </div>
                        ${reason ? `<div class="recommendation-reason">${reason}</div>` : ''}
                    </div>
                </div>
            `;

            recommendationsContainer.appendChild(col);
        });

    } catch (error) {
        console.error('❌ Error loading recommendations:', error);
        recommendationsContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle fa-2x" style="color: #ffc107; margin-bottom: 1rem;"></i>
                    <p class="mb-0" style="color: #666;">Failed to load recommendations. Please try again later.</p>
                </div>
            </div>
        `;
    }
    }

/**
 * Format recommendation data for consistent display
 */
function formatRecommendationData(item) {
    let rating;
    
    // Handle different rating formats based on item type
    if (item.type === 'music') {
        // For music, use popularity/20 with 1 decimal place
        rating = item.popularity ? parseFloat((item.popularity / 20).toFixed(1)) : 0;
    } else if (item.type === 'movie') {
        // For movies, use vote_average/2 with 1 decimal place
        rating = item.vote_average ? parseFloat((item.vote_average / 2).toFixed(1)) : 0;
    } else if (item.type === 'book') {
        // For books, use rating as is
        rating = formatRating(item.rating || 0);
    } else {
        // Fallback for any other types
        rating = formatRating(item.rating || item.vote_average || 0);
    }
    
    
    return {
        id: item.id || item.tmdbId || 'unknown-id',
        title: item.title || item.name || 'Unknown Title',
        type: item.type || (item.media_type === 'movie' ? 'movie' : item.media_type) || 'unknown',
        image: item.image || item.poster_url || (item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : './assests/1984.png'),
        rating: rating,
        views: formatViews(item.views || (item.popularity ? Math.round(item.popularity * 1000) : 0)),
        reason: item.recommendationReason || null
    };
}

    /**
     * Format ratings for display
     * @param {number} rating - The rating to format
     * @returns {string} The formatted rating
     */
    function formatRating(rating) {
        if (!rating || rating === 0) return '0.0';
    return parseFloat(rating).toFixed(1);
    }

    /**
     * Format views for display (e.g., 12000 -> 12k)
     * @param {number|string} views - The views to format
     * @returns {string} The formatted views
     */
    function formatViews(views) {
        if (typeof views === 'string') {
            return views;
        }
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        }
        if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }
});
/**
 * Get current user ID from localStorage (moved to global scope)
 */
function getCurrentUserId() {
    try {
        // Check sessionStorage first (current session)
        let userData = sessionStorage.getItem('loggedInUser');
        
        // If not in session, check localStorage (persistent login)
        if (!userData) {
            userData = localStorage.getItem('loggedInUser');
        }
        
        if (userData) {
            const user = JSON.parse(userData);
            console.log('👤 Found user data:', user);
            
            // Your backend returns userId, but check for other possible ID fields
            const userId = user.userId || user._id || user.id;
            
            if (userId) {
                console.log(`✅ Found user ID: ${userId}`);
                return userId;
            } else {
                console.log('⚠️ User data found but no userId field:', user);
            }
        }
        
        console.log('❌ No user data found in storage');
        return null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
}

/**
 * Collection Dropdown Functionality
 * Add this to your existing script.js file
 */

// Global variable to store user collections
let userCollections = [];

/**
 * Initialize collection dropdown functionality
 */
function initializeCollectionDropdowns() {
    // Add CSS for dropdown styling
    addDropdownStyles();
    
    // Load user collections if user is logged in
    loadUserCollections();
}

/**
 * Add CSS styles for the collection dropdown
 */
function addDropdownStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .collection-dropdown {
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 1000;
        }
        
        .collection-dropdown-btn {
            background: rgba(0, 0, 0, 0.7);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .result-card:hover .collection-dropdown-btn,
        .recommendation-card:hover .collection-dropdown-btn {
            opacity: 1;
        }
        
        .collection-dropdown-btn:hover {
            background: rgba(0, 0, 0, 0.9);
        }
        
        .collection-dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 180px;
            max-height: 200px;
            overflow-y: auto;
            display: none;
            z-index: 1001;
        }
        
        .collection-dropdown-menu.show {
            display: block;
        }
        
        .collection-dropdown-item {
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s ease;
        }
        
        .collection-dropdown-item:hover {
            background-color: #f8f9fa;
        }
        
        .collection-dropdown-item:last-child {
            border-bottom: none;
        }
        
        .collection-dropdown-item.loading {
            color: #666;
            pointer-events: none;
        }
        
        .collection-dropdown-item.no-collections {
            color: #666;
            text-align: center;
            font-style: italic;
        }
        
        .result-card {
            position: relative;
        }
        
        .recommendation-card {
            position: relative;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Load user's collections from the backend
 */
async function loadUserCollections() {
    const userId = getCurrentUserId();
    if (!userId) {
        userCollections = [];
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/collectionNameList?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const collectionNames = await response.json();
        userCollections = collectionNames.map(name => ({
            name: name,
            _id: name.toLowerCase().replace(/\s+/g, '')
        }));
        console.log('✅ Loaded user collections:', userCollections);
        console.log('📋 Collection names:', collectionNames);

    } catch (error) {
       console.error('❌ Error loading user collections:', error);
        
        // Fallback to default collections
        userCollections = [
            { name: 'Favourite', _id: 'favourite' },
            { name: 'Watch Later', _id: 'watchlater' }
            
        ];
        console.log('🔄 Using fallback collections');
    }
}

/**
 * Add collection dropdown to a result card
 * @param {HTMLElement} card - The result card element
 * @param {Object} item - The item data
 */
function addCollectionDropdown(card, item) {
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'collection-dropdown';
    
    // Create dropdown button
    const dropdownBtn = document.createElement('button');
    dropdownBtn.className = 'collection-dropdown-btn';
    dropdownBtn.innerHTML = '<i class="fas fa-plus"></i>';
    dropdownBtn.title = 'Add to collection';
    
    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'collection-dropdown-menu';
    
    // Add click event to button
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdownMenu(dropdownMenu, item);
    });
    
    // Assemble dropdown
    dropdown.appendChild(dropdownBtn);
    dropdown.appendChild(dropdownMenu);
    
    // Add to card
    card.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
}

/**
 * Toggle dropdown menu visibility and populate with collections
 * @param {HTMLElement} menu - The dropdown menu element
 * @param {Object} item - The item data
 */
function toggleDropdownMenu(menu, item) {
    const isVisible = menu.classList.contains('show');
    
    // Hide all other dropdown menus
    document.querySelectorAll('.collection-dropdown-menu').forEach(m => {
        m.classList.remove('show');
    });
    
    if (!isVisible) {
        populateDropdownMenu(menu, item);
        menu.classList.add('show');
    }
}

/**
 * Populate dropdown menu with user collections
 * @param {HTMLElement} menu - The dropdown menu element
 * @param {Object} item - The item data
 */
function populateDropdownMenu(menu, item) {
    const userId = getCurrentUserId();
    
    if (!userId) {
        menu.innerHTML = `
            <div class="collection-dropdown-item no-collections">
                <i class="fas fa-user"></i> Please log in to add to collections
            </div>
        `;
        return;
    }
    
    if (userCollections.length === 0) {
        menu.innerHTML = `
            <div class="collection-dropdown-item loading">
                <i class="fas fa-spinner fa-spin"></i> Loading collections...
            </div>
        `;
        
        // Reload collections and repopulate
        loadUserCollections().then(() => {
            populateDropdownMenu(menu, item);
        });
        return;
    }
    
    // Clear menu
    menu.innerHTML = '';
    
    // Add each collection as a dropdown item
    userCollections.forEach(collection => {
        const menuItem = document.createElement('div');
        menuItem.className = 'collection-dropdown-item';
        menuItem.innerHTML = `
            <i class="fas fa-folder"></i> ${collection.name}
        `;
        
        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCollection(userId, collection.name, item);
            menu.classList.remove('show');
        });
        
        menu.appendChild(menuItem);
    });
}

/**
 * Add item to a specific collection
 * @param {string} userId - User ID
 * @param {string} collectionName - Collection name
 * @param {Object} item - Item data
 */
async function addToCollection(userId, collectionName, item) {
    try {
        // Show loading feedback
        showToast(`Adding "${item.title}" to ${collectionName}...`, 'info');
        
        // Determine item type and ID
        const itemType = item.type;
        let itemId;
        if (itemType === 'movie') {
            itemId = item.tmdbId;
        } else if (itemType === 'music' || itemType === 'book') {
            itemId = item.id;
        } 

        console.log('🔍 Debug item data:', item);
        console.log('🔍 Item type:', itemType);
        console.log('🔍 Item _id:', itemId);
        
        if (!itemId) {
            throw new Error('Item ID not found');
        }
        
        // Call your existing API function
        const response = await fetch(
            `http://localhost:3000/addToCollection?userId=${userId}&collectionName=${encodeURIComponent(collectionName)}&itemId=${encodeURIComponent(itemId)}&type=${encodeURIComponent(itemType)}`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            showToast(`✅ "${item.title}" added to ${collectionName}!`, 'success');
        } else {
            throw new Error(data.message || 'Unknown server error');
        }

    } catch (error) {
        console.error('Error adding item to collection:', error);
        showToast(`❌ Failed to add "${item.title}": ${error.message}`, 'error');
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const toastStyles = document.createElement('style');
        toastStyles.id = 'toast-styles';
        toastStyles.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
                animation-fill-mode: forwards;
            }
            
            .toast-success {
                background: #28a745;
            }
            
            .toast-error {
                background: #dc3545;
            }
            
            .toast-info {
                background: #17a2b8;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(toastStyles);
    }
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}


// dh example way to use that function
// function testingFunction(){
//     const currentUserId = userId;
//     const collectionName = 'Watch Later';
//     const itemId = '3siw6WPG2jmb6xLleIe39c';
//     const type = 'music';
//     addItemFunction(currentUserId,collectionName,itemId,type);
// }




// dh addToCollectionFunction
// async function addItemFunction(userId,collectionName,itemId,type){
//     if (userId && collectionName && itemId && type) {
//         try {
//             const response = await fetch(
//                 `http://localhost:3000/addToCollection?userId=${userId}&collectionName=${encodeURIComponent(collectionName)}&itemId=${encodeURIComponent(itemId)}&type=${encodeURIComponent(type)}`,
//                 {
//                     method: 'POST'
//                 }
//             );

//             if (!response.ok) {
//                 throw new Error(`Server responded with status ${response.status}`);
//             }

//             const data = await response.json();

//             if (!response.ok) {
//                 // Show detailed message from server
//                 console.error('Server error:', data.message || 'Unknown error');
//                 alert(`Failed to add: ${data.message || 'Unknown server error'}`);
//                 return;
//             }

//             console.log('Add to Collection response:', data);

//         } catch (error) {
//             console.error('Error adding item to collection:', error);
//         }
//     }
// }