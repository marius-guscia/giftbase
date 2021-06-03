// NPM
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-Local');

// Models
const User = require('./models/user');

// Routers
const giftCampaignRoutes = require('./routes/giftCampaigns');
const giftItemRoutes = require('./routes/giftItems');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// Utils
const ExpressError = require('./utils/ExpressError');

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

const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}

// Using Session
app.use(session(sessionConfig));

// Using Passport
app.use(passport.initialize());
app.use(passport.session());
// Specifying authentication method
passport.use(new LocalStrategy(User.authenticate()));
// Setting serializing & deserializing methods
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Setting Locals
app.use((req, res, next) => {
    // For hiding nav login/logout links
    res.locals.currentUser = req.user;
    next();
})

// Using Routers
app.use('/giftcampaigns', giftCampaignRoutes);
app.use('/giftitems', giftItemRoutes);
app.use('/giftcampaigns', reviewRoutes);
app.use('/', userRoutes);

// Route for redering HOME PAGE
app.get('/', (req, res) => {
    res.render('home')
})

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