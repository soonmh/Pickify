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

app.delete('/deleteCollection', async (req, res) => {
    const { userId, currentCollectionName } = req.query;
    // console.log(userId);
    // console.log(currentCollectionName);
    try {
        const result = await db.collection('userCollection').deleteOne({
            userId: new ObjectId(userId),
            collectionName: currentCollectionName
        });

        if (result.deletedCount === 1) {
            res.json({ success: true, message: 'Collection deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Collection not found.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting collection.', error });
    }
});

app.delete('/editCollection', async (req, res) => {
    const { userId, currentCollectionName, nameTextAreaValue, descriptionTextAreaValue, listToRemove} = req.query;
    // console.log(userId);
    // console.log(currentCollectionName);
    try {
        const objectIdArray = JSON.parse(listToRemove).map(id => new ObjectId(id));
        // console.log(parsedListToRemove)
        let filter = {
            userId: new ObjectId(userId),
            collectionName: currentCollectionName
        };

        const updateOps = {
            $set: {
                collectionName: nameTextAreaValue,
                description: descriptionTextAreaValue
            }
        };

        const updateResult = await db.collection('userCollection').updateOne(filter, updateOps);

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Collection not found.' });
        }

        filter = {
            userId: new ObjectId(userId),
            collectionName: nameTextAreaValue
        };

        if (Array.isArray(objectIdArray) && objectIdArray.length > 0) {
            // console.log(objectIdArray)
            await db.collection('userCollection').updateOne(
                filter,
                {
                    $pull: {
                        item: {
                            objId: { $in: objectIdArray }
                        }
                    }
                }
            );
        }

        res.json({ success: true, message: 'Collection updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error editing collection.', error });
    }
});

app.post('/addToCollection', async (req, res) => {
    const { userId, collectionName, itemId, type } = req.query;

    if (!userId || !collectionName || !itemId || !type) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    try {
        let finalItemId = itemId;
        if (type === 'book') {
            try {
                finalItemId = new ObjectId(itemId);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid ObjectId for book type.' });
            }
        }

        const filter = {
            userId: new ObjectId(userId),
            collectionName: collectionName
        };

        const collection = await db.collection('userCollection').findOne(filter);
        if (!collection) {
            return res.status(404).json({ success: false, message: 'Collection not found.' });
        }
        
        const isDuplicate = collection.item.some(entry => 
            entry.itemId?.toString() === finalItemId.toString()
        );

        if (isDuplicate) {
            return res.status(400).json({ success: false, message: 'Item already exists in the collection.' });
        }
        const update = {
            $push: {
                item: {
                    objId: new ObjectId(),
                    itemId: finalItemId,
                    type: type
                }
            }
        };

        const result = await db.collection('userCollection').updateOne(filter, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Collection not found.' });
        }

        res.json({ success: true, message: 'Item added successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error adding item.', error });
    }
});

