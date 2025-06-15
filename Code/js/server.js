const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pickify')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

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

// Entertainment routes
app.get('/api/entertainment/:type/:id', async(req, res) => {
    try {
        console.log('🎬 Fetching entertainment details:', {
            type: req.params.type,
            tmdbId: req.params.id,
            url: req.url,
            method: req.method
        });

        const { type, id } = req.params;
        
        // For now, only handle movies
        if (type === 'movie') {
            // Convert id to number for comparison with tmdbId
            const tmdbId = parseInt(id);
            console.log('🔍 Looking for movie with tmdbId:', tmdbId);
            
            // Fetch movie from database
            const movie = await mongoose.model('Movie').findOne({ tmdbId });
            
            if (!movie) {
                console.log('❌ Movie not found with tmdbId:', tmdbId);
                return res.status(404).json({
                    success: false,
                    message: 'Movie not found'
                });
            }

            // Format the response
            const formattedMovie = {
                tmdbId: movie.tmdbId,
                title: movie.title,
                type: 'movie',
                genre: movie.genres.join(', '),
                image: movie.poster_path,
                year: new Date(movie.release_date).getFullYear(),
                description: movie.overview,
                rating: movie.vote_average,
                director: movie.director,
                duration: movie.duration || movie.runtime
            };

            console.log('📤 Sending formatted response:', formattedMovie);

            res.json({
                success: true,
                data: formattedMovie
            });
        } else if (type === 'music') {
            // Fetch music from database
            const music = await mongoose.model('Music').findOne({ _id: id });
            
            if (!music) {
                console.log('❌ Music not found with id:', id);
                return res.status(404).json({
                    success: false,
                    message: 'Music not found'
                });
            }

            // Format the response
            const formattedMusic = {
                tmdbId: music._id,
                title: music.name || music.title,
                type: 'music',
                genre: music.genre || 'Unknown Genre',
                image: music.poster_url || music.image,
                year: music.release ? new Date(music.release).getFullYear() : 'Unknown Year',
                description: music.description || 'No description available',
                rating: music.popularity ? parseFloat((music.popularity / 20).toFixed(1)) : 0
            };

            console.log('📤 Sending formatted response:', formattedMusic);

            res.json({
                success: true,
                data: formattedMusic
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Unsupported entertainment type'
            });
        }
    } catch (error) {
        console.error('❌ Error fetching entertainment details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Review routes
app.get('/api/reviews/:entertainmentId', async (req, res) => {
    try {
        const reviews = await mongoose.model('Review').find({ entertainmentId: req.params.entertainmentId });
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const review = new mongoose.model('Review')(req.body);
        await review.save();
        res.status(201).json({
            success: true,
            message: 'Review saved!',
            review
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/reviews/:id/comment', async (req, res) => {
    try {
        const review = await mongoose.model('Review').findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        review.comments.push(req.body);
        await review.save();
        res.status(200).json({
            success: true,
            message: 'Comment added successfully',
            review
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.put('/api/reviews/:id', async (req, res) => {
    try {
        const review = await mongoose.model('Review').findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});


