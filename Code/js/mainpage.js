// Combine all dummy data into one larger collection
const dummyData = [
    {
        id: 1,
        title: "The Midnight Library",
        type: "book",
        genre: "fantasy",
        rating: 4.8,
        views: 12400,
        image: "./assests/MidnightLibrary.png",
        author: "Matt Haig",
        year: 2020
    },
    {
        id: 2,
        title: "Inception",
        type: "movie",
        genre: "sci-fi",
        rating: 4.7,
        views: 48700,
        image: "./assests/Inception.png",
        director: "Christopher Nolan",
        year: 2010
    },
    {
        id: 3,
        title: "Taylor Swift - Folklore",
        type: "music",
        genre: "pop",
        rating: 4.9,
        views: 38200,
        image: "./assests/movieposter.png",
        artist: "Taylor Swift",
        year: 2020
    },
    {
        id: 4,
        title: "Dune",
        type: "book",
        genre: "sci-fi",
        rating: 4.6,
        views: 15800,
        image: "./assests/movieposter.png",
        author: "Frank Herbert",
        year: 1965
    },
    {
        id: 5,
        title: "The Shawshank Redemption",
        type: "movie",
        genre: "drama",
        rating: 4.9,
        views: 52300,
        image: "./assests/movieposter.png",
        director: "Frank Darabont",
        year: 1994
    },
    {
        id: 6,
        title: "Kendrick Lamar - To Pimp a Butterfly",
        type: "music",
        genre: "hip-hop",
        rating: 4.8,
        views: 27500,
        image: "./assests/movieposter.png",
        artist: "Kendrick Lamar",
        year: 2015
    },
    {
        id: 7,
        title: "Project Hail Mary",
        type: "book",
        genre: "sci-fi",
        rating: 4.7,
        views: 9300,
        image: "./assests/movieposter.png",
        author: "Andy Weir",
        year: 2021
    },
    {
        id: 8,
        title: "Everything Everywhere All at Once",
        type: "movie",
        genre: "sci-fi",
        rating: 4.8,
        views: 31700,
        image: "./assests/movieposter.png",
        director: "Daniels",
        year: 2022
    },
    {
        id: 9,
        title: "The Great Gatsby",
        type: "book",
        genre: "classic",
        rating: 4.5,
        views: 45600,
        image: "./assests/movieposter.png",
        author: "F. Scott Fitzgerald",
        year: 1925
    },
    {
        id: 10,
        title: "Parasite",
        type: "movie",
        genre: "thriller",
        rating: 4.8,
        views: 38900,
        image: "./assests/movieposter.png",
        director: "Bong Joon-ho",
        year: 2019
    },
    {
        id: 11,
        title: "Billie Eilish - Happier Than Ever",
        type: "music",
        genre: "pop",
        rating: 4.7,
        views: 32100,
        image: "./assests/movieposter.png",
        artist: "Billie Eilish",
        year: 2021
    },
    {
        id: 12,
        title: "Educated",
        type: "book",
        genre: "memoir",
        rating: 4.7,
        views: 20300,
        image: "./assests/movieposter.png",
        author: "Tara Westover",
        year: 2018
    },
    {
        id: 13,
        title: "The Dark Knight",
        type: "movie",
        genre: "action",
        rating: 4.9,
        views: 1500000,
        image: "./assests/TheDarkKnight.png",
        director: "Christopher Nolan",
        year: 2008
    },
    {
        id: 4,
        title: "Interstellar",
        type: "movie",
        genre: "sci-fi",
        rating: 4.7,
        views: 1100000,
        image: "./assests/Interstellar.png",
        director: "Christopher Nolan",
        year: 2014
    },
    {
        id: 5,
        title: "Fight Club",
        type: "movie",
        genre: "drama",
        rating: 4.8,
        views: 800000,
        image: "./assests/FightClub.png",
        director: "David Fincher",
        year: 1999
    },
    {
        id: 6,
        title: "Pulp Fiction",
        type: "movie",
        genre: "crime",
        rating: 4.6,
        views: 900000,
        image: "./assests/PulpFiction.png",
        director: "Quentin Tarantino",
        year: 1994
    },
    {
        id: 17,
        title: "The Weeknd - After Hours",
        type: "music",
        genre: "pop",
        rating: 4.9,
        views: 2000000,
        image: "./assests/BlindingLights.png",
        artist: "The Weeknd",
        year: 2020
    },
    {
        id: 8,
        title: "Shape of You",
        type: "music",
        genre: "pop",
        rating: 4.8,
        views: 1800000,
        image: "./assests/ShapeOfYou.png",
        artist: "Ed Sheeran",
        year: 2017
    },
    {
        id: 9,
        title: "Rolling in the Deep",
        type: "music",
        genre: "soul",
        rating: 4.7,
        views: 1500000,
        image: "./assests/RollingInTheDeep.png",
        artist: "Adele",
        year: 2011
    },
    {
        id: 10,
        title: "Bohemian Rhapsody",
        type: "music",
        genre: "rock",
        rating: 4.9,
        views: 1900000,
        image: "./assests/BohemianRhapsody.png",
        artist: "Queen",
        year: 1975
    },
    // Books
    {
        id: 11,
        title: "Atomic Habits",
        type: "book",
        genre: "self-help",
        rating: 4.8,
        views: 600000,
        image: "./assests/AtomicHabits.png",
        author: "James Clear",
        year: 2018
    },
    {
        id: 12,
        title: "The Alchemist",
        type: "book",
        genre: "fantasy",
        rating: 4.9,
        views: 700000,
        image: "./assests/TheAlchemist.png",
        author: "Paulo Coelho",
        year: 1988
    },
    {
        id: 13,
        title: "1984",
        type: "book",
        genre: "dystopian",
        rating: 4.8,
        views: 650000,
        image: "./assests/1984.png",
        author: "George Orwell",
        year: 1949
    }
];

