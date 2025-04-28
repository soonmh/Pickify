// JavaScript for the search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Make all result cards clickable
    const resultCards = document.querySelectorAll('.col[data-id]');
    resultCards.forEach(card => {
        card.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            // Redirect to detail page
            window.location.href = `item-details.html?id=${itemId}`;
        });
    });

    // Sort button toggling
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            sortButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real app, you would perform sorting here
            const sortBy = this.getAttribute('data-sort');
            console.log(`Sorting by: ${sortBy}`);
            // Then reload the results
        });
    });

    // Filter change event handlers
    const typeFilter = document.getElementById('type-filter');
    const genreFilter = document.getElementById('genre-filter');
    
    typeFilter.addEventListener('change', applyFilters);
    genreFilter.addEventListener('change', applyFilters);
    
    function applyFilters() {
        const type = typeFilter.value;
        const genre = genreFilter.value;
        console.log(`Filtering by type: ${type}, genre: ${genre}`);
        // In a real app, you would apply filters here and reload results
    }

    // Search button click handler
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            console.log(`Searching for: ${query}`);
            // In a real app, you would perform search here and reload results
        }
    }
});