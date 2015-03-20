var request = require('supertest'),
    should = require('should'),
    warehouseId, productId, headerId, app = require('../app');
describe('Inputs', function () {
    describe('Maestro de productos', function () {
        var data = {
            data: {
                headerId: 'cldelhfcdfal',
                document_number: 'PNM16',
                products: [{
                    ean: '8432426398713',
                    code: '39871',
                    name: 'Energy Sistem™ Sistema de sonido 2.0 Energy Tower System TS3 2.0 Bluetooth White (RMS: 20W).',
                    weight: 6.210,
                    long: 0.235,
                    width: 0.270,
                    height: 1.030,
                    serial_number: 'S',
                    inner_box: {
                        bar_code: '',
			quantity: 0,
                        weight: 0,
                        long: 0,
                        width: 0,
                        height: 0
                    },
                    outer_box: {
                        bar_code: '',
			quantity: 0,
                        weight: 0,
                        long: 0,
                        width: 0,
                        height: 0
                    },
                    pallet: {
                        bar_code: '',
			quantity: 0,
                        weight: 6.210,
                        long: 0.235,
                        width: 0.270,
                        height: 1.030,
                        type: "EU"
                    }
                }]
            }
        };
        it('Tiene que devolver ok cuando los parámetros son correctos', function (done) {
            request(app).post('/inputs/products').send(data).set('Accept', 'application/json').expect(200).end(function (err, res) {
                if (err) {
                    return done(err);
                }
                done();
            });
        });
    });
});
