/*
This file is used to track the user name and password
It  also raise a flag to indicate whether the user is an administrator or a normal user 

We may allow administrator to perform certain operation that normal users cannot
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('User', User);
