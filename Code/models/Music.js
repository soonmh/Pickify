const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String },
    release_date: { type: Date },
    genre: { type: String },
    poster_url: { type: String },
    album: { type: String },
    duration: { type: String },
   popularity: { type: Number, default: 0 }
}, { timestamps: true });

const Music = mongoose.model('Music', musicSchema);

module.exports = Music; 