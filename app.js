"use strict";
const express = require("express");
const app = express();
const port = process.env.port || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

//Master
const user = require('./routes/user.routes.js');

app.use('/user', user);

app.get('/', (req, res) => {
    //handle root
    res.send("hi root 123");
});

process.once('SIGUSR2', function () {

    console.log('process.pid', process.pid)
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', function () {
    // this is only called on ctrl+c, not restart
    process.kill(process.pid, 'SIGINT');
});

app.listen(port, err => {
    if (err) return console.log("ERROR", err);
    console.log(`Listening on port ${port}`);
});

