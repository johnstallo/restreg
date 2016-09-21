var os = require('os');
var express = require('express');

var app = express();

app.get('/patrons', function (req, res) {
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