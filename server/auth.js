/**
 * authentication file for handling logging a user and creating an account
 */

const mysql = require('mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// create connection to database
/*
let connection = mysql.createConnection({
  host     : 'localhost',   // db host
  user     : 'me',          // db user
  password : 'secret',      // password for user
  database : 'my_db'        // which database to use
});*/

passport.use('login', new LocalStrategy(
    function(username, password, done) {
        // query db
        return done(null, username);
    }
));

passport.use('create-account', new LocalStrategy(
    function(username, password, done) {
        // query db for existing username
        return done(null, username);
    }
));

// Required for storing user info into session
passport.serializeUser(function(username, done) {
    done(null, username);
});

passport.deserializeUser(function(username, done) {
    done(null, username);
});
module.exports = passport;