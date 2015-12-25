exports.install = function() {
	F.route('/files/upload/',          upload, ['post', 'upload'], 3084); // 3 MB
	F.route('/files/upload/base64/',           			upload_base64, ['post'], 2048); // 2 MB
	
	// FILES
	F.route('/files/clear/',         			files_clear);
};

var files = DB('files', null, require('total.js/database/database').BUILT_IN_DB).binary;

// Upload (multiple) files
function upload(callback) {

	var self = this;
	var async = [];
	var id = [];

	self.files.wait(function(file, next) {
		file.read(function(err, data) {
			// Store current file into the HDD
			var index = file.filename.lastIndexOf('.');

			if (index === -1)
				file.extension = '.dat';
			else
				file.extension = file.filename.substring(index);

			id.push(files.insert(file.filename, file.type, data) + file.extension);

			// Next file
			setTimeout(next, 100);
		});

	}, function() {
		// Returns response
		callback ? callback(id) : self.json(id);
	});
}

// Upload base64
function upload_base64() {
	var self = this;

	if (!self.body.file) {
		self.json(null);
		return;
	}

	var type = self.body.file.base64ContentType();
	var data = self.body.file.base64ToBuffer();
	var id = files.insert('unknown', type, data);

	switch (type) {
		case 'image/png':
			id += '.png';
			break;
		case 'image/jpeg':
			id += '.jpg';
			break;
		case 'image/gif':
			id += '.gif';
			break;
	}

	self.json('/download/' + id);
}

// ==========================================================================
// FILES
// ==========================================================================

// Clears all uploaded files
function files_clear() {
	var Fs = require('fs');
	U.ls(files.directory, function(files) {
		files.wait(function(item, next) {
			Fs.unlink(item, next);
		});
	});

	self.json(SUCCESS(true));
}

exports.upload = upload;
exports.upload_base64 = upload_base64;
exports.files_clear = files_clear;
