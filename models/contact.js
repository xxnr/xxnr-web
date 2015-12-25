var Contact = NEWSCHEMA('Contact');

/*
Contact.define('id', String);
Contact.define('firstname', 'String(40)', true);
Contact.define('lastname', 'String(40)', true);
Contact.define('email', 'String(200)', true);
Contact.define('message', String, true);
Contact.define('phone', 'String(20)');
Contact.define('language', 'String(3)');
Contact.define('ip', 'String(80)');
Contact.define('datecreated', Date);*/

var contactSchema = {
	'id': String,
	'firstname': {type: String, required: true},
	'lastname': {type: String, required: true},
	'email': {type: String, required: true},
	'message': {type: String, required: true},
	'phone': String,
	'language': String,
	'ip': String,
	'datecreated': Date,
};

Contact.DEFINE(contactSchema);
var db = DB('contactforms', contactSchema, DB.BUILT_IN_DB);

// Saves the model into the database
Contact.setSave(function(error, model, options, callback) {

	// Default values
	model.id = U.GUID(8);
	model.datecreated = (new Date()).format();

	// Saves to database
	db.insert(model);

	// Returns response
	callback(SUCCESS(true));

	// Writes stats
	MODULE('webcounter').increment('contactforms');

	// Sends email
	var mail = F.mail(F.config.custom.emailcontactform, 'Contact form # ' + model.id, '~mails/contact', model, model.language);
	mail.reply(model.email, true);
});