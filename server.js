var express = require('express');
var app = express();

app.configure(function() {
    app.use(express.static(__dirname + '/app'));
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/index.html');
});

app.get('/daily.html', function(req, res) {
    res.sendfile(__dirname + '/app/coke50/daily.html');
});

app.listen(5555);
console.log('Listening on port 5555');