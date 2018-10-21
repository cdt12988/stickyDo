var path = require('path');
var validate = require(path.join(__dirname + '/../functions/validations'));
var helpers = require(path.join(__dirname + '/../functions/helpers'));

class Orm {
	
	constructor(args={}) {
		this.attributes = 'attributes' in args ? args.attributes : {};
		this.errors = [];
	}
	
	static setDB(db) {
		this.db = db;
	}
	
	static instantiateAll(attributesArr, Class) {
		return helpers.instantiateAll(attributesArr, Class);
	}
	
	static findBySQL(sql, options=[], cb=()=>{}) {
		this.db.query(sql, options, (err, res) => {
				if(err) throw err;
				cb(res);
			}
		);
	}
	
	static findAll(cb=()=>{}) {
		var sql = 'SELECT * FROM ' + this.tableName;
		this.findBySQL(sql, [], cb);
	}
	
	static findOne(options, cb) {
		if('where' in options) {
			var properties = [];
			var values = [];
			Object.keys(options.where).forEach(key => {
				properties.push(key);
				values.push(options.where[key]);
			});
			var sql = 'SELECT * FROM ' + this.tableName + ' WHERE ? LIMIT 1';
			this.db.query(
				sql,
				[
					options.where
				],
				(err, res) => {
					if(err) throw err;
					if(validate.is_empty(res)) {
						cb(false);
					} else {
						cb(res[0]);
					}
				}
			);
		} else {
			return false;
		}
	}
	
	static countAll(cb=()=>{}) {
		var sql = 'SELECT COUNT(*) AS count FROM ' + this.tableName;
		this.findBySQL(sql, [], cb);
	}
	
	static findById(id=0, cb=()=>{}) {
		var sql = 'SELECT * FROM ' + this.tableName + ' ';
		sql += 'WHERE id = ?'
		console.log(sql, id);
		this.db.query(sql, [id], (err, res) => { 
			if(err) throw err;
			if(validate.is_empty(res)) {
				cb(false);
			} else {
				cb(res[0]);
			}
		});
	}
	
	validate() {
		this.errors = [];
		//	Each subclass should set its own validations
		return this.errors;
	}
	
	removeId() {
		var attributes = {};
		Object.keys(this.attributes).forEach(key => {
			if(key == 'id') { return; }
			attributes[key] = this.attributes[key];
		});
		return attributes;
	}
	
	create(cb) {
		this.validate();
		if(!validate.is_empty(this.errors)) {
			cb(false);
		} else {
			var sql = 'INSERT INTO ' + this.constructor.tableName + ' (';
			sql += helpers.getKeys(this.attributes).join(', ');
			sql += ') VALUES (';
			sql += helpers.convertToQuestionMarks(Object.keys(this.attributes));
			sql += ')';
			this.constructor.db.query(sql, helpers.getValues(this.attributes), (err, res) => {
				if(err) throw err;
				this.attributes.id = res.insertId;
				cb(res);
			});
		}
	}
	
	update(cb) {
		this.validate();
		if(!validate.is_empty(this.errors)) {
			cb(false);
		} else {
			var sql = 'UPDATE ' + this.constructor.tableName + ' ';
			sql += 'SET ? WHERE ? LIMIT 1';
			this.constructor.db.query(sql, [this.removeId(), {id: this.attributes.id}], (err, res) => {
				if(err) throw err;
				cb(res);
			});
		}
	}
	
	save(cb=()=>console.log('Save method called')) {
		if('id' in this.attributes) {
			this.update(cb);
		} else {
			this.create(cb);
		}
	}
	
	delete(cb=()=>console.log('Delete method called')) {
		var sql = 'DELETE FROM ' + this.constructor.tableName + ' ';
		sql += 'WHERE id = ? LIMIT 1';
		this.constructor.db.query(sql, [this.attributes.id], (err, res) => {
			if(err) throw err;
			cb(res);
		});
	}
	
}

module.exports = Orm;