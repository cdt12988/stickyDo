var express = require('express');
var router = express.Router();

var indexController = {};

indexController.landingPage = (req, res) => {
	res.render('index.hbs', { title: 'StickyDo' });
};

module.exports = indexController;