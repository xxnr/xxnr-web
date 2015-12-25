var Widget = NEWSCHEMA('Widget')

/*
Widget.define('id', String);
Widget.define('name', String, true);
Widget.define('body', String);
Widget.define('icon', 'String(20)');
Widget.define('istemplate', Boolean);
Widget.define('datecreated', Date);
*/

var widgetSchema = {
    'id': String,
    'name': {type: String, required: true},
    'body': String,
    'icon': String,
    'istemplate': Boolean,
    'datecreated': Date,	
};

Widget.DEFINE(widgetSchema);
var db = DB('widgets', widgetSchema, DB.BUILT_IN_DB);

// Sets default values
Widget.setDefault(function(name) {
	switch (name) {
		case 'datecreated':
			return new Date();
	}
});

// Gets listing
Widget.setQuery(function(error, options, callback) {

	var filter = function(doc) {
		return { id: doc.id, icon: doc.icon, name: doc.name, istemplate: doc.istemplate };
	};

	db.all(filter, function(err, docs, count) {
		callback(docs);
	});
});

// Gets a specific widget
Widget.setGet(function(error, model, options, callback) {

	// options.url {String}
	// options.id {String}

	// Filter for reading
	var filter = function(doc) {

		if (options.url && doc.url !== options.url)
			return;

		if (options.id && doc.id !== options.id)
			return;

		return doc;
	};

	// Gets a specific document
	db.one(filter, function(err, doc) {

		if (doc)
			return callback(doc);

		error.push('error-404-widget');
		callback();
	});
});

// Removes specific widget
Widget.setRemove(function(error, id, callback) {

	// Filter for removing
	var updater = function(doc) {
		if (doc.id !== id)
			return doc;
		return null;
	};

	// Updates database file
	db.update(updater, callback);
});

// Saves the widget into the database
Widget.setSave(function(error, model, options, callback) {

	// options.id {String}
	// options.url {String}

	var count = 0;

	if (!model.id)
		model.id = U.GUID(10);

	if (model.datecreated)
		model.datecreated = model.datecreated.format();

	// Filter for updating
	var updater = function(doc) {
		if (doc.id !== model.id)
			return doc;
		count++;
		return model;
	};

	// Updates database file
	db.update(updater, function() {

		// Creates record if not exists
		if (count === 0)
			db.insert(model);

		// Returns response
		callback(SUCCESS(true));
	});
});

// Clears widget database
Widget.addWorkflow('clear', function(error, model, options, callback) {
	db.clear(NOOP);
	callback(SUCCESS(true));
});

// Loads widgets for rendering
Widget.addWorkflow('load', function(error, model, widgets, callback) {

	// widgets - contains String Array of ID widgets

	var output = {};

	var filter = function(doc) {
		if (doc.istemplate)
			return;
		if (widgets.indexOf(doc.id) !== -1)
			output[doc.id] = doc;
	};

	db.all(filter, function() {
		callback(output);
	});
});