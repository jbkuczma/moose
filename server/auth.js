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
  user     : 'db_user',          // db user
  password : 'db_pass',      // password for user
  database : 'db'        // which database to use
});

passport.use('login', new LocalStrategy(
    function(username, password, done) {
        // query db
        let sql = 'SELECT username, password, salt FROM users WHERE username=?';
        connection.query(sql, username, function(error, results, fields) {
            if(error) {
                throw error;
            }

            let hashedUser = hasher.sha512(password, results[0].salt);
            let storedPassword = results[0].password;

            if(username == results[0].username && hashedUser.passwordHash == storedPassword) {
                 return done(null, username);
            }
        });   
    }
));

passport.use('create-account', new LocalStrategy({ passReqToCallback: true },
    function(req, username, password, done) {
        let username1 = req.body.username;
        let password1 = req.body.password;
        let confirmPassword = req.body.confirm_password;
        if (password1 === confirmPassword) {
            // query db to see if username exists
            let sql = 'SELECT username FROM users WHERE username=?';
            connection.query(sql, username1, function(error, results, fields) {
                if(results[0]) {
                    console.log('username exists')
                } else {
                    let hashedUser = hasher.saltAndHashPassword(password);
                    let hashedPassword = hashedUser.passwordHash;
                    let salt = hashedUser.salt;

                    // create new user
                    sql = 'INSERT INTO users (username, password, salt, created_at) VALUES (?, ?, ?, ?)';
                    connection.query(sql, [username1, hashedPassword, salt, new Date()], function(error, results, fields) {
                        if(!error) {
                            return done(null, username);
                        }
                    });
                }
            });
        }

        // return done(null, username);
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