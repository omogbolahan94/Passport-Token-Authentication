var createError = require('http-errors'); 
var express = require('express'); 
var path = require('path'); 
var cookieParser = require('cookie-parser'); 
var logger = require('morgan'); 
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index'); 
var usersRouter = require('./routes/users'); 
var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');

//establish a connection with the MongoDB server that is running in the background using the mongoose
const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/confusion'; //the address of the MOngoDB database that is running
const connect = mongoose.connect(url);

connect.then(
  (db) => { //resolve function
    console.log("Connected to the server");
  },
  (err) => {//reject function
    console.log(err);
  })


var app = express(); 

// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false } )); 
//app.use(cookieParser('12345-67890-09876-54321')); //using singed cookies in this application with the key: '12345-67890-09876-54321'

app.use(session({
    name: 'session-id', //name of the cookie
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

app.use('/', indexRouter); 
app.use('/users', usersRouter); 

//ensure the user is authorise before granting access to the client to static files and routers
//creating a basic authentication middleware(auth) as shown below
//we will do authentication using login method in user.js
function auth(req, res, next) {
    console.log(req.session); //the session property is now part of req object

    //if session with field property user does not exist yet
    if(!req.session.user) {
        var err = new Error('You are not authenticated!') ;
        err.status = 401; //unauthorise code
        next(err); //go to the error handler to construct the reply message
        return;
    }
    else {
        if (req.session.user === 'authenticated') { 
            next(); 
        }
        else {
          var err = new Error('You are not authenticated!');
          err.status = 403; //unauthorise code
          return next(err);;
        }      
    }
}
app.use(auth);

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
