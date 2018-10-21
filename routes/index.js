var express = require('express');
var router = express.Router();
var path = require('path');

var controller = require(path.join(__dirname, '/../controllers/index.controller'));

//	GET landing page
router.get('/', controller.landingPage);

//	Custom Middleware that checks whether or not a user is authenticated and either redirects them or proceeds (next) accordingly

module.exports = router;