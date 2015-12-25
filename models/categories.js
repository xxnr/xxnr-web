// Supported operations:
// "render" renders category
// "render-multiple" renders multiple categories (uses "render")
// "breadcrumb" creates bredcrumb (uses "render")
// "clear" clears database

// Supported workflows
// "create-url"
/*var Size = NEWSCHEMA('Size');
Size.define('width', Number);
Size.define('height', Number);
*/

var Category = NEWSCHEMA('Category');

/*
Category.define('id', String, true);
Category.define('parent', String);
Category.define('productImgSize', 'Size');
Category.define('productThumbSize', 'Size');
Category.define('pictures', '[String]') // URL address to first 5 pictures
Category.define('name', String);
Category.define('title', String, true);
Category.define('datecreated', Date);
*/

var sizeSchema = {
	'width': Number,
	'height': Number
};

var categorySchema = {
	'id': {type:String, required:true},
	'parent': String,
	'productImgSize': {subschemaName:"Size", type: sizeSchema },
	'productThumbSize': {subschemaName:"Size", type: sizeSchema },
	'pictures': [String], // URL address to first 5 pictures
	'name': String,
	'url': String,
	'title': {type:String, required:true},
	'datecreated': Date,
};


	
Category.DEFINE(categorySchema);
var db = DB('categories', categorySchema);

// Sets default values
Category.setDefault(function(name) {
	switch (name) {
		case 'datecreated':
			return new Date();
	}
});

// Removes a specific category
Category.setRemove(function(error, id, callback) {

	if (db.type == DB.MONGO_DB) {
		db.remove({query:{id:id}}, callback);
	} else {
		// Filters for removing
		var updater = function(doc) {
			if (doc.id !== id)
				return doc;
			return null;
		};

		// Updates database file
		db.update(updater, callback);
	}

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

	if (!model.datecreated)
		model.datecreated = new Date();
		// model.datecreated = model.datecreated.format();

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
	db.update(db.type == DB.MONGO_DB ? {query:{id:clean.id}, operator:{$set:clean}} : updater, function(err, updatedCount) {

		// Creates record if not exists
		if(updatedCount && updatedCount>0){
            // mongodb callback, updated count >0
            count = updatedCount;
        }
		if (count === 0)
			db.insert(clean);

		// Returns response
		callback(SUCCESS(true));

		// Refreshes internal informations e.g. sitemap
		setTimeout(refresh, 1000);
	});
});

// Clears database
Category.addWorkflow('clear', function(error, model, options, callback) {

	db.clear(function() {
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

	db.all(db.type == DB.MONGO_DB ? {query:{}} : prepare, function(err, docs, Count) {
		if (db.type == DB.MONGO_DB) {
			for (var i = 0; i < docs.length; i++) {
				var doc = docs[i];
				categories[doc.id] = doc;
			}
		}
		F.global.mapCategories = categories;
	});
}

setTimeout(refresh, 1000);