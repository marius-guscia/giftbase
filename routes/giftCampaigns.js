// NPM
const express = require('express');
const router = express.Router();
// Models
const GiftItem = require('../models/giftItem');
const GiftCampaign = require('../models/giftCampaign');
// Utils
const catchAsync = require('../utils/catchAsync');
// MW
const { isLoggedIn, validateGiftCampaign } = require('../middleware')

// Gift Campaign statuses
const statuses = ['Preparing', 'Ready', 'Dispatched'];

// GIFT CAMPAIGNS

// Route for redering Gift Campaigns
router.get('/', catchAsync(async (req, res) => {
    const giftCampaigns = await GiftCampaign.find({});
    res.render('giftcampaigns/index', { giftCampaigns })
}))
// Route for rendering new Gift Campaign form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('giftcampaigns/new')
})
// Route for submitting new Gift Campaign form
router.post('/', validateGiftCampaign, catchAsync(async (req, res, next) => {
    const giftCampaign = new GiftCampaign(req.body.giftCampaign);
    await giftCampaign.save();
    res.redirect(`/giftcampaigns`)
}))

// Route for adding Gift Items to Gift Campaign
router.put('/:id/add', catchAsync(async (req, res) => {
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
router.delete('/:id/remove', catchAsync(async (req, res) => {
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
router.get('/:id', catchAsync(async (req, res) => {
    const giftItems = await GiftItem.find({});
    const giftCampaign = await GiftCampaign.findById(req.params.id)
        .populate({
            path: 'contents',
            populate: ('gift_item')
        })
        .populate('gift_item')
        .populate('reviews')
        .populate({
            path: 'reviews',
            populate: 'author'
        });
    res.render('giftcampaigns/show', { giftCampaign, giftItems });
}))
// Route for redering edit Gift Campaign form
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const giftCampaign = await GiftCampaign.findById(req.params.id)
    res.render('giftcampaigns/edit', { giftCampaign, statuses });
}))

// Route for submitting edit Gift Campaign form
router.put('/:id', isLoggedIn, validateGiftCampaign, catchAsync(async (req, res) => {
    const { id: campId } = req.params;
    const giftCampaign = await GiftCampaign.findByIdAndUpdate(campId, { ...req.body.giftCampaign })
    res.redirect(`/giftcampaigns/${giftCampaign._id}`)
}))
// Route for deleting Gift Campaign form
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id: campId } = req.params;
    await GiftCampaign.findByIdAndDelete(campId);
    res.redirect('/giftcampaigns');
}))

module.exports = router;