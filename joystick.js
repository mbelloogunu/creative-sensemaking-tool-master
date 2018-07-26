var stick;
var pivot;
var ycoord;
var isDragging = false;
var springMotionInterval;
var counter = 0;
var lastCounter = 1;
var data = [];
var numDataPoints = 100;
var totalNumDataPoints = 0;
var graph;
var isPlaying = false;
var samplingRate = 500;
var cumSumGraph;
var derCumSumGraph;
var clampCount;
var sumArray = [];
var sumVariable = 0;
var slopeArray = [];
var slope = 0;
var zeroTotal = 0;
var oneTotal = 0;
var ptFiveTotal = 0;
var negOneTotal = 0;
var negPtFiveTotal = 0;

function setup(playerDuration) {
    //console.log("Anything");
    // create joystick
    //stick = $("#slider-vertical");
    //pivot = $("#pivot");
    ycoord = Number($("#amount")[0].value);
    //setStick(0);

    // make stick draggable.
    //$("#pivot-wrapper").on("mousedown", startDragging);
    //$("#pivot-wrapper").on("mousemove", drag);
    //$("#pivot-wrapper").on("mouseup", stopDragging);

    // instantiate data to null
    totalNumDataPoints = (playerDuration + 1) * (samplingRate * (4/1000));
    console.log("totalNumDataPoints:" + totalNumDataPoints);
    console.log("playerDuration:" + playerDuration);
    for (var i = 0; i <= totalNumDataPoints; i++) {
        data[i] = null;
    }
    data[totalNumDataPoints] = 0;

    // create graph to plot what's in data.
    graph = new Highcharts.Chart('graph-container', {
        title: {
            text: 'Sense Making Curve'
        },
        "yAxis": {
            "min": -1,
            "max": 1
        },
        "series": [{
            "data": data,
            "type": "spline",
            "connectNulls": false,
            "connectEnds": true,
            "turboThreshold": totalNumDataPoints + 1
        }]
    });

    for (var i = 0; i <= totalNumDataPoints; i++) {
        sumArray[i] = null;
    }
    sumArray[totalNumDataPoints] = 0;

    // create graph to plot what's in data.
    cumSumGraph = new Highcharts.chart('cum-sum-container', {
        chart: {
            type: "spline",
            zoomType: 'x'
        },
        title: {
            text: 'IxD Cumulative Sum'
        },
        "yAxis": {
            "min": -100,
            "max": 300
        },
        scrollbar: {
            enabled: true,
        },
        "series": [{
            "data": sumArray,
            "type": "spline",
            "connectNulls": false,
            "connectEnds": true,
            "turboThreshold": totalNumDataPoints + 1,
            cropThreshold: 9999
        }]
    });

    for (var i = 0; i <= totalNumDataPoints; i++) {
        slopeArray[i] = null;
    }
    slopeArray[totalNumDataPoints] = 0;

    derCumSumGraph = new Highcharts.chart('der-cum-sum-container', {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: 'Derivative of IxD Cumulative Sum'
        },
        "yAxis": {
            "min": -50,
            "max": 50,
        },
        scrollbar: {
            enabled: true,
        },
        "series": [{
            "data": slopeArray,
            "type": "spline",
            "connectNulls": false,
            "connectEnds": true,
            "turboThreshold": totalNumDataPoints + 1
        }]

    });

    // //mousedown - left mouse button is pressed down over the selected element
    // $('.graph-container').on('mousedown', function(event) {
    //     console.log("Clickdown chart");
    //     $(this).toggleClass('modal');
    //     graph.reflow();
    // });

    // set up download button
    $("#download").on("click", download);
    samplingRate = localStorage["samplingRate"];
    console.log(localStorage["samplingRate"]);
    // starts recording
    // in the future, consider setting the timeout so that the
    // rate of data collection coincides with the video's framerate.
    //setSamplingRate();
    setInterval(record, samplingRate);
    slider();    
}

var recordCode = true;
console.log("RecordCode:" + recordCode);
function codeRecorder(){
    console.log("in the codeRecorder function");
    if (recordCode == true) {
        recordCode = false;
    }
    else recordCode = true;
}

//sets the slider
function slider() {
    $('#slider-vertical').slider({
        orientation: "vertical",
        animate: "fast",
        range: "min",
        min: -1,
        max: 1,
        value: 0,
        step: .5,
        slide: function( event, ui ) {
            $( "#amount" ).val( ui.value );
            ycoord = Number(document.getElementById("amount").value);
            document.getElementById("demo").innerHTML = ycoord;
        }
    });
    $("#amount").val( $("#slider-vertical").slider("value"));

}

// sets the stick's position to the x and y (or to maxX and maxY)
function setStick(y) {

    if (y < 0) y = Math.ceil(y); else y = Math.floor(y);

    var width = stick.width();
    var height = stick.height();
    var parentWidth = pivot.width();
    var parentHeight = pivot.height();

    y = ycoord;

    //stick.css({"top": y});
}

