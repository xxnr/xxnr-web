// Supported operations:
// "render" renders category
// "render-multiple" renders multiple categories (uses "render")
// "breadcrumb" creates bredcrumb (uses "render")
// "clear" clears database

// Supported workflows
// "create-url"
var Size = NEWSCHEMA('Size');
Size.define('width', Number);
Size.define('height', Number);

var Category = NEWSCHEMA('Category');
Category.define('id', String, true);
Category.define('parent', String);
Category.define('productImgSize', 'Size');
Category.define('productThumbSize', 'Size');
Category.define('pictures', '[String]') // URL address to first 5 pictures
Category.define('name', String);
Category.define('title', String, true);
Category.define('datecreated', Date);

// Sets default values
Category.setDefault(function(name) {
	switch (name) {
		case 'datecreated':
			return new Date();
	}
});

// Removes a specific category
Category.setRemove(function(error, id, callback) {

	// Filters for removing
	var updater = function(doc) {
		if (doc.id !== id)
			return doc;
		return null;
	};

	// Updates database file
	DB('categories').update(updater, callback);

	// Refreshes internal informations e.g. sitemap
	setTimeout(refresh, 1000);
});

// Saves the category into the database
Category.setSave(function(error, model, options, callback) {

	// options.id {String}
	// options.url {String}

	if (!model.name)
		model.name = model.title;

	var count = 0;

	if (!model.id)
		model.id = U.GUID(10);

	if (model.datecreated)
		model.datecreated = model.datecreated.format();

	// Removes unnecessary properties (e.g. SchemaBuilder internal properties and methods)
	var clean = model.$clean();

	// Filter for updating
	var updater = function(doc) {
		if (doc.id !== clean.id)
			return doc;
		count++;
		return clean;
	};

	// Updates database file
	DB('categories').update(updater, function() {

		// Creates record if not exists
		if (count === 0)
			DB('categories').insert(clean);

		// Returns response
		callback(SUCCESS(true));

		// Refreshes internal informations e.g. sitemap
		setTimeout(refresh, 1000);
	});
});

// Clears database
Category.addWorkflow('clear', function(error, model, options, callback) {

	DB('categories').clear(function() {
		setTimeout(refresh, 1000);
	});

	callback(SUCCESS(true));
});

// Refreshes internal informations (sitemap and navigations)
function refresh() {
	var categories = {};

	var prepare = function(doc) {
		categories[doc.id] = doc;
	};

	DB('categories').all(prepare, function() {
		F.global.mapCategories = categories;
	});
}

setTimeout(refresh, 1000);