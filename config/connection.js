var mysql = require('mysql');

var connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

//	If socketPath is needed as a connection property:
//		* Find your mysql socket path in terminal by typing: netstat -ln | grep mysql
//		* Copy the path and add the following property-value pair after the database: DB_NAME, pair:
//		* socketPath: 'path/to/copied/socket'

connection.connect((err) => {
	if(err) {
		console.error('error connecting: ', err.stack);
		return;
	}
	console.log('Connected to MySQL database as id: ' + connection.threadId);
});

module.exports = connection;