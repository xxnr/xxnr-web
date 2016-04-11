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

var fs = require("fs");
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var path = require('path');
var app = express();

// certificate
var privateKey = fs.readFileSync('private_key.pem').toString();
var certificate = fs.readFileSync('cert.pem').toString();
var options = {key:privateKey, cert:certificate};

app.set('jsonp callback name', 'JSON_CALLBACK');

// middleware
app.use(bodyParser.json({
	'limit': '1mb'
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('./middlewares/website'));
app.use(express.static(path.join(__dirname, 'public/xxnr')));

app.use('/', require('./routes'));

http.createServer(app).listen(80);
console.info('application listen at port 80');
https.createServer(options, app).listen(443);
console.info('application listen at port 443');
