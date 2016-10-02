var os = require('os');
var express = require('express');
var async = require('async');
var amqp = require('amqplib/callback_api');
var _ = require('underscore');
var app = express();

// CONSTANTS
var RABBITMQ_URL = "amqp://rabbitmq";
var WORKQUEUE = "workqueue";
var CLOSED_PATRON = "closed";

// api ------------------------------------------------------------
app.get('/patrons', function (req, res) {
    var activePatrons = _.filter(patrons, function (p) {
        return p.state != CLOSED_PATRON;
    });

    res.send(activePatrons);
});

// app ------------------------------------------------------------
var port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Listening on port " + port);
});

// data ------------------------------------------------------------
var patrons = [
    { phone: "425 123 9922", name: "Dave", state: "waiting", partySize: 4, waitStartTime: new Date() },
    { phone: "425 452 2853", name: "Audrey", state: "waiting", partySize: 2, waitStartTime: new Date()  },
    { phone: "260 123 1234", name: "Simon", state: "waiting", partySize: 3, waitStartTime: new Date() },
    { phone: "444 444 4444", name: "Peter", state: CLOSED_PATRON, partySize: 11 },
    { phone: "425 333 2833", name: "Mary", state: "seated", partySize: 2, waitStartTime: new Date(), seatStartTime: new Date() },
    { phone: "425 237 9999", name: "Barry", state: "waiting", partySize: 3, waitStartTime: new Date() },
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

    bus.subscribe('patron.leave', function (event) {
        console.log("EVENT RECEIVED: patron.leave - %j", event);
        leavePatron(event.patronID);
    });

    bus.subscribe('table.assigned', function (event) {
        console.log("EVENT RECEIVED: table.assigned - %j", event);
        assignPatronToTable(event.tableID, event.patronID);
    });

    setInterval(function () {
        _.each(patrons, function (p) {
            if (p.state == "waiting") {
                publishEvent("patron.waiting", p);
            }
        });
    }, 5000);
}, 6000);

function assignPatronToTable(tableID, patronID) {
    var patron = _.findWhere(patrons, { phone: patronID });
    if (patron) {
        patron.tableID = tableID;
        patron.state = "called";
        updatePatron(patron);
    }
}

function createPatron(patron) {
    patron.state = "waiting";
    patrons.push(patron);

    publishEvent('patron.created', { patron });
}

function updatePatron(patron) {
    // find patron to update
    for (i = 0; i < patrons.length; i++) {
        if (patrons[i].phone == patron.phone) {
            var oldState = patrons[i].state; 
            patrons[i] = patron;
            if (oldState == "called" && patron.state == "seated") {
                patrons[i].seatStartTime = new Date();
            }

            publishEvent('patron.updated', { patron });
            break;
        }
    }
}

function leavePatron(patronID) {
    for (i = 0; i < patrons.length; i++) {
        if (patrons[i].phone == patronID) {
            patrons[i].state = CLOSED_PATRON;

            publishEvent('patron.left', { patronID });
            break;
        }
    }
}

function publishEvent(eventName, eventData) {
    getServiceBus().publish(eventName, eventData);
    console.log("EVENT PUBLISHED: %s %j", eventName, eventData);
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


