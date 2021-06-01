// NPM
const express = require('express');
const router = express.Router();
const passport = require('passport');
// Models
const User = require('../models/user');
// Utils
const catchAsync = require('../utils/catchAsync');

// User Routes
// Route for rendering a new User form
router.get('/register', (req, res) => {
    res.render('users/register');
})
// Route for submitting a new User
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/giftcampaigns');
        });
    } catch (err) {
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
    res.redirect('/giftcampaigns');
})

module.exports = router;