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
        if (!collection || !collection.item) {
            return res.status(404).json({ error: 'Collection not found or empty' });
        }

        // const movieIds = collection.item.map(id => parseInt(id));
        // console.log(collection.item);

        const enrichedItems = [];

        for (const entry of collection.item) {
            let data = null;
            // const itemId = typeof entry.itemId === 'string' ? entry.itemId : entry.itemId.toString();

            if (entry.type === 'movie') {
                data = await db.collection('Movie')
                .findOne({ tmdbId: parseInt(entry.itemId) },
                    {
                        projection: {
                            title: 1,
                            poster_path: 1,
                            release_date: 1,
                            original_language: 1
                        }
                    }
                );
                const baseUrl = "https://image.tmdb.org/t/p/w342";
                if (data) {
                    data = {
                        title: data.title,
                        image: `${baseUrl}${data.poster_path}`,
                        release_date: data.release_date,
                        info: data.original_language
                    };
                }
            } else if (entry.type === 'book') {
                data = await db.collection('books')
                .findOne({ _id: entry.itemId },
                    {
                        projection: {
                            title: 1,
                            image: 1,
                            year: 1,
                            author: 1
                        }
                    }
                );
                if (data) {
                    data = {
                        title: data.title,
                        image: data.image,
                        release_date: data.year,
                        info: data.author
                    };
                }
            } else if (entry.type === 'music') {
                data = await db.collection('Music')
                .findOne({ id: entry.itemId },
                    {
                        projection: {
                            name: 1,
                            poster_url: 1,
                            release: 1,
                            duration_seconds: 1
                        }
                    }
                );
                if (data) {
                    data = {
                        title: data.name,
                        image: data.poster_url,
                        release_date: data.release,
                        info: `${data.duration_seconds}s`
                    };
                }
            }
            // console.log(entry.itemId);
            // console.log(data);

            if (data) {
                enrichedItems.push({
                    type: entry.type,
                    objId: entry.objId,
                    infomation: data
                });
            }
        }

        res.status(200).json({
            collectionName: collection.collectionName,
            description: collection.description,
            items: enrichedItems
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

// GET /api/movies/search/:query - Search movies
app.get('/api/movies/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Query must be at least 2 characters long'
            });
        }
        
        const searchRegex = new RegExp(query.trim(), 'i');
        const movies = await db.collection('Movie')
            .find({
                $or: [
                    { title: searchRegex },
                    { overview: searchRegex },
                    { 'genres.name': searchRegex }
                ]
            })
            .sort({ popularity: -1 })
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
        
        console.log(`🔍 Found ${movies.length} movies for "${query}"`);
        res.status(200).json({
            success: true,
            query: query,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        console.error('Error searching movies:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed'
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