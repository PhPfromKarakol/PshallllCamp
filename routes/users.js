const User = require('../models/user');
const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsyns');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');
const user = require('../models/user');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));
// router.get('/register', users.renderRegister);
// router.post('/register', catchAsync(users.register));
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        users.login
        // Now we can use res.locals.returnTo to redirect the user after login
    );

// router.get('/login', users.renderLogin);

// router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
//     users.login
//     // Now we can use res.locals.returnTo to redirect the user after login
// );
router.get('/logout', users.logout);

module.exports = router;