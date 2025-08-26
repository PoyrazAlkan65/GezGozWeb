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

// Header navigation routes
app.get("/about", (req, res) => {
    res.redirect('/#about');
});

app.get("/support", (req, res) => {
    res.redirect('/#support');
});

app.get("/paketler", (req, res) => {
    res.redirect('/#paketler');
});

app.get("/references", (req, res) => {
    res.redirect('/#references');
});

app.get("/iyzico", (req, res) => {
    res.redirect('/#iyzico');
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            min-height: 100vh;
            padding: 0;
            margin: 0;
        }
        
        .header-section {
            background-color: #f8f9fa;
            position: relative;
            z-index: 1000;
        }
        
        .header-row-height {
            height: 150px;
        }
        
        .logo-header {
            height: 70px;
            max-width: 100%;
        }
        
        .navbar-brand {
            display: flex;
            align-items: center;
            max-width: 200px;
        }
        
        .navbar-link-custom {
            color: #6c757d;
            font-weight: 500;
            margin-right: 20px;
        }
        
        .navbar-link-custom:hover {
            color: #ff7043;
        }
        
        .navbar-nav {
            display: flex;
            align-items: center;
        }
        
        .nav-item {
            margin: 0 10px;
        }
        
        .header-font-size {
            font-size: 16px;
        }
        
        .qr-img {
            width: auto;
            height: 100px;
            max-height: 100px;
            object-fit: contain;
        }
        
        /* Navbar responsive styles */
        .navbar {
            position: relative;
            z-index: 1001;
        }
        
        .navbar-collapse {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 1002;
            padding: 15px;
        }
        
        /* Büyük ekranlarda navbar-collapse'ı normal pozisyonda göster */
        @media (min-width: 992px) {
            .navbar-collapse {
                position: static;
                background: transparent;
                box-shadow: none;
                padding: 0;
            }
        }
        
        /* Mobil menü stilleri */
        @media (max-width: 991px) {
            .navbar-collapse .navbar-nav {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .navbar-collapse .nav-item {
                margin: 10px 0;
                width: 100%;
            }
            
            .navbar-collapse .nav-link {
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
        }
        
        /* Büyük ekran menü stilleri */
        @media (min-width: 992px) {
            .navbar-collapse .navbar-nav {
                flex-direction: row;
                align-items: center;
            }
            
            .navbar-collapse .nav-item {
                margin: 0 10px;
                width: auto;
            }
            
            .navbar-collapse .nav-link {
                padding: 5px 10px;
                border-bottom: none;
            }
        }
        
        .navbar-toggler {
            border: none;
            padding: 0.25rem 0.5rem;
        }
        
        .navbar-toggler:focus {
            box-shadow: none;
        }
        
        .navbar-toggler-icon {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.55%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }
        
        /* Responsive header adjustments */
        @media (max-width: 1199px) {
            .logo-header {
                height: 40px;
            }
            
            .navbar-brand {
                max-width: 150px;
            }
        }
        
        @media (max-width: 768px) {
            .navbar-brand {
                max-width: 120px;
            }
        }
        
        .post-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            max-width: 600px;
            width: 100%;
            position: relative;
            margin: 40px auto;
            z-index: 1;
        }
        
        .post-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            display: block;
        }
        
        .post-content {
            padding: 30px;
        }
        
        .post-title {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        
        .post-description {
            font-size: 16px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 25px;
        }
        
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
            color: white;
            text-decoration: none;
        }
        
        .btn-secondary {
            background: #333;
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
            background: #555;
            transform: translateY(-2px);
            color: white;
            text-decoration: none;
        }
        
        .gezgoz-brand {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            color: #ff6b35;
            backdrop-filter: blur(10px);
        }
        
        .mobile-only {
            display: block;
        }
        
        .desktop-only {
            display: none;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 15px;
            }
            
            .post-card {
                max-width: 100%;
            }
            
            .post-image {
                height: 300px;
            }
            
            .post-content {
                padding: 25px 20px;
            }
            
            .post-title {
                font-size: 20px;
            }
            
            .post-description {
                font-size: 15px;
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 25px;
                font-size: 15px;
            }
        }
        
        @media (min-width: 769px) {
            .mobile-only {
                display: none;
            }
            
            .desktop-only {
                display: block;
            }
        }
        
        /* Footer Styles */
        .footer-custom {
            background-color: #777777;
            color: #000000;
            font-family: Inter;
            font-weight: 600;
            font-size: 20px;
        }
        
        .footer-custom a {
            text-decoration: none;
            color: white;
            font-weight: bolder;
            cursor: pointer;
        }
        
        .Poweredby {
            font-size: 14px;
            background-color: #ff7043;
            color: white;
        }
        
        .Poweredby a {
            text-decoration: none;
            color: white;
            font-weight: bolder;
            cursor: pointer;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .header-row-height {
                height: 100px;
            }
            
            .logo-header {
                height: 40px;
            }
            
            .footer-custom {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header-section">
        <div class="container-fluid">
            <div class="row header-row-height">
                <!-- Bootstrap Navbar Collapse -->
                <nav class="navbar navbar-expand-lg navbar-light bg-light">
                    <div class="container-fluid">
                        <!-- Logo -->
                        <a class="navbar-brand" href="/">
                            <img src="/wwwroot/logo.png" alt="GezGöz Logo" class="logo-header" />
                        </a>

                        <!-- Hamburger Button -->
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>

                        <!-- Menu Links -->
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 mt-5 mt-lg-0">
                                <li class="nav-item">
                                    <a class="nav-link navbar-link-custom header-font-size" href="/about">Hakkımızda</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link navbar-link-custom header-font-size" href="/support">Destek</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link navbar-link-custom header-font-size" href="/paketler">Paketler</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link navbar-link-custom header-font-size"
                                        href="/references">Referanslar</a>
                                </li>

                                <li class="nav-item">
                                    <a class="nav-link navbar-link-custom header-font-size" href="/iyzico">Android için
                                        indir</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link navbar-link-custom header-font-size" href="/iyzico">IOS için
                                        indir</a>
                                </li>
                            </ul>

                            <!-- QR kodu büyük ekranda göstermek için -->
                            <div class="d-none d-lg-block ms-4">
                                <img src="/wwwroot/qr-removebg-preview.png" class="qr-img" />
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    </div>

    <!-- Post Content -->
    <div class="container">
        <div class="post-card">
            <div class="gezgoz-brand">
                <i class="fas fa-map-marker-alt me-2"></i>GezGöz
            </div>
            
            <img src="${image}" alt="${title}" class="post-image">
            
            <div class="post-content">
                <h1 class="post-title">${title}</h1>
                <p class="post-description">${description}</p>
                
                <div class="action-buttons">
                    <a href="gezgoz://Post/${sharecode}" 
                       id="deepLinkBtn"
                       class="btn-primary mobile-only">
                        <i class="fas fa-mobile-alt me-2"></i>Uygulamada Gör
                    </a>
                    
                    <a href="https://play.google.com/store/apps/details?id=com.GezGoz" 
                       class="btn-secondary">
                        <i class="fab fa-google-play me-2"></i>Android için İndir
                    </a>
                    
                    <a href="https://apps.apple.com/app/gezgoz/id123456789" 
                       class="btn-secondary">
                        <i class="fab fa-apple me-2"></i>iOS için İndir
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer-custom text-center">
        <div class="col-sm-8 col-md-8 col-lg-8 col-xl-8 container-fluid">
            <div class="d-flex align-items-center">
                <div class="d-flex justify-content-between w-100 flex-wrap">
                    <a class="col-sm-12 col-md-2 col-lg-4 col-xl-2" target="_blank"
                        href="/wwwroot/Veri-Kullanim-Politikasi.pdf">Veri Kullanım
                        Politikası</a>
                    <a class="col-sm-12 col-md-2 col-lg-4 col-xl-2" target="_blank"
                        href="/wwwroot/cerez-politikasi.pdf">Çerez Politikası</a>
                    <a class="col-sm-12 col-md-2 col-lg-4 col-xl-2" target="_blank"
                        href="/wwwroot/GEZGOZ-Gizlilik-Politikasi.pdf">Gizlilik
                        Politikası</a>
                    <a class="col-sm-12 col-md-2 col-lg-4 col-xl-2" target="_blank"
                        href="/wwwroot/Kullanici-Sozlesmesi.pdf">Kullanıcı Sözleşmesi</a>
                    <a class="col-sm-12 col-md-2 col-lg-4 col-xl-2" target="_blank"
                        href="/wwwroot/KVKK-Onay-Metni.pdf">KVKK Onay Metni</a>
                    <a class="col-sm-12 col-md-2 col-lg-4 col-xl-2" target="_blank"
                        href="/wwwroot/kvkk-aydinlatma-metni.pdf">KVKK Aydınlatma Metni</a>
                </div>
            </div>
        </div>
    </footer>

    <div class="col-12 container-fluid text-center Poweredby">
        <p>Copyright © 2024 - www.gezgoz.com Powered by: <a href="https://academycodehub.com">Academy Code Hub</a></p>
    </div>
    
    <script>
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            document.getElementById('deepLinkBtn').addEventListener('click', function(e) {
                e.preventDefault();
                
                const deepLink = "gezgoz://Post/${sharecode}";
                
                // Deep link'i deneyelim
                window.location.href = deepLink;
                
                // 2 saniye sonra store'a yönlendir
                setTimeout(function() {
                    if (navigator.userAgent.includes('Android')) {
                        window.location.href = "https://play.google.com/store/apps/details?id=com.GezGoz";
                    } else {
                        window.location.href = "https://apps.apple.com/app/gezgoz/id123456789";
                    }
                }, 2000);
            });
        }
    </script>
    
    <!-- Bootstrap JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
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
                res.redirect('/success.html');
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
