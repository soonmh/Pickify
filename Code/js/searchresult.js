// Dummy data representing search results
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
        views: 67800,
        image: "./assests/movieposter.png",
        director: "Christopher Nolan",
        year: 2008
    },
    {
        id: 14,
        title: "Pink Floyd - The Dark Side of the Moon",
        type: "music",
        genre: "rock",
        rating: 5.0,
        views: 89400,
        image: "./assests/movieposter.png",
        artist: "Pink Floyd",
        year: 1973
    },
    {
        id: 15,
        title: "The Silent Patient",
        type: "book",
        genre: "thriller",
        rating: 4.6,
        views: 18700,
        image: "./assests/movieposter.png",
        author: "Alex Michaelides",
        year: 2019
    },
    {
        id: 16,
        title: "Pulp Fiction",
        type: "movie",
        genre: "drama",
        rating: 4.8,
        views: 58200,
        image: "./assests/movieposter.png",
        director: "Quentin Tarantino",
        year: 1994
    },
    {
        id: 17,
        title: "The Weeknd - After Hours",
        type: "music",
        genre: "r&b",
        rating: 4.7,
        views: 41500,
        image: "./assests/movieposter.png",
        artist: "The Weeknd",
        year: 2020
    },
    {
        id: 18,
        title: "Sapiens: A Brief History of Humankind",
        type: "book",
        genre: "non-fiction",
        rating: 4.7,
        views: 35600,
        image: "./assests/movieposter.png",
        author: "Yuval Noah Harari",
        year: 2011
    },
    {
        id: 19,
        title: "Spirited Away",
        type: "movie",
        genre: "animation",
        rating: 4.8,
        views: 42300,
        image: "./assests/movieposter.png",
        director: "Hayao Miyazaki",
        year: 2001
    },
    {
        id: 20,
        title: "Tyler, the Creator - IGOR",
        type: "music",
        genre: "hip-hop",
        rating: 4.6,
        views: 28900,
        image: "./assests/movieposter.png",
        artist: "Tyler, the Creator",
        year: 2019
    },
    {
        id: 21,
        title: "Where the Crawdads Sing",
        type: "book",
        genre: "fiction",
        rating: 4.5,
        views: 31200,
        image: "https://source.unsplash.com/random/300x200?book,nature",
        author: "Delia Owens",
        year: 2018
    },
    {
        id: 22,
        title: "Black Panther",
        type: "movie",
        genre: "action",
        rating: 4.7,
        views: 49600,
        image: "./assests/movieposter.png",
        director: "Ryan Coogler",
        year: 2018
    },
    {
        id: 23,
        title: "Adele - 30",
        type: "music",
        genre: "pop",
        rating: 4.8,
        views: 36700,
        image: "./assests/movieposter.png",
        artist: "Adele",
        year: 2021
    },
    {
        id: 24,
        title: "Atomic Habits",
        type: "book",
        genre: "self-help",
        rating: 4.8,
        views: 42800,
        image: "./assests/movieposter.png",
        author: "James Clear",
        year: 2018
    }
];

// Dummy user watchlist data (this would come from the backend in a real implementation)
const userWatchlist = [
    {
        id: 13,
        title: "The Dark Knight",
        type: "movie",
        genre: "action"
    },
    {
        id: 6,
        title: "Kendrick Lamar - To Pimp a Butterfly",
        type: "music",
        genre: "hip-hop"
    },
    {
        id: 15,
        title: "The Silent Patient",
        type: "book",
        genre: "thriller"
    }
];

