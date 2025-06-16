const mongoose = require('mongoose');

const entertainmentSchema = new mongoose.Schema({
    tmdbId: { type: String, required: true, unique: true }, // Ensure tmdbId is present and unique
    type: { type: String, required: true }, // 'movie', 'book', 'series', etc.
    title: { type: String, required: true },
    poster_path: { type: String },
    year: { type: String },
    release_date: { type: String }, // Could be used to derive year
    genre: { type: String },
    genres: { type: String }, // Or an array of strings
    description: { type: String },
    overview: { type: String },
    director: { type: String }, // For movies
    duration: { type: Number }, // For movies/series, in minutes
    runtime: { type: Number },  // Alternative for duration
    // Mongoose automatically adds an _id field unless specifically disabled
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

const Entertainment = mongoose.model('Entertainment', entertainmentSchema);

module.exports = Entertainment; 