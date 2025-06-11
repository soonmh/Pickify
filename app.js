require('dotenv').config()
const express = require('express')
const cors = require('cors');
const { connectToDb, getDb } = require('./db')
const app = express()
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds=10;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_APP_PASSWORD
    }
})
let db
app.use(cors());
app.use(express.json())

connectToDb((err) => {
    if(!err) {
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb()
    }
})

app.get('/User', (req, res) => {
    let users = []
    
    db.collection('User')
    .find()
    .forEach(user => users.push(user))
    .then(() => {
        res.status(200).json(users)
    })
    .catch(() => {
        res.status(500).json({error: 'Counld not fetch the documents'})
    })
      
});

app.post('/login', async (req, res) =>{
    const { username, password } = req.body;

    const user = await db.collection('User').findOne({
        $or: [{ name: username }, { email: username }]
    });

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
    }

    res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        user:{
            userId: user._id,
            email: user.email,
            name: user.name
        }
        
    });
});

app.post('/User', async (req, res) => {
    const user = req.body

    const hashPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashPassword;

    db.collection('User')
    .insertOne(user)
    .then(result => {
        res.status(201).json({ success: true, userId: result.insertedId });
    })
    .catch(err => {
        res.status(500).json({success: false, error: 'Failed to create user'})
    })
})

app.post('/VerificationCode', async (req,res) => {
    const {userEmail}=req.body;
    const code=generateVerificationCode();
    try{
        await sendVerificationEmail(userEmail,code);
        res.status(200).json({success: true, message: 'Email sent successfully'});
    }catch (error){
        console.error('Failed to send email:', error);
        res.status(500).json({success: false, error: 'Failed to send email'});
    }

})

