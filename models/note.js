var path = require('path');
var Orm = require(path.join(__dirname, '/../config/orm'));
var validate = require(path.join(__dirname, '/../functions/validations'));

class Note extends Orm {
	
	static get tableName() { return 'notes'; }
	
	static get columns() { return ['id', 'name', 'content', 'user_id', 'created_at', 'note_updated', 'complete_by',
		'color', 'x_pos', 'y_pos', 'on_board', 'in_progress', 'completed', 'in_trash']; }
	
	constructor(args={}) {
		args.attributes.color = 'color' in args.attributes ? args.attributes.color : 'yellow';
		args.attributes.on_board = 'on_board' in args.attributes ? args.attributes.on_board : 1;
		args.attributes.in_progress = 'in_progress' in args.attributes ? args.attributes.in_progress: 0;
		args.attributes.completed = 'completed' in args.attributes ? args.attributes.completed : 0;
		args.attributes.in_trash = 'in_trash' in args.attributes ? args.attributes.in_trash : 0;
		super(args);
	}
	
	validate() {
		this.errors = [];
		
		if(validate.is_empty(this.attributes.content)) {
			this.errors.push('Note must be filled out!');
		}
		
		return this.errors;
	}
}

module.exports = Note;