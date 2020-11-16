var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then((users) => { 
     res.statusCode = 200;
     res.setHeader('Content-Type', 'application/json');
     res.json(users); 
  }, (err) => { next(err) })
  .catch( (err) => next(err) );
  //res.send('respond with a resource');
});



//the register method is provided by the passport-local-mongoose to create a user document 
router.post('/signup', (req, res, next) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      }
      else {
        if(req.body.firstname) {
          user.firstname = req.body.firstname; //fill the firstname field of this user document through the body of req message
        }
        if(req.body.lastname) {
          user.lastname = req.body.lastname; //fill the lastname field of this user document through the body of req message
        }
        user.save((err, user) => {
          if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => { //authenticate the user to ensuyre successful registration of the user
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registrastion Successful!'});
          });
        });
      }
    });
});

//TRACKING THE USER BY CHECKING THEIR AUTHENTICATION. 
//After the user signed up, they should login with their username and password. on logging in, a token will be assigned to them
//passport.authenticate will mount user property on the request message(req.user) to authenticate the valid user
router.post('/login', passport.authenticate('local'), (req, res) => { 
  var token = authenticate.getToken({_id: req.user._id}); //getting the id of the authenticated user(payload) and assign a token to it
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
);

//used for deleting the cookie that is stored on the client side
router.get('/logout', (req, res, next) => {
    if (req.session) { //if session exists i.e not null
      req.session.destroy();//remove this session from  the server side
      res.clearCookie('session-id') //delete the cookie from the client side in the reply message
      res.redirect('/'); //redirect the client to the home page of our application once they logged out
    }
    else { //if req.session doesn't exist i.e if user has already signed out,
        var err = new Error('You are not authenticated');
        err.status = 403;
        next(err);
    }
})  


module.exports = router;
