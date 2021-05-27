// NPM
const mongoose = require('mongoose');
// Shortcut
const Schema = mongoose.Schema;

// Schema
const GiftCampaignSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Preparing', 'Ready', 'Dispatched'],
        required: true
    },
    dispatch_date: {
        type: Date,
        required: true
    },
    delivery_date: {
        type: Date,
        required: true
    },
    // subscribers: {
    //     // Reference to subscribed Users' IDs
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    contents: [
        {
            gift_item: {
                // Reference to added GiftItems' IDs
                type: Schema.Types.ObjectId,
                ref: 'GiftItem'
            },
            gift_item_count: {
                type: Number
            }
        }
    ]

});

// Export
module.exports = mongoose.model('GiftCampaign', GiftCampaignSchema);