// GET /api/recommendation/:userId - Get personalized recommendations
app.get('/api/recommendation/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);

        console.log(`🎯 Fetching recommendations for user: ${userId}`);

        // Validate userId
        let userObjectId;
        try {
            userObjectId = new ObjectId(userId);
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid user ID format' });
        }

        // 1. Fetch user's favorite collection
        const userFavorites = await db.collection('userCollection')
            .findOne({ userId: userObjectId, collectionName: 'Favourite' });

        if (!userFavorites || !userFavorites.item || userFavorites.item.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'no_collections',
                message: 'No favorite items found. Add movies, music, or books to get recommendations!'
            });
        }

        // 2. Separate item IDs by type
        const movieIds = [];
        const musicIds = [];
        const bookIds = [];

        userFavorites.item.forEach(item => {
            if (item.type === 'movie' && typeof item.itemId === 'string') {
                movieIds.push(item.itemId);
            } else if (item.type === 'music' && typeof item.itemId === 'string') {
                musicIds.push(item.itemId);
            } else if (item.type === 'book' && item.itemId?.$oid) {
                bookIds.push(new ObjectId(item.itemId.$oid));
            } else {
                console.warn(`⚠️ Skipping invalid item:`, item);
            }
        });

        console.log('🎥 Movie IDs:', movieIds);
        console.log('🎵 Music IDs:', musicIds);
        console.log('📚 Book IDs:', bookIds);

        // 3. Fetch item details from respective collections (FIXED QUERIES)
        const [movies, music, books] = await Promise.all([
            movieIds.length > 0 ? db.collection('Movie').find({ tmdbId: { $in: movieIds.map(id => parseInt(id)) } }).toArray() : [],
            musicIds.length > 0 ? db.collection('Music').find({ id: { $in: musicIds } }).toArray() : [],
            bookIds.length > 0 ? db.collection('books').find({ _id: { $in: bookIds } }).toArray() : []
        ]);

        console.log('🎬 Fetched Movies:', movies.length);
        console.log('🎵 Fetched Music:', music.length);
        console.log('📚 Fetched Books:', books.length);

        // Add type information to fetched items since it's not in the documents
        const moviesWithType = movies.map(item => ({ ...item, type: 'movie' }));
        const musicWithType = music.map(item => ({ ...item, type: 'music' }));
        const booksWithType = books.map(item => ({ ...item, type: 'book' }));

        const allUserItems = [...moviesWithType, ...musicWithType, ...booksWithType];

        if (!allUserItems.length) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                type: 'invalid_items',
                message: 'No valid items found in your collections. Try adding more items to get recommendations!'
            });
        }

        // 4. Analyze user preferences (UPDATED FOR DIFFERENT STRUCTURES)
        const genreCounts = {};
        const typeCounts = { movie: 0, music: 0, book: 0 };

        allUserItems.forEach(item => {
            // Handle different genre structures
            if (item.type === 'movie' && item.genres && Array.isArray(item.genres)) {
                // Movies: genres as array of objects
                item.genres.forEach(genre => {
                    genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
                });
            } else if (item.type === 'music' && item.genre) {
                // Music: genre as single string
                genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
            } else if (item.type === 'book' && item.genre) {
                // Books: genre as single string
                genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
            }

            // Count types
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });

        console.log('📈 Genre Counts:', genreCounts);
        console.log('📊 Type Counts:', typeCounts);

        // Determine preferred genres and types
        const preferredGenres = Object.entries(genreCounts)
            .filter(([_, count]) => count >= 1) // Changed from > 1 to >= 1 for more recommendations
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre);

        const preferredTypes = Object.entries(typeCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([type]) => type);

        console.log('🎭 User preferred genres:', preferredGenres);
        console.log('📊 User preferred types:', preferredTypes);

        // 5. Fetch recommendations (UPDATED QUERIES FOR DIFFERENT STRUCTURES)
        const recommendations = [];

        for (const type of preferredTypes) {
            let collectionName, query, excludeField;
            
            if (type === 'movie') {
                collectionName = 'Movie';
                excludeField = 'tmdbId';
                query = {
                    tmdbId: { $nin: movieIds.map(id => parseInt(id)) },
                    $or: [
                        { 'genres.name': { $in: preferredGenres } },
                        { vote_average: { $gte: 6.0 } } // Fallback for highly rated
                    ]
                };
            } else if (type === 'music') {
                collectionName = 'Music';
                excludeField = 'id';
                query = {
                    id: { $nin: musicIds },
                    $or: [
                        { genre: { $in: preferredGenres } },
                        { popularity: { $gte: 40 } } // Fallback for popular music
                    ]
                };
            } else if (type === 'book') {
                collectionName = 'books';
                excludeField = '_id';
                query = {
                    _id: { $nin: bookIds },
                    $or: [
                        { genre: { $in: preferredGenres } },
                        { rating: { $gte: 4 } } // Fallback for highly rated books
                    ]
                };
            }

            if (collectionName) {
                console.log(`🔍 Querying ${collectionName} with:`, JSON.stringify(query, null, 2));
                
                const typeRecommendations = await db.collection(collectionName)
                    .find(query)
                    .sort({ 
                        ...(type === 'movie' && { vote_average: -1, popularity: -1 }),
                        ...(type === 'music' && { popularity: -1 }),
                        ...(type === 'book' && { rating: -1, views: -1 })
                    })
                    .limit(Math.ceil(limit / preferredTypes.length))
                    .toArray();

                console.log(`✅ Found ${typeRecommendations.length} ${type} recommendations`);
                
                // Add type information to recommendations
                recommendations.push(...typeRecommendations.map(item => ({ ...item, type })));
            }
        }

        // 6. Shuffle and limit recommendations
        const shuffled = recommendations.sort(() => 0.5 - Math.random()).slice(0, limit);

        console.log(`✅ Generated ${shuffled.length} personalized recommendations`);

        return res.status(200).json({
            success: true,
            count: shuffled.length,
            data: shuffled,
            type: 'personalized',
            userPreferences: {
                totalItemsInCollections: allUserItems.length,
                preferredGenres,
                preferredTypes
            },
            message: `Recommendations based on your ${allUserItems.length} favorite items`
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
                director : 1,
                duration : 1,
                runtime : 1,
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