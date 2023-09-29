const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');


const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) {
    //     throw new ExpressError('Invalid campground data', 400);
    // }

    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();


    // console.log(geoData.body.features);
    // res.send("Ok");

    const campground = new Campground(req.body.campground);

    campground.geometry = geoData.body.features[0].geometry;

    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    // console.log(req.body.campground);

    await campground.save();
    // console.log(campground);
    req.flash('success', "Successfully made a new camp")
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author');
    // console.log(campground); 
    if (!campground) {
        req.flash('error', 'The camp not found')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'The camp not found')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};


module.exports.updateCampground = async (req, res) => {
    // res.send("working");
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground);
    }
    req.flash('success', 'Successfully updated camp')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted camp')
    res.redirect('/campgrounds');
};