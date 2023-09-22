const mongoose =  require('mongoose');

// Define a schema for the Circuit data
const arretsSchema = new mongoose.Schema({
    id: String,
    title: String,
    idCircuit:String,
    description: String,
    specificDestinations: [String],
    mapContent: {
        lat: Number,
        lng: Number
    },
    imagePath : String,
    audioPath : String,
    order: {
        type: Number,
        default: 1, // Set your desired default value here
    },
});

// Create a Mongoose model based on the schema
module.exports = mongoose.model('Arrets', arretsSchema)