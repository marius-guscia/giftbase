// NPM
const mongoose = require('mongoose');
// Shortcut
const Schema = mongoose.Schema;

// Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
});

// Export
module.exports = mongoose.model('User', UserSchema);