const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.send(__dirname)
})
app.get('/login', function(request, response) {
    response.send('login page');
    // response.sendFile(path.join(__dirname + '/../www/html/login.html')); // uncoment when branches are merged
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