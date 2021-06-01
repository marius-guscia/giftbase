// NPM
const express = require('express');
const router = express.Router();
// Models
const GiftItem = require('../models/giftItem');
const GiftCampaign = require('../models/giftCampaign');
// Utils
const catchAsync = require('../utils/catchAsync');
// MW
const { isLoggedIn, validateGiftItem } = require('../middleware')

// GIFT ITEMS

// Route for redering Gift Items
router.get('/', catchAsync(async (req, res) => {
    const giftItems = await GiftItem.find({});
    res.render('giftitems/index', { giftItems })
}))
// Route for redering new Gift Item form
router.get('/new', (req, res, next) => {
    res.render('giftitems/new')
})
// Route for submitting new Gift Item form
router.post('/', validateGiftItem, catchAsync(async (req, res) => {
    const giftItem = new GiftItem(req.body.giftItem);
    await giftItem.save();
    res.redirect(`/giftitems/${giftItem._id}`)
}))
// Route for showing a Gift Item
router.get('/:id', catchAsync(async (req, res) => {
    const giftItem = await GiftItem.findById(req.params.id)
    res.render('giftitems/show', { giftItem });
}))
// Route for redering edit Gift Item form
router.get('/:id/edit', catchAsync(async (req, res) => {
    const giftItem = await GiftItem.findById(req.params.id);
    res.render('giftitems/edit', { giftItem });
}))
// Route for submitting edit Gift Item form
router.put('/:id', validateGiftItem, catchAsync(async (req, res) => {
    const { id: itemId } = req.params;
    // BUG: NO ERROR IF you enter string 
    const giftItem = await GiftItem.findByIdAndUpdate(itemId, { ...req.body.giftItem })
    // const giftItem = await GiftItem.findById(itemId);
    // giftItem.units_owned += parseInt(req.body.giftItem.units_added);
    // await GiftItem.findByIdAndUpdate(itemId, { ...giftItem })
    res.redirect(`/giftitems/${giftItem._id}`)
}))
// Route for deleting Gift Item form
router.delete('/:id', catchAsync(async (req, res) => {
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

module.exports = router;