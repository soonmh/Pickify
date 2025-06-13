const API_BASE_URL = 'http://localhost:3000/api';

// Genre options by entertainment type - Updated to match your actual data
const genresByType = {
    book: [
        {value: 'all', label: 'All Book Genres'},
        {value: 'Fiction', label: 'Fiction'},
        {value: 'Economics', label: 'Economics'},
        {value: 'Literary', label: 'Literary'},
        {value: 'Self-help', label: 'Self-help'},
        {value: 'Reference', label: 'Reference'},
        {value: 'Other', label: 'Other'},
        {value: 'Juvenile', label: 'Juvenile'},
        {value: 'Dating', label: 'Dating'},
        {value: 'Fantasy', label: 'Fantasy'},
        {value: 'Romance', label: 'Romance'}
    ],
    movie: [
        {value: 'all', label: 'All Movie Genres'},
        {value: 'Action', label: 'Action'},                    // Fixed: capitalized
        {value: 'Science Fiction', label: 'Science Fiction'},  // Fixed: full name
        {value: 'Drama', label: 'Drama'},                      // Fixed: capitalized
        {value: 'Thriller', label: 'Thriller'},                // Fixed: capitalized
        {value: 'Animation', label: 'Animation'},              // Fixed: capitalized
        {value: 'Comedy', label: 'Comedy'},                    // Fixed: capitalized
        {value: 'Horror', label: 'Horror'},                    // Fixed: capitalized
        {value: 'Romance', label: 'Romance'}                   // Fixed: capitalized
    ],
    music: [
        {value: 'all', label: 'All Music Genres'},
        {value: 'Pop', label: 'Pop'},
        {value: 'Rock', label: 'Rock'},
        {value: 'Hip hop', label: 'Hip-Hop'},                  // Fixed: actual value from your data
        {value: 'Jazz', label: 'Jazz'},
        {value: 'Classical', label: 'Classical'},
        {value: 'Lofi', label: 'Lo-Fi'}
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
    let currentData = [];
    let currentPage = 1;
    const itemsPerPage = 8;
    let currentFilters = {
        search: '',
        type: 'all',
        genre: 'all'
    };
    let currentSort = 'rating'; // Default sort
    let totalResults = 0;
    
    // If there's a query parameter in the URL, set it as the search input value
    // and apply search immediately
    if (queryFromURL) {
        searchInput.value = queryFromURL;
        currentFilters.search = queryFromURL;
        // Apply the search filter right away
        fetchSearchResults();
        initializeGenreDropdown();
    } else {
        // Show initial state with a message
        resultsContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <h4>Start searching for content</h4>
                <p>Use the search bar above to find movies, music, and books</p>
            </div>
        `;
        initializeGenreDropdown();
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
            fetchSearchResults();
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
        currentFilters.search = searchInput.value.trim();
        currentPage = 1;
        fetchSearchResults();
    }
    
    // Filter handler
    function handleFilters() {
        currentFilters.type = typeFilter.value;
        currentFilters.genre = genreFilter.value;
        currentPage = 1;
        fetchSearchResults();
    }
    
    // Fetch search results from API
    function fetchSearchResults() {
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="col-12 text-center my-5">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading results...</p>
            </div>
        `;
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        // Add search term if present
        if (currentFilters.search) {
            queryParams.append('query', currentFilters.search);
        }
        
        // Add type filter if not 'all'
        if (currentFilters.type !== 'all') {
            queryParams.append('type', currentFilters.type);
        }
        
        // Add genre filter if not 'all' and a specific type is selected
        if (currentFilters.type !== 'all' && currentFilters.genre !== 'all') {
            queryParams.append('genre', currentFilters.genre);
        }
        
        // Add sort parameter
        queryParams.append('sort', currentSort);
        
        // Add pagination parameters
        queryParams.append('page', currentPage);
        queryParams.append('limit', itemsPerPage);
        
        // Debug: Log the query being sent
        console.log('Search query params:', queryParams.toString());
        
        // Make the API call
        fetch(`${API_BASE_URL}/search?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Update state with fetched data
                    currentData = data.items;
                    totalResults = data.total;
                    
                    // Render the results
                    renderResults();
                    updateResultsCount();
                    renderPagination();
                } else {
                    throw new Error(data.error || 'Error fetching search results');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                resultsContainer.innerHTML = `
                    <div class="col-12 text-center my-5">
                        <h4>Error loading results</h4>
                        <p>Please try again later</p>
                    </div>
                `;
            });
    }
    
    // Render results - Updated to show genre information
    function renderResults() {
        resultsContainer.innerHTML = '';
        
        if (currentData.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col-12 text-center my-5">
                    <h4>No results found</h4>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        currentData.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col';
            col.setAttribute('data-id', item.id);
            
            // Determine additional info based on type
            let additionalInfo = '';
            if (item.type === 'book' && item.author) {
                additionalInfo = `<div class="result-author">by ${item.author}</div>`;
            } else if (item.type === 'movie' && item.director) {
                additionalInfo = `<div class="result-director">by ${item.director}</div>`;
            } else if (item.type === 'music' && item.artist) {
                additionalInfo = `<div class="result-artist">by ${item.artist}</div>`;
            }
            
            // Add genre display
            const genreDisplay = item.genre && item.genre !== 'unknown' ? item.genre : 'No Genre';
            
            col.innerHTML = `
                <div class="result-card">
                    <img src="${item.image}" class="result-img" alt="${item.title}" onerror="this.src='./assests/placeholder.png'">
                    <div class="result-body">
                        <span class="result-type ${item.type}">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        <h5 class="result-title">${item.title}</h5>
                        ${additionalInfo}
                        <div class="result-genre">
                            <i class="fas fa-tag"></i> ${genreDisplay}
                        </div>
                        <div class="result-meta">
                            <div class="result-rating">
                                <i class="fas fa-star"></i> ${typeof item.rating === 'number' ? item.rating.toFixed(1) : '0.0'}
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
                // Navigate to detail page based on content type
                let detailUrl;
                if (item.type === 'movie') {
                    detailUrl = `/movie-details.html?id=${item.tmdbId || item.id}`;
                } else if (item.type === 'music') {
                    detailUrl = `/music-details.html?id=${item.id}`;
                } else if (item.type === 'book') {
                    detailUrl = `/book-details.html?id=${item.id}`;
                }
                
                if (detailUrl) {
                    window.location.href = detailUrl;
                }
            });
            
            resultsContainer.appendChild(col);
        });
    }
    
    // Update results count
    function updateResultsCount() {
        resultsNumberSpan.textContent = totalResults;
    }
    
    // Render pagination
    function renderPagination() {
        const pageCount = Math.ceil(totalResults / itemsPerPage);
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;
        
        // Page numbers (show maximum 5 page numbers)
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(pageCount, startPage + maxPages - 1);
        
        // Adjust startPage if we're near the end
        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        // First page
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
            `;
            
            if (startPage > 2) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#">...</a>
                    </li>
                `;
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Last page
        if (endPage < pageCount) {
            if (endPage < pageCount - 1) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#">...</a>
                    </li>
                `;
            }
            
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${pageCount}">${pageCount}</a>
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
                if (this.parentElement.classList.contains('disabled')) {
                    return;
                }
                
                const pageNum = parseInt(this.getAttribute('data-page'));
                if (pageNum >= 1 && pageNum <= pageCount) {
                    currentPage = pageNum;
                    fetchSearchResults();
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
        if (!num) return '0';
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
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