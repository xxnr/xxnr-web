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
var cookieParser = require('cookie-parser');
var busboy = require('connect-busboy');
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

	return next();
});

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

http.createServer(app).listen(80);
console.info('application listen at port 80');

if(config.secure) {
	// certificate
	var privateKey = fs.readFileSync('private_key.pem').toString();
	var certificate = fs.readFileSync('cert.pem').toString();
	var options = {
		key: privateKey,
		cert: certificate
	};

	https.createServer(options, app).listen(443);
	console.info('application listen at port 443');
}