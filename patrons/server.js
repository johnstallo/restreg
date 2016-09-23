var os = require('os');
var express = require('express');

var app = express();

app.get('/patrons', function (req, res) {
    console.log("message from patron");
    res.send(patrons);
});

var port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Listening on port " + port);
});

// data
var patrons = [
    { phone: "425 123 9922", name: "John", state: "Waiting", partySize: 4 },
    { phone: "425 452 2853", name: "Miriam", state: "Waiting", partySize: 2 },
];


setTimeout(function () {
    console.log("Attempting to connect to rabbitmq");
    var amqp = require('amqplib/callback_api');

    amqp.connect('amqp://rabbitmq', function (err, conn) {
        if (err) {
            console.log("[AMQP]", err.message);
        }

        conn.createChannel(function (err, ch) {
            var q = 'hello';

            ch.assertQueue(q, { durable: false });
            console.log("Waiting for messages in %s.", q);
            ch.consume(q, function (msg) {
                console.log("Received message %s on queue %s", msg.content.toString(), q);
            }, { noAck: true });
        });
    });
}, 5000);


