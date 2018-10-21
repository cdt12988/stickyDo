var express = require('express');
var router = express.Router();
var path = require('path');

const db = require(path.join(__dirname + '/../config/connection'));

// var expressValidator = require('express-validator');
var passport = require('passport');

var bcrypt = require('bcrypt');
const saltRounds = 10;

var authController = {};

authController.profile = (req, res) => {
	res.render('profile', { title: 'Profile' });
};

authController.login = (req, res) => {
	res.render('login', { title: 'Login' });
};

authController.logout = (req, res, next) => {
	req.logout();
	req.session.destroy(() => {
		//	This would clear the cookie from the user if we needed to do that, too
//		res.clearCoockie('connect.sid');
		res.redirect('/');
	});
};

authController.registration = (req, res, next) => {
	//	Both of these req behaviors are available via the passport package required
// 	console.log(req.user);
// 	console.log(req.isAuthenticated());
	res.render('register', { title: 'User Registration' });
};

module.exports = authController;