function generateVerificationCode(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(to,code){
    const emailContent={
        from: process.env.EMAIL_NAME,
        to,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`
    }
    await transporter.sendMail(emailContent);
}

app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contactMessage = {
            name: name.trim(),
            email: email.trim(),
            subject: subject ? subject.trim() : '',
            message: message.trim(),
            date: new Date()
        };

        const result = await db.collection('messages').insertOne(contactMessage);

        if (result.acknowledged) {
            res.status(200).json({ 
                success: true, 
                message: 'Message sent successfully!' 
            });
        } else {
            throw new Error('Failed to insert message into database');
        }

    } catch (err) {
        console.error('Error saving contact message:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error. Please try again later.' 
        });
    }
});

app.post('/saveTracks', async (req, res) => {
    // console.log("Hello");
    // console.log('Received body:', req.body);
    const track = req.body;

    if (typeof track !== 'object' || track === null) {
        return res.status(400).json({ error: 'Invalid data format, expected an object' });
    }

    try {
        const result = await db.collection('Music').insertOne(track);
        res.json({
            message: 'Track saved successfully',
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error('DB insert error:', error);
        res.status(500).json({ error: 'Failed to save track' });
    }
});

app.get('/collectionNameList', async (req, res) => {

    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId or collectionName' });
    }
    // console.log(userId);

    db.collection('userCollection').find(
        { userId: new ObjectId(userId) }, { projection: { collectionName: 1, _id: 0} }
    ).toArray()
    .then(collections => {
        const allCollectionName = collections.map(col => col.collectionName);
        res.status(200).json(allCollectionName)
    })
    .catch(() => {
        res.status(500).json({error: 'Counld not fetch the documents'})
    })

});

app.get('/userCollection', async (req, res) => {
    try {
        const { userId, collectionName } = req.query;
        if (!userId || !collectionName) {
            return res.status(400).json({ error: 'Missing userId or collectionName' });
        }
        // console.log(userId);
        // console.log(collectionName);
        const collection = await db.collection('userCollection').findOne(
            { 
                userId: new ObjectId(userId),
                collectionName: collectionName
            },
            { projection: { item: 1, collectionName: 1, description: 1 } }
        );
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // const movieIds = collection.item.map(id => parseInt(id));
        // console.log(collection.item);

        const movieDetails = await db.collection('Movie')
        .find({tmdbId: {$in: collection.item}})
        .toArray();
        // console.log(movieDetails);
        res.status(200).json({
            collectionName: collection.collectionName,
            description: collection.description,
            movies: movieDetails
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/createCollection', async (req, res) => {
    const { userId, collectionName, collectionDescription } = req.body;

    const collection = {
        userId: new ObjectId(userId),
        collectionName: collectionName,
        description: collectionDescription,
        item: []
    };

    await db.collection('userCollection').insertOne(collection);
    res.json({ success: true });
});

// GET /api/recommendation/:userId - Get personalized recommendations
app.get('/api/recommendation/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);
        
        console.log(`🎯 Fetching recommendations for user: ${userId}`);
        
        // Convert userId string to ObjectId
        let userObjectId;
        try {
            userObjectId = new ObjectId(userId);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
        }

        // 1. Get user's collections to understand preferences
        const userCollections = await db.collection('userCollection')
            .find({ userId: userObjectId, collectionName: 'Favourite' })
            .toArray();

        if (!userCollections || userCollections.length === 0) {
            console.log('👤 User has no collections, returning empty state');
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'no_collections',
                message: 'No collections found. Create a collection and add movies to get personalized recommendations!'
            });
        }

        // 2. Extract all movie IDs from the "Favourite" collection
        const userMovieIds = userCollections[0].item.map(id => 
            typeof id === 'string' ? new ObjectId(id) : id
        );

        if (userMovieIds.length === 0) {
            console.log('📭 User collections are empty, returning empty state');
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'empty_collections',
                message: 'Your collections are empty. Add some movies to your watchlist to get personalized recommendations!'
            });
        }
        
        // 3. Get details of user's movies to analyze preferences
        const userMovies = await db.collection('Movie')
            .find({ _id: { $in: userMovieIds } })
            .toArray();
        console.log(`👥 User has ${userMovieIds.length} movies in their collections`);
        console.log('🎥 User movie IDs:', userMovieIds);
        console.log(`📊 Found ${userMovies.length} movies in user's collections`);

        // If no movies found in database (invalid movie IDs)
        if (userMovies.length === 0) {
            console.log('🔍 No valid movies found in database for user collections');
            return res.status(200).json({
    success: true,
    count: 0,
    data: [],
    type: 'invalid_movies',
    message: `No valid movies found in your collections. You have ${userMovieIds.length} movie IDs in your collections, but none matched our database. Try adding movies to get recommendations!`
});
        }

        // Need at least 2 movies for meaningful recommendations
        if (userMovies.length < 2) {
            console.log('📝 User has too few movies for personalized recommendations');
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'insufficient_data',
                message: `You have only ${userMovies.length} movie in your collections. Add more movies to get better personalized recommendations!`
            });
        }

        // 4. Analyze user preferences (genres)
        const genreCounts = {};
        const totalGenres = userMovies.reduce((total, movie) => {
            if (movie.genres && Array.isArray(movie.genres)) {
                movie.genres.forEach(genre => {
                    if (genre.name) {
                        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
                        total++;
                    }
                });
            }
            return total;
        }, 0);

        // Get top genres (at least 20% preference)
        const minThreshold = Math.max(1, Math.ceil(totalGenres * 0.2));
        const preferredGenres = Object.entries(genreCounts)
            .filter(([genre, count]) => count >= minThreshold)
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre);

        console.log('🎭 User preferred genres:', preferredGenres);
        console.log('📈 Genre counts:', genreCounts);

        // 5. Find recommendations based on preferred genres
        let recommendations = [];
        
        if (preferredGenres.length > 0) {
            // Find movies with similar genres, excluding ones user already has
            recommendations = await db.collection('Movie')
                .find({
                    tmdbId: { $nin: userMovieIds }, // Exclude movies user already has
                    vote_average: { $gte: 3.5 }, // Only well-rated movies
                    'genres.name': { $in: preferredGenres } // Match preferred genres
                })
                .sort({ vote_average: -1, popularity: -1 }) // Sort by rating and popularity
                .limit(limit * 2) // Get more to shuffle from
                .project({
                    tmdbId: 1,
                    title: 1,
                    poster_path: 1,
                    vote_average: 1,
                    popularity: 1,
                    genres: 1,
                    release_date: 1,
                    overview: 1
                })
                .toArray();
        }

        // 6. If still not enough recommendations, add popular movies
        if (recommendations.length < limit) {
            const additionalRecs = await db.collection('Movie')
                .find({
                    tmdbId: { $nin: userMovieIds },
                    vote_average: { $gte: 4.0 }
                })
                .sort({ popularity: -1 })
                .limit(limit - recommendations.length)
                .project({
                    tmdbId: 1,
                    title: 1,
                    poster_path: 1,
                    vote_average: 1,
                    popularity: 1,
                    genres: 1,
                    release_date: 1
                })
                .toArray();
            
            recommendations.push(...additionalRecs);
        }

        // 7. If still no recommendations found, return empty state
        if (recommendations.length === 0) {
            console.log('🎬 No suitable recommendations found based on user preferences');
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'no_matches',
                message: 'No recommendations found based on your preferences. Try adding movies from different genres!'
            });
        }

        // 8. Shuffle and limit final results
        const shuffled = recommendations
            .sort(() => 0.5 - Math.random())
            .slice(0, limit);

        console.log(`✅ Generated ${shuffled.length} personalized recommendations`);

        res.status(200).json({
            success: true,
            count: shuffled.length,
            data: shuffled,
            type: 'personalized',
            userPreferences: {
                totalMoviesInCollections: userMovies.length,
                preferredGenres: preferredGenres,
                genreCounts: genreCounts
            },
            message: `Recommendations based on your ${userMovies.length} favorite movies`
        });

    } catch (error) {
        console.error('❌ Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
});
// GET /api/movies/top/:limit - Get top movies by popularity
app.get('/api/movies/top', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        console.log(`📊 Fetching top ${limit} movies by popularity...`);

        // Fetch movies sorted by popularity
        const movies = await db.collection('Movie')
            .find({})
            .sort({ popularity: -1 }) // Sort descending by popularity
            .limit(limit)
            .project({
                tmdbId: 1,
                title: 1,
                poster_path: 1,
                vote_average: 1,
                popularity: 1,
                vote_count: 1,
                genres: 1,
                release_date: 1,
                overview: 1
            })
            .toArray();

        console.log(`✅ Fetched ${movies.length} movies.`);
        return res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        console.error('❌ Error fetching top movies:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch top movies'
        });
    }
});

