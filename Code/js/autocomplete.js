/**
 * Autocomplete functionality for search bar
 * Shows matching titles as dropdown while typing
 */


document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.querySelector('.search-input-container');
    
    // Create autocomplete dropdown container
    const autocompleteDropdown = document.createElement('div');
    autocompleteDropdown.className = 'autocomplete-dropdown';
    searchContainer.appendChild(autocompleteDropdown);
    
    // Debounce function to limit API calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Add event listeners
    searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    searchInput.addEventListener('focus', function() {
        if (searchInput.value.trim().length > 0) {
            handleSearchInput();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            autocompleteDropdown.style.display = 'none';
        }
    });
    
    function handleSearchInput() {
        const query = searchInput.value.trim();
        
        // Clear dropdown
        autocompleteDropdown.innerHTML = '';
        
        // Hide dropdown if query is empty
        if (!query) {
            autocompleteDropdown.style.display = 'none';
            return;
        }
        
        // Show loading indicator
        autocompleteDropdown.innerHTML = `
            <div class="autocomplete-loading">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span>Loading suggestions...</span>
            </div>
        `;
        autocompleteDropdown.style.display = 'block';
        
        // Fetch suggestions from API
        fetch(`${API_BASE_URL}/autocomplete?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                // Clear loading indicator
                autocompleteDropdown.innerHTML = '';
                
                if (data.suggestions && data.suggestions.length > 0) {
                    renderSuggestions(data.suggestions, query);
                    autocompleteDropdown.style.display = 'block';
                } else {
                    autocompleteDropdown.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching autocomplete suggestions:', error);
                autocompleteDropdown.style.display = 'none';
            });
    }
    
    function renderSuggestions(suggestions, query) {
        suggestions.forEach(item => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'autocomplete-item';
            
            // Get the item type icon
            const icon = getTypeIcon(item.type);
            
            // Highlight the matched part of the title
            const titleLower = item.title.toLowerCase();
            const queryLower = query.toLowerCase();
            const index = titleLower.indexOf(queryLower);
            let titleHtml = item.title;
            
            if (index >= 0) {
                const matchedText = item.title.substring(index, index + queryLower.length);
                titleHtml = item.title.replace(
                    new RegExp(matchedText, 'i'), 
                    `<span class="highlight">${matchedText}</span>`
                );
            }
            
            suggestionElement.innerHTML = `
                <div class="autocomplete-icon ${item.type}">${icon}</div>
                <div class="autocomplete-title">${titleHtml}</div>
                <div class="autocomplete-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
            `;
            
            // Add click event to select this item
            suggestionElement.addEventListener('click', function() {
                searchInput.value = item.title;
                autocompleteDropdown.style.display = 'none';
                
                // Trigger search
                const searchButton = document.getElementById('search-button');
                if (searchButton) {
                    searchButton.click();
                }
            });
            
            autocompleteDropdown.appendChild(suggestionElement);
        });
    }
    
    function getTypeIcon(type) {
        switch (type) {
            case 'book':
                return '<i class="fas fa-book"></i>';
            case 'movie':
                return '<i class="fas fa-film"></i>';
            case 'music':
                return '<i class="fas fa-music"></i>';
            default:
                return '<i class="fas fa-search"></i>';
        }
    }
});