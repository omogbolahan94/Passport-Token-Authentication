const express = require("express"),
      bodyParser = require("body-parser");
      authenticate = require('../authenticate');

const Leaders = require('../models/leaders');
      
const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());


//retricts users to perform POST, PUT and DELETE operations only if they are authenticated
leaderRouter.route('/')  
.get((req, res, next) => {
   Leaders.find({})
   .then((leaders) => {
      res.status = 200;
      res.setHeader("Content-Type", 'applicstion/json');
      res.json(leaders)
   }, (err) => next(err) )
   .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.create(req.body)
    .then((leader) => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /leader');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.remove({})
    .then((leaders) => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


leaderRouter.route('/:leaderId') 
.get( (req, res, next) => {
  Leaders.findById(req.params.leaderId)
  .then((leader) => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json(leader)
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post( (req, res, next) => { //cannot create a document for an promoId
  res.statusCode = 403;
  res.end('POST operation is not supported on /promo/' + req.params.leaderId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Leaders.findByIdAndUpdate(req.params.leaderId, {$set: req.body}, {new: true})
  .then((leader) => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(leader);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Leaders.findByIdAndRemove(req.params.leaderId)
  .then((resp) => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = leaderRouter;
