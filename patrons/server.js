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
    res.send(patrons);
});

// app ------------------------------------------------------------
var port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Listening on port " + port);
});

// data ------------------------------------------------------------
var patrons = [
    { phone: "425 123 9922", name: "John", state: "waiting", partySize: 4 },
    { phone: "425 452 2853", name: "Miriam", state: "waiting", partySize: 2 },
    { phone: "260 123 1234", name: "Simon", state: "called", partySize: 3 },
];

// SERVICEBUS ---------------------------------------------------------
var bus;
setTimeout(function () {
    bus = require('servicebus').bus({ url: RABBITMQ_URL });
    bus.subscribe('my.event', function (event) {
        console.log("EVENT RECEIVED: %j", event);
    });

    bus.subscribe('patron.requestCreate', function (event) {
        console.log("EVENT RECEIVED: %j", event);
        createPatron(event.patron);
    });

    // test
    // pushNewPatrons();
}, 6000);

function createPatron(patron) {
    patron.state = "waiting";
    patrons.push(patron);

    console.log("patron %j created: %j", patron.phone, patron);

    // publish message: patron.created
    var bus = getServiceBus();
    bus.publish('patron.created', { patron });
}

function getServiceBus() {
    if (bus) {
        return bus;
    }
    else {
        return require('servicebus').bus({ url: RABBITMQ_URL });
    }
}

// function pushNewPatrons() {
//     var i = patrons.length;
//     setInterval(function() {
//         var randomPatron = { name: "Random" + i.toString(), phone: "425-833-912" + i.toString()};
//         createPatron(randomPatron);
//         i++;
//     }, 5000);
// }


