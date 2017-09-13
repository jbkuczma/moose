const express = require('express');
const app = express();

app.get('/', function(request, response) {
    response.send('Hello');
});

app.listen(3000, function() {
    console.log('Moose started on port 3000. Go to localhost:3000');
});