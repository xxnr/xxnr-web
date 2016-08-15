console.log('processing default.js');
var tools = require('../common/tools');
var utils = require('../common/utils');
var zlib = require('zlib');
var TYPE_FUNCTION = 'function';
var OBJECT = 'object';
var TEMPORARY_KEY_REGEX = /\//g;
var fs = require('fs');
var path = require('path');
var RESPONSE_HEADER_CACHECONTROL = 'Cache-Control';
var RESPONSE_HEADER_CONTENTTYPE = 'Content-Type';
var RESPONSE_HEADER_CONTENTLENGTH = 'Content-Length';
var CONTENTTYPE_TEXTPLAIN = 'text/plain';
var CONTENTTYPE_TEXTHTML = 'text/html';
var REQUEST_COMPRESS_CONTENTTYPE = { 'text/plain': true, 'text/javascript': true, 'text/css': true, 'application/x-javascript': true, 'application/json': true, 'text/xml': true, 'image/svg+xml': true, 'text/x-markdown': true, 'text/html': true };

exports.install = function() {
	// F.route('/', function(){this.raw(`<html><meta http-equiv="refresh" content="0;url=xxnr/index.html"></html>`);}); // same method to jump from baidu.com to www.baidu.com, which should be stable and good enough 
	//F.route('/', function(){this.raw(F.config['home-page']);});
    //F.route('/header',function(){this.view('/../public/xxnr/header')});
    //F.route('/footer',function(){this.view('/../public/xxnr/footer')});

    // COMMON
	// F.route('/', view_homepage);
	// F.route('/contact/', view_contact);

	// CMS rendering through the 404
	//F.route('#404', view_page);

	// FILES
	//F.file('Images (small, large, original, thumbnail) (category)', file_image);
	F.file('Files', file_read);

    //F.middleware('isLoggedIn', middleware.isLoggedIn_middleware);
    //F.middleware('backend_auth', middleware.backend_auth);
    //F.middleware('isInWhiteList', middleware.isInWhiteList_middleware);
    //F.middleware('isXXNRAgent', middleware.isXXNRAgent_middleware);
    //F.middleware('auditing', middleware.auditing_middleware);
	//F.middleware('throttle', middleware.throttle);
	//F.middleware('isRSC', middleware.isRSC_middleware);
};

var files = DB('files', null, require('../modules/database/database').BUILT_IN_DB).binary;
var temporary = {
	path: {},
	processing : {}
};

// ==========================================================================
// COMMON
// ==========================================================================

// Homepage
function view_homepage() {
	var self = this;

	// Increases the performance (1 minute cache)
	self.memorize('cache.homepage', '1 minute', DEBUG, function() {
		var options = {};
		options.max = 12;
		options.homepage = true;
		GETSCHEMA('Product').query(options, function(err, response) {
			self.page('#banners', '~index', response, false, true);
		});
	});
}

// Contact with contact form
function view_contact() {
	var self = this;
	self.page(self.url, 'contact');
}

// ==========================================================================
// CMS (Content Management System)
// ==========================================================================

function view_page() {
	var self = this;
	self.page(self.url);
}

// ==========================================================================
// FILES
// ==========================================================================

// Reads specific file from database
// For images (jpg, gif, png) supports percentual resize according "?s=NUMBER" argument in query string e.g.: .jpg?s=50, .jpg?s=80 (for image galleries)
// URL: /download/*.*
function file_read(req, res, is) {

	if (is)
		return req.path[0] === 'download';

	var id = req.path[1].replace('.' + req.extension, '');

	if (!req.query.s || (req.extension !== 'jpg' && req.extension !== 'gif' && req.extension !== 'png')) {
		// Reads specific file by ID
		files.read(id, function(err, stream, header) {
			if (err)
				return res.throw404();
			res.stream(header.type, stream);
		});
		return;
	}

	// Custom image resizing

	// Small hack for the file cache.
	// F.exists() uses req.uri.pathname for creating temp identificator and skips all query strings by creating (because this hack).
	req.uri.pathname = req.uri.pathname.replace('.', req.query.s + '.');

	// Below method checks if the file exists (processed) in temporary directory
	// More information in total.js documentation
	F.exists(req, res, 10, function(next, filename) {

		// Reads specific file by ID
		files.read(id, function(err, stream, header) {

			if (err) {
				next();
				return res.throw404();
			}

			var writer = require('fs').createWriteStream(filename);
			stream.pipe(writer);
			stream.on('end', function() {

				// Image processing
				F.responseImage(req, res, filename, function(image) {
					image.output(req.extension);
					if (req.extension === 'jpg')
						image.quality(85);
					image.resize(req.query.s + '%');
					image.minify();
				});

				// Releases F.exists()
				next();
			});
		});
	});
}

