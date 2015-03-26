'use strict';
var http = require('http'),
    app = require('./app');
if (process.env.NODE_ENV === 'production') {
    http.createServer(app).listen(3001, function () {
        console.log('Damco %s module listening on port %s', process.env.NODE_ENV, 3001);
    });
} else {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Damco %s module listening on port %s', process.env.NODE_ENV, app.get('port'));
    });
}
process.on('uncaughtException', function (err) {
    console.error('Uncaught process exception ' + err);
    console.trace(err.stack);
    process.exit(1);
});
