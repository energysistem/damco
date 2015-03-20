var express = require('express'),
    http = require('http'),
    path = require('path'),
    inputs = require('./lib/inputs'),
    orders = require('./lib/orders'),
    restartServer = require('./lib/restart'),
    ftp = require('./lib/ftp'),
    sql = require('mssql'),
    req = http.IncomingMessage.prototype,
    app = module.exports = express(),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    errorhandler = require('errorhandler'),
    env = process.env.NODE_ENV || 'development',
    ftpConf;
// all environments
app.set('port', process.env.PORT || 3000);
app.use(logger('combined'));
app.use(bodyParser.json({
    limit: '30mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '30mb'
}));
// development only
if (env == 'development') {
    app.use(errorhandler({
        dumpException: true,
        showStack: true
    }));
    ftpConf = require('./ftpConfDev');
    app.set('ftpConf', ftpConf);
    app.set('dbConfig', require('./mssqlConfDev'));
    console.log('Conectado al FTP y Bd de desarrollo.');
    console.log(ftpConf);
}
if (env == 'production') {
    ftpConf = require('./ftpConfProd');
    app.set('ftpConf', ftpConf);
    app.set('dbConfig', require('./mssqlConf'));
    console.log('Conectado al FTP y Bd de producción.');
    console.log(ftpConf);
}
global.warehouseId = "bpaibhcodhmn";
global.db = global.db ? global.db : new sql.Connection(app.settings.dbConfig, function (err) {
    if (err) {
        console.log(err);
        console.trace(err.stack);
    }
});
app.use('/inputs', inputs);
app.use('/orders', orders);
app.use('/ftp', ftp);
app.get('/restart', restartServer.launch);
