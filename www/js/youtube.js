/**
 * JS file to control the YouTube iframe
 */

/* YOUTUBE IFRAME */
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
    var queue = document.getElementsByClassName('songInQueue');
    var songID = queue[0].id;

    var roomCode = window.location.href.split('/')[4]; // might change

    var data = {
        song: songID,
        room: roomCode
    };
      
    player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: songID,
    playerVars: {
        autoplay: 1,
        showinfo: 0,
        controls: 0,
        rel: 0,
        disablekb: 1
    },
    events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == 0) {
        var queue = document.getElementsByClassName('songInQueue');
        var roomCode = window.location.href.split('/')[4]; // might change
        if(queue[0] === undefined) {
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
            })
        }
        var songID = queue[0].id;
        player.loadVideoById(songID);
        // first add song to previously played, then remove from music
        var data = {
            songName: queue[0].textContent
        };
        var url = '/room/' + roomCode + '/previous';
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function(message) {
            console.log('good')
        });

        var data = {
            song: songID,
            room: roomCode
        };
        fetch('/song/remove', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function(response) {
            var remove = document.getElementById(songID);
            document.getElementById('songQueue').removeChild(remove); // remove song from queue
        })       
    }
}
function stopVideo() {
    player.stopVideo();
}