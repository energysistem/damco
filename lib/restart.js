var exec = require('child_process').execFile;
exports.launch = function (req, res) {
    exec("/home/user/workspace/restart.sh", function puts(error, stdout, stderr) {
        if (error) {
            console.log('ERROR: ' + error);
            console.trace(error.stack);
            res.statusCode = 503;
        } else if (stderr) {
            console.log('stderr: ' + stderr);
            res.statusCode = 503;
        } else {
            console.log('stdout:' + stdout);
        }
        res.end();
    });
};
