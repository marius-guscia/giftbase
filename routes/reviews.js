// NPM
const express = require('express');
const router = express.Router();
// Models
const GiftCampaign = require('../models/giftCampaign');
const Review = require('../models/review');
// Utils
const catchAsync = require('../utils/catchAsync');
// MW
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')

// REVIEWS
// Route for submitting a Review
router.post('/:id/reviews', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const giftCampaign = await GiftCampaign.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    giftCampaign.reviews.push(review);
    await review.save();
    await giftCampaign.save();
    res.redirect(`/giftcampaigns/${giftCampaign._id}`);
}))
// Route for deleting a Review
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id: campId, reviewId } = req.params;
    await GiftCampaign.findByIdAndUpdate(campId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/giftcampaigns/${campId}`);
}))

module.exports = router;