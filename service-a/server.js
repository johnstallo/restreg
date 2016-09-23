var os = require('os');
var request = require('request');
var express = require('express');
var morgan = require('morgan');
var amqp = require('amqplib/callback_api');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(morgan("dev"));

// CONSTANTS
var RABBITMQ_URL = "amqp://rabbitmq";
var WORKQUEUE = "workqueue";

// api ------------------------------------------------------------
app.get('/api', function (req, res) {
    res.send("hello world");
});

app.get('/api/rabbit', function (req, res) {
    var message = req.query.message || "hello world";

    amqp.connect(RABBITMQ_URL, function (err, conn) {
        if (err) {
            console.log("AMQP Error: %s", err.message);
            res.status(500).send('Error');
        }

        conn.createChannel(function (err, ch) {
            var q = WORKQUEUE;
            ch.assertQueue(q, { durable: false });
            ch.sendToQueue(q, new Buffer(message));
            console.log("Sent '%s'", message);
            res.send(message);
        });
    });
});

app.get('/api/patrons', function (req, res) {
    request('http://patrons/patrons', function (error, response, body) {
        res.send(body);
    });
});

app.post('/api/newpatron', function (req, res) {
    var patron = {
        phone: req.body.patron,
        name: req.body.name,
        partySize: req.body.partySize
    };

    console.log("API: new patron added: %j", patron);
});

// web application -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var port = 80;
app.listen(port, function () {
    console.log('Listening on port ' + port);
});
