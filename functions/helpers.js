var helpers = {
	escapeHTML: (string) => {
		var HTMLentities = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
			'/': '&#x2F;',
			'`': '&#x60;',
			'=': '&#x3D;'
		};
	  return String(string).replace(/[&<>"'`=\/]/g, (entity) => {
	    return HTMLentities[entity];
	  }); 
	},
	is_empty: (array) => {
		return array === undefined || array.length == 0
	},
	getKeys: (obj) => {
		var keys = [];
		Object.keys(obj).forEach(key => {
			keys.push(key);
		});
		return keys;
	},
	getValues: (obj) => {
		var keys = [];
		Object.keys(obj).forEach(key => {
			keys.push(obj[key]);
		});
		return keys;
	},
	instantiateAll: (attributes, Class) => {
		var objArr = [];
		attributes.forEach(row => {
			objArr.push(new Class({ attributes: row }));
		});
		return objArr;
	},
	convertToQuestionMarks: (arr) => {
		var unformatted = [];
		arr.forEach(function(itteration) {
			unformatted.push('?');
		});
		return unformatted.toString();
	}
}

module.exports = helpers;