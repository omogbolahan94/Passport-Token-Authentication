const express = require('express'),
      bodyParser = require('body-parser'),
      
      promoRouter = express.Router();

promoRouter.use(bodyParser.json())


promoRouter.route('/')  //mounting this express router in the index.js file. in index.js file, this router is mount  at the /dishes endpoint
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  next();
})
.get((req, res, next) => {
  res.end('Will send all the promo to you!');
})
.post((req, res, next) => {
  res.end('Will add all the promo: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /promo');
})
.delete((req, res, next) => {
  res.end('Deleting all the promo');
});



promoRouter.get('/:promoId', (req, res, next) => {
   res.end('Will send details  of the promo: ' + req.params.promoId + ' to you!');
})
promoRouter.post('/:promoId', (req, res, next) => { //the post will contain a json string with name and description property in the body of the request string
    res.statusCode = 403;
    res.end('POST operation is not supported on /promo/' + req.params.promoId);
})
promoRouter.put('/:promoId', (req, res, next) => {
    res.write('Updating the promo: ' + req.params.promoId + '\n'); //a line to the reply messge
    res.end('Will update the promo: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
promoRouter.delete('/:promoId', (req, res, next) => {
  res.end('Deleting promo: ' + req.params.promoId);
});


module.exports = promoRouter;