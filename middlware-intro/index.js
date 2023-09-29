const express = require('express');
const app = express();
const morgan = require('morgan');




app.use((req, res, next) => {
    console.log("This is my first middleware!");
    next();
});
app.use((req, res, next) => {
    console.log("This is my second middleware!");
    next(); // will move to next middleware, if there is now next function, the morgan function will not be executed
    // if we write some code after next function, it will be run eventually in the end but might come after all tags. In order to prevent this, we can use return next, since after return the function will not look to code after that return.

});
app.use(morgan('tiny'));

app.use('/dogs', (req, res, next) => {
    console.log("I love dogs");
    next();
});

app.get('/', (req, res) => {
    res.send("Home Page");
});

app.get('/dogs', (req, res) => {
    res.send("It is the piece of dog shit");
});


app.listen(4000, () => {
    console.log("App is running in my pc!")

});