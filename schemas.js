const Joi = require('joi');

module.exports.giftItemSchema = Joi.object({
    giftItem: Joi.object({
        name: Joi.string().required(),
        unit_price: Joi.number().required().min(0),
        units_owned: Joi.number().required().min(0)
    }).required()
});

module.exports.giftCampaignSchema = Joi.object({
    giftCampaign: Joi.object({
        name: Joi.string().required(),
        status: Joi.string().valid('Preparing', 'Dispatched', 'Delivered').required(),
        // BUG Need to improve
        dispatch_date: Joi.date().required(),
        delivery_date: Joi.date().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required()
    }).required()
})

