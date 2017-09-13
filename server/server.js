const express = require('express');
const app = express();

app.get('/login', function(request, response) {
    response.send('login page');
});

app.get('/rooms', function(request, response) {
    response.send('create or join a room page');
});

app.get('/room/:roomCode', function(request, response) {
    respone.send('a room page')
})

app.listen(3000, function() {
    console.log('Moose started on port 3000. Go to localhost:3000');
});