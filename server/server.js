const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const os = require('os');
const auth = require('./auth');
const app = express();

// create connection to database
let connection = mysql.createConnection({
  host     : 'localhost',   // db host
  user     : 'root',          // db user
  password : 'password',      // password for user
  database : 'moose'        // which database to use
});

connection.connect();


/*** Express config ***/
app.set('views', path.join(__dirname + '/../www/html_templates/')); // where to look for templates
app.engine('handlebars', exphbs({}));
app.set('view engine', 'handlebars'); // for templates
app.use(express.static('www')); // for static pages
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
    console.log(session)
    response.sendFile(path.join(__dirname + '/../www/html/create_room.html'));
});

// serve a specific room page
app.get('/room/:roomCode', function(request, response) {
    // @TODO: retrieve room info from db (room code, currently playing song, songs in queue, etc.)
    // fake data to show that the template is working
    roomData = {
        isUserHost: true,
        roomName: 'Test',
        roomCode: '4444',
        currentSongName: '3005 - Childish Gambino',
        currenSongID: 'tG35R8F2j8k',
        usersInRoom: [
            {
                username: 'Dean'
            },
            {
                username: 'James'
            },
            {
                username: 'RJ'
            }
        ],
        queue: [
            {
                songID: 'test1',
                songName: 'Major key'
            },
            {
                songID: 'test2',
                songName: 'Another one'
            },
            {
                songID: 'test3',
                songName: 'Bless up'
            },
            {
                songID: 'test4',
                songName: 'Moose'
            },
        ]
    }
    response.render('the_room', roomData);
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
    if ((roomName.length <= 15 && roomName.length > 2)|| roomName === "SaturdaysAreForTheBoys"){
        //generates random 5 digit code that cannot be shorter than 5 digits
        let random_numb = Math.floor(Math.random()*89999 + 10000);
        let SQL = 'INSERT INTO rooms(room_name, room_code, created_at, room_owner_name) VALUES (?, ?, ?, ?)';
        connection.query(SQL, [roomName, random_numb, new Date(), request.session.passport.user], function (error, results, fields) {
            if (error){throw error;}
            response.redirect('/room/' + random_numb);
        });
    }
    // @TODO: create a row in the rooms table in db for new room -> then send user to room page
});

// join an existing room via room code
app.post('/rooms/join', function(request, response) {
    let roomJoinCode = request.body.join_code;
    let SQL = 'SELECT room_code FROM rooms WHERE room_code=?';
    connection.query(SQL, roomJoinCode, function (error, results, fields){
        if (error) {throw error;}
        if (results[0]) {response.redirect('/room/' + roomJoinCode)}
        else {response.redirect("/rooms?status=noRoom")}
    })
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