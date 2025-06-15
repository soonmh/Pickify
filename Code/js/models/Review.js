const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    entertainmentId: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: {
        type: String,
        required: true
    },
    entertainmentDetails: {
        title: String,
        type: String,
        genre: String,
        image: String,
        year: Number,
        description: String,
        author: String,
        director: String,
        artist: String,
        duration: Number
    },
    title: String,
    timeStamp: {
        type: Date,
        default: Date.now
    },
    lastEdited: {
        type: Date,
        default: Date.now
    },
    comments: [{
        user: String,
        userAvatar: String,
        comment: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Review', reviewSchema); 