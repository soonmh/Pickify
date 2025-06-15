const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const Review=require('./models/Review');
const axios = require('axios');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

mongoose.connect('mongodb://localhost:27017/pickify')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

app.get('/api/reviews/:entertainmentId',async(req,res)=>{
    const{entertainmentId}=req.params;
    try{
        const reviews=await Review.find({entertainmentId});
        res.json(reviews);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

app.post('/api/reviews',async(req,res)=>{
    const{entertainmentId,user,rating,text}=req.body;
    try{
        const review=new Review({entertainmentId,user,rating,text});
        await review.save();
        res.status(201).json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.put('/api/reviews/:id',async(req,res)=>{
    const{rating,text}=req.body;
    try{
        const review=await Review.findByIdAndUpdate(
            req.params.id,
            {rating,text},
            {new:true}
        );
        res.json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.patch('/api/reviews/:id/report',async(req,res)=>{
    try{
        const review=await Review.findByIdAndUpdate(
            req.params.id,
            {reported:true},
            {new:true}
        );
        res.json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.post('/api/reviews/:id/comment',async(req,res)=>{
    const{user,comment}=req.body;
    try{
        const review=await Review.findById(req.params.id);
        review.comments.push({user,comment});
        await review.save();
        res.json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
})

// Add entertainment details endpoint
app.get('/api/entertainment/:type/:id', async(req, res) => {
    const { type, id } = req.params;
    
    try {
        let details = null;

        if (type === 'movie') {
            console.log('🔍 Searching for movie with tmdbId:', id);
            // Fetch movie details from database
            const movie = await mongoose.model('Movie').findOne({ tmdbId: parseInt(id) });
            console.log('📽️ Found movie:', movie);
            
            if (movie) {
                details = {
                    poster_path: movie.poster_path,
                    title: movie.title,
                    type: 'movie',
                    release_date: movie.release_date,
                    genres: movie.genres,
                    description: movie.description,
                    director: movie.director,
                    duration: movie.duration
                };
                console.log('🎬 Processed movie details:', details);
            } else {
                console.log('❌ No movie found with tmdbId:', id);
            }
        } else if (type === 'book') {
            // Fetch book details from your database
            const book = await mongoose.model('Book').findOne({ _id: id });
            if (book) {
                details = {
                    title: book.title,
                    type: 'book',
                    year: book.publicationYear,
                    genre: book.genre,
                    description: book.description,
                    image: book.coverImage,
                    author: book.author
                };
            }
        } else if (type === 'music') {
            // Fetch music details from your database
            const music = await mongoose.model('Music').findOne({ _id: id });
            if (music) {
                details = {
                    tmdbId: music._id,
                    title: music.name || music.title, 
                    type: 'music',
                    year: music.release,
                    genre: music.genre,
                    description: music.description,
                    image: music.poster_url,
                    artist: music.artists
                };
            }
        }

        if (!details) {
            console.log('❌ No details found for type:', type, 'id:', id);
            return res.status(404).json({
                success: false,
                message: 'Entertainment not found'
            });
        }

        // Log the request and response for debugging
        console.log('📤 Sending response:', details);

        res.json({
            success: true,
            data: details
        });
    } catch(err) {
        console.error('❌ Error fetching entertainment details:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entertainment details'
        });
    }
});

// Helper function to get movie director
async function getMovieDirector(movieId) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
            params: {
                api_key: TMDB_API_KEY
            }
        });
        
        const director = response.data.crew.find(person => person.job === 'Director');
        return director ? director.name : 'Unknown Director';
    } catch (error) {
        console.error('Error fetching movie director:', error);
        return 'Unknown Director';
    }
}

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


