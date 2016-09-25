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

// // RabbitMQ connection --------------------------------------------
// async.retry({
//     times: 10,
//     interval: function (retryCount) {
//         return 50 * Math.pow(2, retryCount); // exponential backoff
//     }
// }, function (cb, result) {
//     amqp.connect(RABBITMQ_URL, function (err, conn) {
//         if (err) {
//             console.error("*************", err.message, "*************");
//             return cb(new Error("could not connect to rabbit"));
//         }
//         // successful connection
//         console.log("Successfully connected");
//         cb(null, conn);
//     });
// }, function (err, connection) {
//     if (err) { return null; } // couldn't connect even after n retries

//     connection.createChannel(function (err, ch) {
//         var q = WORKQUEUE;
//         ch.assertQueue(q, { durable: true });
//         ch.prefetch(1);
//         console.log("Waiting for messages on queue %s.", q);

//         ch.consume(q, function (msg) {
//             console.log("Received message %s on queue %s", msg.content.toString(), q);
//             setTimeout(function () {
//                 ch.ack(msg);
//             }, 1000);
//         }, { noAck: false });
//     });
// });

// SERVICEBUS ---------------------------------------------------------

setTimeout(function () {
    var bus = require('servicebus').bus({ url: RABBITMQ_URL });
    bus.subscribe('my.event', function (event) {
        console.log("EVENT RECEIVED: %j", event);
    });

    bus.subscribe('patron.requestCreate', function (event) {
        console.log("EVENT RECEIVED: %j", event);
        createPatron(event.patron);
    })
}, 6000);

function createPatron(patron) {
    patron.status = "waiting";
    patrons.push(patron);
    console.log("patron %j created: %j", patron.phone, patron);
}




