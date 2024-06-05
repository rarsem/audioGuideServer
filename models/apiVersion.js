const mongoose = require('mongoose');

const ApkVersionSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: false
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ApkVersion', ApkVersionSchema);