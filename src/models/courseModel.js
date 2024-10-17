const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    route: {
        type: String,
        required: true,
        unique: true,
    },
    prefix: {
        type: String,
        required: false,
        default: "U"
    }
});

module.exports = mongoose.model('Course', courseSchema);