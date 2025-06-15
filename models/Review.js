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
    comments: [{
        user: String,
        comment: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    reported: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema); 