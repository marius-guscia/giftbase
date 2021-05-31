// NPM
const mongoose = require('mongoose');
// Shortcut
const Schema = mongoose.Schema;
// Models
const Review = require('./review');

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
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// POST MW
GiftCampaignSchema.post('findOneAndDelete', async function (document) {
    // the giftCampaign that was deleted is passed in as an argument
    if (document) {
        await Review.deleteMany({
            _id: {
                $in: document.reviews
            }
        })
    }
});

// Export
module.exports = mongoose.model('GiftCampaign', GiftCampaignSchema);