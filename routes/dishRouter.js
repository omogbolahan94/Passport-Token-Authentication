/*
BODY-PARSER:
    Any POST or PUT request that is made, the in the body of the 
    message sent by the client by the body-parser in JSON format

ENDPOINT:
    We defined the ENDPOINT by 'dishes' 

APP.ALL:
    Whatever is spacified in the function that is given for 
    app.all will be applied to all the incoming requests

    The next() function in the app.all allows us to use use other REST API verbs
*/

const express = require('express'),
      bodyParser = require('body-parser');

//making the dishRouter to interact with the MongoDB server using mongoose
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes') //Dishes here becomes a collection in our database
      

const dishRouter = express.Router();
dishRouter.use(bodyParser.json()); //the body of the request message will be in JSON format



//for REST API, we will open the GET operation for anybody but the POST, PUT and DELETE  
//operations will be restricted to authenticated users only
//this restriction is possible by the verifyUser function in authenticate.js
//comments.author knows the user document that will populate it because when it was assigned a token(which is used anywhere) to it based on the user id
dishRouter.route('/')  //mounting this express router in the index.js file. In index.js file, this router is mount  at the /dishes endpoint
.get((req, res, next) => {
     Dishes.find({})
    .populate('comments.author') //populate the author field of Dishes here with the User document before replying the client
    .then((dishes) => { //returns a collection which is an array of all existing dishes
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(dishes); //convert the array of dishes to json format
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
     Dishes.create(req.body) //document created is on the body of the request and then post to the server request(req.body)
    .then((dish) => { //returns a dish object
        console.log('Dish created ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //convert the array of dishes to json format
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
     Dishes.remove({}) //returns a response to be resolved when dishes are deleted
    .then((resp) => { 
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(resp); //convert the array of dishes to json format
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
});


dishRouter.route('/:dishId') //where the dishId is the special key generated for a particular document in our Dishes collection
.get( (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author') //populate the author field of comments with the user decument before replying the client 
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //convert the array of dishes to json format and return it
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.post( (req, res, next) => { 
    res.statusCode = 403;
    res.end('POST operation is not supported on /dishes/' + req.params.dishId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {$set: req.body}, {new: true}) //update and return the updated document
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //convert the array of dishes to json format
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => { 
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp); //returns the dish as response
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
});


/*this is a route to the sub-documents in the  commentns field of the Dishes collection */
dishRouter.route('/:dishId/comments')  
.get((req, res, next) => {
     Dishes.findById(req.params.dishId) //retrieve the document with this dishId
     .populate('comments.author') //populate the author field of comments with the user decument before replying the client 
     .then((dish) => { 
        if (dish !== null) { 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments); //return the comments field which is a field that returns list of sub-documents(list of comments document)
        }
        else {
            err = new Error("Dish " + req.params.dishId + " Not Found");
            err.status = 404;
            return next(err); //this is handles by the error handler in app.js
        }
     }, (err) => next(err)) 
    .catch( (err) => next(err) );
})
.post(authenticate.verifyUser, (req, res, next) => {//when a user is verified, a property user is added to request. this user property is an object litersl with an _id property which is unique to that verified user
     Dishes.findById(req.params.dishId) 
    .then((dish) => { //returns a dish object
       if(dish !== null) {
          req.body.author = req.user._id;//recall author ref the user by the _id tht's posting the comment. Remember we have verified the user with authenticate.verifyUser method in the post function 
          dish.comments.push(req.body);
          dish.save()
          .then((dish) => {
              Dishes.findById(dish._id)
              .populate('comments.author') //populating the author's information to the dish
              .then((dish) => {
                res.statusCode = 200;
                res.setHeader('content-type', 'application/json');
                res.json(dish);
              })   
          })
       }
       else {
          err = new Error("Dish " + req.params.dishId + " Not Found");
          err.status = 404;
          return next(err); //this is handled by the error handler in app.js
       }
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
      if(dish !== null) {
         for(let i = (dish.comments.length - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove(); //each document in the comments array also has a unique id
         } 
         //to indicate the updated dish being returned afetr deleting all the documents in comments of dish
         dish.save()
         .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
          }, (err) => next(err));  
      }
      else {
        err = new Error("Dish " + req.params.dishId + " Not Found");
        err.status = 404;
        return next(err); 
      }
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
});


dishRouter.route('/:dishId/comments/:commentId')
.get( (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .populate('comments.author') //
  .then((dish) => { 
     if (dish !== null && dish.comments.id(req.params.commentId) !== null) { 
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments.id(req.params.commentId)); 
     }
     else if(dish === null){
        err = new Error("Dish " + req.params.dishId + " Not Found");
        err.status = 404;
        return next(err); 
     }
     else {
        err = new Error("Comment " + req.params.commentId + " Not Found");
        err.status = 404;
        return next(err); //this is hanfdles by the error handler in app.js
     }
  }, (err) => next(err)) 
  .catch( (err) => next(err) );
})
.post( (req, res, next) => { 
    res.statusCode = 403;
    res.end('POST operation is not supported on /dishes/' + req.params.dishtId + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {   //allowing client to update only the rating and comment fields
      if (dish !== null && dish.comments.id(req.params.commentId) !== null) { 
          if (dish.comments.id(req.params.commentId).author.toString() !== req.user._id.toString()) {
            err = new Error("You are not authorized to modify this comment");
            err.status = 404;
            return next(err);
          }
          if(req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating; //updating the rating field
          }
          if(req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment; //updating the comment field
          }
      
          dish.save()
          .then((dish) => {
              Dishes.findById(dish._id)
              .populate('comments.author')
              .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish); 
              })
          }, (err) => next(err))
      }
      else if(dish === null){
          err = new Error("Dish " + req.params.dishId + " Not Found");
          err.status = 404;
          return next(err); 
      }
      else {
          err = new Error("Comment " + req.params.commentId + " Not Found");
          err.status = 404;
          return next(err); //this is handled by the error handler in app.js
      }
  }, (err) => next(err)) 
  .catch( (err) => next(err) );
})
.delete(authenticate.verifyUser, (req, res, next) => { //deleting a specific comment
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish !== null && dish.comments.id(req.params.commentId) !== null) {
        if (dish.comments.id(req.params.commentId).author.toString() !== req.user._id.toString()) {
            err = new Error("You are not authorized to modify this comment");
            err.status = 404;
            return next(err);
          }
        dish.comments.id(req.params.commentId).remove(); //each document in the comments array also has a unique id
      
       //to indicate the updated dish being returned afetr deleting all the documents in comments of dish
       dish.save()
       .then((dish) => {
            Dishes.findById(dish._id)
            .populate('comments.author') 
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish); 
            })
        }, (err) => next(err));  
    }
    else if(dish === null){
        err = new Error("Dish " + req.params.dishId + " Not Found");
        err.status = 404;
        return next(err); 
    }
    else {
        err = new Error("Comment " + req.params.commentId + " Not Found");
        err.status = 404;
        return next(err); //this is handled by the error handler in app.js
    }
  }, (err) => { next(err) })
  .catch( (err) => next(err) );
});


module.exports  = dishRouter;