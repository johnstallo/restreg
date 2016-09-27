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

    bus.subscribe('patron.requestCreate', function (event) {
        console.log("EVENT RECEIVED: patron.requestCreate - %j", event);
        createPatron(event.patron);
    });

    bus.subscribe('patron.update', function (event) {
        console.log("EVENT RECEIVED: patron.update - %j", event);
        updatePatron(event.patron);
    });

    bus.subscribe('patron.delete', function (event) {
        console.log("EVENT RECEIVED: patron.delete - %j", event);
        deletePatron(event.patronID);
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

function updatePatron(patron) {
    // find patron to update
    for (i = 0; i < patrons.length; i++) {
        if (patrons[i].phone == patron.phone) {
            patrons[i] = patron;
            // publish message: patron.created
            var bus = getServiceBus();
            bus.publish('patron.updated', { patron });
            break;
        }
    }
}

function deletePatron(patronID) {
    for (i = 0; i < patrons.length; i++) {
        if (patrons[i].phone == patronID) {
            console.log("Deleting patron %s...", patronID);
            patrons.splice(i, 1);

            getServiceBus().publish('patron.deleted', { patronID });
            break;
        }
    }
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


