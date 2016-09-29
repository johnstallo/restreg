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
app.get('/tables', function (req, res) {
    res.send(tables);
});

// app ------------------------------------------------------------
var port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Listening on port " + port);
});

// data ------------------------------------------------------------
var tables = [
    { id: "1", capacity: "4", state: "available" },
    { id: "2", capacity: "4", state: "available" },
    { id: "3", capacity: "4", state: "occupied", patronID: "425 333 2833" }
];

// SERVICEBUS ---------------------------------------------------------
setTimeout(function () {
    var bus = getServiceBus();

    bus.subscribe('patron.created', function (event) {
        console.log("EVENT RECEIVED: patron.created - %j", event);
        // matchTable(event.patron);
    });

    bus.subscribe('patron.waiting', function (event) {
        console.log("EVENT RECEIVED: patron.waiting - %j", event);
        matchTable(event);
    });

    bus.subscribe('patron.left', function (event) {
        console.log("EVENT RECEIVED: patron.left - %j", event);
        unassignTable(event.patronID);
    });
}, 5000);

function unassignTable(patronID) {
    var table = _.findWhere(tables, { patronID: patronID });
    if (table) {
        table.patronID = null;
        table.state = "available";
    }
}

function matchTable(patron) {
    var table = findAvailableTable(patron.partySize);
    if (table) {
        console.log("found available table: id=%s", table.id);
        assignPatronToTable(table, patron.phone);
    }
    else {
        console.log("could not find an available table");
    }
}

function assignPatronToTable(table, patronID) {
    table.patronID = patronID;
    table.state = "occupied";
    publishEvent("table.assigned", { tableID: table.id, patronID: patronID });
}

function findAvailableTable(capacity) {
    console.log("searching available capacity of " + capacity);
    var availableTables = _.filter(tables, function (t) {
        return t.state == "available" && t.capacity >= capacity;
    });
    if (availableTables.length > 0) {
        return availableTables[0]; // return first match
    }
    return null;
}


function publishEvent(eventName, eventData) {
    getServiceBus().publish(eventName, eventData);
    console.log("EVENT PUBLISHED: %s %j", eventName, eventData);
}

var bus;
function getServiceBus() {
    if (bus) {
        return bus;
    }
    else {
        return require('servicebus').bus({ url: RABBITMQ_URL });
    }
}
