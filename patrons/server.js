var os = require('os');
var express = require('express');
var async = require('async');
var amqp = require('amqplib/callback_api');
var app = express();

// CONSTANTS
var RABBITMQ_URL = "amqp://rabbitmq";
var WORKQUEUE = "workqueue";

// api ------------------------------------------------------------
app.get('/patrons', function (req, res) {
    console.log("message from patron");
    res.send(patrons);
});

// app ------------------------------------------------------------
var port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Listening on port " + port);
});

// data ------------------------------------------------------------
var patrons = [
    { phone: "425 123 9922", name: "John", state: "Waiting", partySize: 4 },
    { phone: "425 452 2853", name: "Miriam", state: "Waiting", partySize: 2 },
];

// RabbitMQ connection --------------------------------------------
async.retry({
    times: 10,
    interval: function (retryCount) {
        return 50 * Math.pow(2, retryCount); // exponential backoff
    }
}, function (cb, result) {
    amqp.connect(RABBITMQ_URL, function (err, conn) {
        if (err) {
            console.error("*************", err.message);
            return cb(new Error("could not connect to rabbit"));
        }
        // successful connection
        console.log("Successfully connected");
        cb(null, conn);
    });
}, function (err, connection) {
    if (err) { return null; } // couldn't connect even after n retries

    connection.createChannel(function (err, ch) {
        var q = WORKQUEUE;
        ch.assertQueue(q, { durable: false });
        console.log("Waiting for messages on queue %s.", q);

        ch.consume(q, function (msg) {
            console.log("Received message %s on queue %s", msg.content.toString(), q);
        }, { noAck: true });
    });
});



// setTimeout(function () {
//     console.log("Attempting to connect to rabbitmq");
//     var amqp = require('amqplib/callback_api');

//     amqp.connect('amqp://rabbitmq', function (err, conn) {
//         if (err) {
//             console.log("[AMQP]", err.message);
//         }

//         conn.createChannel(function (err, ch) {
//             var q = 'hello';

//             ch.assertQueue(q, { durable: false });
//             console.log("Waiting for messages in %s.", q);
//             ch.consume(q, function (msg) {
//                 console.log("Received message %s on queue %s", msg.content.toString(), q);
//             }, { noAck: true });
//         });
//     });
// }, 5000);


