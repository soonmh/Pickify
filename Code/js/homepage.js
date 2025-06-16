const API_BASE_URL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', async function() {
    await loadEntertainmentData();
    initializeCollectionDropdowns();
    
<<<<<<< HEAD

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

    /**
     * Load fallback data if MongoDB is unavailable
     */
    function loadFallbackData() {
        console.log('🔄 Loading fallback dummy data...');
        
        // Your existing dummy data arrays
        const top10Movies = [
            { tmdbId: 3, title: "The Dark Knight", image: "./assests/TheDarkKnight.png", rating: 4.9, views: "1.5M", type: "movie" },
            { tmdbId: 4, title: "Interstellar", image: "./assests/Interstellar.png", rating: 4.7, views: "1.1M", type: "movie" },
            { tmdbId: 2, title: "Inception", image: "./assests/Inception.png", rating: 4.7, views: "48.7K", type: "movie" },
            { tmdbId: 5, title: "Fight Club", image: "./assests/FightClub.png", rating: 4.8, views: "800K", type: "movie" },
            { tmdbId: 6, title: "Pulp Fiction", image: "./assests/PulpFiction.png", rating: 4.6, views: "900K", type: "movie" },
            { tmdbId: 14, title: "The Matrix", image: "./assests/TheMatrix.png", rating: 4.8, views: "1.0M", type: "movie" },
            { tmdbId: 15, title: "Forrest Gump", image: "./assests/ForrestGump.png", rating: 4.9, views: "1.3M", type: "movie" },
            { tmdbId: 16, title: "The Shawshank Redemption", image: "./assests/ShawshankRedemption.png", rating: 4.9, views: "1.6M", type: "movie" },
            { tmdbId: 17, title: "The Godfather", image: "./assests/TheGodfather.png", rating: 4.9, views: "1.7M", type: "movie" },
            { tmdbId: 18, title: "Avengers: Endgame", image: "./assests/movieposter.png", rating: 4.7, views: "2.1M", type: "movie" },
        ];

        const top10Music = [
            { tmdbId: 7, title: "Blinding Lights", image: "./assests/BlindingLights.png", rating: 4.9, views: "2.0M", type: "music" },
            { tmdbId: 8, title: "Shape of You", image: "./assests/ShapeOfYou.png", rating: 4.8, views: "1.8M", type: "music" },
            { tmdbId: 9, title: "Rolling in the Deep", image: "./assests/RollingInTheDeep.png", rating: 4.7, views: "1.5M", type: "music" },
            { tmdbId: 10, title: "Bohemian Rhapsody", image: "./assests/BohemianRhapsody.png", rating: 4.9, views: "1.9M", type: "music" },
            { tmdbId: 19, title: "Someone Like You", image: "./assests/SomeoneLikeYou.png", rating: 4.8, views: "1.6M", type: "music" },
            { tmdbId: 20, title: "Let It Be", image: "./assests/LetItBe.png", rating: 4.9, views: "1.7M", type: "music" },
            { tmdbId: 21, title: "Bad Guy", image: "./assests/badguy.png", rating: 4.6, views: "1.4M", type: "music" },
            { tmdbId: 22, title: "Hotel California", image: "./assests/HotelCalifornia.png", rating: 4.9, views: "1.9M", type: "music" },
            { tmdbId: 23, title: "Hey Jude", image: "./assests/HeyJude.png", rating: 4.9, views: "2.0M", type: "music" },
            { tmdbId: 24, title: "Stairway to Heaven", image: "./assests/StairwayToHeaven.png", rating: 4.8, views: "1.8M", type: "music" },
        ];

        const top10Books = [
            { tmdbId: 1, title: "The Midnight Library", image: "./assests/MidnightLibrary.png", rating: 4.8, views: "12.4K", type: "book" },
            { tmdbId: 11, title: "Atomic Habits", image: "./assests/AtomicHabits.png", rating: 4.8, views: "600K", type: "book" },
            { tmdbId: 12, title: "The Alchemist", image: "./assests/TheAlchemist.png", rating: 4.9, views: "700K", type: "book" },
            { tmdbId: 13, title: "1984", image: "./assests/1984.png", rating: 4.8, views: "650K", type: "book" },
            { tmdbId: 25, title: "To Kill a Mockingbird", image: "./assests/ToKillAMockingbird.png", rating: 4.9, views: "800K", type: "book" },
            { tmdbId: 26, title: "The Great Gatsby", image: "./assests/TheGreatGatsby.png", rating: 4.6, views: "550K", type: "book" },
            { tmdbId: 27, title: "The Catcher in the Rye", image: "./assests/TheCatcherInTheRye.png", rating: 4.7, views: "500K", type: "book" },
            { tmdbId: 28, title: "Sapiens", image: "./assests/Sapiens.png", rating: 4.8, views: "700K", type: "book" },
            { tmdbId: 29, title: "Harry Potter and the Philosopher's Stone", image: "./assests/HarryPotter1.png", rating: 4.9, views: "1.0M", type: "book" },
            { tmdbId: 30, title: "Pride and Prejudice", image: "./assests/PrideAndPrejudice.png", rating: 4.8, views: "750K", type: "book" },
        ];

        // Render fallback data
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

    /**
     * Load fallback data if MongoDB is unavailable
     */
    function loadFallbackData() {
        console.log('🔄 Loading fallback dummy data...');
        
        // Your existing dummy data arrays
        const top10Movies = [
            { tmdbId: 1, title: "The Dark Knight", image: "./assests/TheDarkKnight.png", rating: 4.9, views: "1.5M", type: "movie" },
            { tmdbId: 4, title: "Interstellar", image: "./assests/Interstellar.png", rating: 4.7, views: "1.1M", type: "movie" },
            { tmdbId: 2, title: "Inception", image: "./assests/Inception.png", rating: 4.7, views: "48.7K", type: "movie" },
            { tmdbId: 5, title: "Fight Club", image: "./assests/FightClub.png", rating: 4.8, views: "800K", type: "movie" },
            { tmdbId: 6, title: "Pulp Fiction", image: "./assests/PulpFiction.png", rating: 4.6, views: "900K", type: "movie" },
            { tmdbId: 14, title: "The Matrix", image: "./assests/TheMatrix.png", rating: 4.8, views: "1.0M", type: "movie" },
            { tmdbId: 15, title: "Forrest Gump", image: "./assests/ForrestGump.png", rating: 4.9, views: "1.3M", type: "movie" },
            { tmdbId: 16, title: "The Shawshank Redemption", image: "./assests/ShawshankRedemption.png", rating: 4.9, views: "1.6M", type: "movie" },
            { tmdbId: 17, title: "The Godfather", image: "./assests/TheGodfather.png", rating: 4.9, views: "1.7M", type: "movie" },
            { tmdbId: 18, title: "Avengers: Endgame", image: "./assests/movieposter.png", rating: 4.7, views: "2.1M", type: "movie" },
        ];

        const top10Music = [
            { tmdbId: 7, title: "Blinding Lights", image: "./assests/BlindingLights.png", rating: 4.9, views: "2.0M", type: "music" },
            { tmdbId: 8, title: "Shape of You", image: "./assests/ShapeOfYou.png", rating: 4.8, views: "1.8M", type: "music" },
            { tmdbId: 9, title: "Rolling in the Deep", image: "./assests/RollingInTheDeep.png", rating: 4.7, views: "1.5M", type: "music" },
            { tmdbId: 10, title: "Bohemian Rhapsody", image: "./assests/BohemianRhapsody.png", rating: 4.9, views: "1.9M", type: "music" },
            { tmdbId: 19, title: "Someone Like You", image: "./assests/SomeoneLikeYou.png", rating: 4.8, views: "1.6M", type: "music" },
            { tmdbId: 20, title: "Let It Be", image: "./assests/LetItBe.png", rating: 4.9, views: "1.7M", type: "music" },
            { tmdbId: 21, title: "Bad Guy", image: "./assests/badguy.png", rating: 4.6, views: "1.4M", type: "music" },
            { tmdbId: 22, title: "Hotel California", image: "./assests/HotelCalifornia.png", rating: 4.9, views: "1.9M", type: "music" },
            { tmdbId: 23, title: "Hey Jude", image: "./assests/HeyJude.png", rating: 4.9, views: "2.0M", type: "music" },
            { tmdbId: 24, title: "Stairway to Heaven", image: "./assests/StairwayToHeaven.png", rating: 4.8, views: "1.8M", type: "music" },
        ];

        const top10Books = [
            { tmdbId: 1, title: "The Midnight Library", image: "./assests/MidnightLibrary.png", rating: 4.8, views: "12.4K", type: "book" },
            { tmdbId: 11, title: "Atomic Habits", image: "./assests/AtomicHabits.png", rating: 4.8, views: "600K", type: "book" },
            { tmdbId: 12, title: "The Alchemist", image: "./assests/TheAlchemist.png", rating: 4.9, views: "700K", type: "book" },
            { tmdbId: 13, title: "1984", image: "./assests/1984.png", rating: 4.8, views: "650K", type: "book" },
            { tmdbId: 25, title: "To Kill a Mockingbird", image: "./assests/ToKillAMockingbird.png", rating: 4.9, views: "800K", type: "book" },
            { tmdbId: 26, title: "The Great Gatsby", image: "./assests/TheGreatGatsby.png", rating: 4.6, views: "550K", type: "book" },
            { tmdbId: 27, title: "The Catcher in the Rye", image: "./assests/TheCatcherInTheRye.png", rating: 4.7, views: "500K", type: "book" },
            { tmdbId: 28, title: "Sapiens", image: "./assests/Sapiens.png", rating: 4.8, views: "700K", type: "book" },
            { tmdbId: 29, title: "Harry Potter and the Philosopher's Stone", image: "./assests/HarryPotter1.png", rating: 4.9, views: "1.0M", type: "book" },
            { tmdbId: 30, title: "Pride and Prejudice", image: "./assests/PrideAndPrejudice .png", rating: 4.8, views: "750K", type: "book" },
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
                    // Navigate to review page with item details
                    window.location.href = `review.html?tmdbId=${item.tmdbId}&type=${mediaType}`;
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
            col.setAttribute('data-id', item.tmdbId || item.id);  // Use tmdbId first, then fall back to id

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
    
    // Determine the correct ID based on type
    let id;
    if (item.type === 'movie') {
        id = item.tmdbId;
    } else if (item.type === 'music' || item.type === 'book') {
        id = item.id;
    } else {
        id = item.tmdbId || item.id || 'unknown-id';
    }
    
    return {
        id: id,
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
=======
    initChart();
>>>>>>> f087eac58523e6053d31e57878cd7c39189ee849
});

let entertainmentData = [];
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

function getDummyData() {
    return [

        {
            id: 1,
            title: "The Midnight Library",
            type: "books",
            genre: "fantasy fiction",
            rating: 4.8,
            views: 12400,
            image: "./assests/MidnightLibrary.png",
            author: "Matt Haig",
            year: 2020,
            description: "A woman explores infinite lives in a mystical library to discover what truly makes life worth living."
        },
        {
            id: 2,
            title: "Inception",
            type: "movies",
            genre: "sci-fi",
            rating: 4.7,
            views: 48700,
            image: "./assests/Inception.png",
            director: "Christopher Nolan",
            year: 2010,
            duration: 148,
            description:"A skilled thief enters dreams to plant an idea but risks losing himself in layers of subconscious."
        },
        {
            id: 3,
            title: "Taylor Swift - Folklore",
            type: "music",
            genre: "pop",
            rating: 4.9,
            views: 38200,
            image: "./assests/Folklore.png",
            artist: "Taylor Swift",
            year: 2020,
            description:"An introspective journey through nostalgic melodies and fictional tales of love, loss, and longing."
        },
        {
            id: 4,
            title: "Dune",
            type: "books",
            genre: "sci-fi",
            rating: 4.6,
            views: 15800,
            image: "./assests/DuneBook.png",
            author: "Frank Herbert",
            year: 1965,
            description:"Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
        },
        {
            id: 5,
            title: "The Shawshank Redemption",
            type: "movies",
            genre: "drama",
            rating: 4.4,
            views: 52300,
            image: "./assests/ShawshankRedemption.png",
            director: "Frank Darabont",
            year: 1994,
            duration:142,
            description:"A banker wrongfully imprisoned forms a life-changing friendship and plans a daring escape."
        },
        {
            id: 6,
            title: "Kendrick Lamar - To Pimp a Butterfly",
            type: "music",
            genre: "hip-hop",
            rating: 4.8,
            views: 27500,
            image: "./assests/ToPimpAButterfly.png",
            artist: "Kendrick Lamar",
            year: 2015,
            description:"A powerful fusion of jazz, rap, and soul that explores race, fame, and personal transformation."
        },
        {
            id: 7,
            title: "Project Hail Mary",
            type: "books",
            genre: "sci-fi",
            rating: 4.7,
            views: 9300,
            image: "./assests/ProjectHailMary.png",
            author: "Andy Weir",
            year: 2021,
            description:"A lone astronaut awakens in space with amnesia and must save humanity from an extinction event."
        },
        {
            id: 8,
            title: "Everything Everywhere All at Once",
            type: "movies",
            genre: "sci-fi",
            rating: 4.8,
            views: 31700,
            image: "./assests/EverythingEverywhere.png",
            director: "Daniels",
            year: 2022,
            duration: 139,
            description:"An aging laundromat owner must save the multiverse by confronting her alternate selves."
        },
        {
            id: 9,
            title: "The Great Gatsby",
            type: "books",
            genre: "classic",
            rating: 4.5,
            views: 45600,
            image: "./assests/TheGreatGatsby.png",
            author: "F. Scott Fitzgerald",
            year: 1925,
            description:"A mysterious millionaire's lavish parties mask his obsession with a lost love across the bay."
        },
        {
            id: 10,
            title: "Parasite",
            type: "movies",
            genre: "thriller",
            rating: 4.8,
            views: 38900,
            image: "./assests/Parasite.png",
            director: "Bong Joon-ho",
            year: 2019,
            duration: 132,
            description:"A poor family schemes to infiltrate a wealthy household, sparking a shocking class conflict."
        },
        {
            id: 11,
            title: "Billie Eilish - Happier Than Ever",
            type: "music",
            genre: "pop",
            rating: 4.7,
            views: 32100,
            image: "./assests/HappierThanEver.png",
            artist: "Billie Eilish",
            year: 2021,
            description:"A haunting blend of ballads and rage as Billie reflects on fame, betrayal, and self-empowerment."
        },
        {
            id: 12,
            title: "Educated",
            type: "books",
            genre: "memoir",
            rating: 4.7,
            views: 20300,
            image: "./assests/Educated.png",
            author: "Tara Westover",
            year: 2018,
            description:"Raised by survivalists in rural Idaho, a young woman escapes to pursue education and self-discovery."
        },
        {
            id: 13,
            title: "The Dark Knight",
            type: "movies",
            genre: "action",
            rating: 4.9,
            views: 67800,
            image: "./assests/TheDarkKnight.png",
            director: "Christopher Nolan",
            year: 2008,
            duration: 152,
            description:"Batman battles chaos incarnate as the Joker pushes Gotham and its hero to their moral limits."
        },
        {
            id: 14,
            title: "Pink Floyd - The Dark Side of the Moon",
            type: "music",
            genre: "rock",
            rating: 5.0,
            views: 89400,
            image: "./assests/TheDarkSideOfTheMoon.png",
            artist: "Pink Floyd",
            year: 1973,
            description:"A psychedelic odyssey through time, money, madness, and the pressures of modern life."
        },
        {
            id: 15,
            title: "The Silent Patient",
            type: "books",
            genre: "thriller",
            rating: 4.6,
            views: 18700,
            image: "./assests/TheSilentPatient.png",
            author: "Alex Michaelides",
            year: 2019,
            description:"A woman’s silence after murdering her husband hides a dark truth waiting to be uncovered."
        },
        {
            id: 16,
            title: "Pulp Fiction",
            type: "movies",
            genre: "drama",
            rating: 4.8,
            views: 58200,
            image: "./assests/PulpFiction.png",
            director: "Quentin Tarantino",
            year: 1994,
            duration: 154,
            description:"Interwoven stories of crime and redemption unfold with wit, violence, and pop-culture flair."
        },
        {
            id: 17,
            title: "The Weeknd - After Hours",
            type: "music",
            genre: "r&b",
            rating: 4.7,
            views: 41500,
            image: "./assests/AfterHours.png",
            artist: "The Weeknd",
            year: 2020,
            description:"A synth-heavy descent into heartbreak, loneliness, and emotional transformation in the city."
        },
        {
            id: 18,
            title: "Sapiens: A Brief History of Humankind",
            type: "books",
            genre: "non-fiction",
            rating: 4.7,
            views: 35600,
            image: "./assests/Sapiens.png",
            author: "Yuval Noah Harari",
            year: 2011,
            description:"A sweeping account of human evolution, culture, and our species’ impact on the world."
        },
        {
            id: 19,
            title: "Spirited Away",
            type: "movies",
            genre: "animation",
            rating: 4.8,
            views: 42300,
            image: "./assests/SpiritedAway.png",
            director: "Hayao Miyazaki",
            year: 2001,
            duration: 125,
            description:"A young girl navigates a spirit world to save her parents and discover her inner strength."
        },
        {
            id: 20,
            title: "Tyler, the Creator - IGOR",
            type: "music",
            genre: "hip-hop",
            rating: 4.6,
            views: 28900,
            image: "./assests/IGOR.png",
            artist: "Tyler, the Creator",
            year: 2019,
            description:"A genre-bending tale of heartbreak and identity wrapped in bold, soulful production."
        },
        {
            id: 21,
            title: "Where the Crawdads Sing",
            type: "books",
            genre: "fiction",
            rating: 4.5,
            views: 31200,
            image: "./assests/WhereTheCrawdadsSing.png",
            author: "Delia Owens",
            year: 2018,
            description:"An abandoned girl raised in the marsh becomes a murder suspect in a quiet Southern town."
        },
        {
            id: 22,
            title: "Black Panther",
            type: "movies",
            genre: "action",
            rating: 4.7,
            views: 49600,
            image: "./assests/BlackPanther.png",
            director: "Ryan Coogler",
            year: 2018,
            duration: 134,
            description:"A king returns to a hidden nation to defend his throne and legacy from powerful enemies."
        },
        {
            id: 23,
            title: "Adele - 30",
            type: "music",
            genre: "pop",
            rating: 4.8,
            views: 36700,
            image: "./assests/30.png",
            artist: "Adele",
            year: 2021,
            description:"An emotional album chronicling heartbreak, healing, and the complexities of motherhood."
        },
        {
            id: 24,
            title: "Atomic Habits",
            type: "books",
            genre: "self-help",
            rating: 4.8,
            views: 42800,
            image: "./assests/AtomicHabits.png",
            author: "James Clear",
            year: 2018,
            description:"A practical guide to building good habits and breaking bad ones through small, consistent changes."
        },
        {
            id: 25,
            title: "Squid Game",
            type: "movies",
            genre: "thriller",
            rating: 5.0,
            views: 61000,
            image: "./assests/poster.png",
            director: "Hwang Dong-hyuk",
            year: 2021,
            duration: 480,
            description: "A survival game where 456 players, including Choi Hyun Suk, Lee Jung Jae, Park Hae Soo, and Kim Joo Hyuk, compete for a 45.6 billion won prize."
        }
    ];
}

    function formatMovieData(movie) {
        const genreType = movie.genres;
        var genre1 = '';
        console.log(genreType.length);
        for (let i = 0; i < genreType.length; i++) {
            if (i > 0) genre1 += ' ';
            genre1 += genreType[i].name || 'Unknown Genre';
        }
        const baseImageUrl = movie.poster_path ?
            `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` :
            './assests/default-poster.png';
        return {
            id: movie.tmdbId || movie._id,
            title: movie.title || 'Unknown Title',
            type: "movies",
            genre: genre1 || 'unknown',
            rating: Math.round((movie.vote_average / 2) * 10) / 10 || 0,
            views: movie.popularity ? Math.round(movie.popularity * 1000) : Math.floor(Math.random() * 1000000),
            image: baseImageUrl,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
            director: movie.director || '',
            duration: movie.runtime || 1,
            description: movie.overview || ''
        };
    }

    function formatMusicData(music) {
        const artistName = music.artists;
        var artist = '';
        for (let i = 0; i < artistName.length; i++) {
            if (i > 0) artist += ', ';
            artist += artistName[i] || 'Unknown Artist';
        }

        return {
            id: music.id,
            title: music.name,
            type: 'music',
            genre: music.genre || 'unknown',
            rating: music.popularity / 20 || 0,
            views: music.popularity || 0,
            image: music.poster_url || './assests/default-music.png',
            artist: artist || '',
            year: music.release ? new Date(music.release).getFullYear() : 'Unknown',
            description: music.description || ''
        };
    }

    function formatBookData(book) {
        return {
            id: book._id,
            title: book.title,
            type: 'books',
            genre: book.genre || 'unknown',
            rating: book.rating || 0,
            views: book.popularity ? Math.round(book.popularity * 1000) : Math.floor(Math.random() * 100000),
            image: book.image || './assests/default-book.png',
            author: book.author || '',
            year: book.year || 'Unknown',
            description: book.description || ''
        };
    }

    async function loadEntertainmentData() {
        const chartItems = document.querySelector('.chart-items');
        const chartEmpty = document.querySelector('.chart-empty');
        const chartLoading = document.querySelector('.chart-loading');
        
        chartItems.style.display = 'none';
        chartEmpty.style.display = 'none';
        chartLoading.style.display = 'block';

        try {
            // Fetch all types in parallel
            const [moviesRes, musicRes, booksRes] = await Promise.all([
                fetch(`${API_BASE_URL}/movies/top?limit=50`),
                fetch(`${API_BASE_URL}/music/top?limit=50`),
                fetch(`${API_BASE_URL}/books/top?limit=50`)
            ]);
            
            const [movies, music, books] = await Promise.all([
                moviesRes.json(),
                musicRes.json(),
                booksRes.json()
            ]);

            // Format and merge all data into one array
            entertainmentData = [
                ...(movies.data || []).map(formatMovieData),
                ...(music.data || []).map(formatMusicData),
                ...(books.data || []).map(formatBookData)
            ];

            console.log('Successfully loaded data from database');
            
        } catch (error) {
            console.error('Failed to fetch data from backend, falling back to dummy data:', error);
            entertainmentData = getDummyData();
        }

        chartLoading.style.display = 'none';
        return entertainmentData;
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    let currentData = [...entertainmentData];
    
    // tab switch
    const tabs = document.querySelectorAll('.chart-tab');
    const chartItems = document.querySelector('.chart-items');
    const chartLoading = document.querySelector('.chart-loading');
    const chartEmpty = document.querySelector('.chart-empty');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // remove class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // add active class to clicked tab
            this.classList.add('active');
            
            // show loading state
            chartItems.style.display = 'none';
            chartEmpty.style.display = 'none';
            chartLoading.style.display = 'block';
            
            // get the tab type (top rated or most viewed)
            const tabType = this.dataset.tab;
            
            // update URL to reflect the current state
            updatePageUrl(typeFilter.value, tabType);
            
            setTimeout(() => {
                chartLoading.style.display = 'none';
                
                applyFilters();
                
                console.log(`Switched to "${tabType}" tab`);
            }, 800);
        });
    });
    
    const typeFilter = document.getElementById('chart-type-filter');
    const genreFilter = document.getElementById('chart-genre-filter');
    const ratingFilter = document.getElementById('chart-rating-filter');
    
    typeFilter.addEventListener('change', function() {
        const activeTab = document.querySelector('.chart-tab.active');
        updatePageUrl(this.value, activeTab.dataset.tab);
        updateGenreFilterOptions();
        updateSearchPlaceholder(this.value); // Add this line
        applyFilters();
    });
    genreFilter.addEventListener('change', applyFilters);
    ratingFilter.addEventListener('change', applyFilters);
    
    function updatePageUrl(type, tab) {
        const url = new URL(window.location);
        url.searchParams.set('type', type);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url);
    }

    function applyFilters() {
        const type = typeFilter.value;
        const genre = genreFilter.value;
        const ratingValue = ratingFilter.value;
        
        chartItems.style.display = 'none';
        chartEmpty.style.display = 'none';
        chartLoading.style.display = 'block';
        
        setTimeout(() => {
            chartLoading.style.display = 'none';
            
            currentData = getFilteredDataWithOriginalRankings();
            
            renderChartItems(currentData);
            
            if (currentData.length > 0) {
                chartItems.style.display = 'block';
            } else {
                chartEmpty.style.display = 'block';
            }
            
            console.log(`Applied filters - Type: ${type}, Genre: ${genre}, Rating: ${ratingValue}`);
        }, 300);
    }

    function parseViews(views) {
        if (typeof views === 'number') return views;
        if (typeof views === 'string') {
            if (views.endsWith('M')) return parseFloat(views) * 1000000;
            if (views.endsWith('K')) return parseFloat(views) * 1000;
            return parseInt(views) || 0;
        }
        return 0;
    }

    function getFilteredDataWithOriginalRankings(searchTerm = '') {
        let filteredData = entertainmentData.filter(item => {
            if (typeFilter.value !== 'all' && item.type !== typeFilter.value) {
                return false;
            }
            
            if (genreFilter.value !== 'all' && !(item.genre && item.genre.toLowerCase().includes(genreFilter.value.toLowerCase()))) {
                return false;
            }
            
            if (ratingFilter.value !== 'all') {
                const [minRating, maxRating] = ratingFilter.value.split('-').map(parseFloat);
                if (maxRating) {
                    if (item.rating < minRating || item.rating > maxRating) {
                        return false;
                    }
                } else {
                    if (item.rating < minRating) {
                        return false;
                    }
                }
            }
            
            return true;
        });
        
        const activeTab = document.querySelector('.chart-tab.active');
        const activeTabType = activeTab.dataset.tab;
        
        let topRatedData = [...filteredData].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        let mostViewedData = [...filteredData].sort((a, b) => (parseViews(b.views) || 0) - (parseViews(a.views) || 0));
        
        const topRatedRankMap = new Map();
        const mostViewedRankMap = new Map();
        
        topRatedData.forEach((item, index) => {
            topRatedRankMap.set(item.id, index + 1);
        });
        
        mostViewedData.forEach((item, index) => {
            mostViewedRankMap.set(item.id, index + 1);
        });
        
        if (activeTabType === 'top-rated') {
            filteredData = topRatedData;
        } else {
            filteredData = mostViewedData;
        }
        
        if (searchTerm) {
            return filteredData.filter(item => 
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.genre && item.genre.toLowerCase().includes(searchTerm)) ||
                (item.author && item.author.toLowerCase().includes(searchTerm)) ||
                (item.artist && item.artist.toLowerCase().includes(searchTerm)) ||
                (item.director && item.director.toLowerCase().includes(searchTerm))
            ).map(item => ({
                ...item,
                originalRank: activeTabType === 'top-rated' ? 
                    topRatedRankMap.get(item.id) : 
                    mostViewedRankMap.get(item.id)
            }));
        }
        
        return filteredData.map(item => ({
            ...item,
            originalRank: activeTabType === 'top-rated' ? 
                topRatedRankMap.get(item.id) : 
                mostViewedRankMap.get(item.id)
        }));
    }
    
    function updateGenreFilterOptions() {
        const selectedType = typeFilter.value;
        
        while (genreFilter.options.length > 1) {
            genreFilter.remove(1);
        }
        
        if (selectedType === 'all') {
            const allGenres = new Set();
            entertainmentData.forEach(item => {
                item.genre.split(' ').forEach(genre => allGenres.add(genre));
            });
            
            Array.from(allGenres).sort().forEach(genre => {
                const option = document.createElement('option');
                option.value = genre;
                option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
                genreFilter.appendChild(option);
            });
        } else {
            const typeGenres = new Set();
            entertainmentData
                .filter(item => item.type === selectedType)
                .forEach(item => {
                    item.genre.split(' ').forEach(genre => typeGenres.add(genre));
                });
            
            Array.from(typeGenres).sort().forEach(genre => {
                const option = document.createElement('option');
                option.value = genre;
                option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
                genreFilter.appendChild(option);
            });
        }
    }
    
    const searchInput = document.getElementById('chart-search');
    const searchButton = document.getElementById('search-btn');
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    searchInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            applyFilters();
            console.log('Search cleared - resetting to default filtered view');
        }
    });
        
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            applyFilters();
            return;
        }
        
        chartItems.style.display = 'none';
        chartEmpty.style.display = 'none';
        chartLoading.style.display = 'block';
        
        setTimeout(() => {
            chartLoading.style.display = 'none';
            
            currentData = getFilteredDataWithOriginalRankings(searchTerm);
            
            renderChartItems(currentData);
            
            if (currentData.length > 0) {
                chartItems.style.display = 'block';
            } else {
                chartEmpty.style.display = 'block';
            }
            
            console.log(`Performed search for: "${searchTerm}" with current filters`);
        }, 300);
    }

    function updateSearchPlaceholder(type) {
        const searchInput = document.getElementById('chart-search');
        
        switch(type) {
            case 'movies':
                searchInput.placeholder = 'Search titles and directors...';
                break;
            case 'music':
                searchInput.placeholder = 'Search titles and artists...';
                break;
            case 'books':
                searchInput.placeholder = 'Search titles and authors...';
                break;
            default:
                searchInput.placeholder = 'Search...';
        }
    }

    function addMedalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Medal styles for rank numbers */
            .chart-rank.rank-gold {
                background-color: #FFD700; /* Gold */
                color: var(--text-color);
                box-shadow: 0 2px 5px rgba(255, 215, 0, 0.3);
            }
            
            .chart-rank.rank-silver {
                background-color: #C0C0C0; /* Silver */
                color: var(--text-color);
                box-shadow: 0 2px 5px rgba(192, 192, 192, 0.3);
            }
            
            .chart-rank.rank-bronze {
                background-color: #CD7F32; /* Bronze */
                color: white;
                box-shadow: 0 2px 5px rgba(205, 127, 50, 0.3);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    function renderChartItems(data) {
        const chartItemsContainer = document.querySelector('.chart-items');
        
        chartItemsContainer.innerHTML = '';
        
        data.forEach((item, index) => {
            const chartItem = document.createElement('div');
            chartItem.className = 'chart-item';
            chartItem.dataset.type = item.type;
            chartItem.dataset.genre = item.genre;
            chartItem.dataset.rating = item.rating;
            
            let metaIcons = '';
            let metaInfo = '';
            
            if (item.type === 'movies') {
                metaIcons = `<i class="fas fa-film"></i>`;
                metaInfo = `<span class="meta-item">${item.genre.split(' ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}</span>
                            <span class="meta-item"><i class="fas fa-calendar"></i> ${item.year}</span>
                            <span class="meta-item"><i class="fas fa-user"></i> ${item.director}</span>
                            <span class="meta-item"><i class="fas fa-clock"></i> ${item.duration} min</span>`;
            } else if (item.type === 'books') {
                metaIcons = `<i class="fas fa-book"></i>`;
                metaInfo = `<span class="meta-item">${item.genre.split(' ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}</span>
                            <span class="meta-item"><i class="fas fa-calendar"></i> ${item.year}</span>
                            <span class="meta-item"><i class="fas fa-user"></i> ${item.author}</span>`;
            } else if (item.type === 'music') {
                metaIcons = `<i class="fas fa-music"></i>`;
                metaInfo = `<span class="meta-item">${item.genre.split(' ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')}</span>
                            <span class="meta-item"><i class="fas fa-calendar"></i> ${item.year}</span>
                            <span class="meta-item"><i class="fas fa-user"></i> ${item.artist}</span>`;
            }
            
            const displayRank = item.originalRank || (index + 1);
            
            let rankClass = '';
            if (displayRank === 1) {
                rankClass = 'rank-gold';
            } else if (displayRank === 2) {
                rankClass = 'rank-silver';
            } else if (displayRank === 3) {
                rankClass = 'rank-bronze';
            }
            
            chartItem.innerHTML = `
                <div class="chart-rank ${rankClass}">${displayRank}</div>
                <img src="${item.image}" alt="${item.title}" class="chart-thumbnail" data-id="${item.id}">
                <div class="chart-info">
                    <div class="chart-title-row">
                        <h3 class="chart-item-title" data-id="${item.id}">${item.title}</h3>
                        <div class="chart-rating-save">
                            <div class="chart-rating">
                                <i class="fas fa-star"></i>
                                ${item.rating.toFixed(1)}
                            </div>
                        
                            <div syle="position: relative;align-items: center;">
                            <div class = "collection-dropdown">
                                    <button class="collection-dropdown-btn" title = "Add to Watchlist" onfocus="dropdown('${item.id}',1,'${item.type}','${item.title}')" onblur="dropdown('${item.id}',2,'${item.type}','${item.id}','${item.title}')" onclick="dropdown('${item.id}',1,'${item.type}','${item.title}')">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                    <div class="collection-dropdown-menu" id="menu-${item.id}">
                                        
                                    </div>
                                </div>
                        </div>                          
                        </div>
                    
                    </div>
                    <div class="chart-meta">
                        <span>${metaIcons} ${metaInfo}</span>
                    </div>
                    <p class="chart-description">
                        ${item.description}
                    </p>
                </div>
            `;
            
            chartItemsContainer.appendChild(chartItem);
        });
        
        attachEventListeners();
    }
    function dropdown(id,x, itemType,itemT) {
        const menu = document.getElementById(`menu-${id}`);
        if (x == 1) {
            loadmenu(id, itemType,itemT);
            menu.classList.add('show');
        } else {
            // menu.classList.remove('show');
        }
    }
    function loadmenu(id, itemType,itemT) {
        userId = getCurrentUserId();
        const menu = document.getElementById(`menu-${id}`);
        menu.innerHTML = ''; // Clear existing items
        userCollections.forEach(collection => {
        const menuItem = document.createElement('div');
        menuItem.className = 'collection-dropdown-item';
        menuItem.innerHTML = `
            <i class="fas fa-folder"></i> ${collection.name}
        `;
        
        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCollection(userId, collection.name, id, itemType,itemT);
            menu.classList.remove('show');
        });
        
        menu.appendChild(menuItem);
    });
    }
