var fs = require('fs'),
    readline = require('readline'),
    utils = require('../utils'),
    stream = require('stream');
exports.serialNumbers = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            filename: file.name,
            urlPath: '/orders/' + warehouseId + '/',
            data: {
                products: [],
                message: file.message || '',
                alias: file.alias || ''
            }
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (process.data.headerId) {
            if (line.length == 45) {
                process.data.products.push({
                    code: line.substring(0, 10).trim(),
                    serialNumber: line.substring(10, 25).trim(),
                    datetime: line.substring(25, 45)
                });
            } else {
                console.log('La linea "' + line + '" tiene un tamaño incorrecto.');
            }
        } else {
            process.data.headerId = line;
            process.urlPath += process.data.message.length > 0 ? line + '/serial-numbers/note' : line + '/serial-numbers';
        }
    });
    reader.on('close', function () {
        if (process.data.products && process.data.products.length > 0) {
            utils.postToEnergy(process);
        }
    });
};

function getDateAndTimeFromFilename(filename) {
    var rawDate = filename.substring(20, 34);
    return {
        date: rawDate.substring(0, 4) + '/' + rawDate.substring(4, 6) + '/' + rawDate.substring(6, 8),
        time: rawDate.substring(8, 10) + ':' + rawDate.substring(10, 12) + ':' + rawDate.substring(12, 14) + '.000'
    };
}
exports.exists = function (file, next) {
    fs.exists('files/in/' + file.name, function (exists) {
        if (exists) {
            next(file);
        }
    });
};
exports.state = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            filename: file.name,
            urlPath: '/orders/' + warehouseId + '/state/',
            data: getDateAndTimeFromFilename(file.name)
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (line.length == 14 || line.length == 26 || line.length == 83) {
            process.data.headerId = line.substring(0, 12);
            process.urlPath += process.data.headerId;
            process.data.state = line.substring(12, 14);
            process.data.shipper = line.substring(14, 16);
            if (process.data.state == "SA") {
                process.data.expedition_number = line.substring(16, 56).trim();
                process.data.pallets = parseInt(line.substring(56, 59), 10);
                process.data.boxes = parseInt(line.substring(59, 63), 10);
                process.data.weight = parseFloat(line.substring(63, 73));
                process.data.volume = parseFloat(line.substring(73, 83));
            }
        } else {
            console.log('La linea "' + line + '" tiene un tamaño incorrecto.');
        }
    });
    reader.on('close', function () {
        if (process.data.headerId && process.data.headerId.length == 12) {
            utils.postToEnergy(process);
        } else {
            console.log('El ID es incorrecto: ' + process.data.headerId);
        }
    });
};
exports.shippingEmail = function (file) {
    var email = JSON.parse(file.name),
        process = {
            rowId: file.id,
            urlPath: '/orders/' + warehouseId + '/' + email.shipping + '/email/shipping',
            data: {}
        };
    utils.postToEnergy(process);
};
exports.invoiceEmail = function (file) {
    var email = JSON.parse(file.name),
        process = {
            rowId: file.id,
            urlPath: '/orders/' + warehouseId + '/' + email.invoice + '/email/invoice',
            data: {}
        };
    utils.postToEnergy(process);
};
exports.changeShippingNumber = function (file) {
    var data = JSON.parse(file.name),
        process = {
            rowId: file.id,
            urlPath: '/orders/' + warehouseId + '/' + data.id + '/shipping',
            data: data
        };
    utils.postToEnergy(process);
};
