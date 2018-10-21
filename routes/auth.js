var express = require('express');
var router = express.Router();
var path = require('path');

var passport = require('passport');
var bcrypt = require('bcrypt');
const saltRounds = 10;

// var expressValidator = require('express-validator');

const db = require(path.join(__dirname + '/../config/connection'));

var controller = require(path.join(__dirname, '/../controllers/users.controller'));

//	GET profile page
router.get('/profile', isLoggedIn(), controller.profile);

//	GET login page
router.get('/login', controller.login);

//	POST login
//	passport.authenticate using a 'local' strategy, which is setup within server.js
router.post('/login', passport.authenticate('local', {
	successRedirect: '/notes',
	failureRedirect: '/login'
}));

//	GET logout page
router.get('/logout', controller.logout);

//	GET user registration page
router.get('/register', controller.registration);


//	POST Registration
router.post('/register', registerValidation, passport.authenticate('local-register', {
	successRedirect: '/notes',
	failureRedirect: '/register',
	failureFlash: true
}));

//	Middleware that uses Express-Validator to validate the registration form
function registerValidation(req, res, next) {
	//	perform express-validation on all of the POSTed form fields (using the form names)
	req.checkBody('username', 'Username cannot be blank').notEmpty();
	req.checkBody('username', 'Username must be between 4-15 characters long').len(4, 15);
	req.checkBody('email', 'Email must be a valid email format').isEmail();
	req.checkBody('email', 'Email address must be between 4-100 characters long').len(4, 100);
	req.checkBody('password', 'Password must be between 8-100 characters long').len(8, 100);
	req.checkBody('password', 'Password must include one lowercase character, one uppercase character, a number, and a special character')
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,100}$/, "i");
	req.checkBody('confirm_password', 'Password must be between 8-100 characters long').len(8, 100);
	req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.password);

// 	const errors = req.validationErrors();		(This method is deprecated)
	req.getValidationResult().then((results) => {
		if(results.isEmpty() === false) {
// 			console.log('Errors: ', results.array());
	
			return res.render('register', {
				title: 'Registration Error',
				errors: results.array()
			});
		} else {
			return next();
		}
	});
}

//	Custom Middleware that checks whether or not a user is authenticated and either redirects them or proceeds (next) accordingly
function isLoggedIn() {
	return(req, res, next) => {
// 		console.log(`req.session.passport.user: $(JSON.stringify(req.session.passport)}`);
		if(req.isAuthenticated()) return next();
		return res.redirect('/login');
	}
}

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = router;