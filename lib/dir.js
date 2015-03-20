var queue = require('./ftp/queue'),
    mkdirp = require('mkdirp'),
    fs = require('fs');

function create(path, next) {
    mkdirp(path, function (err) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
            res.statusCode = 503;
            return res.json({
                error: err
            });
        }
        next();
    });
}

function getDate() {
    var date = new Date();
    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + '/';
}
exports.getPathByDate = function (req, res, next) {
    res.locals.dirPath = getDate();
    create(res.locals.pathPrefix + res.locals.dirPath, next);
};

function removeFile(file, rowId) {
    fs.unlink(file, function (err) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
            res.statusCode = 503;
            return res.json({
                error: err
            });
        }
        queue.done(rowId);
    });
}

function createFile(date, source, originPath, destinyPath, rowId) {
    create('files/in/' + date, function () {
        var dest = fs.createWriteStream(destinyPath);
        source.pipe(dest);
        source.on('end', function () {
            removeFile(originPath, rowId);
        });
        source.on('error', function (err) {
            console.log(err);
            console.trace(err.stack);
            res.statusCode = 503;
            return res.json({
                error: err
            });
        });
    });
}
exports.moveFile = function (process) {
    var date = getDate(),
        destinyPath = 'files/in/' + date + process.filename,
        originPath = 'files/in/' + process.filename,
        source;
    fs.exists(originPath, function (exists) {
        if (exists) {
            source = fs.createReadStream(originPath);
            createFile(date, source, originPath, destinyPath, process.rowId);
        } else {
            queue.done(process.rowId);
        }
    });
};