// Dummy user watchlist data (this would come from the backend in a real implementation)
const userWatchlist = [
    {
        id: 1,
        title: "The Midnight Library",
        type: "book",
        genre: "fantasy"
    },
    {
        id: 2,
        title: "Inception",
        type: "movie",
        genre: "sci-fi"
    }
];

// State to maintain search history
let searchHistory = [];

document.addEventListener('DOMContentLoaded', function () {

    loadSearchHistoryFromStorage();
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchHistoryList = document.getElementById('search-history-list');
    const searchResultsContainer = document.getElementById('search-results-container'); 
    const recommendationsContainer = document.getElementById('recommendations-container');
    const top10MoviesContainer = document.getElementById('top10-movies');
    const top10MusicContainer = document.getElementById('top10-music');
    const top10BooksContainer = document.getElementById('top10-books');

    // Dummy Data for Top 10 Movies
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

    // Dummy Data for Top 10 Music
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

    // Dummy Data for Top 10 Books
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

    // Initialize the page
    renderScrollingList(top10MoviesContainer, top10Movies, 'movie');
    renderScrollingList(top10MusicContainer, top10Music, 'music');
    renderScrollingList(top10BooksContainer, top10Books, 'book');
    setupCustomScrollbars();
    renderSearchHistory(); // Initialize search history
    renderRecommendations(); // Initialize recommendations

    // Add event listeners for search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

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
            
            // Add click handler for the card
            card.addEventListener('click', () => {
                // You can add navigation to detail page or other functionality here
                console.log(`Clicked on ${mediaType} item: ${item.title}`);
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
     * Render search results
     * @param {Array} results - Array of search result objects
     * @param {string} query - The search query
     */
    function renderSearchResults(results, query) {
        // Clear the search results container
        searchResultsContainer.innerHTML = '';

        // If no results, show a message
        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <p class="no-results-message">No results found for "${query}". Try another search!</p>
            `;
            return;
        }

        // Render the search results
        results.forEach(item => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';

            resultCard.innerHTML = `
                <img src="${item.image}" class="result-img" alt="${item.title}">
                <div class="result-body">
                    <h5 class="result-title">${item.title}</h5>
                    <p class="result-meta">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                </div>
            `;

            searchResultsContainer.appendChild(resultCard);
        });
    }

    /**
     * Render recommendations in the recommendations container
     */
    function renderRecommendations() {
        // Clear the recommendations container
        recommendationsContainer.innerHTML = '';

        const recommendations = getRecommendationsForUser();

        // If no recommendations, show a message
        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p class="mb-0">No recommendations available. Add items to your watchlist!</p>
                </div>
            `;
            return;
        }

        // Render up to 4 recommendations
        recommendations.slice(0, 4).forEach(item => {
            const col = document.createElement('div');
            col.className = 'col';
            col.setAttribute('data-id', item.id);

            col.innerHTML = `
                <div class="result-card recommendation-card">
                    <div class="recommendation-badge">Recommended</div>
                    <img src="${item.image}" class="result-img" alt="${item.title}">
                    <div class="result-body">
                        <span class="result-type ${item.type}">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        <h5 class="result-title">${item.title}</h5>
                        <div class="result-meta">
                            <div class="result-rating">
                                <i class="fas fa-star"></i> ${formatRating(item.rating)}
                            </div>
                            <div class="result-views">
                                <i class="fas fa-eye"></i> ${formatViews(item.views)}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            recommendationsContainer.appendChild(col);
        });
    }

    /**
     * Get personalized recommendations based on the user's watchlist
     * @returns {Array} Array of recommendation objects
     */
    function getRecommendationsForUser() {
        // Extract genres and types from user's watchlist
        const userGenres = userWatchlist.map(item => item.genre);
        const userTypes = userWatchlist.map(item => item.type);
        
        // Get watchlist IDs to exclude items already in watchlist
        const watchlistIds = userWatchlist.map(item => item.id);
        
        // Find items with similar genres or types, but not already in watchlist
        let recommendations = dummyData.filter(item => 
            (userGenres.includes(item.genre) || userTypes.includes(item.type)) && 
            !watchlistIds.includes(item.id)
        );
        
        // If we don't have enough recommendations based on watchlist, add some from top lists
        if (recommendations.length < 4) {
            // Get potential recommendations from top lists that aren't already in our recommendations
            const existingIds = recommendations.map(item => item.id);
            const potentialMovies = top10Movies.filter(item => 
                !watchlistIds.includes(item.id) && !existingIds.includes(item.id)
            );
            const potentialBooks = top10Books.filter(item => 
                !watchlistIds.includes(item.id) && !existingIds.includes(item.id)
            );
            const potentialMusic = top10Music.filter(item => 
                !watchlistIds.includes(item.id) && !existingIds.includes(item.id)
            );
            
            // Add recommendations until we have 4 or run out of options
            let i = 0;
            while (recommendations.length < 4) {
                // Add one from each category in rotation if available
                if (i < potentialMovies.length && !recommendations.some(r => r.id === potentialMovies[i].id)) {
                    recommendations.push(potentialMovies[i]);
                }
                if (recommendations.length < 4 && i < potentialBooks.length && !recommendations.some(r => r.id === potentialBooks[i].id)) {
                    recommendations.push(potentialBooks[i]);
                }
                if (recommendations.length < 4 && i < potentialMusic.length && !recommendations.some(r => r.id === potentialMusic[i].id)) {
                    recommendations.push(potentialMusic[i]);
                }
                
                i++;
                // Break if we've gone through all options
                if (i >= Math.max(potentialMovies.length, potentialBooks.length, potentialMusic.length)) {
                    break;
                }
            }
        }
        
        return recommendations;
    }

    /**
     * Format ratings for display
     * @param {number} rating - The rating to format
     * @returns {string} The formatted rating
     */
    function formatRating(rating) {
        return typeof rating === 'number' ? rating.toFixed(1) : rating;
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
            return (views / 1000).toFixed(1) + 'k';
        }
        return views.toString();
    }
});