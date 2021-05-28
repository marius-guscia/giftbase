// CONSTANTS
const GIFT_CAMPAIGN_QTY = 16;
const GIFT_ITEM_QTY = 24;
const GIFT_ITEMS_IN_CAMPAIGN = 3;

// NPM
const mongoose = require('mongoose');
const GiftItem = require('../models/giftItem');
const GiftCampaign = require('../models/giftCampaign');
const campaigns = require('./campaigns');
const items = require('./items');

// Connecting to mongoose
mongoose.connect('mongodb://localhost:27017/giftbase', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected.")
})

let giftItemsArray = [];
const randomNumber = (number) => { return Math.floor(Math.random() * number) + 1 }

// Seeding function
const seedItemDB = async () => {
    // Clearing old DB
    await GiftItem.deleteMany({});
    for (let i = 0; i < GIFT_ITEM_QTY; i++) {
        const giftItem = new GiftItem({
            name: items[i].name,
            unit_price: items[i].unit_price,
            units_owned: items[i].units_owned
        })
        await giftItem.save();
        giftItemsArray[i] = giftItem;
    }
    console.log('Gift Items seeded.');
}

// Seeding function
const seedCampaignDB = async () => {
    // Clearing old DB
    await GiftCampaign.deleteMany({});
    for (let i = 0; i < GIFT_CAMPAIGN_QTY; i++) {
        const giftCampaign = new GiftCampaign({
            name: campaigns[i].name,
            status: campaigns[i].status,
            dispatch_date: campaigns[i].dispatch_date,
            delivery_date: campaigns[i].delivery_date,
            contents: []
        })
        for (let i = 1; i <= GIFT_ITEMS_IN_CAMPAIGN; i++) {
            const giftItem = giftItemsArray[randomNumber(GIFT_CAMPAIGN_QTY - 1)];
            const gift_item_count = randomNumber(5);
            giftCampaign.contents.push({ gift_item: giftItem, gift_item_count })
        }
        await giftCampaign.save();
    }
    console.log('Gift Campaigns seeded.');
}

seedItemDB();
setTimeout(() => { seedCampaignDB() }, 500);

setTimeout(() => {
    process.exit(0)
}, 1000);