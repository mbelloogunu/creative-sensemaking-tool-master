var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function submitForm() {
    var url = $("#url").val();
    
    console.log(url);

    localStorage["url"] = JSON.stringify(url);

    console.log(localStorage["url"]);

	if (localStorage["url"].includes("www.youtube.com/watch?v="))
    {
    	localStorage["url"] = localStorage["url"].substring((localStorage["url"].indexOf("=")+1), localStorage["url"].length-1);
    }

    console.log(localStorage["url"]);

    window.location = "index.html";
}

function setSamplingRate() {
    localStorage["samplingRate"] = document.getElementById("samplingRate").value;
    samplingRate = document.getElementById("samplingRate").value;
    clearInterval();
    console.log("newSamplingRate:" + samplingRate);
    return;
}