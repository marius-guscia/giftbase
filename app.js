// NPM
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
// Models
const GiftItem = require('./models/giftItem');
const GiftCampaign = require('./models/giftCampaign');
// const User = require('./models/user');

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

// Creating express server
const app = express();

// EJS-MATE package for layout templating
app.engine('ejs', ejsMate);

// Setting HTML templating engine
app.set('view engine', 'ejs');

// Joining dir paths to be able to access views from an
app.set('views', path.join(__dirname, 'views'));

// URL req.body parsing
app.use(express.urlencoded({ extended: true }));

// Method Override for using PUT & DELETE HTML requests
app.use(methodOverride('_method'));

const statuses = ['Preparing', 'Ready', 'Dispatched'];

// GIFT ITEMS

// Route for redering Gift Items
app.get('/giftitems', async (req, res) => {
    const giftItems = await GiftItem.find({});
    res.render('giftItems/index', { giftItems })
})
// Route for redering new Gift Item form
app.get('/giftitems/new', (req, res) => {
    res.render('giftItems/new')
})
// Route for submitting new Gift Item form
app.post('/giftitems', async (req, res) => {
    const giftItem = new GiftItem(req.body.giftItem);
    await giftItem.save();
    res.redirect(`/giftItems/${giftItem._id}`)
})
// Route for showing a Gift Item
app.get('/giftItems/:id', async (req, res) => {
    const giftItem = await GiftItem.findById(req.params.id)
    res.render('giftItems/show', { giftItem });
})
// Route for redering edit Gift Item form
app.get('/giftitems/:id/edit', async (req, res) => {
    const giftItem = await (await GiftItem.findById(req.params.id));
    res.render('giftItems/edit', { giftItem });
})
// Route for submitting edit Gift Item form
app.put('/giftitems/:id', async (req, res) => {
    const { id } = req.params;
    const giftItem = await GiftItem.findByIdAndUpdate(id, { ...req.body.giftItem })
    res.redirect(`/giftItems/${giftItem._id}`)
})
// Route for deleting Gift Item form
app.delete('/giftitems/:id', async (req, res) => {
    const { id } = req.params;
    await GiftItem.findByIdAndDelete(id);
    res.redirect('/giftItems');
})

// GIFT CAMPAIGNS

// Route for redering Gift Campaigns
app.get('/giftcampaigns', async (req, res) => {
    const giftCampaigns = await GiftCampaign.find({});
    res.render('giftCampaigns/index', { giftCampaigns })
})
// Route for rendering new Gift Campaign form
app.get('/giftcampaigns/new', (req, res) => {
    res.render('giftCampaigns/new')
})
// Route for submitting new Gift Campaign form
app.post('/giftcampaigns', async (req, res) => {
    const giftCampaign = new GiftCampaign(req.body.giftCampaign);
    await giftCampaign.save();
    res.redirect(`/giftCampaigns`)
})
// Route for showing a Gift Campaign
app.get('/giftcampaigns/:id', async (req, res) => {
    const giftCampaign = await GiftCampaign.findById(req.params.id);
    res.render('giftCampaigns/show', { giftCampaign });
})
// Route for redering edit Gift Campaign form
app.get('/giftcampaigns/:id/edit', async (req, res) => {
    const giftCampaign = await GiftCampaign.findById(req.params.id)
    res.render('giftCampaigns/edit', { giftCampaign, statuses });
})
// Route for submitting edit Gift Campaign form
app.put('/giftcampaigns/:id', async (req, res) => {
    const { id } = req.params;
    const giftCampaign = await GiftCampaign.findByIdAndUpdate(id, { ...req.body.giftCampaign })
    res.redirect(`/giftCampaigns/${giftCampaign._id}`)
})
// Route for deleting Gift Campaign form
app.delete('/giftcampaigns/:id', async (req, res) => {
    const { id } = req.params;
    await GiftCampaign.findByIdAndDelete(id);
    res.redirect('/giftCampaigns');
})
// Listening for HTML requests
app.listen(3000, () => {
    console.log('Serving on PORT 3000.')
});