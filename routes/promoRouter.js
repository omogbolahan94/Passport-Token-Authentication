const express = require('express'),
      bodyParser = require('body-parser');
      authenticate = require('../authenticate');

const Promotions = require('../models/promotions');
      
const promoRouter = express.Router();

promoRouter.use(bodyParser.json())

//placing restriction on user to performing the PUT, POST and DELETE operation unless they are authenticated 
promoRouter.route('/')  
.get((req, res, next) => {
   Promotions.find({})
   .then((promotions) => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promotions);
   }, (err) => next(err))
   .catch((err) => next(err) )
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
    .then((promotion) => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json')
      res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /promo');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove({})
    .then( (resp) => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


promoRouter.route('/:promoId')
.get( (req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post( (req, res, next) => { //cannot create a document for an promoId
    res.statusCode = 403;
    res.end('POST operation is not supported on /promo/' + req.params.promoId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {$set: req.body}, {new: true})
    .then((promotion) => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((resp) => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = promoRouter;