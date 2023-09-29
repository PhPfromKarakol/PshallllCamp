const mongoose = require('mongoose');
const { campgroundsSchema } = require('../schemas');
const Schema = mongoose.Schema;
const Review = require('./review');
const User = require('./user');

const imageSchema = new Schema(
    {
        url: String,
        filename: String,
    }
);

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } };

const campGroundShema = new Schema({
    title: String,

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },

    image: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ]
}, opts);

campGroundShema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href = "/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 25)}...</p>`;
});

// mongoose middleware
// after deleting the campground it will run and pass the camp info
// we will catch this info and by ids which in doc.reviews ids
campGroundShema.post('findOneAndDelete', async function (doc) {
    //console.log('The post was deleted')
    //console.log(doc);
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('campground', campGroundShema);
