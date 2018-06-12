//get the session name from local storage
//var url = JSON.parse(localStorage["url"]);
var tag = document.createElement('script');
var prev = [];

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onPlayerReady(event) {
    console.log("this was fired");
    setup(player.getDuration());
}

function onYouTubeIframeAPIReady() {
    console.log(localStorage["url"]);
    if (localStorage["url"]) {
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: localStorage["url"],
            events: {
                'onReady': onPlayerReady
            }
        });

        player.addEventListener('onReady', onPlayerReady);
    } else { console.log('ERROR: No URL provided.'); }
};
