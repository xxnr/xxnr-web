// ===================================================
// IMPORTANT: only for production
// total.js - web application framework for node.js
// http://www.totaljs.com
// ===================================================

var fs = require('fs');
var options = {};

options.ip = '0.0.0.0';
options.port = 80;

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
var framework = require('total.js');
framework.setWorkingDirectory(__dirname);
framework.http('release', options);