// GET /api/music/top - Get top 10 music by popularity
app.get('/api/music/top', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Default limit to 10, max 50
        console.log(`🎵 Fetching top ${limit} music by popularity...`);

        const music = await db.collection('Music')
            .find({})
            .sort({ popularity: -1 }) // Sort descending by popularity
            .limit(limit)
            .project({
                id: 1,
                name: 1,
                artists: 1,
                album: 1,
                release: 1,
                duration_seconds: 1,
                popularity: 1,
                explicit: 1,
                spotify_url: 1,
                poster_url: 1,
                genre: 1
            })
            .toArray();

        console.log(`✅ Fetched ${music.length} music items.`);
        return res.status(200).json({
            success: true,
            count: music.length,
            data: music
        });
    } catch (error) {
        console.error('❌ Error fetching top music:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch top music'
        });
    }
});

// GET /api/books/top - Get top 10 books by views
app.get('/api/books/top', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Default limit to 10, max 50
        console.log(`📚 Fetching top ${limit} books by views...`);

        const books = await db.collection('books')
            .find({})
            .sort({ views: -1 }) // Sort descending by views
            .limit(limit)
            .project({
                title: 1,
                genre: 1,
                rating: 1,
                views: 1,
                image: 1,
                author: 1,
                year: 1,
                description: 1
            })
            .toArray();

        console.log(`✅ Fetched ${books.length} books.`);
        return res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('❌ Error fetching top books:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch top books'
        });
    }
});

// GET /api/health - Health check for frontend
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Pickify Backend is running!',
        database: db ? 'Connected' : 'Disconnected'
    });
});

