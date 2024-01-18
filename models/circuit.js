const mongoose =  require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for the Circuit data
const circuitSchema = new mongoose.Schema({
    id: String,
    city: String,
    country: String,
    title: String,
    description: String,
    languages: [String],
    distance: Number,
    duration: String,
    imagePath: String,
    audioPath: String,
    mapContent: {
        lat: Number,
        lng: Number
    },
    showPolyline: Boolean
});

// Create a Mongoose model based on the schema
module.exports = mongoose.model('Circuit', circuitSchema)