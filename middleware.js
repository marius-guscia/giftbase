// Joi Schemas
const { giftCampaignSchema, giftItemSchema, reviewSchema } = require('./schemas.js');

// Models
const Review = require('./models/review');

// MW for checking if there is a User logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log('You must be logged in.');
        return res.redirect('/login');
    }
    next();
}

// JOI MW for Reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// JOI MW for Gift Campaigns
module.exports.validateGiftCampaign = (req, res, next) => {
    const { error } = giftCampaignSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// JOI MW for Gift Items
module.exports.validateGiftItem = (req, res, next) => {
    const { error } = giftItemSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
// JOI MW for Reviews
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id: campId, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        return res.redirect(`/giftcampaigns/${campId}`);
    } else {
        next();
    }
}