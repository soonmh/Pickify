const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true },
  title: String,
  overview: String,
  release_date: String,
  genres: [String], 
  poster_path: String,
  popularity: Number,
  vote_average: Number,
});

module.exports = mongoose.model('Movie', movieSchema);
