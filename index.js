const express = require('express')
const sql = require('./mssql')
const app = express()
const port = process.env.PORT
const path = require('path');

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`User-Agent: ${req.headers['user-agent']}`);
    console.log(`Mobile: ${/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.headers['user-agent'])}`);
    next();
});

async function getExtension(fileName) {
    return path.extname(fileName).replace('.', '');
}

app.use('/', express.static('public'))

app.get("/test", (req, res) => {
    res.json({ 
        message: "Server çalışıyor!", 
        timestamp: new Date().toISOString(),
        port: port,
        env: process.env.NODE_ENV || 'development'
    });
});

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
    
    <meta name="apple-itunes-app" content="app-argument=gezgoz://Post/${sharecode}">
    <meta name="google-play-app" content="app-id=com.GezGoz">
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>${title}</h1>
    <img src="${image}" style="max-width: 100%; height: auto;"/>
    <p>${description}</p><br>
    
    <div style="text-align: center; margin: 20px 0;">
        <a href="gezgoz://Post/${sharecode}" 
           id="deepLinkBtn"
           style="display: inline-block; background: #e96f43; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
            Uygulamada Gör
        </a>
        
        <a href="https://play.google.com/store/apps/details?id=com.GezGoz" 
           id="storeLink"
           style="display: inline-block; background: #333; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">
            Uygulamayı İndir
        </a>
    </div>
    
    <script>
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.getElementById('deepLinkBtn').addEventListener('click', function(e) {
                e.preventDefault();
                
                const deepLink = "gezgoz://Post/${sharecode}";
                
                window.location.href = deepLink;
                
                setTimeout(function() {
                    if (navigator.userAgent.includes('Android')) {
                        window.location.href = "https://play.google.com/store/apps/details?id=com.GezGoz";
                    } else {
                        window.location.href = "https://apps.apple.com/app/gezgoz/id123456789";
                    }
                }, 2000);
            });
        } else {
            document.getElementById('deepLinkBtn').style.display = 'none';
        }
    </script>
</body>
</html>`
    
    return SharePostHtmlTemplate;
}

app.get("/api/post/:shareCode", async (req, res) => {
    let PostShareLink = req.params.shareCode;
    let sqlString = `sp_getPost @PSlink`;
    let params = [{ name: 'PSlink', value: PostShareLink }];
    
    try {
        sql.runSQLWithPool(sqlString, params, function (result) {
            if (result.recordset && result.recordset.length > 0) {
                let post = result.recordset[0];
                
                res.json({
                    success: true,
                    data: post
                });
            } else {
                res.json({ success: false, message: "Post bulunamadı" });
            }
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

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
            if (result.recordset && result.recordset.length > 0 && result.recordset[0].Id > 0) {
                let p = result.recordset[0];
                
                let url = process.env.BASE_URL + "/PostShare/" + req.params.PostShareLink;
                let ext = await getExtension(p.PostImage);
                let _image = process.env.FE_CDN_LINK + "Post/" + p.PostImage;
                
                let _html = await OgGenerate(p.Title, p.Descr, ext, url, _image, req.params.PostShareLink);
                res.send(_html);
                
            } else {
                res.send({ field: "validCode", message: "Geçersiz Kod" });
            }
        })

    } catch (error) {
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
            } else {
                res.send({ field: "validCode", message: "Geçersiz Kod" });
            }
        })

    } catch (error) {
        res.send({ error: "Veritabanı sorgusu başarısız.", details: error });
    }
})

app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint bulunamadı', url: req.url });
});



app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
