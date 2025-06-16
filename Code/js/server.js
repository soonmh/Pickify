const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Entertainment = require('../models/Entertainment');
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
            id: req.params.id,
            url: req.url,
            method: req.method
        });

        const { type, id } = req.params;
        
        // Debug: Log the search criteria
        console.log('🔍 Searching for entertainment with criteria:', {
            type: type,
            $or: [
                { tmdbId: id },
                { _id: id }
            ]
        });

        // Find entertainment item by type and id
        const entertainment = await Entertainment.findOne({
            type: type,
            $or: [
                { tmdbId: id },
                { _id: id }
            ]
        });
        
        // Debug: Log the search result
        console.log('🔍 Search result:', entertainment);
        
        if (!entertainment) {
            console.log('❌ Entertainment item not found:', { type, id });
            return res.status(404).json({
                success: false,
                message: 'Entertainment item not found'
            });
        }

        // Format the response
        const formattedItem = {
            tmdbId: entertainment.tmdbId || entertainment._id,
            title: entertainment.title,
            type: entertainment.type || 'movie',
            genre: entertainment.genres ? entertainment.genres.map(g => g.name).join(', ') : 'Unknown Genre',
            image: entertainment.poster_path,
            year: entertainment.year || (entertainment.release_date ? new Date(entertainment.release_date).getFullYear() : 'Unknown Year'),
            description: entertainment.overview || entertainment.description || 'No description available',
            director: entertainment.director,
            duration: entertainment.duration || entertainment.runtime,
            rating: entertainment.vote_average,
            voteCount: entertainment.vote_count,
            language: entertainment.original_language
        };

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


