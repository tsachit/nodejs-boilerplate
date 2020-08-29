const bodyParser = require('body-parser');
const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const { foo } = require('./utils');

console.log('Getting foo from utils, foo: ', foo);

require('dotenv').config();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// use public for local and build for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

// global variable set
app.use((req, res, next) => {
  res.locals.title = process.env.APP_NAME || '';
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/something', (req, res) => {
  // post something here
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.title = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('_partials/error');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
