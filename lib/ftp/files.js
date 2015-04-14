var orders = require('../orders/process'),
    inputs = require('../inputs/process'),
    stock = require('../stock'),
    fs = require('fs');

function exists(file, next) {
    fs.exists('files/in/' + file.name, function (exists) {
        if (exists) {
            next(file);
        }
    });
}
exports.process = function (req, res, next) {
    var i = res.locals.files ? res.locals.files.length : 0,
        file;
    while (i--) {
        file = res.locals.files[i];
        switch (file.name.match(/^([a-z]+|\{"[a-z]+":)/)[0]) {
        case 'statca':
            exists(file, orders.state);
            break;
        case 'artconf':
            //            inputs.checkMaster(file);
            break;
        case 'nsord':
            exists(file, orders.serialNumbers);
            break;
        case 'alc':
            exists(file, inputs.checkComplete);
            break;
        case 'invex':
            exists(file, stock.process);
            break;
        case 'movst':
            exists(file, inputs.checkMovement);
            break;
        case '{"reference":':
            orders.changeShippingNumber(file);
            break;
        case '{"shipping":':
            orders.shippingEmail(file);
            break;
        case '{"invoice":':
            orders.invoiceEmail(file);
            break;
        case 'rec':
            exists(File, inputs.checkReceived);
            break;
        }
    }
    res.end();
};
