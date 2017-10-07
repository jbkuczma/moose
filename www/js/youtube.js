/**
 * JS file to control the YouTube iframe
 */

 /**
 * get the first li element in the song
 */
// function getSongIDFromQueue() {
//     var queue = document.getElementsByClassName('songInQueue');
//     var songID = queue[0].id;
//     var roomCode = window.location.href.split('/')[4]; // might change
//     var data = {
//         song: newID,
//         room: roomCode
//     };
//     fetch('/song/remove', {
//         method: 'POST',
//         body: JSON.stringify(data),
//         headers: {
//             "Content-Type": "application/json"
//         }
//     }).then(function(response) {
//         document.getElementById('songQueue').removeChild(queue[0]); // remove song from queue
//     });
// }

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
    player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: document.getElementsByClassName('songInQueue')[0].id,
    playerVars: {
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
    if (event.data == YT.PlayerState.ENDED) { // or 0
        var queue = document.getElementsByClassName('songInQueue');
        console.log(queue)
        var songID = queue[0].id;
        console.log(songID)
        var roomCode = window.location.href.split('/')[4]; // might change
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
            document.getElementById('songQueue').removeChild(queue[0]); // remove song from queue
            player.loadVideoById(songID);
        })
        .catch(function(error) {
            player.loadVideoById('dQw4w9WgXcQ'); 
        });        
    }
}
function stopVideo() {
    player.stopVideo();
}
//  setTimeout(function() {
    
//  }, 10000);