// Reads a specific picture from database
// URL: /images/small|large|original/*.jpg
exports.file_image = function(req, res, next) {
	var type = req.params.type;
	var path = req.params.filename;
	var extension = req.params.extension;
	fileExists(req, res, 10, function(next, filename) {
		//var path = (req.path.length > 3 ? req.path[3] : req.path[2]);

		// Reads specific file by ID
		files.read(path.replace('.jpg', ''), function(err, stream, header) {
			if (err) {
				next();
				return res.sendStatus(404);
			}

			var writer = require('fs').createWriteStream(filename);
			stream.pipe(writer);

			stream.on('end', function() {

				// Image processing
				responseImage(req, res, filename, function(image) {
					image.output(extension);

					var category = req.query['category'];
					
					var size = null;

					if(category){
						var mapCategories = F.global.mapCategories || {};

						if(mapCategories.hasOwnProperty(category)){
							var thumb = type === 'thumbnail';

							size = thumb ?  mapCategories[category].productThumbSize : mapCategories[category].productImgSize;
						}
					}

					if(!size) {
                        if (type === 'original') {
                            // image.miniature(600, 400);
                            image.quality(90);
                        } else {
                            image.quality(100);
                            if (type === 'large')
                                size = {width: 350, height: 350};
                            else
                                size = {width: 190, height: 190};
                        }
                    }


					if(size) {
                        image.quality(100);
						image.miniature(size.width, size.height);
					}

					image.minify();
				});

				// Releases F.exists()
				next();
			});
		});
	});
};

function fileExists(req, res, max, callback){
	if (typeof(max) === TYPE_FUNCTION) {
		callback = max;
		max = 10;
	}

	var name = createTemporaryKey(req);
	var filename = tempFileName(name);
	var httpcachevalid = false;

	if (RELEASE) {
		var etag = utils.etag(req.url, F.config['etag-version']);
		if (req.get('if-none-match') === etag)
			httpcachevalid = true;
	}

	if (isProcessed(name) || httpcachevalid) {
		responseFile(req, res, filename);
		return;
	}

	utils.queue('framework.exists', max, function(next) {
		fsFileExists(filename, function(e) {

			if (e) {
				responseFile(req, res, filename, undefined, undefined, next);
				return;
			}

			callback(next, filename);
		});
	});

	return;
}

function createTemporaryKey(req) {
	return req.path.replace(TEMPORARY_KEY_REGEX, '-').substring(1);
}

function tempFileName(filename) {
	verify('temp');
	return utils.combine(F.config['directory_temp'], filename || '');
}

function verify(name){
	var prop = '$directory-' + name;
	if (temporary.path[prop])
		return;
	var dir = utils.combine(F.config['directory_' + name]);
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir);
	temporary.path[prop] = true;
}

function fsFileExists(filename, callback) {
	utils.queue('framework.files', F.config.default_maximum_file_descriptors, function(next) {
		fs.exists(filename, function(e) {
			next();
			callback(e);
		});
	});
}

function $decodeURIComponent(value) {
	try
	{
		return decodeURIComponent(value);
	} catch (e) {
		return value;
	}
}

function isProcessed(filename){
	if (filename.url) {
		var name = filename.url;
		var index = name.indexOf('?');

		if (index !== -1)
			name = name.substring(0, index);

		filename = publicPath($decodeURIComponent(name));
	}

	if (temporary.path[filename] !== undefined)
		return true;

	return false;
}

function publicPath(filename){
	return utils.combine(F.config.directory_public, filename || '');
}

