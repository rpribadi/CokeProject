var express = require('express');
var app = express();
var fs = require('fs');

app.configure(function() {
    app.use(express.bodyParser({limit: '50mb'}));
    app.use(express.static(__dirname + '/app'));
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/index.html');
});

app.get('/daily.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/daily.html');
});

app.get('/brand.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/brand.html');
});

app.get('/timeline.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/timeline.html');
});

app.get('/time.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/time.html');
});

app.get('/recipe.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/recipe.html');
});

// Pad to follow the processing export format
function pad(num) {
    var s = "000" + num;
    return s.substr(s.length-4);
}
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