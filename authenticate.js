/*
AUTHENTICATING AN END POINT USING THE JSON WEB TOKEN STRATEGY
Passport: This is an authentication middleware for Node.js
Strategy: using the JSON Web Token strategy to authenticatre end point wihtout session
NOTE: i used the localStrategy to allow the user to enter username and password

JWT: this is a way of transmitting information between parties as a JSON object
NOTE: signed(public/privaste key) tokens are used to verify the integrity of the user of a token
APPLICATION: 
1) for authentication. Once a user is logged in, each subsequest request will include the JWT
allowing the user to access routes, services and resources permitted with that token
2) Information exchange b/t parties.
STRUCTURE OF JWT
in its compact form, it contains 3 parts separated by dots(header.payload.signature) which are base64 encoded
1)The Header: {"alg":"HS256","tpy":"JWT" } I.E the type of the token and the signing algorithm. 
 This JSON is Base64Url encoded to form the first part of the JWT 
2)The Payload: This contains the claims(statement about an entity). {"sub":"1234567890", "name":"Ola Gab", "admin":true}
This JSON is also Base64Url encoded to form the second part of the JWT
3)The Signature: to create the signature, take and sign all the encoded header, encoded payload, a secret, the algorithm specified in the header
functionality: this is used to verify the message wasn't changed along the way
it is also used to verify that the sender of the JWT is who it says it's

HOW TO USE THE TOKEN
* Whenever the user wants to access a protected route, resources, the user agent should send the JWT
in the Authorization header using Bearer schema
* The server protected routes will check for a valid JWT in the Authorization header, and if present,
the user will be allowed to access the protected resources
*/

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;//this strategy allows user to enter username and password
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');
const { NotExtended } = require('http-errors');
//using the local strategy in passport
exports.local = passport.use(new LocalStrategy(User.authenticate()));


//since we are still using session in this application
//serialize and deserialize the user information
//passport.authenticate will mount user property on the request message(req.user)
passport.serializeUser(User.serializeUser()); //serializing the User information to be stored in the session information on the server side  
passport.deserializeUser(User.deserializeUser());//deserialize the user information to extract the session information from the servers side when request comes in 

//creating a token
/*
user: this is the payload object that contains the information about the user
expiresIn: the duration during which the jsonwebtoken will be valid
the jwt.sign will generate the token
*/
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});//generate the token
}

/*
options is an object literals containing options to control how the token
is being extrated from the request(req) or verified
jwtFromRequest: this is a function that accepts the request as a parameter and return the encoded JWT as a string or null
 */
var options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); 
options.secretOrKey = config.secretKey;


//configuring the json web token passport strategy
//jwt_payload: an object literal containing the decoded JWT payload
//done: a passport error first callback accepting argument done(error, user, info[optonal])
exports.jwtPassport = passport.use(new JwtStrategy(options, 
    (jwt_payload, done) => { //this 2nd argument of the jwtStrategy is used for verification
        console.log('jwt payload: ', jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            else if(user) {
                return done(null, user);
            }
            else {
                return done(null, false); //if user does not exists, create another one
            }
        })
    })
);


//jwt strategy is used for verifying the user and so session is set to false
//jwt works by including token in the authentication header
//this token will then be extracted and used for authentication
//this can be used to restricts  users from performing certain type REST API operations. check files in the routes directory
exports.verifyUser = passport.authenticate('jwt', {session: false}); //employing as JWT strategy in our routes(an ordinary user)
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin === true) {
        next();
    }
    else {
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403; 
        return next(err);
    }
}

