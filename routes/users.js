var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//the user name is provided as a json string inside the body of the incoming request
//note that this body of the request is being passed by the body-parser
//we will check that the user with the username doesn't exists within the systems

router.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username})
    .then((user) => {
        if(user !== null) { ////if the username of the user is not null, that means the user already exists(no 2 users must have the same username)
            var err = new Error('User ' + req.body.username + ' already exists');
            err.status = 403;
            next(err); 
        }
        else {
          return User.create({
              username: req.body.username,
              password: req.body.password
          });
        }; //this returns a promise to be verified
    })
    .then((user) => { //user will be a JSON object {username:req.body.username, password:req.body.password, _id:base64 String, admin:false} which becomes a record in MongoDB
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({status: "Registration successful", user: user}) //loading the user as a property in the reply message which is optional though 
    }, (err) => next(err) )
    .catch((err) => next(err))
});

//TRACKING THE USER BY CHECKING THEIR AUTHENTICATION. 
router.post('/login', (req, res, next) => {

  if(!req.session.user) { //if cookie for user sesion has not been set up, and and set it up once user logged in successfully
    var authHeader = req.headers.authorization; 

    if(!authHeader) {  //if authorization property of the req headers is null, it means the user has not entered the username and the password fields
        var err = new Error('You are not authorized!') ;

        res.setHeader('WWW-Authenticate', 'Basic'); 
        err.status = 401; 
        next(err); 
        return;
    }

    //authHeader = Authorization: Basic encoded-string-in-Base64
    //authHeader.split(' ') = ['Basic', encoded-string-in-Base64]
    //authHeader.split(' ')[1].toString() = "userName:password"
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':'); //[userName, Password]    
    var username = auth[0];
    var password = auth[1];

    //search if the user name of a particular user document already exists(has been created on the User collection) in the User collection in database
    User.findOne({username: username}) //return a document in User collection with the username property as the value of the username retrieved from the headers authorization property
    .then((user) => { //returns a document of the User collection bassed on the username specified above
        if(user === null) {
          var err = new Error('User ' + username + ' does not exists');
          err.status = 403; 
          next(err);
        }
        else if (user.password !== password) { //check if password is correct if user already entered the correct username
          var err = new Error('Your password is incorrect');
          err.status = 401; 
          next(err);
        }
        else if(user.username === username && user.password === password) { //this else if statement is not necessary
            req.session.user = 'authenticated'; //setting the  cookie for this user 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are authenticated'); 
        } 
    })
    .catch((err) => next(err))  
  }
  else { //we dont need to verify if the user has already logged in i.e req.session.user !== null
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated'); 
  }
});

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
