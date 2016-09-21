var os = require('os');
var request = require('request');
var express = require('express');
var morgan = require('morgan');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(morgan("dev"));

// api ------------------------------------------------------------
app.get('/api', function (req, res) {
    res.send("hello world");
});

app.get('/api/patrons', function(req, res) {
    request('http://patrons/patrons', function (error, response, body) {
        res.send(body);
    });
});

app.post('/api/newpatron', function(req, res) {
    var patron = {
        phone: req.body.patron,
        name: req.body.name,
        partySize: req.body.partySize
    };

    console.log("API: new patron added: %j", patron);
});

// app.get('/metrics', function (req, res) {
//     var redis = require('redis').createClient('redis://myredis');
//     redis.get('requestCount', function (err, reply) {
//         res.send({ requestCount: reply });
//     });
// });

// web application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var port = 80;
app.listen(port, function () {
    console.log('Listening on port ' + port);
});
