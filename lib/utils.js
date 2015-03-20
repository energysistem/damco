var jsftp = require('jsftp'),
    http = require('http'),
    fs = require('fs'),
    dir = require('./dir');
String.prototype.padRight = function (length) {
    return this + Array(length - String(this).length + 1).join(' ');
};
String.prototype.padLeft = function (length, fillWith) {
    return Array(length - this.length + 1).join(fillWith || '0') + this;
};
String.prototype.removeBreakLines = function () {
    return this.replace(/\r?\n|\r/g, " ");
};
Number.prototype.padLeft = function (length, fillWith) {
    return Array(length - String(this).length + 1).join(fillWith || '0') + this;
};
Number.prototype.padRight = function (length) {
    return String(this) + Array(length - String(this).length + 1).join(' ');
};
Number.prototype.noZero = function (length) {
    if (!length) {
        return String(this);
    }
    if (String(this) != '0') {
        return String(this);
    } else {
        return String(Array(length + 1).join('9'));
    }
};
Number.prototype.yesZero = function (length) {
    if (!length) {
        return String(this);
    }
    if (String(this) != '0') {
        return String(this);
    } else {
        return String(Array(length + 1).join('0'));
    }
};
String.prototype.replaceAt = function (index, old, replace) {
    var temp = this.replace(/-/g, "");
    return temp.substr(0, 4) + "-" + temp.substr(4);
};
exports.getFilename = function (prefix) {
    var d = new Date();
    return prefix + "_" + d.getFullYear() + (d.getMonth() + 1).padLeft(2) + d.getDate().padLeft(2) + d.getHours().padLeft(2) + d.getMinutes().padLeft(2) + d.getSeconds().padLeft(2) + ".txt";
};
exports.putFileToFTP = function (req, res, next) {
    var ftpConf = req.app.get('ftpConf'),
        ftp = new jsftp(ftpConf);
    ftp.put(res.locals.pathPrefix + res.locals.dirPath + res.locals.filename, 'in/' + res.locals.filename, function (err) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
            res.statusCode = 503;
            return res.json({
                error: err
            });
        }
        ftp.raw.quit();
        if (res.locals.hasNext) {
            next();
        } else {
            res.end();
        }
    });
};
exports.postToEnergy = function (process) {
    var options = {
        host: 'localhost',
        port: 3000,
        path: process.urlPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    },
        request = http.request(options, function (res) {
            res.on('end', function () {
                if (res.statusCode == 200) {
                    dir.moveFile(process);
                } else {
                    console.log('Ocurrió un error procesando: ' + process.urlPath);
                }
            });
        });
    request.on('error', function (err) {
        console.log(err);
        console.trace(err.stack);
    });
    request.on('response', function (response) {
        response.resume();
    });
    request.write(JSON.stringify(process.data));
    request.end();
};
