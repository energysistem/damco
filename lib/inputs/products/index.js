var utils = require('../../utils'),
    fs = require('fs'),
    http = require('http');

module.exports.prepareMasterProductsFile = function (req, res, next) {
    if (!req.body.data) {
        res.send(500);
        return next();
    }
    var data = req.body.data,
        i = data.products.length,
        filepath = res.locals.pathPrefix + res.locals.dirPath + res.locals.filename;
    fs.writeFileSync(filepath, data.headerId.padRight(12) + '\n');
    fs.appendFileSync(filepath, data.document_number.padRight(10));
    while (i--) {
        fs.appendFileSync(filepath, '\n' + data.products[i].ean.padRight(14) + data.products[i].code.padRight(10) + data.products[i].name.padRight(125).toUpperCase() + data.products[i].weight.yesZero(10).padLeft(10) + data.products[i].long.yesZero(10).padLeft(10) + data.products[i].width.yesZero(10).padLeft(10) + data.products[i].height.yesZero(10).padLeft(10) + data.products[i].serial_number + data.products[i].type);
        fs.appendFileSync(filepath, data.products[i].inner_box.bar_code.padLeft(14, ' ') + data.products[i].inner_box.quantity.yesZero(5).padLeft(5) + data.products[i].inner_box.weight.yesZero(10).padLeft(10) + data.products[i].inner_box.long.yesZero(10).padLeft(10) + data.products[i].inner_box.width.yesZero(10).padLeft(10) + data.products[i].inner_box.height.yesZero(10).padLeft(10));
        fs.appendFileSync(filepath, data.products[i].outer_box.bar_code.padLeft(14, ' ') + data.products[i].outer_box.quantity.yesZero(5).padLeft(5) + data.products[i].outer_box.weight.yesZero(10).padLeft(10) + data.products[i].outer_box.long.yesZero(10).padLeft(10) + data.products[i].outer_box.width.yesZero(10).padLeft(10) + data.products[i].outer_box.height.yesZero(10).padLeft(10));
        fs.appendFileSync(filepath, data.products[i].pallet.bar_code.padLeft(14, ' ') + data.products[i].pallet.quantity.yesZero(5).padLeft(5) + data.products[i].pallet.weight.yesZero(10).padLeft(10) + data.products[i].pallet.long.yesZero(10).padLeft(10) + data.products[i].pallet.width.yesZero(10).padLeft(10) + data.products[i].pallet.height.yesZero(10).padLeft(10) + data.products[i].pallet.type);
    }
    next();
};
module.exports.prepareQuantitiesFile = function (req, res, next) {
    if (!req.body.data) {
        res.send(500);
        return next();
    }
    var data = req.body.data,
        i = data.products.length,
        filepath = res.locals.pathPrefix + res.locals.dirPath + res.locals.filename;
    fs.writeFileSync(filepath, data.headerId.padRight(12) + '\n');
    fs.appendFileSync(filepath, data.document_number.padRight(10));
    while (i--) {
        fs.appendFileSync(filepath, '\n' + data.products[i].ean.padRight(14) + data.products[i].code.padRight(10) + data.products[i].quantity.yesZero(10).padLeft(10));
    }
    next();
};
module.exports.prepareSerialNumbersFile = function (req, res, next) {
    if (!req.body.data) {
        res.send(500);
        return next();
    }
    var data = req.body.data,
        i = data.products.length,
        filepath = res.locals.pathPrefix + res.locals.dirPath + res.locals.filename;
    while (i--) {
        if (i < data.products.length - 1) {
            fs.appendFileSync(filepath, '\n');
        }
        fs.appendFileSync(filepath, data.products[i].code.padRight(10) + data.products[i].serial_number.padRight(15));
    }
    next();
};
