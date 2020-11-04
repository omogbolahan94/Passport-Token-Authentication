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
const Dishes = require('../models/dishes') //Dishes here becomes a collection in our database
      

const dishRouter = express.Router();
dishRouter.use(bodyParser.json()); //the body of the request message will be in JSON format

//Modification is not done on this root directory so we cannot use the PUT method
//I will handle each of the GET, POST, PUT and DELETE independently(so i wont use .all)
//Every documents in a database collection has a unique id
//each sub-document in a particular  field of a collection also has a unique i
dishRouter.route('/')  //mounting this express router in the index.js file. In index.js file, this router is mount  at the /dishes endpoint
.get((req, res, next) => {
     Dishes.find({})
    .then((dishes) => { //returns a collection which is an array of dishes
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(dishes); //convert the array of dishes to json format
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.post((req, res, next) => {
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
.delete((req, res, next) => {
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
.put( (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {$set: req.body}, {new: true}) //update and return the updated document
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //convert the array of dishes to json format
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.delete( (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => { 
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp); //returns the dish as response
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
});


/*this is a route to the sub-documents in the  commentns field of the Dishes collectiuon */
dishRouter.route('/:dishId/comments')  
.get((req, res, next) => {
     Dishes.findById(req.params.dishId) //retrieve the document with this dishId
    .then((dish) => { 
       if (dish !== null) { //if the id does not exist, then dish does not exist and this will return null
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments); //return the comments field which is a field that returns list of sub-documents(list of comments document)
       }
       else {
          err = new Error("Dish " + req.params.dishId + " Not Found");
          err.status = 404;
          return next(err); //this is hanfdles by the error handler in app.js
       }
    }, (err) => next(err)) 
    .catch( (err) => next(err) );
})
.post((req, res, next) => {
     Dishes.findById(req.params.dishId) 
    .then((dish) => { //returns a dish object
       if(dish !== null) {
          dish.comments.push(req.body);
          dish.save()
          .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
          })
       }
       else {
          err = new Error("Dish " + req.params.dishId + " Not Found");
          err.status = 404;
          return next(err); //this is hanfdles by the error handler in app.js
       }
    }, (err) => { next(err) })
    .catch( (err) => next(err) );
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete( (req, res, next) => {
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
.put( (req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {   //allowing client to update only the rating and comment fields
      if (dish !== null && dish.comments.id(req.params.commentId) !== null) { 
          if(req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating; //updating the rating field
          }
          if(req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment; //updating the comment field
          }
      
          dish.save()
          .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish); 
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
          return next(err); //this is hanfdles by the error handler in app.js
      }
  }, (err) => next(err)) 
  .catch( (err) => next(err) );
})
.delete( (req, res, next) => { //deleting a specific comment
  Dishes.findByIdAndRemove(req.params.dishId)
  .then((dish) => {
    if(dish !== null && dish.comments.id(req.params.commentId) !== null) {
        dish.comments.id(req.params.commentId).remove(); //each document in the comments array also has a unique id
      
       //to indicate the updated dish being returned afetr deleting all the documents in comments of dish
       dish.save()
       .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
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
        return next(err); //this is hanfdles by the error handler in app.js
    }
  }, (err) => { next(err) })
  .catch( (err) => next(err) );
});


module.exports  = dishRouter;