var express = require('express');
var router = express.Router();

var path = require('path');

var controller = require(path.join(__dirname, '/../controllers/notes.controller'));

//	GET notes page
router.get('/notes', isLoggedIn(), controller.getNotes);

//	POST New Note
router.post('/create', isLoggedIn(), controller.createNote);

//	POST Update Note
router.post('/note/update/:id', isLoggedIn(), (req, res) => {
	var id = req.params.id;
	controller.updateNote(req, res, id);
});

//	POST Delete Note
router.post('/note/delete/:id', isLoggedIn(), (req, res) => {
	var id = req.params.id;
	controller.deleteNote(req, res, id);
});

//	GET Notes API
router.get('/api/notes', isLoggedIn(), controller.notesJSON);

function isLoggedIn() {
	return(req, res, next) => {
		console.log(`req.session.passport.user: $(JSON.stringify(req.session.passport)}`);
		if(req.isAuthenticated()) return next();
		return res.redirect('/');
	}
}

module.exports = router;