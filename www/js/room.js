/**
 * this file is loaded for everyone - allows searching for a song and adding to queue
 */

function loadSearch(){
    let array = document.getElementById("songArray");
    var query = document.getElementById('Search').value;
    var roomCode = window.location.href.split('/')[4]; // might change
    array.innerHTML = '';
    fetch('/room/' + roomCode + '/search/?query=' + query).then(function (response) {
        return response.json();

    }).then(function (json) {
        for(let n=0; n < 10; n++) {
            var song = document.createElement('button');
            song.textContent = json.data[n].title;	
            song.setAttribute('id', json.data[n].id);
            song.classList.add('songResultButton');	
            song.addEventListener('click', addSongToQueue);				
            array.append(song);
        }

    }).catch(function(error){
        console.log(error);
    });
}

function addSongToQueue(event) {
    document.getElementById("overlay").style.display = "block";
    window.setTimeout(function() {
        document.getElementById("overlay").style.display = "none";
    }, 5000);
    var songID = event.target.id;
    var roomCode = window.location.href.split('/')[4]; // might change
    var name = event.target.textContent;
    var data = {
        song: songID,
        room: roomCode,
        name: name
    };
    fetch('/song/add', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function(response) {
        console.log('ok')
    });
}

function getPreviouslyPlayedMusic() {
    var roomCode = window.location.href.split('/')[4]; // might change
    var url = '/room/' + roomCode + '/previous';
    fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        var previousEl = document.getElementById('previousSongs');
        previousEl.innerHTML = '';
        for(song in json['data']) {
            var li = document.createElement('li');
            li.classList.add('list-group-item');
            li.classList.add('songInQueue');
            li.textContent = json['data'][song]['song'];
            previousEl.append(li);
        }
    });
}

// call it initially, then run on interval
getPreviouslyPlayedMusic();
setInterval(function() {
    getPreviouslyPlayedMusic();
}, 5000);