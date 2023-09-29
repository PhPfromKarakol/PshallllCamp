const express = require('express');
const { readdirSync } = require('fs');

const Campground = require('../models/campground');
const { places, descriptors } = require('../seeds/seedHelper');
const cities = require('../seeds/cities');
const mongoose = require('mongoose');

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log(" mongo connection openfdsfds!");
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}



const sampleNum = array => array[Math.floor(Math.random() * array.length)];


const seedDb = async () => {
    await Campground.deleteMany({});
    // // // const c = new Campground({
    //     title: 'purple field',
    // })
    // await c.save();

    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor((Math.random() * 1000));
        const price = Math.floor(Math.random() * 30) + 10;
        const newCamp = new Campground({
            author: "650f3032a5a6aee1647e3730",
            location: `${cities[random1000].city} , ${cities[random1000].state}`,
            title: `${sampleNum(descriptors)} ${sampleNum(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ],
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dyut6sms4/image/upload/v1695849568/Pshallll%20camp/okll3xkvh4hukyjlta1m.jpg',
                    filename: 'Pshallll camp/okll3xkvh4hukyjlta1m',
                },
                {
                    url: 'https://res.cloudinary.com/dyut6sms4/image/upload/v1695849568/Pshallll%20camp/qcw7apdalbyx2pyn4jxu.jpg',
                    filename: 'Pshallll camp/qcw7apdalbyx2pyn4jxu',
                },
                {
                    url: 'https://res.cloudinary.com/dyut6sms4/image/upload/v1695849569/Pshallll%20camp/zkbk4pyjb0azfek4g8nz.jpg',
                    filename: 'Pshallll camp/zkbk4pyjb0azfek4g8nz',

                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique iusto expedita voluptatibus, praesentium numquam laborum aliquam fuga consectetur eveniet labore.Necessitatibus quisquam nulla placeat animi minusfacere fugiat ea a?',
            price
        });
        await newCamp.save();
    };
};


seedDb().then(() => {
    mongoose.connection.close();
});