// Genre options by entertainment type
const genresByType = {
    book: [
        {value: 'all', label: 'All Book Genres'},
        {value: 'fantasy', label: 'Fantasy'},
        {value: 'sci-fi', label: 'Science Fiction'},
        {value: 'thriller', label: 'Thriller'},
        {value: 'classic', label: 'Classic Literature'},
        {value: 'memoir', label: 'Memoir'},
        {value: 'non-fiction', label: 'Non-Fiction'},
        {value: 'fiction', label: 'Fiction'},
        {value: 'self-help', label: 'Self-Help'}
    ],
    movie: [
        {value: 'all', label: 'All Movie Genres'},
        {value: 'action', label: 'Action'},
        {value: 'sci-fi', label: 'Science Fiction'},
        {value: 'drama', label: 'Drama'},
        {value: 'thriller', label: 'Thriller'},
        {value: 'animation', label: 'Animation'},
        {value: 'comedy', label: 'Comedy'},
        {value: 'horror', label: 'Horror'},
        {value: 'romance', label: 'Romance'}
    ],
    music: [
        {value: 'all', label: 'All Music Genres'},
        {value: 'pop', label: 'Pop'},
        {value: 'rock', label: 'Rock'},
        {value: 'hip-hop', label: 'Hip-Hop'},
        {value: 'r&b', label: 'R&B'},
        {value: 'jazz', label: 'Jazz'},
        {value: 'classical', label: 'Classical'},
        {value: 'country', label: 'Country'},
        {value: 'electronic', label: 'Electronic'}
    ]
};