// starts the dragging event for the stick
function startDragging(event) {
    if (YT.PlayerState.PLAYING) {
        isRecording = true;
    }

    // stops stick's spring motion
    //clearInterval(springMotionInterval);

    // enables dragging
    isDragging = true;

    // find position of stick relative to pivot and sets stick position to that.
    //var x = event.pageX - pivot.offset().left - pivot.width() / 2;
    var y = event.pageY - pivot.offset().top - pivot.height() / 2;
}

// set stick's position, if dragging event occurring.
function drag(event) {
    if (!YT.PlayerState.PLAYING) {
        isRecording = false;
    }

    if (isDragging) {
        //var x = event.pageX - pivot.offset().left - pivot.width() / 2;
        var y = event.pageY - pivot.offset().top - pivot.height() / 2;
        setStick(y);
    }
}

// downloads data in csv format.
function download() {
    var text = "";

    var data_length = graph.series[0].data.length;
    data = graph.series[0].data;

    for (var i = 0; i < data_length; i++) {
        text += data[i].x + "," + data[i].y;
        text += "\n";
    }

    document.getElementById("download").href = 'data:attachment/csv,'+ encodeURIComponent(text);
}

// records the position of the stick in the output file/variable.
function record() {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else {
        isPlaying = false;
    }

    // console.log(graph)
    // sets the counter to be at the current video frame. Ensures sync.
    lastCounter = counter;
    counter = Math.round(player.getCurrentTime() * samplingRate * (4/1000));

    //if button is OFF, values are not recorded.
    if(!recordCode) {
        return;
    }
    
    // only records if video is playing AND button is ON.
    console.log("isPlaying: " + isPlaying);
    console.log("recordCode: " + recordCode);
    if (!isPlaying /*&& !recordCode*/) {
        console.log("In isPlaying: " + codeRecorder);
        var startIndex = counter - numDataPoints;
        graph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);
        //cumSumGraph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);
        //derCumSumGraph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);

        return;
    }

    //var x = stick.position().left + stick.width() / 2 - pivot.width() / 2;
    //var y = - stick.position().top - stick.height() / 2 + pivot.height() / 2;
    var y = ycoord;
    console.log("y: " + y);

    if (lastCounter < counter) {
        // clear data all from lastCounter up to counter.
        // important for scrubbing
        for (var i = lastCounter + 1; i < counter; i++) {
            var previous = data[lastCounter];
            var numSlots = counter - lastCounter;
            //this is calculating slope
            //var newY = (i - lastCounter)*(y - previous.y)/numSlots + previous.y;
            graph.series[0].data[i].update(y);
            console.log("inside lastCounter");
        }
    }

    graph.series[0].data[counter].update(y);
    cumSumGraph.series[0].data[counter].update(sumVariable);
    derCumSumGraph.series[0].data[counter].update(slope);

    // data[counter].y = y;

    // counter determines the extremes of the x axis to display.
    var startIndex = counter - numDataPoints;
    graph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);
    cumSumGraph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);
    derCumSumGraph.xAxis[0].setExtremes(startIndex, startIndex + 100, true, false);

    //console.log("data: " + data[i]);
    sumVariable += y;
    sumArray[i] = sumVariable;
    
/*    console.log("sumArray vals:" + sumArray);
    console.log("sumVariable: " + sumVariable);*/

    slope = Math.round((sumArray[i - 1] - sumArray[i])/((player.getCurrentTime() - 1) - player.getCurrentTime()));
    slopeArray[i] = slope;

   /* console.log("slopeArray vals:" + slopeArray);
    console.log("slope: " + slope);*/

    if (y == 0) {
        zeroTotal += 1;
        document.getElementById("zeroTotal").innerHTML = zeroTotal;
    } else if (y == 1) {
        oneTotal += 1;
        document.getElementById("oneTotal").innerHTML = oneTotal;
    } else if (y == 0.5) {
        ptFiveTotal += 1;
        document.getElementById("ptFiveTotal").innerHTML = ptFiveTotal;
    } else if (y == -1) {
        negOneTotal += 1;
        document.getElementById("negOneTotal").innerHTML = negOneTotal;
    } else if (y == -0.5) {
        negPtFiveTotal += 1;
        document.getElementById("negPtFiveTotal").innerHTML = negPtFiveTotal;
    }

    console.log("zeroTotal = " + zeroTotal);
    console.log("oneTotal = " + oneTotal);
    console.log("ptFiveTotal = " + ptFiveTotal);
    console.log("negOneTotal = " + negOneTotal);
    console.log("negPtFiveTotal = " + negPtFiveTotal);

}

function graphVisibility(id) {
    var checkbox = document.getElementById(id);
    if (checkbox.style.visibility == "visible") {
        checkbox.style.visibility = "hidden";
    } else {
        checkbox.style.visibility = "visible";
    }
}
