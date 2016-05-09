// ===================================================
// IMPORTANT: only for mobile production
// ===================================================

/**
 * Release notes:
 */

var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var busboy = require('connect-busboy');
var https = require('https');
var http = require('http');
var path = require('path');
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

// certificate
var privateKey = fs.readFileSync('private_key.pem').toString();
var certificate = fs.readFileSync('cert.pem').toString();
var options = {key:privateKey, cert:certificate};
app.disable('etag');
app.set('jsonp callback name', 'JSON_CALLBACK');

//view template setting
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

/**
 * middleware
 */
// bodyParser based on content type
app.use(bodyParser.json({
    'limit': '1mb'
}));
app.use(bodyParser.urlencoded({extended: false}));

// cookieParser
app.use(cookieParser());

// busboy
app.use(busboy({
    limits: {
        fileSize: F.config.file_size_limit,
        files: F.config.file_count_limit
    }
}));

// website common middleware
app.use(require('./middlewares/website'));

// set static file path
app.use(express.static(path.join(__dirname, 'public/xxnr/mobileWeb')));
app.use(express.static(path.join(__dirname, 'public/xxnr')));

// routes
app.use('/', require('./routes'));

http.createServer(app).listen(8888);
console.info('mobile application listen at port 8888');
https.createServer(options, app).listen(1111);
console.info('application listen at port 1111');