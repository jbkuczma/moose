const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const os = require('os');
const auth = require('./auth');
const _ = require('underscore');

const app = express();
const my_key = require("./keys");
const search = require('youtube-search');

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
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/../www/html/index.html'));
});

// serve login page
app.get('/login', function(request, response) {
    response.sendFile(path.join(__dirname + '/../www/html/login.html'));
});

// serve page to create a new room or join an existing room
app.get('/rooms', function(request, response) {
    if(!request.session.passport) {
        response.redirect('/login');
        return;
    }
    response.sendFile(path.join(__dirname + '/../www/html/create_room.html'));
});
app.get('/room/:roomCode/search', function(request,response){
    let searchQuery = request.query.query;
    let options = {
        maxResults: 10,
        key: my_key.my_key
    };

    search(searchQuery, options, function (err, results) {
        if (err) return console.log(err);
        let song_array = [10];
        for (let i = 0; i < results.length; i++){
            let currID = results[i]["id"];
            let currTitle = results[i]["title"];
            song_array[i]  = {id: currID, title: currTitle};
        }
        response.send({data: song_array});
    });
});

app.post('/song/add', function(request, response) {
    let name = request.body.name;
    let song = request.body.song;
    let roomCode = request.body.room;
    // let positionInQueue = request.body.position;
    let sql = 'INSERT INTO music (youtube_id, room_code, song_name) VALUES (?, ?, ?); ';
    connection.query(sql, [song, roomCode, name], function (error, results, fields) {
        if (error) {
            respone.redirect('/rooms');
        }
    });
});

app.post('/song/remove', function(request, response) {
    let song = request.body.song;
    let roomCode = request.body.room;
    let sql = 'DELETE FROM music WHERE youtube_id=? AND room_code=?';
    connection.query(sql, [song, roomCode], function (error, results, fields) {
        if (error) {
            respone.redirect('/rooms');
        }
    });
});
// serve a specific room page
app.get('/room/:roomCode', function(request, response) {
    if(!request.session.passport) {
        response.redirect('/login');
        return;
    }
    let roomCode = request.params.roomCode;
    // let sql = 'SELECT room_name, room_owner_name FROM rooms WHERE room_code=?';
    let sql = `SELECT rooms.room_name, rooms.room_owner_name, users.username, users.user_id, music.youtube_id, music.rank_in_queue, music.song_name 
               FROM rooms 
               INNER JOIN users ON users.current_room=rooms.room_code 
               INNER JOIN music ON music.room_code=rooms.room_code AND rooms.room_code=?`;
    connection.query(sql, roomCode, function (error, results, fields) {
        if(error) {
            respone.redirect('/rooms');
        }

        if(!results[0]) {
            let sql = 'SELECT room_name FROM rooms WHERE room_code=?';
            connection.query(sql, roomCode, function (error, results, fields) {
                if(error || !results[0]) { respone.redirect('/rooms'); }
                roomData = {
                    isUserHost: request.session.passport.user,
                    roomName: results[0].room_name,
                    roomCode: roomCode
                }
                response.render('the_room', roomData);
            });
        } 
        else {
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
                    songName: row['song_name']

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
                usersInRoom: usersInRoom,
                queue: queue
            }
            response.render('the_room', roomData);
        }
    });
});

