const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const os = require('os');
const auth = require('./auth');
const app = express();

// create connection to database
/* uncomment block for MVP
let connection = mysql.createConnection({
  host     : 'localhost',   // db host
  user     : 'me',          // db user
  password : 'secret',      // password for user
  database : 'my_db'        // which database to use
});

connection.connect();

// example query
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
connection.end();
*/

/*** Express config ***/
app.use(express.static('www'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({ 
    secret: 'moose',
    saveUninitialized: false,
    resave: true
}));
// for auth with passport
app.use(auth.initialize());
app.use(auth.session());

/*** GET REQUESTS ***/

// serve login page
app.get('/login', function(request, response) {
    response.sendFile(path.join(__dirname + '/../www/html/login.html'));
});

// serve page to create a new room or join an existing room
app.get('/rooms', function(request, response) {
    response.sendFile(path.join(__dirname + '/../www/html/create_room.html'));
});

// serve a specific room page
app.get('/room/:roomCode', function(request, response) {
    // @TODO: retrieve room info from db (room code, currently playing song, songs in queue, etc.)
    response.sendFile(path.join(__dirname + '/../www/html/the_room.html'));
});

/*** POST REQUESTS ***/

// log a user in
app.post('/account/login', auth.authenticate('login', {
    successRedirect: '/rooms',
    failureRedirect: '/login?status=failedLogin',
    failureFlash: false
}));

app.post('/account/create', auth.authenticate('create-account', {
    successRedirect: '/rooms',
    failureRedirect: '/login?status=failedCreateAccount',
    failureFlash: false
}));

// create a room
app.post('/rooms/create', function(request, response) {
    let roomName = request.body.room_name;
    // @TODO: create a row in the rooms table in db for new room -> then send user to room page
});

// join an existing room via room code
app.post('/rooms/join', function(request, response) {
    let roomJoinCode = request.body.join_code;
    // @TODO: send user to that room
});

// search YouTube api using query input
app.post('/room/:roomCode/search', function(request, response) {
    let searchQuery = request.body.query;
    // @TODO: send query to YouTube API, parse results, send results to frontend to show
});


// starts Moose on port 3000
app.listen(3000, '0.0.0.0', function() {
    let userIP = ipAddress()
    console.log('Moose started on port 3000');
    console.log(`Visit localhost:3000/login or ${userIP}:3000/login`);
});


/**
 * helper to get user's ip address
 */
let ipAddress = function() {
    let interfaces = os.networkInterfaces()
    let address = '';
    for(let dev in interfaces) {
        interfaces[dev].filter(function(details) {
            details.family === 'IPv4' && details.internal === false ? address = details.address : undefined;
        });
    }
    return address;
}