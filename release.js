// ===================================================
// IMPORTANT: only for production
// total.js - web application framework for node.js
// http://www.totaljs.com
// ===================================================

//var fs = require('fs');
//var options = {};
//
//options.ip = '0.0.0.0';
//options.port = 80;

/*  var args = process.argv.splice(2);  // skip argv[0], argv[1] which is "node" "release.js"

    if(!args || args.length ==0){   
    }  
	*/
// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.config = { name: 'total.js' };
// options.https = { key: fs.readFileSync('keys/agent2-key.pem'), cert: fs.readFileSync('keys/agent2-cert.pem')};

/**
 * Release notes:
 */
//var framework = require('total.js');
//framework.setWorkingDirectory(__dirname);
//framework.http('release', options);

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
var URL = require('url');
var tools = require('./common/tools');
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
	req.url = req.url.replace(/\/*/, '/');

	// for nginx proxy
	req.clientIp = req.headers['x-real-ip'] || req.headers['ip'] || req.ip;
	return next();
});

app.use('/', function(req, res, next) {
	var urlObject = URL.parse(req.protocol + '://' + req.get('host'));
	var port = urlObject.port;
	if (port == '80' || port == '443' || config.environment == 'sandbox') {
		port = undefined;
	}

	var hosturl = req.hostname;
	if (hosturl) {
		hosturl = tools.getXXNRHost(hosturl);
	} else {
		hosturl = 'www.xinxinnongren.com';
	}

	var protocol = req.protocol + '://';
	req.url_prefix = protocol + hosturl + (port ? ':' + port : '');
	next();
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
app.use(express.static(path.join(__dirname, F.config.directory_xxnr_public)));
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes');
// routes
app.use('/', routes.secureFrontendApis);
app.use('/', routes.frontendApis);
app.use('/', routes.frontendPages);
app.use('/', routes.appRelatedPages);
app.use('/', routes.backendApis);
app.use('/', routes.backendPages);

app.use(function (err, req, res, next) {
	if(F.config.environment === 'production'){
		res.status(500);
		res.end();
		return;
	}

	next(err);
});

module.exports = app;

var port = 8070;
if(F.config.environment === 'sandbox'){
	port = 80;
}

http.createServer(app).listen(port);
console.info('application listen at port', port);

if(config.secure) {
	var options = {
		ca:fs.readFileSync('xxnr.ca-bundle'),
		key: fs.readFileSync('xxnr.key'),
		cert: fs.readFileSync('xxnr.crt')
	};

	https.createServer(options, app).listen(1111);
	console.info('application listen at port 1111');
}