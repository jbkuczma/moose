const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const os = require('os');
const auth = require('./auth');
const WebSocket = require('ws');

const app = express();

// setup the websocket
// const wss = new WebSocket.Server(app);
const wss = new WebSocket.Server({ port: 3030 });

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
    response.sendFile(path.join(__dirname + '/../www/html/create_room.html'));
});

// serve a specific room page
app.get('/room/:roomCode', function(request, response) {
    let roomCode = request.params.roomCode;
    // let sql = 'SELECT room_name, room_owner_name FROM rooms WHERE room_code=?';
    let sql = `SELECT rooms.room_name, rooms.room_owner_name, users.username, users.user_id, music.youtube_id, music.rank_in_queue 
               FROM rooms 
               INNER JOIN users ON users.current_room=rooms.room_code 
               INNER JOIN music ON music.room_code=rooms.room_code AND rooms.room_code=?`;
    connection.query(sql, roomCode, function (error, results, fields) {
        if(error) {
            throw error;
        }

        // filter results for usernames
        let usersInRoom = results.map(function(row) { 
            return { 
                username: row['username'] 
            }; 
        });
        // filter results for songs in queue, order based on rank in queue
        let queue = results.map(function(row) {
            return {
                position: row['rank_in_queue'],
                songID: row['youtube_id'],
                songName: 'Another One'

            }
        }).sort(function(i, j) {
            return i.rank_in_queue < j.rank_in_queue
        });

        let roomName = results[0].room_name;
        let roomOwner = results[0].room_owner_name;
        let isUserRoomOwner = (roomOwner === request.session.passport.user);
        roomData = {
            isUserHost: isUserRoomOwner,
            roomName: roomName,
            roomCode: roomCode,
            currentSongID: 'tG35R8F2j8k',
            usersInRoom: usersInRoom,
            queue: queue
        }
        response.render('the_room', roomData);
    });
    wss.on('connection', function(websocket, request) {
        websocket.on('message', function(message) {
            let sql = `SELECT users.username, users.user_id, music.youtube_id, music.rank_in_queue 
            FROM users
            INNER JOIN music ON music.room_code=users.current_room AND music.room_code=?`;
            connection.query(sql, roomCode, function (error, results, fields) {
                // filter results for usernames
                let usersInRoom = results.map(function(row) { 
                    return { 
                        username: row['username'] 
                    }; 
                });
                // filter results for songs in queue, order based on rank in queue
                let queue = results.map(function(row) {
                    return {
                        position: row['rank_in_queue'],
                        songID: row['youtube_id'],
                        songName: 'Another One'
        
                    }
                }).sort(function(i, j) {
                    return i.rank_in_queue < j.rank_in_queue
                });
                let roomData = {
                    usersInRoom: usersInRoom,
                    queue: queue
                }
                websocket.send(JSON.stringify(roomData));
            });
        });
    });
});

/*** POST REQUESTS ***/

// log a user in
app.post('/account/login', auth.authenticate('login', {
    successRedirect: '/rooms',
    failureRedirect: '/login?status=failedLogin',
    failureFlash: false
}));

// create an account 
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
        let roomCode = Math.floor(Math.random()*89999 + 10000);
        let sql = 'SELECT room_code FROM rooms WHERE room_code=?';
        connection.query(sql, roomCode, function(error, results, fields) {
            if (results[0]) {
                roomCode = Math.floor(Math.random()*89999 + 10000);
                connection.query(sql, roomCode, function(error, results, fields) {
                    if(!results[0]) {
                        let SQL = 'INSERT INTO rooms(room_name, room_code, created_at, room_owner_name) VALUES (?, ?, ?, ?)';
                        connection.query(SQL, [roomName, roomCode, new Date(), request.session.passport.user], function (error, results, fields) {
                            if (error){throw error;}
                            response.redirect('/room/' + roomCode);
                        });
                    }
                })
            } else {
                let SQL = 'INSERT INTO rooms(room_name, room_code, created_at, room_owner_name) VALUES (?, ?, ?, ?)';
                connection.query(SQL, [roomName, roomCode, new Date(), request.session.passport.user], function (error, results, fields) {
                    if (error) {
                        throw error;
                    }
                        response.redirect('/room/' + roomCode);
                    })
            }
        });
    }
});
    // @TODO: create a row in the rooms table in db for new room -> then send user to room page

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