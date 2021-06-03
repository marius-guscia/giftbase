// NPM
const express = require('express');
const router = express.Router();
const passport = require('passport');
// Validation Data
const countyList = require('../public/validationData/countyList')
// Models
const User = require('../models/user');
// Utils
const catchAsync = require('../utils/catchAsync');
// MW
const { validateUser } = require('../middleware');


// User Routes
// Route for rendering a new User form
router.get('/register', (req, res) => {
    res.render('users/register', { countyList });
})
// Route for submitting a new User
router.post('/register', validateUser, catchAsync(async (req, res) => {
    try {
        const { password } = req.body;
        const user = new User(req.body);
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/giftcampaigns');
        });
    } catch (err) {
        console.log(err)
        res.redirect('/register')
    }
}))

// Route for rendering a Login form
router.get('/login', (req, res) => {
    res.render('users/login');
})
// Route for submitting a Login
router.post('/login',
    passport.authenticate('local', {
        // failureFlash: true,
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.redirect('/giftcampaigns');
    }
)

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;