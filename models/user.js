// NPM
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
// Shortcut
const Schema = mongoose.Schema;

// Schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    // address: {
    //     type: String,
    //     required: true
    // }
});

// Passport & allowing email as a username
UserSchema.plugin(passportLocalMongoose);

// Export
module.exports = mongoose.model('User', UserSchema);