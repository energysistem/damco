var fs = require('fs'),
    readline = require('readline'),
    utils = require('./utils'),
    stream = require('stream');
exports.process = function (file) {
    var instream = fs.createReadStream('files/in/' + file.name),
        outstream = new stream(),
        process = {
            rowId: file.id,
            filename: file.name,
            urlPath: '/stock/' + warehouseId,
            data: {
                products: []
            }
        },
        reader = readline.createInterface(instream, outstream);
    reader.on('line', function (line) {
        if (line.length == 39) {
            process.data.products.push({
                ean: line.substring(0, 15).trim(),
                code: line.substring(15, 25).trim(),
                block: line.substring(25, 29).trim(),
                quantity: parseInt(line.substring(29, 39), 10)
            });
        } else {
            console.log(file.name + ': La línea "' + line + '" tiene un tamaño incorrecto.');
        }
    });
    reader.on('close', function () {
        if (process.data.products && process.data.products.length > 0) {
            utils.postToEnergy(process);
        }
    });
};
