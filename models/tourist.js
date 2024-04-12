const mongoose =  require('mongoose');

const uniqueValidator = require("mongoose-unique-validator")

const touristSchema  =  mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    confirmed: { type: Boolean, default: false },
    resetCode : { type: Number, default: null },
    resetCodeExpires : { type: Date, default: null }
});

touristSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Tourist', touristSchema);