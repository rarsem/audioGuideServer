const mongoose = require('mongoose');



// Define the Authorization schema
const authorizationSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
  },
  circuit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Circuit',
  },
  authorized: {
    type: Boolean,
    default: false, // Initially, the tourist is not authorized
  },
});

module.exports = mongoose.model('Authorization', authorizationSchema)