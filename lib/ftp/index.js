var express = require('express'),
    jsftp = require('jsftp'),
    queue = require('./queue'),
    files = require('./files'),
    app = module.exports = express();

function removeFile(ftp, res, temp) {
    var filename = res.locals.files[temp];
    ftp.raw.dele('out/' + filename, function (err) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
        }
        ftp.raw.quit();
    });
}

function getFile(res, ftpConf, temp) {
    var ftp = new jsftp(ftpConf),
        filename = res.locals.files[temp];
    ftp.get('out/' + filename, 'files/in/' + filename, function (err) {
        if (err) {
	    console.log('ERROR abriendo fichero ' + filename);
            console.log(err);
            console.trace(err.stack);
	    res.statusCode = 503;
	    return res.end();
        }
        removeFile(ftp, res, temp);
        queue.add(filename);
        if (temp === 0) {
            res.end();
        }
    });
}

function getFiles(req, res, next) {
    var i = res.locals.files.length,
        temp;
    while (i--) {
        temp = i;
        getFile(res, req.app.get('ftpConf'), temp);
    }
}

function getList(req, res, next) {
    var ftp = new jsftp(req.app.get('ftpConf')), MAX_FILES = 900, c = 0;
    ftp.list('out', function (err, list) {
        if (err) {
	    console.log('ERROR listando ftp');
            console.log(err);
            console.trace(err.stack);
	    res.statusCode = 503;
            return res.end();
        }
        res.locals.files = [];
        var regexp = new RegExp("\\w+\\.txt", "i");
        var lines = list.split(/\n/),
            filename, i = lines.length - 1;
        while (i-- && c < MAX_FILES) {
            filename = lines[i].match(regexp);
            if (filename) {
                res.locals.files.push(filename[0]);
		c++;
            }
        }
        ftp.raw.quit();
        next();
    });
}
app.get('/', getList, getFiles);
app.get('/process', queue.get, files.process);
