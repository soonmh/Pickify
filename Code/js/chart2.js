const API_BASE_URL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', async function() {
    await loadEntertainmentData();
    
    initChart();
});

let entertainmentData = [];

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
            description:"A woman's silence after murdering her husband hides a dark truth waiting to be uncovered."
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
            description:"A sweeping account of human evolution, culture, and our species' impact on the world."
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
                            <button class="chart-save" aria-label="Save to favorites">
                                <i class="far fa-bookmark"></i>
                            </button>
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
        // Find the item in the current data
        const item = currentData.find(item => item.id == id);
        if (!item) {
            console.error('Item not found:', id);
            return;
        }

        // Construct the review page URL based on item type
        let reviewUrl;
        if (item.type === 'movies') {
            reviewUrl = `review.html?id=${item.tmdbId}&type=movie`;
        } else if (item.type === 'music') {
            reviewUrl = `review.html?id=${item.id}&type=music`;
        } else if (item.type === 'books') {
            reviewUrl = `review.html?id=${item.id}&type=book`;
        }

        if (reviewUrl) {
            window.location.href = reviewUrl;
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

    addMedalStyles();