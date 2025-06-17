const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Review = require('./models/Review');
const axios = require('axios');
const Entertainment = require('./Code/models/Entertainment');
const Movie = require('./Code/models/Movie');
const Music = require('./Code/models/Music');
const Book = require('./Code/models/books');
require('dotenv').config();

const app = express();

// MongoDB connection configuration
const MONGODB_URI = 'mongodb+srv://engkejia:1234@cluster0.dadg8gh.mongodb.net/Pickify?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
.then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('Database name:', mongoose.connection.name);
    console.log('Connection state:', mongoose.connection.readyState);
})
.catch((err) => {
    console.error('❌ MongoDB connection error details:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    process.exit(1); // Exit if cannot connect to database
});

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configure CORS
app.use(cors({
    origin: ['http://localhost:5501', 'https://localhost:5501', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.static("public"));

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// app.get('/api/reviews/:entertainmentId', async(req, res) => {
//     const { entertainmentId } = req.params;
//     try {
//         console.log('🔍 Fetching reviews for entertainmentId:', entertainmentId);
        
//         // First try to find a music item with this ID
//         const music = await mongoose.model('Music').findById(entertainmentId);
//         if (music) {
//             // If it's a music item, use its _id for reviews
//             const reviews = await Review.find({ entertainmentId: music._id });
//             console.log(`✅ Found ${reviews.length} reviews for music`);
//             return res.json({
//                 success: true,
//                 data: reviews
//             });
//         }

//         // If not found as music, try as movie
//         const movie = await mongoose.model('Movie').findById(entertainmentId);
//         if (movie) {
//             const reviews = await Review.find({ entertainmentId: movie._id });
//             console.log(`✅ Found ${reviews.length} reviews for movie`);
//             return res.json({
//                 success: true,
//                 data: reviews
//             });
//         }

//         // If not found as either, return empty array
//         console.log('ℹ️ No entertainment found with ID:', entertainmentId);
//         return res.json({
//             success: true,
//             data: []
//         });
//     } catch(err) {
//         console.error('❌ Error fetching reviews:', err);
//         res.status(500).json({
//             success: false,
//             message: err.message
//         });
//     }
// });

// app.post('/api/reviews',async(req,res)=>{
//     const{entertainmentId,user,rating,text}=req.body;
//     try{
//         const review=new Review({entertainmentId,user,rating,text});
//         await review.save();
//         res.status(201).json(review);
//     }catch(err){
//         res.status(400).json({message:err.message});
//     }
// });

// app.put('/api/reviews/:id',async(req,res)=>{
//     const{rating,text}=req.body;
//     try{
//         const review=await Review.findByIdAndUpdate(
//             req.params.id,
//             {rating,text},
//             {new:true}
//         );
//         res.json(review);
//     }catch(err){
//         res.status(400).json({message:err.message});
//     }
// });

// app.patch('/api/reviews/:id/report',async(req,res)=>{
//     try{
//         const review=await Review.findByIdAndUpdate(
//             req.params.id,
//             {reported:true},
//             {new:true}
//         );
//         res.json(review);
//     }catch(err){
//         res.status(400).json({message:err.message});
//     }
// });

// app.post('/api/reviews/:id/comment',async(req,res)=>{
//     const{user,comment}=req.body;
//     try{
//         const review=await Review.findById(req.params.id);
//         review.comments.push({user,comment});
//         await review.save();
//         res.json(review);
//     }catch(err){
//         res.status(400).json({message:err.message});
//     }
// })

// // Entertainment routes
// app.get('/api/:type/:id', async(req, res) => {
//     try {
//         const { type, id } = req.params;
//         console.log('🎬 Request received:', {
//             type,
//             id,
//             url: req.originalUrl,
//             method: req.method
//         });

//         if (type.toLowerCase() === 'movie') {
//             console.log('🔍 Searching for movie with tmdbId:', id);
//             const movie = await Movie.findOne({ tmdbId: id });
//             console.log('📽️ Database query result:', {
//                 found: !!movie,
//                 tmdbId: id,
//                 movieDetails: movie ? {
//                     _id: movie._id,
//                     tmdbId: movie.tmdbId,
//                     title: movie.title,
//                     genres: movie.genres
//                 } : null
//             });
            
//             if (movie) {
//                 const details = {
//                     _id: movie._id,
//                     tmdbId: movie.tmdbId,
//                     poster_path: movie.poster_path,
//                     title: movie.title,
//                     type: 'movie',
//                     release_date: movie.release_date,
//                     genres: movie.genres,
//                     description: movie.overview,
//                     director: movie.director,
//                     duration: movie.duration,
//                     vote_average: movie.vote_average,
//                     popularity: movie.popularity,
//                     vote_count: movie.vote_count
//                 };
//                 console.log('🎬 Sending response:', {
//                     success: true,
//                     data: {
//                         _id: details._id,
//                         tmdbId: details.tmdbId,
//                         title: details.title,
//                         type: details.type
//                     }
//                 });
//                 return res.json({
//                     success: true,
//                     data: details
//                 });
//             } else {
//                 console.log('❌ No movie found with tmdbId:', id);
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Movie not found'
//                 });
//             }
//         } else if (type.toLowerCase() === 'books') {
//             console.log('📚 Searching for book with id:', id);
//             const book = await Book.findOne({ _id: id });
//             console.log('📚 Database query result:', {
//                 found: !!book,
//                 id: id,
//                 bookDetails: book ? {
//                     _id: book._id,
//                     title: book.title,
//                     author: book.author
//                 } : null
//             });
            
//             if (book) {
//                 const details = {
//                     _id: book._id,
//                     title: book.title,
//                     type: 'book',
//                     year: book.year,
//                     genre: book.genre,
//                     description: book.description,
//                     image: book.image,
//                     author: book.author,
//                     rating: book.rating,
//                     views: book.views,
//                     popularity: book.popularity
//                 };
//                 console.log('📚 Sending response:', {
//                     success: true,
//                     data: {
//                         _id: details._id,
//                         title: details.title,
//                         type: details.type
//                     }
//                 });
//                 return res.json({
//                     success: true,
//                     data: details
//                 });
//             } else {
//                 console.log('❌ No book found with id:', id);
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Book not found'
//                 });
//             }
//         } else if (type.toLowerCase() === 'music') {
//             console.log('🎵 Searching for music with id:', id);
//             // Try to find music by either id or _id
//             const music = await Music.findOne({
//                 $or: [
//                     { id: id },
//                     { _id: id }
//                 ]
//             });
//             console.log('🎵 Database query result:', {
//                 found: !!music,
//                 id: id,
//                 musicDetails: music ? {
//                     _id: music._id,
//                     id: music.id,
//                     title: music.title,
//                     artist: music.artist
//                 } : null
//             });
            
//             if (music) {
//                 const details = {
//                     _id: music._id,
//                     id: music.id,
//                     poster_url: music.poster_url,
//                     title: music.title,
//                     type: 'music',
//                     artist: music.artist,
//                     album: music.album,
//                     release_date: music.release_date,
//                     genre: music.genre,
//                     description: music.album,
//                     duration: music.duration,
//                     popularity: music.popularity
//                 };
//                 console.log('🎵 Sending response:', {
//                     success: true,
//                     data: {
//                         _id: details._id,
//                         title: details.title,
//                         type: details.type
//                     }
//                 });
//                 return res.json({
//                     success: true,
//                     data: details
//                 });
//             } else {
//                 console.log('❌ No music found with id:', id);
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Music not found'
//                 });
//             }
//         }

//         console.log('❌ No entertainment found for type:', type, 'and id:', id);
//         return res.status(404).json({
//             success: false,
//             message: 'Entertainment not found'
//         });
//     } catch (error) {
//         console.error('❌ Error fetching entertainment details:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to fetch entertainment details'
//         });
//     }
// });

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

// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});


