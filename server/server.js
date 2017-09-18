const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/*** GET REQUESTS ***/

// serve login page
app.get('/login', function(request, response) {
    response.send('login page');
    // response.sendFile(path.join(__dirname + '/../www/html/login.html')); // uncoment when branches are merged
});

// serve page to create a new room or join an existing room
app.get('/rooms', function(request, response) {
    response.send('create or join a room page');
});

// serve a specific room page
app.get('/room/:roomCode', function(request, response) {
    // @TODO: retrieve room info from db (room code, currently playing song, songs in queue, etc.)
    response.send('a room page');
});

/*** POST REQUESTS ***/

// log a user in
app.post('/account/login', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    console.log('login')
    /*
        @TODO: implement once database schema is determined, log user in
        - check if password provided matches hashed password in db
    */

});

// create an account
app.post('/account/create', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confirm_password;

    console.log('create account')
    /*
        @TODO: implement once database schema is determined
        sql = 'SELECT FROM {tableName} (username, password) WHERE username=?';
        execute sql with username var and check if a row was returned
        if a row was returned, the username exists -> tell user to choose a new username
        else
            check to make sure password === confirmPassword -> if not then tell user
            create a row in the user table for this username and password. HASH the password before inserting into database
            sql = 'INSERT INTO {tableName} (username, password) VALUES (username, SHA2(password, 256))
    */
});

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
app.listen(3000, function() {
    console.log('Moose started on port 3000. Go to localhost:3000/login');
});