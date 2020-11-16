const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

//creating a comment schema
const commentSChema = new Schema({
    rating: { //rafting field 
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: { //comment field
        type: String,
        required: true,
    },
    author: {//referencing a User document by ID. Then in dishRouter we wil use mongoose to populate the this Dish with the user document
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' //the document we want tlo reference
    }
  }, 
  {timestamps: true} //timestamps is a document on its own
);

//creating a schema for a dish document in dishes collection
const dishSchema = new Schema({
    name: {//name field
        type: String,
        required: true,
        unigue: true //no 2 documents in a collection should have been same name
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: '' //another is saying:- [ required: false []
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSChema] //comments is field(but a sub-collection) of the Dishes collection of which will contain documents of the commentSchema type 
},
{
    timestamps: true
});

//creating a model that uses the schema created above
/*
   Dish is the name of this mongoose model
   Dish will be autoatically transformed(pluralise to dishes) by mongoose
   and then mapped into a collection(named dishes) in our MongoDB database 

   So when we specify dish as the name of a model, mongoose will construct
   the dishes collection in our MongoDB database
   And then the dishes collection will store documents of dish type 
   in it
   */

let Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;

