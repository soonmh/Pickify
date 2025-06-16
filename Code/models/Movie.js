const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
    title: { type: String, required: true },
    poster_path: { type: String },
    release_date: { type: String },
    genres: [{ type: String }],
    overview: { type: String },
    director: { type: String },
    duration: { type: Number },
    type: { type: String, default: 'movie' },
    vote_average: { type: Number },
    vote_count: { type: Number },
    popularity: { type: Number }
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie; 