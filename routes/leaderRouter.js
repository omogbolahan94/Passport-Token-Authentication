const express = require("express"),
      bodyParser = require("body-parser"),
      
      leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')  
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  next();
})
.get((req, res, next) => {
  res.end('Will send all the leader to you!');
})
.post((req, res, next) => {
  res.end('Will add all the leader: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /leader');
})
.delete((req, res, next) => {
  res.end('Deleting all the leader');
});



leaderRouter.get('/:leaderId', (req, res, next) => {
   res.end('Will send details  of the leader: ' + req.params.leaderId + ' to you!');
})
leaderRouter.post('/:leaderId', (req, res, next) => { 
    res.statusCode = 403;
    res.end('POST operation is not supported on /leader/' + req.params.leaderId);
})
leaderRouter.put('/:leaderId', (req, res, next) => {
    res.write('Updating the leader: ' + req.params.leaderId + '\n'); 
    res.end('Will update the leader: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
leaderRouter.delete('/:leaderId', (req, res, next) => {
  res.end('Deleting promo: ' + req.params.leaderId);
});



module.exports = leaderRouter;
