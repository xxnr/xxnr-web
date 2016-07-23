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
var buildMobileApp = require('./buildMobileApp');

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
buildMobileApp(app);

http.createServer(app).listen(8060);
console.info('application listen at port 8060');

if(config.secure) {
    var options = {
        ca:fs.readFileSync('xxnr.ca-bundle'),
        key: fs.readFileSync('xxnr.key'),
        cert: fs.readFileSync('xxnr.crt')
    };
    https.createServer(options, app).listen(8443);
    console.info('application listen at port 8443');
}
