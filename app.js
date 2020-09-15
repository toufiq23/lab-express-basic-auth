require('dotenv').config();

const path = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const favicon = require('serve-favicon');

// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const mongoose = require('mongoose');

// require database configuration
require('./configs/db.config');

// Session login
const app = express();
require('./configs/session.config')(app); // the "app" that gets passed here is the previously defined Express app (const app = express();)

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);


// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// Express View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Middleware Setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

// Routers
const index = require('./routes/index.routes');
app.use('/', index);

const auth = require('./routes/auth.routes')
app.use('/', auth);

// Catch missing routes and forward to error handler
app.use((req, res, next) => next(createError(404)));

// Catch all error handler
app.use((error, req, res) => {
	// Set error information, with stack only available in developement
	res.locals.message = error.message;
	res.locals.error = req.app.get('env') === 'development' ? error : {};

	// render the error page
	res.status(error.status || 500);
	res.render('error');
});

module.exports = app;