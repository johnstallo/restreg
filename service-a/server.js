var os = require('os');
var request = require('request');
var express = require('express');
var morgan = require('morgan');

var amqp = require('amqp');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(morgan("dev"));

// api ------------------------------------------------------------
app.get('/api', function (req, res) {
    res.send("hello world");
});


var amqp2 = require('amqplib/callback_api');
app.get('/api/amqplib', function(req, res) {
    amqp2.connect('amqp://rabbitmq', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var q = "hello";
            ch.assertQueue(q, {durable: false});
            ch.sendToQueue(q, new Buffer('Hello World'));
            console.log("Sent 'Hello World");
            res.send("sent hello world");
        });
    });
});

app.get('/api/rabbit', function(req, res) {
    var connection = amqp.createConnection({host: "rabbitmq"}, {reconnect: false});
    console.log('Rabbit connection created; waiting for connection... %j', connection);

    connection.on('ready', function() {
        console.log('Connection ready for use.');
        connection.queue('hello', {autoDelete: false }, function(q){
            console.log('Connected to "hello" queue.');

            q.bind('#'); // bind to all messages

            q.on('queueBindOk', function() {
                var message = 'hello world @ ' + new Date();
                connection.publish('hello', message);

                console.log('Published message: "' + message + '"');
                connection.disconnect();
                res.send("successfully connected to queue");
            });
        });
    });
});

app.get('/api/patrons', function(req, res) {
    request('http://patrons/sendrabbit', function (error, response, body) {
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
