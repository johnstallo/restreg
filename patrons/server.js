var os = require('os');
var express = require('express');

var app = express();

app.get('/patrons', function (req, res) {
    console.log("message from patron");
    res.send(patrons);
});

app.get('/sendrabbit', function (req, res) {
    var readMessage = readFromRabbit();
    console.log("read message: " + readMessage);
    res.send(readMessage);
});

var port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Listening on port " + port);
});

var amqp = require('amqp');

function readFromRabbit() {
    var connection = amqp.createConnection({ host: "rabbitmq" }, { reconnect: false });
    console.log('Rabbit connection created; waiting for connection... %j', connection);

    connection.on('ready', function () {
        console.log("connection ready for use.");
        connection.queue('hello', { autoDelete: false }, function (q) {
            console.log("Connection to 'hello' queue");

            q.bind('#'); // Catch all messages

            q.on('queueBindOk', function () {
                console.log("The 'hello' queue is ready for use. Subscribing to message...");
                q.subscribe(function (message) {
                    var buf = new Buffer(message.data);
                    var messageData = buf.toString('utf-8');
                    console.log("received message: " + messageData);
                    return messageData;
                });
            });
        });
    });
};


// data
var patrons = [
    { phone: "425 123 9922", name: "John", state: "Waiting", partySize: 4 },
    { phone: "425 452 2853", name: "Miriam", state: "Waiting", partySize: 2 },
];


setTimeout(function () {
    console.log("Attempting to connect to rabbitmq");
    var amqp2 = require('amqplib/callback_api');

    amqp2.connect('amqp://rabbitmq', function (err, conn) {
        if (err) {
            console.log("[AMQP]", err.message);
        }

        conn.createChannel(function (err, ch) {
            var q = 'hello';

            ch.assertQueue(q, { durable: false });
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
            ch.consume(q, function (msg) {
                console.log(" [x] Received %s", msg.content.toString());
            }, { noAck: true });
        });
    });
}, 5000);


