var createError = require('http-errors'); 
var express = require('express'); 
var path = require('path'); 
var cookieParser = require('cookie-parser'); 
var logger = require('morgan'); 
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate  = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index'); 
var usersRouter = require('./routes/users'); 
var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');

//establish a connection with the MongoDB server that is running in the background using the mongoose
const mongoose = require('mongoose');
const url = config.mongoUrl; //the address of the MOngoDB database that is running
const connect = mongoose.connect(url);

connect.then(
  (db) => { //resolve function
    console.log("Connected to the server");
  },
  (err) => {//err function due to rejection
    console.log(err);
  })


var app = express(); 

// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({extended: false })); 

app.use(passport.initialize()); //once a user logged in, the passport.authenticate in the users.js add a user property to the request message and the passport


app.use('/', indexRouter); 
app.use('/users', usersRouter); 


app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter); //any request coming to the /dishes will be handled by the dishRouter
app.use('/promotions', promoRouter); //any request coming to the /promotions will be handled by the promotionsRouter
app.use('/leaders', leaderRouter); //any request coming to the /leaders will be handled by the leadersRouter

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
