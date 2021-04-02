"use strict";
const express = require("express");
let router = express.Router();

const dataAction = require('../modules/dataaction');
const user = require('../controllers/user.controller');

router.use((req, res, next) => {
    console.log(req.url, '@', Date.now());
    next();
});

router
    .route('/')
    .get(dataAction.authenticateToken, user.findAll)
    .post(user.create);

module.exports = router;