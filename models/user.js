/*
** We are going to use the 'passport-local-mongoose' in our User Schema 
** The field: username, password, authenticate method, register(to register(signup route) a new user of the users collection), 
   serializeUser and deserializeUser will authomatically be generated for us in the schema
** serializeUser and deserializeUser is used to track the activity of the User 
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
})

//using the 'passport-local-mongoose' on User schema
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