// Enhanced search API with better debugging - replace your existing search API
app.get('/api/search', async (req, res) => {
    try {
        const { query, type, genre, sort = 'rating', page = 1, limit = 8 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        console.log(`[${new Date().toISOString()}] 🔍 Search Request:`);
        console.log(`  Query: "${query}"`);
        console.log(`  Type: ${type}`);
        console.log(`  Genre: ${genre}`);
        console.log(`  Sort: ${sort}`);
        console.log(`  Page: ${pageNum}, Limit: ${limitNum}`);
        
        // Initialize results array and total count
        let results = [];
        let total = 0;
        
        // Define sort options
        const sortOptions = {
            rating: { 'vote_average': -1, 'rating': -1 },
            views: { 'popularity': -1, 'views': -1 }
        };
        
        // Build base filters
        const buildFilter = (queryText, contentType, genreFilter) => {
            const filter = {};
            
            // Add title search if query provided
            if (queryText && queryText.trim() !== '') {
                // Create case-insensitive regex for title search
                const titleRegex = new RegExp(queryText, 'i');
                
                // For movies
                if (contentType === 'all' || contentType === 'movie') {
                    filter.title = titleRegex;
                }
                // For music
                else if (contentType === 'music') {
                    filter.name = titleRegex;
                }
                // For books
                else if (contentType === 'book') {
                    filter.title = titleRegex;
                }
            }
            
            // Add genre filter if provided and not 'all'
            if (genreFilter && genreFilter !== 'all') {
                if (contentType === 'movie') {
                    // Use dot notation to filter on nested genre name in the array
                    filter['genres.name'] = genreFilter;
                    console.log(`  Movie genre filter: genres.name = "${genreFilter}"`);
                } else {
                    filter.genre = genreFilter;
                    console.log(`  ${contentType} genre filter: genre = "${genreFilter}"`);
                }
            }
            
            return filter;
        };
        
        // 1. Search based on content type
        if (type === 'all' || !type) {
            // Search in all collections
            
            // 1a. Search movies
            const movieFilter = buildFilter(query, 'movie', genre);
            console.log(`  Movie filter:`, JSON.stringify(movieFilter));
            
            const movies = await db.collection('Movie')
                .find(movieFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${movies.length} movies`);
                
            // Transform movie data to match our unified format
            const formattedMovies = movies.map(movie => {
                // Extract primary genre (first in the list) or default to 'unknown'
                const primaryGenre = movie.genres && movie.genres.length > 0 && movie.genres[0].name 
                    ? movie.genres[0].name 
                    : 'unknown';
                    
                // Get all genre names for display in details if needed
                const allGenres = movie.genres 
                    ? movie.genres.map(g => g.name).join(', ')
                    : 'unknown';
                
                return {
                    id: movie._id,
                    tmdbId: movie.tmdbId,
                    title: movie.title,
                    type: 'movie',
                    genre: primaryGenre,
                    allGenres: allGenres,
                    rating: movie.vote_average/2 || 0,
                    views: formatViews(movie.popularity ? Math.round(movie.popularity * 1000) : Math.floor(Math.random() * 1000000)) || 0,
                    image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './assests/movieposter.png',
                    director: movie.director || 'Unknown',
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
                    overview: movie.overview,
                    lastUpdated: movie.lastUpdated,
                    updatedBy: movie.updatedBy
                };
            });
            
            // 1b. Search music
            const musicFilter = buildFilter(query, 'music', genre);
            console.log(`  Music filter:`, JSON.stringify(musicFilter));
            
            const music = await db.collection('Music')
                .find(musicFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${music.length} music tracks`);
                
            // Transform music data
            const formattedMusic = music.map(track => ({
                id: track._id,
                title: track.name,
                type: 'music',
                genre: track.genre || 'unknown',
                rating: track.popularity ? track.popularity / 20 : 4.5, // Convert popularity to 5-star scale
                views: track.popularity * 10000 || 1000, // Create views from popularity
                image: track.poster_url || './assests/musicposter.png',
                artist: track.artists ? track.artists.join(', ') : 'Unknown',
                year: track.release ? new Date(track.release).getFullYear() : 'Unknown'
            }));
            
            // 1c. Search books
            const bookFilter = buildFilter(query, 'book', genre);
            console.log(`  Book filter:`, JSON.stringify(bookFilter));
            
            const books = await db.collection('books')
                .find(bookFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${books.length} books`);
                
            // Transform book data
            const formattedBooks = books.map(book => ({
                id: book._id,
                title: book.title,
                type: 'book',
                genre: book.genre || 'unknown',
                rating: book.rating || 4.5,
                views: book.views || 5000,
                image: book.image ,
                author: book.author || 'Unknown',
                year: book.year || 'Unknown',
                description: book.description
            }));
            
            // Combine all results
            results = [...formattedMovies, ...formattedMusic, ...formattedBooks];
            
        } else if (type === 'movie') {
            // Search only in movies
            const movieFilter = buildFilter(query, 'movie', genre);
            console.log(`  Movie-only filter:`, JSON.stringify(movieFilter));
            
            const movies = await db.collection('Movie')
                .find(movieFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${movies.length} movies`);
                
            results = movies.map(movie => {
                // Extract primary genre (first in the list) or default to 'unknown'
                const primaryGenre = movie.genres && movie.genres.length > 0 && movie.genres[0].name 
                    ? movie.genres[0].name 
                    : 'unknown';
                    
                // Get all genre names for display in details if needed
                const allGenres = movie.genres 
                    ? movie.genres.map(g => g.name).join(', ')
                    : 'unknown';
                
                return {
                    id: movie._id,
                    tmdbId: movie.tmdbId,
                    title: movie.title,
                    type: 'movie',
                    genre: primaryGenre,
                    allGenres: allGenres,
                    rating: movie.vote_average/2 || 0,
                    views: formatViews(movie.popularity ? Math.round(movie.popularity * 1000) : Math.floor(Math.random() * 1000000)) || 0,
                    image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './assests/movieposter.png',
                    director: movie.director || 'Unknown',
                    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
                    overview: movie.overview,
                    lastUpdated: movie.lastUpdated,
                    updatedBy: movie.updatedBy
                };
            });
            
        } else if (type === 'music') {
            // Search only in music
            const musicFilter = buildFilter(query, 'music', genre);
            console.log(`  Music-only filter:`, JSON.stringify(musicFilter));
            
            const music = await db.collection('Music')
                .find(musicFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${music.length} music tracks`);
                
            results = music.map(track => ({
                id: track._id,
                title: track.name,
                type: 'music',
                genre: track.genre || 'unknown',
                rating: track.popularity ? track.popularity / 20 : 4.5,
                views: track.popularity * 10000 || 1000,
                image: track.poster_url || './assests/musicposter.png',
                artist: track.artists ? track.artists.join(', ') : 'Unknown',
                year: track.release ? new Date(track.release).getFullYear() : 'Unknown'
            }));
            
        } else if (type === 'book') {
            // Search only in books
            const bookFilter = buildFilter(query, 'book', genre);
            console.log(`  Book-only filter:`, JSON.stringify(bookFilter));
            
            const books = await db.collection('books')
                .find(bookFilter)
                .sort(sortOptions[sort])
                .toArray();
                
            console.log(`  Found ${books.length} books`);
                
            results = books.map(book => ({
                id: book._id,
                title: book.title,
                type: 'book',
                genre: book.genre || 'unknown',
                rating: book.rating || 4.5,
                views: book.views || 5000,
                image: book.image || './assests/bookposter.png',
                author: book.author || 'Unknown',
                year: book.year || 'Unknown',
                description: book.description
            }));
        }
        
        // Sort combined results
        if (sort === 'rating') {
            results.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'views') {
            results.sort((a, b) => b.views - a.views);
        }
        
        // Get total count
        total = results.length;
        
        // Apply pagination after sorting
        const paginatedResults = results.slice(skip, skip + limitNum);
        
        console.log(`[${new Date().toISOString()}] ✅ Search completed:`);
        console.log(`  Total results: ${total}`);
        console.log(`  Returned: ${paginatedResults.length} items (page ${pageNum})`);
        console.log(`  Sample genres:`, paginatedResults.slice(0, 3).map(r => `${r.title}: ${r.genre}`));
        
        return res.status(200).json({
            success: true,
            total: total,
            items: paginatedResults,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Search error:`, error);
        return res.status(500).json({
            success: false,
            error: 'Failed to search content'
        });
    }
});

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

// GET /api/autocomplete - Endpoint for search suggestions
app.get('/api/autocomplete', async (req, res) => {
    try {
        const { query } = req.query;
        const limit = 6; // Limit to 6 suggestions
        
        if (!query || query.trim() === '') {
            return res.json({ suggestions: [] });
        }
        
        console.log(`🔍 Getting autocomplete suggestions for "${query}"`);
        
        // Create case-insensitive regex for search
        const searchRegex = new RegExp(query, 'i');
        
        // Search in all collections concurrently
        const [movies, music, books] = await Promise.all([
            // Search movies by title
            db.collection('Movie')
                .find({ title: searchRegex })
                .limit(limit)
                .project({ title: 1, poster_path: 1, vote_average: 1 })
                .toArray(),
                
            // Search music by name
            db.collection('Music')
                .find({ name: searchRegex })
                .limit(limit)
                .project({ name: 1, artists: 1, poster_url: 1 })
                .toArray(),
                
            // Search books by title
            db.collection('books')
                .find({ title: searchRegex })
                .limit(limit)
                .project({ title: 1, author: 1, image: 1 })
                .toArray()
        ]);
        
        // Format results to a common structure
        const movieSuggestions = movies.map(movie => ({
            id: movie._id,
            title: movie.title,
            type: 'movie',
            image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './assests/movieposter.png'
        }));
        
        const musicSuggestions = music.map(track => ({
            id: track._id,
            title: track.name,
            type: 'music',
            image: track.poster_url || './assests/musicposter.png'
        }));
        
        const bookSuggestions = books.map(book => ({
            id: book._id,
            title: book.title,
            type: 'book',
            image: book.image || './assests/bookposter.png'
        }));
        
        // Combine and limit results
        const allSuggestions = [...movieSuggestions, ...musicSuggestions, ...bookSuggestions]
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, limit);
            
        console.log(`✅ Found ${allSuggestions.length} suggestions`);
        
        res.json({ suggestions: allSuggestions });
        
    } catch (error) {
        console.error('❌ Autocomplete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get suggestions'
        });
    }
});