process.chdir(__dirname);
var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var cookieParser = require('cookie-parser');
var https = require('https');
var http = require('http');
var path = require('path');
var config = require('./config');

//require('./common/extension_methods');
require('./modules/database');
global.U = require('./common/utils');
global.F = {
    config:require('./config'),
    global:require('./global')
};
global.RELEASE = true;
global.isDebug = false;
global.framework_image = global.Image = require('./modules/image');

var app = express();

app.disable('etag');
app.set('jsonp callback name', 'JSON_CALLBACK');

//view template setting
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

/**
 * middleware
 */
app.use(function (req, res, next) {
    if (req.headers['content-type']){
        req.headers['content-type'] = req.headers['content-type'].replace('charset=utf8', 'charset=utf-8');
    }

    // utf-8 is not a valid content-encoding while old android app will add this header improperly, so we need to remove them.
    if(req.headers['content-encoding'] && req.headers['content-encoding'].toLocaleLowerCase() === 'utf-8'){
        delete req.headers['content-encoding'];
    }

    // APP will add extra slash at the beginning of the path improperly, here to remove them
    req.path.replace(/\/*/, '/');

    // for nginx proxy
    req.clientIp = req.headers['x-real-ip'] || req.headers['ip'] || req.ip;
    return next();
});

// bodyParser based on content type
app.use(bodyParser.json({
    'limit': '1mb'
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', multer({ storage: multer.memoryStorage() }).any());

// cookieParser
app.use(cookieParser());

// website common middleware
app.use(require('./middlewares/website'));

// set static file path
app.use(express.static(path.join(__dirname, F.config.directory_xxnr_mobile_public)));

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

var routes = require('./routes');
// routes
app.use('/', routes.secureFrontendApis);
app.use('/', routes.frontendApis);
app.use('/', routes.frontendPages);
//app.use('/', routes.appRelatedPages);
//app.use('/', routes.backendApis);
//app.use('/', routes.backendPages);

app.use(function (err, req, res, next) {
    if(F.config.environment === 'production'){
        res.status(500);
        res.end();
        return;
    }

    next(err);
});

http.createServer(app).listen(8060);
console.info('application listen at port 8060');


if(config.secure) {
    var options = {
        ca:fs.readFileSync('xxnr.ca-bundle'),
        key: fs.readFileSync('xxnr.key'),
        cert: fs.readFileSync('xxnr.crt')
    };
    https.createServer(options, app).listen(1111);
    console.info('application listen at port 1111');
}
