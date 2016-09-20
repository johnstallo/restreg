var os = require('os');
//var request = require('request');
var express = require('express');
var morgan = require('morgan');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(morgan("dev"));

// api ------------------------------------------------------------
app.get('/api', function (req, res) {

    // Connect to redis container using environment variables
    // var redis = require('redis').createClient('redis://myredis');
    
    // Increment requestCount each time API is called
    // redis.incr('requestCount', function (err, reply) {
    //     var requestCount = reply;
    // });
    
    // Invoke service-b
    // request('http://service-b', function (error, response, body) {
    //      res.send('Hello from service-A running on ' + os.hostname() + ' and ' + body);
    // });

    res.send("hello world");
});

// app.get('/metrics', function (req, res) {
//     var redis = require('redis').createClient('redis://myredis');
//     redis.get('requestCount', function (err, reply) {
//         res.send({ requestCount: reply });
//     });
// });

// application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var port = 80;
app.listen(port, function () {
    console.log('Listening on port ' + port);
});
