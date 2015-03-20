var express = require('express'),
    app = module.exports = express(),
    utils = require('../utils'),
    sql = require('mssql'),
    fs = require('fs'),
    dir = require('../dir'),
    orders = require('./process');

function updatePicking(req, res, next) {
    var query = "UPDATE PICKING_EXTERNO SET F_SALIDA=GETDATE(), USU_SALIDA='LOGITERS' WHERE ID_CABECERA='" + req.body.data.header.headerId + "'",
        request = new sql.Request(db);
    request.query(query, function (err) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
        }
        res.end();
    });
}

function setFilename(req, res, next) {
    res.locals.filename = utils.getFilename('ped_' + req.body.data.header.headerId);
    res.locals.pathPrefix = 'files/out/';
    next();
}

function createOrderFile(req, res, next) {
    if (!req.body.data) {
        res.send(500);
        return next();
    }
    res.locals.hasNext = true;
    var data = req.body.data,
        i = data.products.length,
        filepath = res.locals.pathPrefix + res.locals.dirPath + res.locals.filename,
        invoice_url = data.header.print_invoice_url ? data.header.invoice_url : "",
        document_url = data.header.invoice_number.substr(0, 4) == "RMAS" ? data.header.document_url : "";
    data.header.max_datetime = "";
    fs.writeFileSync(filepath, data.header.headerId.padRight(12) + data.header.reference.padRight(100) + data.header.invoice_number.replaceAt(2, "-", "").padRight(20) + data.header.action + data.header.origin.operational_point.padRight(20));
    fs.appendFileSync(filepath, data.header.shipping.name.toUpperCase().padRight(50) + data.header.shipping.card_id.padRight(50) + data.header.shipping.address.toUpperCase().padRight(150) + data.header.shipping.city.toUpperCase().padRight(100) + data.header.shipping.zip_code.padRight(10) + data.header.shipping.province.toUpperCase().padRight(50) + data.header.shipping.country.toUpperCase().padRight(2) + data.header.shipping.operational_point.padRight(20) + data.header.shipping.freight);
    fs.appendFileSync(filepath, data.header.center.receiver.toUpperCase().padRight(50) + data.header.center.address.toUpperCase().padRight(150) + data.header.center.city.toUpperCase().padRight(100) + data.header.center.zip_code.padRight(10) + data.header.center.province.toUpperCase().padRight(50) + data.header.center.country.toUpperCase().padRight(2) + data.header.center.operational_point.padRight(20));
    fs.appendFileSync(filepath, data.header.fiscal.name.padRight(50) + data.header.fiscal.nif.padRight(15) + data.header.fiscal.address.toUpperCase().padRight(150) + data.header.fiscal.city.toUpperCase().padRight(100) + data.header.fiscal.zip_code.padRight(10) + data.header.fiscal.province.toUpperCase().padRight(50) + data.header.fiscal.country.toUpperCase().padRight(2) + data.header.fiscal.operational_point.padRight(20));
    fs.appendFileSync(filepath, data.header.texts.removeBreakLines().substr(0, 1000).toUpperCase().padRight(1000) + data.header.labels_per_box.removeBreakLines().toUpperCase().padRight(600) + data.header.shipper.id.toUpperCase().padRight(2) + data.header.shipper.product.toUpperCase().padRight(2) + data.header.refund_account.padRight(30) + data.header.transport_reference_groups.padRight(20));
    fs.appendFileSync(filepath, data.header.eci.ia00.padRight(20) + data.header.eci.ia91.padRight(8) + data.header.eci.ia98.substring(0, 22).padRight(22) + data.header.eci.center_code.substring(0, 3).padRight(3) + data.header.eci.department.substring(0, 3).toUpperCase().padRight(3) + data.header.eci.order.removeBreakLines().substr(0, 12).padRight(12) + data.header.eci.delivery_note.padRight(7) + data.header.eci.supplier_number.padRight(20));
    fs.appendFileSync(filepath, data.header.client_id.toUpperCase().padRight(12) + data.header.date + data.header.max_datetime.padRight(11) + data.header.meeting_time.padRight(250) + data.header.comments.removeBreakLines().replace("OBSERVACIONES DEL PEDIDO:", "").substr(0, 250).toUpperCase().padRight(250) + data.header.total.padLeft(20) + data.header.currency + data.header.shipping.email.padRight(255) + document_url.padRight(255) + invoice_url.padRight(255));
    fs.appendFileSync(filepath, data.header.shipping.phone.padRight(20) + data.header.shipping.palletized + data.header.office_locator.padRight(7) + data.header.channel);
    while (i--) {
        fs.appendFileSync(filepath, '\n' + data.products[i].ean.padRight(14) + data.products[i].code.padRight(10) + data.products[i].quantity.padLeft(10));
    }
    next();
}
app.post('/serial-numbers', function (req, res) {
    var file = {
        id: req.body.rowid,
	name: req.body.filename,
	message: req.body.justification,
	alias: req.body.alias
    };
    orders.serialNumbers(file);
    res.redirect('back');
});
app.post('/', setFilename, dir.getPathByDate, createOrderFile, utils.putFileToFTP, updatePicking);
app.get('/:filename', function (req, res) {
    var file = {
        id: req.query.rowid,
        name: req.params.filename
    };
    orders.serialNumbers(file);
    res.jsonp({});
});
