if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


// console.log(process.env.secret)

const express = require('express');
const app = express();

const { readdirSync, rmSync } = require('fs');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const Joi = require('joi');
const { campgroundsSchema, reviewSchema } = require('./schemas.js');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const catchAsync = require('./utilities/catchAsyns');
const ExpressError = require('./utilities/ExpressError');


const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const { parseArgs } = require('util');


const mongoSanitize = require('express-mongo-sanitize');

const helmet = require('helmet');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL;

main().catch(err => console.log(err));
async function main() {
    // 'mongodb://127.0.0.1:27017/yelp-camp'
    await mongoose.connect(dbUrl);
    //console.log(" mongo connection open!");
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

// mongoose.set('strictQuery', true);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on('error', function (e) {
    console.log('session store error');
})

const sessionConfig = {
    store,
    name: 'sjfs876865apfhi45435',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        // for max time of being coookies on the browser page
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));

app.use(flash());
// app.use(helmet()); //including this breaks the CSP

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dyut6sms4/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dyut6sms4/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dyut6sms4/"
];
const fontSrcUrls = ["https://res.cloudinary.com/dyut6sms4/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dyut6sms4/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dyut6sms4/"],
            childSrc: ["blob:"]
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});



// app.get('/fakeUser', async (req, res) => {
//     const user = new User({
//         email: 'sobaka@gmail.com',
//         username: 'sobakaaaa',
//     });
//     const newUser = await User.register(user, 'sobakaaaa');
//     res.send(newUser);
// });

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);


app.get('/', (req, res) => {
    // res.send("Hello from Yelp Camp");
    res.render("home");
})

app.all('*', (req, res, next) => {
    //res.send('404!!!');
    next(new ExpressError('Page not found', 404));
});


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'oh no, something went wrong';
    }
    res.status(statusCode).render('error', { err });
    //res.send('malysh, kosyk')
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("serving");
})




