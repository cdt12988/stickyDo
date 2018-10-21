var express = require('express');
var router = express.Router();

var path = require('path');
var Note = require(path.join(__dirname, '/../models/note'));
var User = require(path.join(__dirname, '/../models/users'));
var validate = require(path.join(__dirname, '/../functions/validations'));

var moment = require('moment');

var noteController = {};

noteController.getNotes = (req, res) => {
	getUser(req.user.user_id, user => {
		if(user) {
			user.getNotes(notes => {
// 				console.log('Note Objects:', notes);
				res.render('new.hbs', { notes: notes, user: user.attributes });
			});
		} else {
			console.log('User not found: ', req.user.user_id);
			res.redirect('/');
		}
	});
};

noteController.notesJSON = (req, res) => {
	getUser(req.user.user_id, user => {
		if(user) {
			user.getNotes(notes => {
				res.json(notes);
			});
		} else {
			console.log('User not found: ', req.user.user_id);
			res.redirect('/');
		}
	});
};

noteController.createNote = (req, res) => {
	getUser(req.user.user_id, user => {
		if(user) {
			if(validate.is_blank(req.body.name.trim())) return res.json({ error: 'Heading cannot be blank.' });
			if(!validate.has_length(req.body.name.trim(), { max: 35 })) {
				return res.json({ error: 'Heading cannot exceed 35 characters.' });
			}
			if(validate.is_blank(req.body.content.trim())) return res.json({ error: 'Note cannot be blank.' });
			if(!validate.has_length(req.body.content.trim(), { max: 55 })) {
				return res.json({ error: 'Note cannot exceed 55 characters.' });
			}
// 			console.log('\n\nUser:', user);
			var args = {
				attributes: req.body
			};
			args.attributes.user_id = user.attributes.id;
// 			console.log('\n\nArgs:', args);
			var note = new Note(args);
			note.save(result => {
				if(result) {
					var data = {
						id: note.attributes.id,
						color: note.attributes.color,
						rot: 'rot-6n'
					};
// 					console.log('\n\nNew Note:', note);
// 					console.log('\n\nSaved Note:', result);
// 					console.log('\n\nJSON Response:', data);
					res.json(data);
				} else {
					res.json(false);
				}
			});
		} else {
			res.json(false);
		}
	});
	
};

noteController.updateNote = (req, res, id) => {
	getUser(req.user.user_id, user => {
		if(user) {
			Note.findById(id, noteResult => {
				if(noteResult) {
// 					console.log('\n\nNote:', noteResult);
// 					console.log('\n\nRequest Body:', req.body);
					var note = new Note({ attributes: noteResult });
					note.attributes.x_pos = req.body.x_pos;
					note.attributes.y_pos = req.body.y_pos;
					note.attributes.on_board = req.body.on_board;
					note.attributes.in_progress = req.body.in_progress;
					note.attributes.completed = req.body.completed;
					note.attributes.in_trash = req.body.in_trash;
					note.attributes.note_updated = moment().format('YYYY-MM-DD hh:mm:ss');
					note.save(result => {
						if(result) {
							res.json(true);
						} else {
							res.json(false);
						}
					});
				} else {
					res.json(false);
				}
			});
		} else {
			res.json(false);
		}
	});
};

noteController.deleteNote = (req, res, id) => {
	getUser(req.user.user_id, user => {
		if(user) {
			Note.findById(id, noteDB => {
				if(noteDB) {
					var note = new Note({ attributes: noteDB });
					note.delete((result) => {
						if(result) {
							res.json(true);
						} else {
							res.json(false);
						}
					});
				} else {
					res.json(false);
				}
			});
		} else {
			res.json(false);
		}
	});
};

function getUser(user_id, cb) {
	User.findById(user_id, user => {
		if(user) {
			var args = {
				attributes: user
			};
			var newUser = new User(args);
			cb(newUser);
		} else {
			cb(false);
		}
	});
}

module.exports = noteController;