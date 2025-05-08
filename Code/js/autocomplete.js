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
    
    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', handleSearchInput);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            autocompleteDropdown.style.display = 'none';
        }
    });
    
    function handleSearchInput(e) {
        const query = searchInput.value.toLowerCase().trim();
        
        // Clear dropdown
        autocompleteDropdown.innerHTML = '';
        
        // Hide dropdown if query is empty
        if (!query) {
            autocompleteDropdown.style.display = 'none';
            return;
        }
        
        // Find matching titles
        const matches = findMatches(query);
        
        // Show dropdown if matches found
        if (matches.length > 0) {
            renderMatches(matches);
            autocompleteDropdown.style.display = 'block';
        } else {
            autocompleteDropdown.style.display = 'none';
        }
    }
    
    function findMatches(query) {
        // Return all items that contain the query in their title
        return dummyData
            .filter(item => item.title.toLowerCase().includes(query))
            .slice(0, 6); // Limit to 6 results
    }
    
    function renderMatches(matches) {
        matches.forEach(item => {
            const matchElement = document.createElement('div');
            matchElement.className = 'autocomplete-item';
            
            // Get the item type icon
            const icon = getTypeIcon(item.type);
            
            // Highlight the matched part of the title
            const titleLower = item.title.toLowerCase();
            const queryLower = searchInput.value.toLowerCase();
            const index = titleLower.indexOf(queryLower);
            let titleHtml = item.title;
            
            if (index >= 0) {
                const matchedText = item.title.substring(index, index + queryLower.length);
                titleHtml = item.title.replace(
                    new RegExp(matchedText, 'i'), 
                    `<span class="highlight">${matchedText}</span>`
                );
            }
            
            matchElement.innerHTML = `
                <div class="autocomplete-icon ${item.type}">${icon}</div>
                <div class="autocomplete-title">${titleHtml}</div>
                <div class="autocomplete-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
            `;
            
            // Add click event to select this item
            matchElement.addEventListener('click', function() {
                searchInput.value = item.title;
                autocompleteDropdown.style.display = 'none';
                
                // Trigger search
                const searchButton = document.getElementById('search-button');
                if (searchButton) {
                    searchButton.click();
                }
            });
            
            autocompleteDropdown.appendChild(matchElement);
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