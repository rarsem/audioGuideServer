const mongoose =  require('mongoose');

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
    mapContent: {
        lat: Number,
        lng: Number
    }
});

// Create a Mongoose model based on the schema
module.exports = mongoose.model('Circuit', circuitSchema)