document.addEventListener('DOMContentLoaded', function() {

    const urlParams = new URLSearchParams(window.location.search);
    const queryFromURL = urlParams.get('query');

    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const typeFilter = document.getElementById('type-filter');
    const genreFilter = document.getElementById('genre-filter');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsNumberSpan = document.getElementById('results-number');
    const pagination = document.querySelector('.pagination');
    
    // State variables
    let currentData = [...dummyData];
    let currentPage = 1;
    const itemsPerPage = 8;
    let currentFilters = {
        search: '',
        type: 'all',
        genre: 'all'
    };
    let currentSort = 'rating'; // Default sort
    
    // If there's a query parameter in the URL, set it as the search input value
    // and apply search immediately
    if (queryFromURL) {
        searchInput.value = queryFromURL;
        currentFilters.search = queryFromURL.toLowerCase().trim();
        // Apply the search filter right away
        applyFiltersAndSort();
        initializeGenreDropdown()
    } else {
        renderResults();
        updateResultsCount();
        renderPagination();
    }
    
    
    // Initialize the genre dropdown (disabled by default)
    function initializeGenreDropdown() {
        // Initially, the genre filter should be disabled
        genreFilter.disabled = true;
        
        // Add a placeholder option
        genreFilter.innerHTML = '<option value="all">Please select a type first</option>';
        
        // Add a visual indicator that it's disabled
        genreFilter.classList.add('disabled-select');
    }
    
    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    typeFilter.addEventListener('change', function() {
        const selectedType = this.value;
        
        if (selectedType === 'all') {
            // If "All Types" is selected, disable the genre dropdown
            disableGenreDropdown();
            
            // Reset genre filter to "all"
            currentFilters.genre = 'all';
        } else {
            // Enable and update genre options for the selected type
            enableGenreDropdown(selectedType);
        }
        
        // Handle filters to update results
        handleFilters();
    });
    
    genreFilter.addEventListener('change', handleFilters);
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentSort = this.getAttribute('data-sort');
            currentPage = 1;
            applyFiltersAndSort();
        });
    });
    
    // Disable genre dropdown when no specific type is selected
    function disableGenreDropdown() {
        genreFilter.disabled = true;
        genreFilter.innerHTML = '<option value="all">Please select a type first</option>';
        genreFilter.classList.add('disabled-select');
    }
    
    // Enable genre dropdown and populate with options for the selected type
    function enableGenreDropdown(selectedType) {
        // Only enable if we have genre options for this type
        if (genresByType[selectedType]) {
            genreFilter.disabled = false;
            genreFilter.classList.remove('disabled-select');
            
            // Clear current options
            genreFilter.innerHTML = '';
            
            // Add new options based on selected type
            genresByType[selectedType].forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.value;
                option.textContent = genre.label;
                genreFilter.appendChild(option);
            });
            
            // Reset genre filter to "all"
            genreFilter.value = 'all';
            currentFilters.genre = 'all';
        }
    }
    
    // Search handler
    function handleSearch() {
        currentFilters.search = searchInput.value.toLowerCase().trim();
        currentPage = 1;
        applyFiltersAndSort();
    }
    
    // Filter handler
    function handleFilters() {
        currentFilters.type = typeFilter.value;
        currentFilters.genre = genreFilter.value;
        currentPage = 1;
        applyFiltersAndSort();
    }
    
    // Apply filters and sort
    function applyFiltersAndSort() {
        // Filter data
        let filteredData = dummyData.filter(item => {
            // Search filter
            if (currentFilters.search && !item.title.toLowerCase().includes(currentFilters.search)) {
                return false;
            }
            
            // Type filter
            if (currentFilters.type !== 'all' && item.type !== currentFilters.type) {
                return false;
            }
            
            // Genre filter (only apply if genre is not 'all' and we're filtering by a specific type)
            if (currentFilters.type !== 'all' && currentFilters.genre !== 'all' && item.genre !== currentFilters.genre) {
                return false;
            }
            
            return true;
        });
        
        // Sort data
        filteredData.sort((a, b) => {
            if (currentSort === 'rating') {
                return b.rating - a.rating;
            } else if (currentSort === 'views') {
                return b.views - a.views;
            }
            return 0;
        });
        
        currentData = filteredData;
        renderResults();
        updateResultsCount();
        renderPagination();
    }
    
    // Render results
    function renderResults() {
        resultsContainer.innerHTML = '';
        
        // Calculate pagination slicing
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = currentData.slice(startIndex, endIndex);
        
        if (paginatedData.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col-12 text-center my-5">
                    <h4>No results found</h4>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        paginatedData.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col';
            col.setAttribute('data-id', item.id);
            
            col.innerHTML = `
                <div class="result-card">
                    <img src="${item.image}" class="result-img" alt="${item.title}">
                    <div class="result-body">
                        <span class="result-type ${item.type}">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        <h5 class="result-title">${item.title}</h5>
                        <div class="result-meta">
                            <div class="result-rating">
                                <i class="fas fa-star"></i> ${item.rating.toFixed(1)}
                            </div>
                            <div class="result-views">
                                <i class="fas fa-eye"></i> ${formatNumber(item.views)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add click event to each card
            col.addEventListener('click', () => {
                // This will be replaced with actual navigation when backend is integrated
                alert(`You clicked on ${item.title}. In the final version, this will navigate to the detail page.`);
            });
            
            resultsContainer.appendChild(col);
        });
    }
    
    // Update results count
    function updateResultsCount() {
        resultsNumberSpan.textContent = currentData.length;
    }
    
    // Render pagination
    function renderPagination() {
        const pageCount = Math.ceil(currentData.length / itemsPerPage);
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= pageCount; i++) {
            paginationHTML += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === pageCount || pageCount === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Add event listeners to pagination links
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageNum = parseInt(this.getAttribute('data-page'));
                if (pageNum >= 1 && pageNum <= pageCount) {
                    currentPage = pageNum;
                    renderResults();
                    renderPagination();
                    // Scroll back to top of results
                    window.scrollTo({
                        top: document.querySelector('.search-container').offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Helper function to format numbers (e.g., 12000 -> 12k)
    function formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    }

    // Ensure pagination is visible after all dynamic content is loaded
    const paginationElement = document.querySelector('.pagination');
    if (paginationElement) {
        paginationElement.style.display = 'flex';
        paginationElement.style.visibility = 'visible';
        
        // Make each page item visible
        const pageItems = document.querySelectorAll('.page-item');
        pageItems.forEach(item => {
            item.style.display = 'inline-block';
            item.style.visibility = 'visible';
        });
    }
});