// NPM
const mongoose = require('mongoose');
// Shortcut
const Schema = mongoose.Schema;

// Schema
const GiftItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    unit_price: {
        type: Number,
        required: true
    },
    units_owned: {
        type: Number,
        required: true
    }
});

// Export
module.exports = mongoose.model('GiftItem', GiftItemSchema);