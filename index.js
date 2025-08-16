const express = require('express')
const sql = require('./mssql')
const app = express()
const port = process.env.PORT
const path = require('path');

async function getExtension(fileName) {
    return path.extname(fileName).replace('.', '');
}
app.use('/', express.static('public'))

// Test 
// app.get("/test-success", (req, res) => {
//     res.sendFile(__dirname + '/public/success.html');
// });
 async function OgGenerate(title, description, type, url, image, sharecode) {
    let SharePostHtmlTemplate = `<html prefix="og: https://ogp.me/ns#">
<head>
<title>${title}</title>
<meta name="twitter:card" content="summary" />
<meta name="twitter:site" content="@gezgozofficial" />
<meta name="twitter:creator" content="@gezgozofficial" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="image/${type}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:type" content="image/${type}" />
<meta property="og:image:width" content="400" />
<meta property="og:image:height" content="300" />
<meta property="og:image:alt" content="${description}" />
</head>
<body>
<h1>${title}</h1>
<img src="${image}"/>
<p>${description}</p><br>
<a href="gezgoz://Post/{sharecode}">Uygulamada Gör</a>
<body>
</html>`
    return SharePostHtmlTemplate;
}


app.get("/PostShare/:PostShareLink", async (req, res) => {
    let PostShareLink = req.params.PostShareLink || "";
    let errors = [];
    if (errors.length > 0) {
        return res.json({ success: false, errors });
    }
    let sqlString = `sp_getPost @PSlink`
    let params = [];
    params.push({ name: 'PSlink', value: PostShareLink });
    try {
        sql.runSQLWithPool(sqlString, params, async function (result) {
            if (result.recordset[0].Id > 0) {
                let p = result.recordset[0];
                let url = process.env.BASE_URL + "/PostShare/" + req.params.PostShareLink
                let ext = await getExtension(p.PostImage);
                let _image = process.env.FE_CDN_LINK+"Post/"+p.PostImage
                let _html = await OgGenerate(p.Title, p.Descr,ext, url, _image, req.params.PostShareLink) 
                res.send(_html);
            }
            else { res.send({ field: "validCode", message: "Geçersiz Kod" }); }
        })

    } catch (error) {
        console.error("SQL Error:", error);
        res.send({ error: "Veritabanı sorgusu başarısız.", details: error });
    }
})
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
                res.sendFile(__dirname + '/public/success.html');
            }
            else { res.send({ field: "validCode", message: "Geçersiz Kod" }); }
        })

    } catch (error) {
        console.error("SQL Error:", error);
        res.send({ error: "Veritabanı sorgusu başarısız.", details: error });
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
