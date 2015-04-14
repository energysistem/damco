var fs = require('fs'),
    queue = require('../ftp/queue'),
    sql = require('mssql'),
    readline = require('readline'),
    utils = require('../utils'),
    stream = require('stream');
exports.checkMaster = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            filename: file.name,
            urlPath: '/inputs/' + warehouseId + '/products/by-header/',
            data: {
                products: []
            }
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (process.data.headerId && process.data.document_number) {
            if (line.length == 370) {
                process.data.products.push({
                    ean: line.substring(0, 14),
                    code: line.substring(14, 24).trim(),
                    name: line.substring(24, 149),
                    weight: line.substring(149, 159),
                    long: line.substring(159, 169),
                    width: line.substring(169, 179),
                    height: line.substring(179, 189),
                    serial_number: line.substring(189, 190),
                    type: line.substring(190, 191),
                    inner_box: {
                        bar_code: line.substring(191, 205),
                        quantity: line.substring(205, 210),
                        weight: line.substring(210, 220),
                        long: line.substring(220, 230),
                        width: line.substring(230, 240),
                        height: line.substring(240, 250)
                    },
                    outer_box: {
                        bar_code: line.substring(250, 264),
                        quantity: line.substring(264, 269),
                        weight: line.substring(269, 279),
                        long: line.substring(279, 289),
                        width: line.substring(289, 299),
                        height: line.substring(299, 309)
                    },
                    pallet: {
                        bar_code: line.substring(309, 323),
                        quantity: line.substring(323, 328),
                        weight: line.substring(328, 338),
                        long: line.substring(338, 348),
                        width: line.substring(348, 358),
                        height: line.substring(358, 368),
                        type: line.substring(368, 370)
                    }
                });
            } else {
                console.log('La linea "' + line + '" tiene un tamaño incorrecto.');
            }
        } else if (process.data.headerId) {
            process.data.document_number = line;
        } else {
            process.data.headerId = line;
            process.urlPath += line;
        }
    });
    reader.on('close', function () {
        if (process.data.products && process.data.products.length > 0) {
            utils.postToEnergy(process);
        }
    });
};
exports.checkComplete = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            urlPath: '/inputs/' + warehouseId + '/process',
            filename: file.name,
            data: {
                products: []
            }
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (process.data.headerId) {
            if (line.length == 41) {
                process.data.products.push({
                    datetime: line.substring(0, 20),
                    code: line.substring(20, 30).trim(),
                    quantity: parseInt(line.substring(30, 40), 10),
                    state: line.substring(40)
                });
            } else {
                console.log('La linea "' + line + '" tiene un tamaño incorrecto.');
            }
        } else {
            process.data.headerId = line;
        }
    });
    reader.on('close', function () {
        if (process.data.products && process.data.products.length > 0) {
            utils.postToEnergy(process);
        }
    });
};
exports.checkMovement = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            urlPath: '/inputs/' + warehouseId + '/movement',
            filename: file.name,
            data: {
                movements: []
            }
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (line.length == 22) {
            process.data.movements.push({
                code: line.substring(0, 10).trim(),
                type: line.substring(10, 11),
                originReason: line.substring(11, 14),
                destinyReason: line.substring(14, 17),
                quantity: parseInt(line.substring(18), 10)
            });
        } else {
            console.log('La linea "' + line + '" tiene un tamaño incorrecto.');
        }
    });
    reader.on('close', function () {
        if (process.data.movements && process.data.movements.length > 0) {
            utils.postToEnergy(process);
        }
    });
};
exports.checkReceived = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            urlPath: '/inputs/' + warehouseId + '/received',
            filename: file.name,
            data: {}
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (line.length == 32) {
            process.data.headerId = line.substring(0, 12);
            process.data.datetime = line.substring(12, 32);
        } else {
            console.log('La linea "' + line + '" tiene un tamaño incorrecto.');
        }
    });
    reader.on('close', function () {
        if (process.data.headerId && process.data.headerId.length > 0) {
            utils.postToEnergy(process);
        }
    });
};
