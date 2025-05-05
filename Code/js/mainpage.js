// Combine all dummy data into one larger collection
const dummyData = [
    {
        id: 1,
        title: "The Midnight Library",
        type: "book",
        genre: "fantasy",
        rating: 4.8,
        views: 12400,
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
        director: "Christopher Nolan",
        year: 2010
    },
    // Adding more items from the top 10 lists to dummyData
    // Movies
    {
        id: 3,
        title: "The Dark Knight",
        type: "movie",
        genre: "action",
        rating: 4.9,
        views: 1500000,
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
        director: "Quentin Tarantino",
        year: 1994
    },
    // Music
    {
        id: 7,
        title: "Blinding Lights",
        type: "music",
        genre: "pop",
        rating: 4.9,
        views: 2000000,
        image: "./assests/movieposter.png",
        artist: "The Weeknd",
        year: 2019
    },
    {
        id: 8,
        title: "Shape of You",
        type: "music",
        genre: "pop",
        rating: 4.8,
        views: 1800000,
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
        image: "./assests/movieposter.png",
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
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchHistoryList = document.getElementById('search-history-list');
    const searchResultsContainer = document.getElementById('search-results-container'); 
    const recommendationsContainer = document.getElementById('recommendations-container');
    const top10MoviesContainer = document.getElementById('top10-movies');
    const top10MusicContainer = document.getElementById('top10-music');
    const top10BooksContainer = document.getElementById('top10-books');

    const moviesPrev = document.getElementById('movies-prev');
    const moviesNext = document.getElementById('movies-next');
    const musicPrev = document.getElementById('music-prev');
    const musicNext = document.getElementById('music-next');
    const booksPrev = document.getElementById('books-prev');
    const booksNext = document.getElementById('books-next');

    // Variables for pagination
    let currentPageMovies = 0;
    let currentPageMusic = 0;
    let currentPageBooks = 0;

    // Dummy Data for Top 10 Movies
    const top10Movies = [
        { id: 3, title: "The Dark Knight", image: "./assests/movieposter.png", rating: 4.9, views: "1.5M" },
        { id: 4, title: "Interstellar", image: "./assests/movieposter.png", rating: 4.7, views: "1.1M" },
        { id: 2, title: "Inception", image: "./assests/movieposter.png", rating: 4.7, views: "48.7K" },
        { id: 5, title: "Fight Club", image: "./assests/movieposter.png", rating: 4.8, views: "800K" },
        { id: 6, title: "Pulp Fiction", image: "./assests/movieposter.png", rating: 4.6, views: "900K" },
        { id: 14, title: "The Matrix", image: "./assests/movieposter.png", rating: 4.8, views: "1.0M" },
        { id: 15, title: "Forrest Gump", image: "./assests/movieposter.png", rating: 4.9, views: "1.3M" },
        { id: 16, title: "The Shawshank Redemption", image: "./assests/movieposter.png", rating: 4.9, views: "1.6M" },
        { id: 17, title: "The Godfather", image: "./assests/movieposter.png", rating: 4.9, views: "1.7M" },
        { id: 18, title: "Avengers: Endgame", image: "./assests/movieposter.png", rating: 4.7, views: "2.1M" },
    ];

    // Dummy Data for Top 10 Music
    const top10Music = [
        { id: 7, title: "Blinding Lights", image: "./assests/movieposter.png", rating: 4.9, views: "2.0M" },
        { id: 8, title: "Shape of You", image: "./assests/movieposter.png", rating: 4.8, views: "1.8M" },
        { id: 9, title: "Rolling in the Deep", image: "./assests/movieposter.png", rating: 4.7, views: "1.5M" },
        { id: 10, title: "Bohemian Rhapsody", image: "./assests/movieposter.png", rating: 4.9, views: "1.9M" },
        { id: 19, title: "Someone Like You", image: "./assests/movieposter.png", rating: 4.8, views: "1.6M" },
        { id: 20, title: "Let It Be", image: "./assests/movieposter.png", rating: 4.9, views: "1.7M" },
        { id: 21, title: "Bad Guy", image: "./assests/movieposter.png", rating: 4.6, views: "1.4M" },
        { id: 22, title: "Hotel California", image: "./assests/movieposter.png", rating: 4.9, views: "1.9M" },
        { id: 23, title: "Hey Jude", image: "./assests/movieposter.png", rating: 4.9, views: "2.0M" },
        { id: 24, title: "Stairway to Heaven", image: "./assests/movieposter.png", rating: 4.8, views: "1.8M" },
    ];

    // Dummy Data for Top 10 Books
    const top10Books = [
        { id: 1, title: "The Midnight Library", image: "./assests/movieposter.png", rating: 4.8, views: "12.4K" },
        { id: 11, title: "Atomic Habits", image: "./assests/movieposter.png", rating: 4.8, views: "600K" },
        { id: 12, title: "The Alchemist", image: "./assests/movieposter.png", rating: 4.9, views: "700K" },
        { id: 13, title: "1984", image: "./assests/movieposter.png", rating: 4.8, views: "650K" },
        { id: 25, title: "To Kill a Mockingbird", image: "./assests/movieposter.png", rating: 4.9, views: "800K" },
        { id: 26, title: "The Great Gatsby", image: "./assests/movieposter.png", rating: 4.6, views: "550K" },
        { id: 27, title: "The Catcher in the Rye", image: "./assests/movieposter.png", rating: 4.7, views: "500K" },
        { id: 28, title: "Sapiens", image: "./assests/movieposter.png", rating: 4.8, views: "700K" },
        { id: 29, title: "Harry Potter and the Sorcerer's Stone", image: "./assests/movieposter.png", rating: 4.9, views: "1.0M" },
        { id: 30, title: "Pride and Prejudice", image: "./assests/movieposter.png", rating: 4.8, views: "750K" },
    ];

    // Initialize the page
    renderPage(top10MoviesContainer, top10Movies, currentPageMovies);
    renderPage(top10MusicContainer, top10Music, currentPageMusic);
    renderPage(top10BooksContainer, top10Books, currentPageBooks);
    renderSearchHistory(); // Initialize search history
    renderRecommendations(); // Initialize recommendations

    // Add event listeners for search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    handleNavigation(moviesPrev, moviesNext, () => currentPageMovies, (newPage) => currentPageMovies = newPage, top10Movies, top10MoviesContainer);
    handleNavigation(musicPrev, musicNext, () => currentPageMusic, (newPage) => currentPageMusic = newPage, top10Music, top10MusicContainer);
    handleNavigation(booksPrev, booksNext, () => currentPageBooks, (newPage) => currentPageBooks = newPage, top10Books, top10BooksContainer);

    function renderPage(container, data, page) {
        container.innerHTML = '';
        const start = page * 4;
        const end = start + 4;
        const itemsToRender = data.slice(start, end);
        
        itemsToRender.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            
            // Calculate the actual position number based on the page and index
            const positionNumber = start + index + 1;
            
            // Create the badge class based on position
            const badgeClass = positionNumber <= 3 ? `no${positionNumber}` : '';
            
            // Add the badge HTML
            const badgeHTML = `<div class="numbered-badge ${badgeClass}">No ${positionNumber}</div>`;
            
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
            container.appendChild(card);
        });
    }

    function handleNavigation(buttonPrev, buttonNext, getPage, setPage, data, container) {
        buttonPrev.addEventListener('click', () => {
            const page = getPage();
            if (page > 0) {
                setPage(page - 1);
                renderPage(container, data, page - 1);
            }
        });

        buttonNext.addEventListener('click', () => {
            const page = getPage();
            if ((page + 1) * 4 < data.length) {
                setPage(page + 1);
                renderPage(container, data, page + 1);
            }
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

        // Filter search results based on query
        const filteredSearchResults = dummyData.filter(item =>
            item.title.toLowerCase().includes(query)
        );

        // Render the search results
        renderSearchResults(filteredSearchResults, query);
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
        renderSearchHistory();
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