// update queue and users in room
app.get('/room/:roomCode/update', function(request, response) {
    let roomCode = request.params.roomCode;
    let sql = `SELECT users.username, users.user_id, music.youtube_id, music.rank_in_queue, music.song_name
            FROM users
            INNER JOIN music ON music.room_code=users.current_room AND music.room_code=?`;
    connection.query(sql, roomCode, function (error, results, fields) {
        // filter results for usernames
        let usersInRoom = results.map(function(row) { 
            return { 
                username: row['username'] 
            }; 
        });
        usersInRoom = _.uniq(usersInRoom, function(v) { 
            return v.username;
        });

        // filter results for songs in queue, order based on rank in queue
        let queue = results.map(function(row) {
            return {
                position: row['rank_in_queue'],
                songID: row['youtube_id'],
                songName: row['song_name']

            }
        }).sort(function(i, j) {
            return i.position > j.position
        });

        queue = _.uniq(queue, function(v) {
            return v.songID
        });
        let roomData = {
            usersInRoom: usersInRoom,
            queue: queue
        }
        response.json({'data': roomData});
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
    if(!request.session.passport) {
        response.redirect('/login');
        return;
    }
    let roomName = request.body.room_name;
    if ((roomName.match(/^[a-zA-Z0-9]{3,16}$/)[0]) || roomName === "SaturdaysAreForTheBoys"){
        //generates random 5 digit code that cannot be shorter than 5 digits
        let roomCode = Math.floor(Math.random()*89999 + 10000);
            let SQL = 'INSERT INTO rooms (room_name, room_code, created_at, room_owner_name) VALUES (?, ?, ?, ?); ';
            connection.query(SQL, [roomName, roomCode, new Date(), request.session.passport.user], function (error, results, fields) {
                if (error) {
                    throw error;
                }
                let sql2 = 'UPDATE users SET current_room=? WHERE username=?';
                connection.query(sql2, [roomCode, request.session.passport.user], function(error, results, fields) {
                    if(error) {
                        throw error;
                    }
                    let id = 'OHU80BsabxQ'; //default choice
                    let sql3 = 'INSERT INTO music (youtube_id, room_code, song_name) VALUES (?, ?, ?)';
                    connection.query(sql3, [id, roomCode, '10 seconds'], function(error, results, fields) {
                        response.redirect('/room/' + roomCode)
                    });     
                })
            })
    }
    else{
        response.redirect("/rooms?status=InvalidRoom")
    }
});

// join an existing room via room code
app.post('/rooms/join', function(request, response) {
    if(!request.session.passport) {
        response.redirect('/login');
        return;
    }
    let roomJoinCode = request.body.join_code;
    let SQL = 'SELECT room_code FROM rooms WHERE room_code=?';
    connection.query(SQL, roomJoinCode, function (error, results, fields){
        if (error) {
            respone.redirect('/rooms');
        }
        if (results[0]) {
            let sql2 = 'UPDATE users SET current_room=? WHERE username=?';
            connection.query(sql2, [roomJoinCode, request.session.passport.user], function(error, results, fields) {
                if(!error) {
                    response.redirect('/room/' + roomJoinCode)
                }
            })
            // response.redirect('/room/' + roomJoinCode)
        }
        else {response.redirect("/rooms?status=noRoom")}
    })
    // @TODO: send user to that room
});

// search YouTube api using query input
app.post('/room/:roomCode/search', function(request, response) {
    let searchQuery = request.body.query;
    let options = {
        maxResults: 10,
        key: my_key.my_key
    };

    search(searchQuery, options, function (err, results) {
        if (err) {
            respone.redirect('/rooms');
        }
        let song_array = [10];
        for (let i = 0; i < results.length; i++){
            let currID = results[i]["id"];
            let currTitle = results[i]["title"];
            song_array[i]  = {id: currID, title: currTitle};
        }
    });
});

app.post('/room/delete', function(request, response) {
    let roomCode = request.body.room;
    let SQL = 'DELETE FROM music WHERE music.room_code=?';
    let SQL2 = 'DELETE FROM rooms WHERE rooms.room_code=?';
    connection.query(SQL, roomCode, function (error, results, fields){
        if (error) {
            respone.redirect('/rooms');
        }
        connection.query(SQL2, roomCode, function (error, results, fields){
            if (error) {
                throw error;
            }
        });
    });
});


// starts Moose on port 3000
app.listen(3000, '0.0.0.0', function () {
    let userIP = ipAddress()
    console.log('Moose started on port 3000');
    console.log(`Visit localhost:3000/login or ${userIP}:3000/login`);
});


/**
 * helper to get user's ip address
 */
let ipAddress = function () {
    let interfaces = os.networkInterfaces()
    let address = '';
    for (let dev in interfaces) {
        interfaces[dev].filter(function (details) {
            details.family === 'IPv4' && details.internal === false ? address = details.address : undefined;
        });
    }
    return address;
}