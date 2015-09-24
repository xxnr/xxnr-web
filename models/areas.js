var Province = NEWSCHEMA('Province');
Province.define('id', String);					// 省ID
Province.define('name', String, true);			// 省Name
Province.define('shortname', String, true);		// 省Name

var City = NEWSCHEMA('City');
City.define('id', String);						// 市ID
City.define('name', String, true);				// 市Name
City.define('provinceid', String, true);		// 所属省ID

var County = NEWSCHEMA('County');
County.define('id', String);					// 县ID
County.define('name', String, true);			// 县Name
County.define('cityid', String, true);			// 所属市ID
County.define('provinceid', String, true);		// 所属省ID

// ==========================================================================
// Province
// ==========================================================================

// Gets listing
Province.setQuery(function(error, options, callback) {

	// Filtering documents
	var filter = function(doc) {
		return doc;
	};

	// Sorting documents
	var sorting = function(a, b) {
		if (a.shortname <= b.shortname)
			return -1;
		return 1;
	};

	DB('provinces').sort(filter, sorting, function(err, docs, count) {
		var data = {};

		data.count = count;
		data.items = docs;

		// Returns data
		callback(data);

	});
});

// Gets a specific Province
Province.setGet(function(error, model, options, callback) {
	// options.id {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.id && doc.id === options.id)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('provinces').one(filter, function(err, province) {
		if (!province || err){
			callback();
			return;
		} else{
			// Returns response
			callback(province);
			return;
		}
	});
});

// ==========================================================================
// City
// ==========================================================================

// Gets listing
City.setQuery(function(error, options, callback) {

	// Filtering documents
	var filter = function(doc) {
		if (options.provinceid && doc.provinceid === options.provinceid)
			return doc;
		return;
	};

	// Sorting documents
	/*var sorting = function(a, b) {
		return -1;
	};

	DB('cities').sort(filter, sorting, function(err, docs, count) {*/
	DB('cities').sort(filter, null, function(err, docs, count) {
		var data = {};

		data.count = count;
		data.items = docs;

		// Returns data
		callback(data);

	});
});

// Gets a specific City
City.setGet(function(error, model, options, callback) {
	// options.id {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.id && doc.id === options.id)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('cities').one(filter, function(err, city) {
		if (!city || err){
			callback();
			return;
		} else{
			// Returns response
			callback(city);
			return;
		}
	});
});

// ==========================================================================
// County
// ==========================================================================

// Gets listing
County.setQuery(function(error, options, callback) {

	// Filtering documents
	var filter = function(doc) {
		if (options.cityid && options.provinceid && doc.cityid === options.cityid && doc.provinceid === options.provinceid)
			return doc
		if (options.cityid && doc.cityid === options.cityid)
			return doc;
		if (options.provinceid && doc.provinceid === options.provinceid)
			return doc;
		return;
	};

	// Sorting documents
	/*var sorting = function(a, b) {
		return -1;
	};

	DB('counties').sort(filter, sorting, function(err, docs, count) {*/
	DB('counties').sort(filter, null, function(err, docs, count) {
		var data = {};

		data.count = count;
		data.items = docs;

		// Returns data
		callback(data);

	});
});

// Gets a specific County
County.setGet(function(error, model, options, callback) {
	// options.id {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.id && doc.id === options.id)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('counties').one(filter, function(err, county) {
		if (!county || err){
			callback();
			return;
		} else{
			// Returns response
			callback(county);
			return;
		}
	});
});
