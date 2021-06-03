// NPM
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
// Validation Data
const countyList = require('../public/validationData/countyList')
// Shortcut
const Schema = mongoose.Schema;

// Schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    address: {
        phone: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        zip: {
            type: Number,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        county: {
            type: String,
            enum: countyList,
            required: true
        }
    },
    subscriptions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'GiftCampaign'
        }
    ]
});

// Passport
UserSchema.plugin(passportLocalMongoose);

// Export
module.exports = mongoose.model('User', UserSchema);