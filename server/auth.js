/**
 * authentication file for handling logging a user and creating an account
 */

const mysql = require('mysql');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const hasher = require('./hash')

// create connection to database
let connection = mysql.createConnection({
  host     : 'localhost',   // db host
  user     : 'root',          // db user
  password : 'password',      // password for user
  database : 'moose'        // which database to use
});

/**
 * See if string only contains letters and numbers
 * @param {String} inputString - string to test
 */
function isValidInput(inputString) {
        return inputString.match(/^[a-zA-Z0-9]{3,16}$/);// regex to limit username input string to letters and numbers and a max length of 16
}

passport.use('login', new LocalStrategy({ failWithError: true },
    function(username, password, done) {
        // query db
        let sql = 'SELECT username, password, salt FROM users WHERE username=?';
        connection.query(sql, username, function(error, results, fields) {
            if(error) {
                return done(error);
            }

            if(!results[0]) {
                return done(null, false);
            }

            let hashedUser = hasher.sha512(password, results[0].salt);
            let storedPassword = results[0].password;

            if(username == results[0].username && hashedUser.passwordHash == storedPassword) {
                 return done(null, username);
            } else {
                return done(null, false);
            }
        });   
    }
));

passport.use('create-account', new LocalStrategy({ passReqToCallback: true, failWithError: true },
    function(req, username, password, done) {
        let username1 = req.body.username;
        let password1 = req.body.password;
        let confirmPassword = req.body.confirm_password;
        if (password1 === confirmPassword) {
            // query db to see if username exists
            let sql = 'SELECT username FROM users WHERE username=?';
            connection.query(sql, username1, function(error, results, fields) {
                if(results[0] || error) {
                    return done(null, false);
                } else {
                    let hashedUser = hasher.saltAndHashPassword(password);
                    let hashedPassword = hashedUser.passwordHash;
                    let salt = hashedUser.salt;

                    if(isValidInput(username1)) {
                        // create new user
                        sql = 'INSERT INTO users (username, password, salt, created_at) VALUES (?, ?, ?, ?)';
                        connection.query(sql, [username1, hashedPassword, salt, new Date()], function(error, results, fields) {
                            if(!error) {
                                return done(null, username);
                            }
                        });
                    } else {
                        return done(null, false);
                    }              
                }
            });
        }
        else{
            return done(null, false);
        }
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