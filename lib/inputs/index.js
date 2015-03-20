var express = require('express'),
    products = require('./products'),
    app = module.exports = express(),
    utils = require('../utils'),
    dir = require('../dir');
app.post('/products', function (req, res, next) {
    res.locals.filename = utils.getFilename('art_' + req.body.data.headerId);
    res.locals.pathPrefix = 'files/out/';
    next();
}, dir.getPathByDate, products.prepareMasterProductsFile, utils.putFileToFTP);
app.post('/products/quantities', function (req, res, next) {
    res.locals.filename = utils.getFilename('cant_' + req.body.data.headerId);
    res.locals.pathPrefix = 'files/out/';
    next();
}, dir.getPathByDate, products.prepareQuantitiesFile, utils.putFileToFTP);
app.post('/products/serial-numbers', function (req, res, next) {
    var code = req.body.productCode ? "_" + req.body.productCode : '';
    res.locals.filename = utils.getFilename('ns_' + code);
    res.locals.pathPrefix = 'files/out/';
    next();
}, dir.getPathByDate, products.prepareSerialNumbersFile, utils.putFileToFTP);
