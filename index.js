const express = require('express')
const sql = require('./mssql')
const app = express()
const port = process.env.PORT

app.use('/', express.static('public'))

app.get("/mailvalid/:code", async (req, res) => {
    let validCode = req.params.code || "";
    let errors = [];
    if (errors.length > 0) {
        return res.json({ success: false, errors });
    }
    let sqlString = `sp_validEmail @ActiveCode`
    let params = [];
    params.push({ name: 'ActiveCode', value: validCode });
    try {
        sql.runSQLWithPool(sqlString, params, function (result) {
            if (result.recordset[0].UserId > 0) {
                res.send({ field: "validCode", message: "Email Doğrulandı." });
            }
            else { res.send({ field: "validCode", message: "Geçersiz Kod" }); }
        })

    } catch (error) {
        console.error("SQL Error:", error);
        res.send({ error: "Veritabanı sorgusu başarısız.", details: error });
    }
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
