const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsyns');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundsSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');


const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage });


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.createCampground));
// .post(upload.array('campground[image]'), (req, res) => {
//     console.log(req.body, req.files);
//     res.send('worked');
// });



router.get('/new', isLoggedIn, campgrounds.renderNewForm);
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// router.get('/', catchAsync(campgrounds.index));
// router.get('/:id', catchAsync(campgrounds.showCampground));
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
// router.put('/:id', isLoggedIn, validateCampground, catchAsync(campgrounds.updateCampground));
// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;