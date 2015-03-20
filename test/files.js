var request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    fs = require('fs'),
    ftpConf = require('../ftpConfDev'),
    jsftp = require('jsftp'),
    ftp = new jsftp(ftpConf);
describe('Files', function () {
    after(function (done) {
        ftp.raw.quit();
	done();
    });
    describe('Descarga', function () {
        before(function (done) {
            ftp.put('test/test01.txt', 'out/test01.txt', function (err) {
                if (err) {
                    console.log(err);
                    console.trace(err.stack);
                }
		done();
            });
        });
        it('Descarga los ficheros que hay en /out del ftp, los sitúa en nuestro /in y borra los ficheros del ftp', function (done) {
            request(app).get('/files').expect(200).end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });
    });
});
