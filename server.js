//	Load Environment Variables from .env into process.env
require('dotenv').config();

//	Dependencies
var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var hbs = exphbs.create({});
var db = require(path.join(__dirname + '/config/connection'));
var Orm = require(path.join(__dirname + '/config/orm'));
//	Pass DB connection into custom ORM
Orm.setDB(db);

//var favicon = require('serve-favicon');
//var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var randomstring = require('randomstring');

//	Authentication Packages
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var MySQLStore = require('express-mysql-session')(session);
var bcrypt = require('bcrypt');

//	Setup Express App
const app = express();
var PORT = process.env.PORT || 8080;

//	Serve static directory
app.use(express.static(path.join(__dirname + '/public')));


//	Setup View Engine
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', '.hbs');

//	Setup Middleware
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

//	Create Session Store arguments
var sessionStoreOptions = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
};
//	 Create Session Store using above arugments
var sessionStore = new MySQLStore(sessionStoreOptions);
//	Setup Session Store with the options detailed below
app.use(session({
//	Secret is added on to the cookie returned to the user so it can be matched later to ensure it is correct (similar to salting a password)
//	Could/should use a random string generator here
	secret: randomstring.generate(25),
//	Resave will update the session each time a page is loaded, even if the user did not make any changes (autosave)
	resave: false,
//	Creates a cookie for the user automatically when they load a page, instead of only when we tell it to (when they login)
	saveUninitialized: false,
//	This option includes our MySQLStore object to store our sessions within our DB
	store: sessionStore
//	If using https, would need to set cookie to secure: true
//	cookie: { secure: true }
}));
/*

If, for whatever reason, the Sessions table was not automatically created within the DB by setting the sessionStore above,
can create the table manually using this .sql:

CREATE TABLE IF NOT EXISTS `sessions` (
`session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
`expires` int(11) unsigned NOT NULL,
`data` text COLLATE utf8mb4_bin,
PRIMARY KEY (`session_id`)
) ENGINE=InnoDB;

*/

//	Setup Passport Middlware
app.use(passport.initialize());
//	Integrate passport with express-session
app.use(passport.session());

//	This custom middleware function will set a new property for res.locals that can be accessed within ALL of our views
//	This prevents the need to pass this property/value into every route/render
//	Also used to authenticate if a user is currently logged in (isAuthenticated) and dynamically render pages accordingly
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.isAuthenticated();
	next();
});

//	Routes
// var notes = require(path.join(__dirname, './controllers/notes.controller'));
var notes = require(path.join(__dirname, './routes/notes'));
// var users = require(path.join(__dirname, './controllers/users.controller'));
var users = require(path.join(__dirname, './routes/auth'));
// var index = require(path.join(__dirname, './controllers/index.controller'));
var index = require(path.join(__dirname, './routes/index'));
// var index = require(path.join(__dirname + '/routes/index'));

app.use(users);
app.use(notes);
app.use(index);

//	Setup Passport Local Strategy logic for user login authentication
passport.use(new LocalStrategy((username, password, done) => {
	var sql = 'SELECT id, hashed_password FROM users WHERE ?';
	var query = db.query(
		sql,
		{
			username: username
		},
		(err, data, fields) => {
			//	Have passport handle query error, if one exists
			if(err) { done(err) }
			//	Return false if no results where found (username not found)
			if(data.length == 0) {
				done(null, false);
			} else {
				//	Otherwise, hash the password entered and compare with the hashed_password returned from the DB for the entered username
				var hashed_password = data[0].hashed_password.toString();
				var user_id = data[0].id;
				bcrypt.compare(password, hashed_password, (error, response) => {
					if(response === true) {
						return done(null, { user_id: user_id });
					} else {
						return done(null, false);
					}
				});
			}
		}
	);
}));

//	Setup Passport Local Strategy logic for user registration authentication
passport.use('local-register', new LocalStrategy(
	{
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, next) {
		var User = require('./models/users');
		bcrypt.hash(password, 10, (err, hash) => {
			var data = {
				username: username,
				email: req.body.email,
				hashed_password: hash,
			};
			var user = new User({attributes: data});
			console.log('userObj:', user);
			user.save(result => {
				if(result) {
					return next(null, { user_id: user.attributes.id });
				} else {
					console.log('User NOT created...');
					return next(null, false);
				}
			});
		});
	}
));

//	Setup Error Handler
app.use((err, req, res, next) => {
	//	set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	//	render the error page
	res.status(err.status || 500);
	res.render('error');
});

//	Start server and run the app!
app.listen(PORT, () => {
	console.log("App listening on PORT " + PORT);
});