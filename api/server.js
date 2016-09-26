var os = require('os');
var request = require('request');
var express = require('express');
var morgan = require('morgan');
var amqp = require('amqplib');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
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
    var q = WORKQUEUE;
    var rabbitmq = require('amqplib').connect(RABBITMQ_URL);

    rabbitmq.then(function (conn) {
        conn.createChannel().then(function (ch) {
            ch.assertQueue(q, { durable: true }).then(function (ok) {
                ch.sendToQueue(q, new Buffer(message), { persistent: true });
                console.log("Sent message '%s' to queue '%s', %j", message, ok.queue, ok);
                res.send(message);
            });
            setTimeout(function () {
                conn.close();
            }), 500;
        });
    }).catch(console.warn);
});

app.get('/api/patrons', function (req, res) {
    request('http://patrons/patrons', function (error, response, body) {
        res.send(body);
    });
});

app.post('/api/patron', function (req, res) {
    console.log('received new patron request: %j', req.body);

    var patron = {
        phone: req.body.phone,
        name: req.body.name,
        partySize: req.body.partySize
    };

    // publish message: patron.requestCreate 
    var bus = getServiceBus();
    bus.publish('patron.requestCreate', { patron });

    res.send({ status: "ok" });
});

function getServiceBus() {
    if (bus) {
        return bus;
    }
    else {
        return require('servicebus').bus({ url: RABBITMQ_URL });
    }
}

// web api -------------------------------------------------------------
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// socket.io -----------------------------------------------------------
function notifyUpdatedPatrons() {
    request('http://patrons/patrons', function (error, response, body) {
        console.log("Patrons: \n%j", body);
    });
}

var port = 80;
app.listen(port, function () {
    console.log('Listening on port ' + port);
});

// servicebus ----------------------------------------------------------
var bus;
setTimeout(function () {
    bus = require('servicebus').bus({ url: RABBITMQ_URL });
    console.log("service bus connected %j", bus);
    // setInterval(function () {
    //     console.log("publishing my.event");
    //     bus.publish('my.event', { my: 'event' });
    // }, 1000);

    bus.subscribe('patron.created', function (event) {
        console.log("EVENT RECEIVED: %j", event);
        
        notifyUpdatedPatrons();
    });

}, 5000);


