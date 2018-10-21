var path = require('path');
var Orm = require(path.join(__dirname, '../config/orm'));

var helpers = require(path.join(__dirname, '/../functions/helpers'));

class user extends Orm {
	
	static get tableName() { return 'users'; }
	
	static get columns() { return ['id']; }
	
	constructor(args={}) {
		super(args);
	}
	
	getNotes(cb) {
		var sql = 'SELECT * FROM notes WHERE ?';
		var where = {
			user_id : this.attributes.id
		}
		Orm.findBySQL(sql, where, notes => {
			var Note = require(path.join(__dirname, '../models/note'));
			var noteObjects = helpers.instantiateAll(notes, Note);
			cb(noteObjects);
		});
	}
};

module.exports = user;
