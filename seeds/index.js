// DB seeding file

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

// Seeding function
const seedItemDB = async () => {
    // Clearing old DB
    await GiftItem.deleteMany({});
    for (let i = 0; i < items.length; i++) {
        const giftItem = new GiftItem({
            name: items[i].name,
            unit_price: items[i].unit_price,
            units_owned: items[i].units_owned
        })
        await giftItem.save();
    }
    console.log('Gift Items seeded.');
}

// Seeding function
const seedCampaignDB = async () => {
    // Clearing old DB
    await GiftCampaign.deleteMany({});
    for (let i = 0; i < campaigns.length; i++) {
        const giftCampaign = new GiftCampaign({
            name: campaigns[i].name,
            status: campaigns[i].status,
            dispatch_date: campaigns[i].dispatch_date,
            delivery_date: campaigns[i].delivery_date
        })
        await giftCampaign.save();
    }
    console.log('Gift Campaigns seeded.');
}

seedItemDB();
seedCampaignDB();