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

// Function to create indexes
async function createIndexes() {
    if (!db) {
        console.error("Database connection not established. Cannot create indexes.");
        return;
    }

    try {
        const userCollection = db.collection('User');

        await userCollection.createIndex({ email: 1 }, { unique: true });
        console.log("Index on 'email' created/ensured.");

        await userCollection.createIndex({ name: 1 }, { unique: true });
        console.log("Index on 'name' created/ensured.");

        // Important: sparse: true for googleId means it won't index documents without this field.
        await userCollection.createIndex({ googleId: 1 }, { unique: true, sparse: true });
        console.log("Index on 'googleId' created/ensured.");

        console.log("All indexes created successfully!");
    } catch (error) {
        console.error("Error creating indexes:", error);
    }
}

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
        $or: [{ name: new RegExp(`^${username}$`, 'i') }, { email: new RegExp(`^${username}$`, 'i') }] // Case-insensitive for login
    });

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Handle password comparison only if the user has a password (i.e., not a Google-only user)
    if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect password' });
        }
    } else {
        // If the user has no password (e.g., Google user), and they are trying to log in with a password, it's an error.
        // Or you might want to prompt them to use Google login.
        return res.status(401).json({ success: false, error: 'This account uses Google Sign-In. Please log in with Google.' });
    }


    res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        user:{
            userId: user._id, // Ensure _id is returned for collections
            email: user.email,
            name: user.name
        }
    });
});

// ✅ MODIFIED: app.post('/User') to handle Google users (no password) and enforce uniqueness
app.post('/User', async (req, res) => {
    const user = req.body; // user will now contain { name, email, picture, googleId } OR { name, email, password }

    // Server-side duplicate check for email (case-insensitive)
    const existingEmailUser = await db.collection('User').findOne({ email: new RegExp(`^${user.email}$`, 'i') });
    if (existingEmailUser) {
        return res.status(409).json({ success: false, error: 'Email address already registered.' });
    }

    // Server-side duplicate check for username (case-insensitive)
    const existingUsernameUser = await db.collection('User').findOne({ name: new RegExp(`^${user.name}$`, 'i') });
    if (existingUsernameUser) {
        return res.status(409).json({ success: false, error: 'Username already taken.' });
    }

    // Hash password only if provided (for traditional signup)
    if (user.password) {
        const hashPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashPassword;
    } else {
        // If no password, ensure it's explicitly null or undefined, not stored as an empty string.
        user.password = null; // Mark as null for Google users
    }

    try {
        const result = await db.collection('User')
            .insertOne(user);
        res.status(201).json({ success: true, userId: result.insertedId });
    } catch (err) {
        console.error("Database insertion error:", err);
        // Catch E11000 duplicate key error if unique index is violated (as a fallback)
        if (err.code === 11000) {
            if (err.keyPattern.email) {
                return res.status(409).json({ success: false, error: 'Email address already registered.' });
            }
            if (err.keyPattern.name) {
                return res.status(409).json({ success: false, error: 'Username already taken.' });
            }
        }
        res.status(500).json({success: false, error: 'Failed to create user'})
    }
});

// ✅ NEW ENDPOINT: Handle Google Login (if user already exists via Google)
app.post('/googleLogin', async (req, res) => {
    const { email, googleId } = req.body;

    try {
        const user = await db.collection('User').findOne({ email: new RegExp(`^${email}$`, 'i'), googleId: googleId });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Google user not found. Please register.' });
        }

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            user: {
                userId: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture // Include picture if you store it
            }
        });
    } catch (err) {
        console.error('Error in Google login:', err);
        res.status(500).json({ success: false, error: 'Server error during Google login.' });
    }
});

app.get('/checkEmailAvailability', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required.' });
    }
    try {
        const existingUser = await db.collection('User').findOne({ email: new RegExp(`^${email}$`, 'i') }); // Case-insensitive check
        res.status(200).json({ isAvailable: !existingUser });
    } catch (err) {
        console.error('Error checking email availability:', err);
        res.status(500).json({ error: 'Server error checking email availability.' });
    }
});

// New endpoint to check username availability
app.get('/checkUsernameAvailability', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
    }
    try {
        const existingUser = await db.collection('User').findOne({ name: new RegExp(`^${username}$`, 'i') }); // Case-insensitive check
        res.status(200).json({ isAvailable: !existingUser });
    } catch (err) {
        console.error('Error checking username availability:', err);
        res.status(500).json({ error: 'Server error checking username availability.' });
    }
});

const verificationCodes = {}; 

app.post('/VerificationCode', async (req, res) => {
    const { userEmail } = req.body;
    const code = generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes

    verificationCodes[userEmail] = { code, expiry };
    console.log(`Generated code for ${userEmail}: ${code}`);

    try {
        await sendVerificationEmail(userEmail, code);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

app.post('/verifyCode', async (req, res) => {
    const { email, code } = req.body;
    const storedCodeData = verificationCodes[email];

    if (!storedCodeData) {
        return res.status(400).json({ success: false, error: 'No verification code found for this email. Please request a new one.' });
    }

    if (storedCodeData.expiry < new Date()) {
        delete verificationCodes[email]; // Remove expired code
        return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
    }

    if (storedCodeData.code !== code) {
        return res.status(400).json({ success: false, error: 'Invalid verification code.' });
    }

    // Code is valid and not expired, delete it after successful verification
    delete verificationCodes[email];
    res.status(200).json({ success: true, message: 'Email verified successfully!' });
});


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