async function addToCollection(userId, collectionName, itemId, itemType,itemT) {
    try {
        // Show loading feedback
        showToast(`Adding "${itemT}" to ${collectionName}...`, 'info');
        
        // Determine item type and ID
    
        console.log('🔍 Item type:', itemType);
        console.log('🔍 Item _id:', itemId);
        
        if (!itemId) {
            throw new Error('Item ID not found');
        }
        if (itemType.endsWith('s')) {
        itemType = itemType.slice(0, -1); // Remove trailing 's' from type
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
            showToast(`✅ "${itemT}" added to ${collectionName}!`, 'success');
        } else {
            throw new Error(data.message || 'Unknown server error');
        }

    } catch (error) {
        console.error('Error adding item to collection:', error);
        showToast(`❌ Failed to add "${itemT}": Already in ${collectionName}`, 'error');
    }
}
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

    function initializeCollectionDropdowns() {
        // Add CSS for dropdown styling
        addDropdownStyles();
        
        // Load user collections if user is logged in
        loadUserCollections();
    }
    
    function addDropdownStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .collection-dropdown {
                position: adsolute;
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
        `;
        document.head.appendChild(style);
    }

    function attachEventListeners() {
        const thumbnails = document.querySelectorAll('.chart-thumbnail');
        const titles = document.querySelectorAll('.chart-item-title');
        
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                const id = this.dataset.id;
                navigateToContentPage(id);
            });
        });
        
        titles.forEach(title => {
            title.addEventListener('click', function() {
                const id = this.dataset.id;
                navigateToContentPage(id);
            });
        });
        
        const saveButtons = document.querySelectorAll('.chart-save');
        saveButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const icon = this.querySelector('i');
                
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');

                    this.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    this.style.color = '';
                }
            });
        });
    }
    
    function navigateToContentPage(id) {
        console.log(`Navigating to content page for ID: ${id}`);
        
        // use Squid Game as example first (ID: 25)
        if (id == 25) {
            window.location.href = "review.html";
        } else {
            alert(`Navigating to content page for: ${id}`);
            // future implementation could use: window.location.href = `/content/${id}`;
        }
    }
    
    function initChart() {
        const urlType = getUrlParameter('type');
        if (urlType && ['movies', 'music', 'books'].includes(urlType)) {
            typeFilter.value = urlType;
        } else {
            typeFilter.value = 'movies';
        }
        
        updateGenreFilterOptions();
        updateSearchPlaceholder(typeFilter.value);
        
        const urlTab = getUrlParameter('tab');
        if (urlTab && ['top-rated', 'most-viewed'].includes(urlTab)) {
            document.querySelectorAll('.chart-tab').forEach(tab => {
                if (tab.dataset.tab === urlTab) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }
        
        const activeTab = document.querySelector('.chart-tab.active');
        const activeTabType = activeTab.dataset.tab;
        
        currentData = [...entertainmentData];
        
        if (activeTabType === 'top-rated') {
            currentData.sort((a, b) => b.rating - a.rating);
        } else {
            currentData.sort((a, b) => b.views - a.views);
        }
        
        applyFilters();
        
        console.log(`Entertainment chart initialized with ${typeFilter.value} as type`);
    }
    initChart();

<<<<<<< HEAD


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

/**
 * Handle click on recommendation items
 * @param {string} id - The item ID
 * @param {string} type - The item type (movie, music, book)
 */
function handleRecommendationClick(id, type) {
    console.log(`Clicked on ${type} recommendation: ${id}`);
    window.location.href = `review.html?tmdbId=${id}&type=${type}`;
}    renderScrollingList(top10MoviesContainer, top10Movies, 'movie');
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
                    // Navigate to review page with item details
                    window.location.href = `review.html?tmdbId=${item.tmdbId}&type=${mediaType}`;
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
            col.setAttribute('data-id', item.tmdbId || item.id);  // Use tmdbId first, then fall back to id

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
    
    // Determine the correct ID based on type
    let id;
    if (item.type === 'movie') {
        id = item.tmdbId;
    } else if (item.type === 'music' || item.type === 'book') {
        id = item.id;
    } else {
        id = item.tmdbId || item.id || 'unknown-id';
    }
    
    return {
        id: id,
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
    dropdownBtn.title = 'Add to Watchlist';
    
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

/**
 * Handle click on recommendation items
 * @param {string} id - The item ID
 * @param {string} type - The item type (movie, music, book)
 */
function handleRecommendationClick(id, type) {
    console.log(`Clicked on ${type} recommendation: ${id}`);
    window.location.href = `review.html?tmdbId=${id}&type=${type}`;
}
=======
    addMedalStyles();
>>>>>>> f087eac58523e6053d31e57878cd7c39189ee849
