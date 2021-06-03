// NPM
const Joi = require('joi');
// Validation Data
const countyList = require('./public/validationData/countyList');

// Gift Item server side validation
module.exports.giftItemSchema = Joi.object({
    giftItem: Joi.object({
        name: Joi.string().required(),
        unit_price: Joi.number().required().min(0),
        units_owned: Joi.number().min(0).required()
    }).required()
});
// Gift Campaign server side validation
module.exports.giftCampaignSchema = Joi.object({
    giftCampaign: Joi.object({
        name: Joi.string().required(),
        status: Joi.string().valid('Preparing', 'Ready', 'Dispatched').required(),
        dispatch_date: Joi.date().required(),
        delivery_date: Joi.date().required()
    }).required()
});
// Review server side validation
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required()
    }).required()
})
// User server side validation
module.exports.userSchema = Joi.object({
    username: Joi.string().required(),
    admin: Joi.boolean().required(),
    password: Joi.string().required(),
    fullname: Joi.string().required(),
    address: Joi.object().keys({
        phone: Joi.number().required(),
        address: Joi.string().required(),
        zip: Joi.number().min(01001).max(99425).required(),
        city: Joi.string().required(),
        county: Joi.string().valid(...countyList).required()
    }).required()
})

