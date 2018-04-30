'use strict';

const config = require('./config.js');
const currencyHistory = require('./actions/currency-history.js');
const db = require('./db/db.js');
const express = require('express');

const app = express();
const router = express.Router();


db.init(config.DBFILE);

router.use('/history/:base/:target/:start/:weeks', currencyHistory.get);

app.use('/v1', router);

app.use(onError);

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
    db.close();
}

function onError(err, req, res, next) {
    console.log(err);
    res.statusCode = 500;
    res.status(500).json({
        error_message: 'something went wrong'
    });
}