const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    popularity: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: 'book'
    }
}, {
    timestamps: true
});

// Create index for faster queries
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 