function isProcessing(filename) {
	var name;

	if (filename.url) {
		name = filename.url;
		var index = name.indexOf('?');

		if (index !== -1)
			name = name.substring(0, index);

		filename = utils.combine(F.config.directory_public, $decodeURIComponent(name));
	}

	name = temporary.processing[filename];
	if (temporary.processing[filename] !== undefined)
		return true;
	return false;
}

function responseImage(req, res, filename, fnProcess, headers, done) {
	var key = createTemporaryKey(req);

	var name = temporary.path[key];
	if (name === null) {
		res.sendStatus(404);
		if (done)
			done();
		return;
	}

	var stream = null;

	if (typeof(filename) === OBJECT)
		stream = filename;

	if (name !== undefined) {
		responseFile(req, res, '', undefined, headers, done, key);
		return;
	}

	var im = F.config['default-image-converter'] === 'im';

	if (isProcessing(key)) {

		if (req.processing > F.config.default_request_timeout) {
			res.sendStatus(408);
			if (done)
				done();
			return;
		}

		req.processing += 500;
		setTimeout(function() {
			responseImage(req, res, filename, fnProcess, headers, done);
		}, 500);
		return;
	}

	//var plus = self.id === null ? '' : 'instance-' + self.id + '-';

	name = tempFileName(key);
	temporary.processing[key] = true;

	// STREAM
	if (stream !== null) {
		fsFileExists(name, function(exist) {

			if (exist) {
				delete temporary.processing[key];
				temporary.path[key] = name;
				responseFile(req, res, name, undefined, headers, done, key);
				if (isDebug)
					delete temporary.path[key];
				return;
			}

			verify('temp');
			var image = framework_image.load(stream, im);

			fnProcess(image);

			var extension = path.extname(name);
			if (extension.substring(1) !== image.outputType)
				name = name.substring(0, name.lastIndexOf(extension)) + '.' + image.outputType;

			image.save(name, function(err) {

				delete temporary.processing[key];

				if (err) {

					temporary.path[key] = null;
					res.sendStatus(500);

					if (done)
						done();

					if (isDebug)
						delete temporary.path[key];

					return;
				}

				temporary.path[key] = name + ';' + fs.statSync(name).size;
				responseFile(req, res, name, undefined, headers, done, key);
			});
		});

		return;
	}

	// FILENAME
	fsFileExists(filename, function(exist) {

		if (!exist) {

			delete temporary.processing[key];
			temporary.path[key] = null;
			res.sendStatus(404);

			if (done)
				done();

			if (isDebug)
				delete temporary.path[key];

			return;
		}

		verify('temp');

		var image = framework_image.load(filename, im);

		fnProcess(image);

		var extension = path.extname(name);
		if (extension.substring(1) !== image.outputType)
			name = name.substring(0, name.lastIndexOf(extension)) + '.' + image.outputType;

		image.save(name, function(err) {

			delete temporary.processing[key];

			if (err) {
				temporary.path[key] = null;
				res.sendStatus(500);

				if (done)
					done();

				if (isDebug)
					delete temporary.path[key];

				return;
			}

			temporary.path[key] = name + ';' + fs.statSync(name).size;
			responseFile(req, res, name, undefined, headers, done, key);
		});
	});

	return;
}

