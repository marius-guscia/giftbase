// NPM
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
// Models
const GiftItem = require('./models/giftItem');
const GiftCampaign = require('./models/giftCampaign');
const Review = require('./models/review');
// const User = require('./models/user');

// Utils
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { giftItemSchema, giftCampaignSchema, reviewSchema } = require('./schemas.js');

// Connecting to mongoose
mongoose.connect('mongodb://localhost:27017/giftbase', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
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

// Servicing Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// JOI MW
const validateGiftItem = (req, res, next) => {
    const { error } = giftItemSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
// JOI MW
const validateCampaignItem = (req, res, next) => {
    const { error } = giftCampaignSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
// JOI MW
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Gift Campaign statuses
const statuses = ['Preparing', 'Ready', 'Dispatched'];

// Route for redering HOME PAGE
app.get('/', (req, res) => {
    res.render('index')
})

// GIFT ITEMS

// Route for redering Gift Items
app.get('/giftitems', catchAsync(async (req, res) => {
    const giftItems = await GiftItem.find({});
    res.render('giftitems/index', { giftItems })
}))
// Route for redering new Gift Item form
app.get('/giftitems/new', (req, res, next) => {
    res.render('giftitems/new')
})
// Route for submitting new Gift Item form
app.post('/giftitems', validateGiftItem, catchAsync(async (req, res) => {
    const giftItem = new GiftItem(req.body.giftItem);
    await giftItem.save();
    res.redirect(`/giftitems/${giftItem._id}`)
}))
// Route for showing a Gift Item
app.get('/giftItems/:id', catchAsync(async (req, res) => {
    const giftItem = await GiftItem.findById(req.params.id)
    res.render('giftitems/show', { giftItem });
}))
// Route for redering edit Gift Item form
app.get('/giftitems/:id/edit', catchAsync(async (req, res) => {
    const giftItem = await GiftItem.findById(req.params.id);
    res.render('giftitems/edit', { giftItem });
}))
// Route for submitting edit Gift Item form
app.put('/giftitems/:id', validateGiftItem, catchAsync(async (req, res) => {
    const { id: itemId } = req.params;
    // BUG: NO ERROR IF you enter string 
    const giftItem = await GiftItem.findByIdAndUpdate(itemId, { ...req.body.giftItem })
    // const giftItem = await GiftItem.findById(itemId);
    // giftItem.units_owned += parseInt(req.body.giftItem.units_added);
    // await GiftItem.findByIdAndUpdate(itemId, { ...giftItem })
    res.redirect(`/giftitems/${giftItem._id}`)
}))
// Route for deleting Gift Item form
app.delete('/giftitems/:id', catchAsync(async (req, res) => {
    const { id: itemId } = req.params;
    await GiftItem.findByIdAndDelete(itemId);
    const giftCampaigns = await GiftCampaign.find({});
    for (let giftCampaign of giftCampaigns) {
        let index = 0;
        for (let content_item of giftCampaign.contents) {
            // BUG should be ===
            if (content_item.gift_item._id == itemId) {
                await GiftCampaign.findByIdAndUpdate(giftCampaign._id, { $pull: { contents: { _id: giftCampaign.contents[index]._id } } })
            }
            index++;
        }
    }
    res.redirect('/giftitems');
}))

// GIFT CAMPAIGNS

// Route for redering Gift Campaigns
app.get('/giftcampaigns', catchAsync(async (req, res) => {
    const giftCampaigns = await GiftCampaign.find({});
    res.render('giftcampaigns/index', { giftCampaigns })
}))
// Route for rendering new Gift Campaign form
app.get('/giftcampaigns/new', (req, res) => {
    res.render('giftcampaigns/new')
})
// Route for submitting new Gift Campaign form
app.post('/giftcampaigns', validateCampaignItem, catchAsync(async (req, res, next) => {
    const giftCampaign = new GiftCampaign(req.body.giftCampaign);
    await giftCampaign.save();
    res.redirect(`/giftcampaigns`)
}))

// Route for adding Gift Items to Gift Campaign
app.put('/giftcampaigns/:id/add', catchAsync(async (req, res) => {
    const { id: campId } = req.params;
    const { id: itemId } = req.body;
    const giftCampaign = await GiftCampaign.findById(campId).populate({
        path: 'contents',
        populate: {
            path: 'gift_item'
        }
    }).populate('gift_item');
    const giftItem = await GiftItem.findById(itemId);
    let index = 0;
    let found = false;
    for (let content_item of giftCampaign.contents) {
        if (content_item.gift_item._id.equals(giftItem._id)) {
            giftCampaign.contents[index].gift_item_count++;
            found = true;
            break;
        }
        index++;
    }
    if (found === false) {
        giftCampaign.contents.push({ gift_item: giftItem, gift_item_count: 1 })
    }
    await giftCampaign.save();
    res.redirect(`/giftcampaigns/${giftCampaign._id}`)
}))
// Route for removing Gift Items from Gift Campaign
app.delete('/giftcampaigns/:id/remove', catchAsync(async (req, res) => {
    const { id: campId } = req.params;
    const { id: itemId } = req.body;
    const giftCampaign = await GiftCampaign.findById(campId).populate({
        path: 'contents',
        populate: {
            path: 'gift_item'
        }
    }).populate('gift_item');
    const giftItem = await GiftItem.findById(itemId);
    let index = 0;
    for (let content_item of giftCampaign.contents) {
        let tempGiftItem = giftCampaign.contents[index];
        if (content_item.gift_item._id.equals(giftItem._id)) {
            if (tempGiftItem.gift_item_count > 1) {
                tempGiftItem.gift_item_count--;
            } else {
                await GiftCampaign.findByIdAndUpdate(campId, { $pull: { contents: { _id: tempGiftItem._id } } })
            }
            break;
        }
        index++;
    }
    await giftCampaign.save();
    res.redirect(`/giftcampaigns/${giftCampaign._id}`)
}))
// Route for showing a Gift Campaign
app.get('/giftcampaigns/:id', catchAsync(async (req, res) => {
    const giftItems = await GiftItem.find({});
    const giftCampaign = await GiftCampaign.findById(req.params.id)
        .populate({
            path: 'contents',
            populate: {
                path: 'gift_item'
            }
        })
        .populate('gift_item')
        .populate('reviews');
    res.render('giftcampaigns/show', { giftCampaign, giftItems });
}))
// Route for redering edit Gift Campaign form
app.get('/giftcampaigns/:id/edit', catchAsync(async (req, res) => {
    const giftCampaign = await GiftCampaign.findById(req.params.id)
    res.render('giftcampaigns/edit', { giftCampaign, statuses });
}))

// Route for submitting edit Gift Campaign form
app.put('/giftcampaigns/:id', validateCampaignItem, catchAsync(async (req, res) => {
    const { id: campId } = req.params;
    const giftCampaign = await GiftCampaign.findByIdAndUpdate(campId, { ...req.body.giftCampaign })
    res.redirect(`/giftcampaigns/${giftCampaign._id}`)
}))
// Route for deleting Gift Campaign form
app.delete('/giftcampaigns/:id', catchAsync(async (req, res) => {
    const { id: campId } = req.params;
    await GiftCampaign.findByIdAndDelete(campId);
    res.redirect('/giftcampaigns');
}))

// REVIEWS
// Route for submitting a Review
app.post('/giftcampaigns/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const giftCampaign = await GiftCampaign.findById(req.params.id);
    const review = new Review(req.body.review)
    giftCampaign.reviews.push(review);
    await review.save();
    await giftCampaign.save();
    res.redirect(`/giftcampaigns/${giftCampaign._id}`);
}))
// Route for deleting a Review
app.delete('/giftcampaigns/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id: campId, reviewId } = req.params;
    await GiftCampaign.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/giftcampaigns/${campId}`);
}))

// 404 Error
app.all('*', (req, res, next) => {
    next(new ExpressError('404 Page not found.', 404))
})

// Route for handling errors
app.use((err, req, res, next) => {
    const { status_code = 500, message = 'Something went wrong.' } = err;
    res.status(status_code).render('error', { err })
})


// Listening for HTML requests
app.listen(3000, () => {
    console.log('Serving on PORT 3000.')
});