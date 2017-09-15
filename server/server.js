const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({extend: true}));
app.use(bodyParser.json());

/*** GET ***/
app.get('/login', function(request, response) {
    response.send('login page');
    // response.sendFile(path.join(__dirname + '/../www/html/login.html')); // uncoment when branches are merged
});

app.get('/rooms', function(request, response) {
    response.send('create or join a room page');
});

app.get('/room/:roomCode', function(request, response) {
    response.send('a room page');
});

/*** POST ***/
app.post('/login', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confirm_password;
    // username and password provided, user is trying to login
    if(username && password && !confirmPassword) {
        console.log('login')
    }
    // username, password, confirm password provided, user is trying to create an account
    else if(username && password && confirmPassword) {
        console.log('create account')
    }
    else {
        console.log('error')
    }
    return
});

app.listen(3000, function() {
    console.log('Moose started on port 3000. Go to localhost:3000/login');
});