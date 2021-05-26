// NPM
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
// Models
const GiftItem = require('./models/giftItem');
const GiftCampaign = require('./models/giftCampaign');
const User = require('./models/user');

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

// Setting HTML templating engine
app.set('view engine', 'ejs');

// Joining dir paths to be able to access views from an
app.set('views', path.join(__dirname, 'views'));

// URL req.body parsing
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('index')
});

app.listen(3000, () => {
    console.log('Serving on PORT 3000.')
});