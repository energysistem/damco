var sql = require('mssql'),
    files = require('./files');

function getId(next) {
    var request = new sql.Request(db),
        query = "DECLARE @ID char(12); EXEC MAKE_ID @ID OUTPUT; SELECT @ID AS ID;";
    request.query(query, function (err, recordset) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
            next(err);
        } else {
            next(err, recordset[0].ID);
        }
    });
}
exports.add = function (filename) {
    getId(function (err, id) {
        if (!err) {
            var request = new sql.Request(db),
                query = "INSERT INTO TRAMAS (ID, TIPO, F_CREA, F_PROGRAMADO, TRAMA) VALUES ('" + id + "', 'LOGITERS', GETDATE(), GETDATE(), '" + filename + "');";
            request.query(query, function (err) {
                if (err) {
                    console.log(err);
                    console.trace(err.stack);
                }
            });
        }
    });
};
exports.done = function (rowId) {
    var request = new sql.Request(db),
        query = "UPDATE TRAMAS SET F_EJECUTADO=GETDATE() WHERE ID='" + rowId + "';";
    request.query(query, function (err) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
        }
    });
};
exports.get = function (req, res, next) {
    var request = new sql.Request(db),
        // Ordenado al revés para que primero se guarden los nuevos estados
        query = "SELECT TOP 30 ID as id, TRAMA as name FROM TRAMAS WHERE TIPO='LOGITERS' AND F_EJECUTADO IS NULL AND F_PROGRAMADO < GETDATE() AND TRAMA NOT LIKE 'artconf_%' ";
    query += "ORDER BY CASE WHEN TRAMA LIKE 'statca_%' then 1 ";
    query += "WHEN TRAMA LIKE '{\"%' then 2 ";
    query += "WHEN TRAMA LIKE 'alc_%' then 3 ";
    query += "WHEN TRAMA LIKE 'invex_%' then 4 ";
    query += "WHEN TRAMA LIKE 'nsord_%' then 5 ";
    query += "ELSE 6 END, ";
    query += "F_CREA ASC";
    request.query(query, function (err, recordset) {
        if (err) {
            console.log(err);
            console.trace(err.stack);
        }
        res.locals.files = recordset;
        next();
    });
};
