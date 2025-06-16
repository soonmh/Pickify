const mongoose = require('mongoose');
const Movie = require('./Code/models/Movie');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://engkejia:1234@cluster0.dadg8gh.mongodb.net/Pickify?retryWrites=true&w=majority&appName=Cluster0';

// Test movie data
const testMovie = {
    tmdbId: "12345678912",  // Changed to string
    title: "Final Destination Bloodlines",
    overview: "Plagued by a violent recurring nightmare, college student Stefanie heads home to track down the one person who might be able to break the cycle and save her family from the grisly demise that inevitably awaits them all.",
    popularity: 491.2483,
    release_date: "2025-05-09",
    genres: ["Horror", "Thriller"],
    poster_path: "/6WxhEvFsauuACfv8HyoVX6mZKFj.jpg",
    vote_average: 7.304,
    vote_count: 204,
    director: "Adam B. Stein, Zach Lipovsky",
    duration: 110
};

// Add test movie
async function addMovie() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Adding movie...');
        const movie = new Movie(testMovie);
        await movie.save();
        console.log('Movie added successfully:', movie);

        // Verify the movie was added
        const foundMovie = await Movie.findOne({ tmdbId: "12345678912" });
        console.log('Found movie in database:', foundMovie);
    } catch (err) {
        console.error('Error:', err);
    }
}

addMovie(); 