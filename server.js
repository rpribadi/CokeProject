var express = require('express');
var app = express();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/app'));
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/index.html');
});

app.get('/daily.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/daily.html');
});



var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
// Override so we don't decode spaces, and mess up the base64 encoding
querystring.unescape = function(s, decodeSpaces) {
    return s;
};

// Pad to follow the processing export format
function pad(num) {
    var s = "000" + num;
    return s.substr(s.length-4);
}

app.post('/export2.html', function(request, response) {
    console.log("RECEIVE", request.param('frame'))
    request.content = '';
    var frame = 0;

    request.addListener("data", function(data) {
        if(typeof data !== data) {
            request.content += data;
        }
    });

    request.addListener("end", function() {
        if (request.content.trim()) {
            request.content = querystring.parse(request.content);
            var data = request.content['data'];
            frame = request.content['frame'];

            // Remove data:image/png;base64,
            data = data.substr(data.indexOf(',') + 1);
            var buffer = new Buffer(data, 'base64');
            fs.writeFile('screen-' + pad(frame) + '.png',
                buffer.toString('binary'), 'binary');
        }
    });

//    response.writeHead(200, {
//        'Content-Type': 'text/plain',
//        'Access-Control-Allow-Origin': '*',
//        'Access-Control-Allow-Headers': 'X-Requested-With'
//    });


//    response.end(function(){
//        console.log("FRAME", frame)
//        response.send({
//            abc: 'abcd',
//            frame: frame,
//            test: 'riki'
//        });
//    })
});

app.post('/export.html', function(request, response) {
    console.log("Data received: ", request.param('frame'));

    var frame = request.param('frame');
    var data = request.param('data');
    // Remove data:image/png;base64,
    data = data.substr(data.indexOf(',') + 1);

    var filename = 'screenshots/screen-' + pad(frame) + '.png';
    var buffer = new Buffer(data, 'base64');

    fs.writeFile(filename, buffer.toString('binary'), 'binary');
    console.log("Screenshot saved: ", filename)

    response.send({
        frame: frame,
        filename: filename
    });

});

app.listen(5555);
console.log('Listening on port 5555');