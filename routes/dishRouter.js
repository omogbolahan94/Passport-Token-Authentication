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

const dishRouter = express.Router();
dishRouter.use(bodyParser.json()); 

//modification is not done on this root directory so we cannot use the PUT method
//i will chain all the all, get, post, put and delete to the dishRoter.route
dishRouter.route('/')  //mounting this express router in the index.js file. in index.js file, this router is mount  at the /dishes endpoint
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  next();
})
.get((req, res, next) => {
  res.end('Will send all the dishes to you!');
})
.post((req, res, next) => {
  res.end('Will add all the dish: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /dishes');
})
.delete((req, res, next) => {
  res.end('Deleting all the dishes');
});


//dishRouter.route('/:dishId')
dishRouter.get('/:dishId', (req, res, next) => {
   res.end('Will send details  of the dish: ' + req.params.dishId + ' to you!');
})
dishRouter.post('/:dishId', (req, res, next) => { //the post will contain a json string with name and description property in the body of the request string
    res.statusCode = 403;
    res.end('POST operation is not supported on /dishes/' + req.params.dishId);
})
dishRouter.put('/:dishId', (req, res, next) => {
    res.write('Updating the dish: ' + req.params.dishId + '\n'); //a line to the reply messge
    res.end('Will update the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
dishRouter.delete('/:dishId', (req, res, next) => {
  res.end('Deleting dish: ' + req.params.dishId);
});


module.exports  = dishRouter;