function responseFile(req, res, filename, downloadName, headers, done, key) {
	if (res.success || res.headersSent) {
		if (done)
			done();
		return;
	}

	//req.clear(true);

	if (!key)
		key = createTemporaryKey(req);

	var name = temporary.path[key];
	if (name === null) {

		if (isDebug)
			delete temporary.path[key];

		res.sendStatus(404);

		if (done)
			done();

		return;
	}

	var allowcache = req.get('pragma') !== 'no-cache';
	var etag = allowcache ? utils.etag(req.url, F.config['etag-version']) : null;

	if (!isDebug && req.get('if-none-match') === etag) {

		if (etag)
			res.set('Etag', etag);

			res.set('Expires', new Date().add('M', 2));

		res.set(RESPONSE_HEADER_CACHECONTROL, 'public, max-age=5184000');

		res.success = true;
		res.sendStatus(304);
		if (done)
			done();

		return;
	}

	var extension = req.extension;
	if (!extension) {
		if (key)
			extension = path.extname(key);
		if (!extension)
			extension = path.extname(name);
	}

	// JS, CSS
	if (name === undefined) {
		if (isProcessing(key)) {
			if (req.processing > F.config.default_request_timeout) {
				// timeout
				res.sendStatus(408);
				return;
			}
			req.processing += 500;
			setTimeout(function() {
				responseFile(req, res, filename, downloadName, headers, done, key);
			}, 500);
			return;
		}

		// waiting
		temporary.processing[key] = true;

		// checks if the file exists
		compileFile(filename, key, function(){
			delete temporary.processing[key];
			responseFile(req, res, filename, downloadName, headers, done, key);
		});

		return;
	}

	var index = name.lastIndexOf(';');
	var size = null;

	if (index === -1)
		index = name.length;
	else
		size = name.substring(index + 1);

	name = name.substring(0, index);

	var accept = req.get('accept-encoding') || '';

	res.set('Accept-Ranges', 'bytes');
	if (extension === 'html') {
		res.set('Pragma', 'no-cache');
		res.set(RESPONSE_HEADER_CACHECONTROL, 'no-cache, no-store, max-age=0, must-revalidate');

		if (RELEASE && allowcache)
			res.set('Expires', new Date());
	} else {
		res.set(RESPONSE_HEADER_CACHECONTROL, 'public' + (RELEASE && allowcache ? ', max-age=5184000' : ''));
		if (RELEASE && allowcache)
			res.set('Expires', new Date().add('M', 2));
	}

	res.set('Vary', 'Accept-Encoding' + (req.$mobile ? ', User-Agent' : ''));

	if (downloadName)
		res.set('Content-Disposition', 'attachment; filename="' + downloadName + '"');

	if (RELEASE && allowcache && etag && !res.getHeader('ETag'))
		res.set('Etag', etag);

		res.set(RESPONSE_HEADER_CONTENTTYPE, utils.getContentType(extension));

	var compress = F.config['allow-gzip'] && REQUEST_COMPRESS_CONTENTTYPE[utils.getContentType(extension)] && accept.lastIndexOf('gzip') !== -1;
	res.success = true;

	if (isDebug && isProcessed(key))
		delete temporary.path[key];

	if (size !== null && size !== '0' && !compress)
		res.set(RESPONSE_HEADER_CONTENTLENGTH, size);

	if (req.method === 'HEAD') {
		if (compress)
			res.set('Content-Encoding', 'gzip');

		res.sendStatus(200);

		if (done)
			done();
		return;
	}

	if (compress) {
		res.set('Content-Encoding', 'gzip');
		fsStreamRead(name, function(stream, next) {

			res.status(200);

			require('../modules/Streaming').onFinished(res, function(err) {
				require('../modules/Streaming').destroyStream(stream);
				next();
			});

			stream.pipe(zlib.createGzip()).pipe(res);

			if (done)
				done();
		});
		return;
	}

	fsStreamRead(name, function(stream, next) {
		res.status(200);
		stream.pipe(res);

		require('../modules/Streaming').onFinished(res, function(err) {
			require('../modules/Streaming').destroyStream(stream);
			next();
		});

		if (done)
			done();
	});

	return;
}

function fsStreamRead(filename, options, callback, next) {
	if (!callback) {
		callback = options;
		options = undefined;
	}

	var opt = { flags: 'r', mode: '0666', autoClose: true };

	if (options)
		utils.extend(opt, options, true);

	utils.queue('framework.files', F.config.default_maximum_file_descriptors, function(next) {
		var stream = fs.createReadStream(filename, opt);
		stream.on('error', noop);
		callback(stream, next);
	});
}

function fsFileRead(filename, callback) {
	U.queue('framework.files', F.config.default_maximum_file_descriptors, function(next) {
		fs.readFile(filename, function(err, result) {
			next();
			callback(err, result);
		});
	});
}

function compileFile(filename, key, callback){
	fsFileRead(filename, function(err, buffer) {

		if (err) {
			temporary.path[key] = null;
			callback();
			return;
		}

		var file = tempFileName(key);
		verify('temp');
		//fs.writeFileSync(file, self.compileContent(extension, buffer.toString(ENCODING), filename), ENCODING);
		temporary.path[key] = file + ';' + fs.statSync(file).size;
		callback();
	});
}

// Test for PullRequest And CoreReview
// more lines to see if new push can be taken by pull request