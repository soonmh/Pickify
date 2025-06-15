const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const Review=require('./models/Review');

const app=express();

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

// Configure CORS with specific options
app.use(cors({
    origin: ['http://localhost:5501', 'https://localhost:5501', 'http://127.0.0.1:5501'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Add middleware to set JSON content type for all responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pickify', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔌 Connection state:', mongoose.connection.readyState);
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Review routes
app.post('/api/reviews', async(req, res) => {
    try {
        console.log('Creating new review:', req.body);
        const { entertainmentId, user, rating, text, entertainmentDetails } = req.body;
        
        // Validate required fields
        if (!entertainmentId || !user || !rating || !text || !entertainmentDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create new review with entertainment details
        const review = new Review({
            entertainmentId,
            user,
            rating,
            text,
            entertainmentDetails,
            title: entertainmentDetails.title,
            timeStamp: new Date(),
            lastEdited: new Date()
        });

        await review.save();
        res.status(201).json({
            success: true, 
            message: 'Review saved!', 
            review: review.toJSON()
        });
    } catch (error) {
        console.error('Error saving review:', error);
        res.status(400).json({
            success: false, 
            message: error.message
        });
    }
});

app.get('/api/reviews', async(req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json({
            success: true, 
            data: reviews.map(review => review.toJSON())
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false, 
            message: error.message
        });
    }
});

// Comment routes
app.post('/api/reviews/:id/comment', async(req, res) => {
    try {
        console.log('Adding comment to review:', req.params.id);
        console.log('Comment data:', req.body);

        const { user, userAvatar, comment } = req.body;
        
        if (!user || !comment) {
            console.log('Missing required fields:', { user, comment });
            return res.status(400).json({ 
                success: false,
                message: 'User and comment are required' 
            });
        }

        const review = await Review.findById(req.params.id);
        
        if (!review) {
            console.log('Review not found:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Review not found' 
            });
        }

        const newComment = {
            user,
            userAvatar,
            comment,
            timestamp: new Date()
        };

        review.comments.push(newComment);
        const savedReview = await review.save();
        
        console.log('Comment added successfully');
        const response = {
            success: true,
            message: 'Comment added successfully',
            review: savedReview.toJSON()
        };
        console.log('Sending response:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ 
            success: false,
            message: error.message,
            details: error.stack 
        });
    }
});

// Update review endpoint
app.put('/api/reviews/:id', async(req, res) => {
    try {
        const { rating, text, entertainmentDetails } = req.body;
        const updateData = {
            rating,
            text,
            lastEdited: new Date()
        };

        // If entertainment details are provided, update them
        if (entertainmentDetails) {
            updateData.entertainmentDetails = entertainmentDetails;
            updateData.title = entertainmentDetails.title;
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review updated successfully',
            review: review.toJSON()
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Entertainment routes
app.get('/api/entertainment/:type/:id', async(req, res) => {
    try {
        console.log('🎬 Fetching entertainment details:', {
            type: req.params.type,
            id: req.params.id
        });

        const { type, id } = req.params;
        let collection;
        
        // Map the type to the correct collection name
        switch(type) {
            case 'movie':
                collection = 'Movie';
                break;
            case 'music':
                collection = 'Music';
                break;
            case 'book':
                collection = 'books';
                break;
            default:
                throw new Error(`Invalid entertainment type: ${type}`);
        }

        console.log('📚 Using collection:', collection);
        
        // Try to find the item by ID
        const item = await mongoose.connection.db.collection(collection).findOne({
            $or: [
                { _id: new mongoose.Types.ObjectId(id) },
                { tmdbId: parseInt(id) }
            ]
        });

        console.log('🔍 Found item:', item ? 'Yes' : 'No');
        
        if (!item) {
            console.log('❌ Item not found in collection:', collection);
            return res.status(404).json({
                success: false,
                message: 'Entertainment item not found'
            });
        }

        // Format the response based on the type
        const formattedItem = {
            id: item._id || item.tmdbId,
            title: item.title || item.name,
            type: type,
            genre: item.genre || (item.genres ? item.genres.map(g => g.name).join(', ') : ''),
            image: item.poster_path || item.image || item.cover_image,
            year: item.release_date ? new Date(item.release_date).getFullYear() : item.year,
            description: item.overview || item.description,
            rating: item.vote_average || item.rating || 0,
            views: item.views || 0
        };

        // Add type-specific fields
        if (type === 'book') {
            formattedItem.author = item.author;
        } else if (type === 'movie') {
            formattedItem.director = item.director;
            formattedItem.duration = item.runtime;
        } else if (type === 'music') {
            formattedItem.artist = item.artist;
        }

        // Handle image URL
        if (formattedItem.image) {
            if (type === 'movie' && formattedItem.image.startsWith('/')) {
                formattedItem.image = `https://image.tmdb.org/t/p/w500${formattedItem.image}`;
            } else if (!formattedItem.image.startsWith('http')) {
                formattedItem.image = `./assets/${formattedItem.image}`;
            }
        } else {
            formattedItem.image = './assets/placeholder.png';
        }

        console.log('📤 Sending formatted response:', formattedItem);

        res.json({
            success: true,
            data: formattedItem
        });
    } catch (error) {
        console.error('❌ Error fetching entertainment details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Handle 404 errors
app.use((req, res) => {
    console.log('404 - Route not found:', req.url);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = 5501;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the server with: curl http://localhost:${PORT}/api/reviews`);
});


