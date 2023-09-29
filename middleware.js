const { campgroundsSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review.js');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // prev url
        req.flash('error', 'You must be signed in');
        res.redirect('/login');
    }
    else {
        next();
    }
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};


module.exports.validateCampground = (req, res, next) => {

    const result = campgroundsSchema.validate(req.body);
    const { error } = campgroundsSchema.validate(req.body);
    // console.log(result);
    if (error) {
        const mgs = error.details.map(el => el.message).join(',');
        throw new ExpressError(mgs, 404);
    }
    else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // console.log(campground);
    if (!campground.author.equals(req.user._id) || campground.author === null) {
        req.flash('error', 'You are not allowed to edit this page');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You are not allowed to edit this page');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};




module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        console.log(error)
        const mgs = error.details.map(el => el.message).join(',');
        throw new ExpressError(mgs, 404);
    }
    else {
        next();
    }
};
