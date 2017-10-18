/**
 * this file is only laoded if you are the host - guests should not be requesting updates to the room
 */

 // replaced the websocket with a get request every 5 seconds
setInterval(function() {
    var roomCode = window.location.href.split('/')[4]; // might change
    fetch('/room/' + roomCode + '/update')
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        updatePage(json);
    })
    .catch(function(error) {
        console.log('error updating')
    })
}, 5000);


function updatePage(json) {
    var queue = json['data']['queue'];
    var users = json['data']['usersInRoom'];

    var queueEl = document.getElementById('songQueue');
    var userListEl = document.getElementById('users');

    // clear them
    userListEl.innerHTML = '';
    queueEl.innerHTML = '';

    for(var i = 0; i < queue.length; i++) {
        var songID = queue[i]['songID'];
        var songName = queue[i]['songName'];
        var el = document.createElement('li');
        el.classList.add('list-group-item');
        el.classList.add('songInQueue');
        el.id = songID;
        el.textContent = songName;
        queueEl.append(el);
    }

    for(var j = 0; j < users.length; j++) {
        var username = users[j]['username'];
        var el = document.createElement('h5');
        el.classList.add("card-user");
        el.textContent = username;
        userListEl.append(el);
    }
}

function closeRoom() {
    var roomCode = window.location.href.split('/')[4]; // might change
    var data = {
        room: roomCode,
    };
    window.location = ('/rooms');
    fetch('/room/delete', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function(response) {
        console.log('deleted');
    });
}