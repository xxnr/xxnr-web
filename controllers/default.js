exports.install = function() {
	// COMMON
	F.route('/', view_homepage);
	F.route('/contact/', view_contact);

	// CMS rendering through the 404
	F.route('#404', view_page);

	// FILES
	F.file('Images (small, large, original, thumbnail) (category)', file_image);
	F.file('Files', file_read);
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
		DB('files').binary.read(id, function(err, stream, header) {
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
		DB('files').binary.read(id, function(err, stream, header) {

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
function file_image(req, res, is) {

	if (is)
		return req.path[0] === 'images' && 
	(req.path[1] === 'small' || req.path[1] === 'large' || req.path[1] === 'original' || req.path[1] === 'thumbnail')
	 && req.path[2];


	// Below method checks if the file exists (processed) in temporary directory
	// More information in total.js documentation
	F.exists(req, res, 10, function(next, filename) {
		var path = (req.path.length > 3 ? req.path[3] : req.path[2]);

		// Reads specific file by ID
		DB('files').binary.read(path.replace('.jpg', ''), function(err, stream, header) {

			if (err) {
				next();
				return res.throw404();
			}

			var writer = require('fs').createWriteStream(filename);
			stream.pipe(writer);

			stream.on('end', function() {

				// Image processing
				F.responseImage(req, res, filename, function(image) {
					image.output('jpg');
					image.quality(90);

					var category = req.query['category'];
					
					var size = null;

					if(category){
						var mapCategories = F.global.mapCategories || {};

						if(mapCategories.hasOwnProperty(category)){
							var thumb = req.path[1] === 'thumbnail';

							size = thumb ?  mapCategories[category].productThumbSize : mapCategories[category].productImgSize;
						}
					}

					if(!size){
						if (req.path[1] === 'original'){
							// image.miniature(600, 400);
						}
						else if (req.path[1] === 'large')
							size = {width:600, height:400};
						else
							size = {width:200, height:150};
					}

					if(size){
						image.miniature(size.width, size.height);
					}

					image.minify();
				});

				// Releases F.exists()
				next();
			});
		});
	});
}