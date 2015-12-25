var tools = require('../common/tools');

var VCode = NEWSCHEMA('VCode');

/*
VCode.define('id', String);					// vcode ID
VCode.define('code_type', String);			// register, resetpwd..
VCode.define('code', String);				// random string.
VCode.define('target', String);				// phone number or email address or session id.
VCode.define('target_type', String);		// phone, email or session.
VCode.define('valid_time', Date);			// valid time
VCode.define('start_time', Date);			// start time
VCode.define('ttl', Number);				// times to live
*/

var vcodeSchema = {
    'id': String,					// vcode ID
    'code_type': String,			// register, resetpwd..
    'code': String,				// random string.
    'target': String,				// phone number or email address or session id.
    'target_type': String,		// phone, email or session.
    'valid_time': Date,			// valid time
    'start_time': Date,			// start time
    'ttl': Number,				// times to live
};

VCode.DEFINE(vcodeSchema);
var db = DB('vcodes', vcodeSchema);

// Sets default values
VCode.setDefault(function(name) {
	switch (name) {
		case 'start_time':
			return new Date().getTime();
		case 'valid_time':
			return new Date().getTime() + F.config.vcode_resend_valid;
		case 'ttl':
			return 5;
	}
});

// Creates vcode
VCode.addWorkflow('create', function(error, model, options, callback) {
    var vcode = GETSCHEMA('VCode').create();
    var nowtime = new Date();

    vcode.id = U.GUID(10);
    vcode.code = tools.generateAuthCode();
    vcode.code_type = options.code_type;
    vcode.target = options.target;
    vcode.target_type = options.target_type;
    //vcode.valid_time = nowtime.getTime() + F.config.vcode_resend_valid;
    //vcode.start_time = nowtime.getTime();

    // Inserts vcode into the database
	db.insert(vcode, function(err) {
		if (err) {
            return callback(err, null);
        }

        return callback(null, vcode);
	});

});

// Verify vcode
VCode.addWorkflow('verify', function(error, model, options, callback) {
	var id, target, code_type, code;
	if (options.id)
		id = options.id
	if (options.target)
		target = options.target
	if (options.code_type)
		code_type = options.code_type
	if (options.code)
		code = options.code

    getByIdentity(id, target, code_type, function(err, vcode) {
        if (err) {
            return callback(err);
        }
        if (!vcode) {
            return callback(null, {'type':5,'data':'没有查找到验证码'});
        }
        if (vcode.ttl <= 0) {
        	return callback(null, {'type':4,'data':'错误次数太多，请重新获取'});
        }
        if (vcode.valid_time < Date.now()) {
        	return callback(null, {'type':3,'data':'验证码已过期，请重新获取'});
        } 
        if (vcode.code !== code) {
            vcode.ttl--;
            // Filter for update
			var updater = function(doc) {
				if (vcode.target && vcode.code_type && doc.target === vcode.target && doc.code_type === vcode.code_type) {
					doc.ttl = vcode.ttl;
					return doc;
				}
				return doc;
			}
			// Updates vcode into the database
			var queryoptions = {target:vcode.target, code_type:vcode.code_type};
			var operatoroptions = {ttl:vcode.ttl};
			db.update(db.type == DB.MONGO_DB ? {query:queryoptions, operator:{$set:operatoroptions}} : updater, function(err) {
                if (err) {
                    return callback(err);
                }

                return callback(null, {'type':2,'data':'验证码输入错误'});
            });
        } else {
        	var returncall = function(err) {
    			if (err) {
                    return callback(err);
                }

                return callback(null, {'type':1,'data':vcode});
        	};

        	if (db.type == DB.MONGO_DB) {
        		db.remove({query:{target:vcode.target, code_type:vcode.code_type}}, returncall(err));
        	} else {
				// Filter for removing
				var updater = function(doc) {
					if (vcode.target && vcode.code_type && doc.target === vcode.target && doc.code_type === vcode.code_type)
						return null;

					return doc;
				};
				db.update(updater, returncall(err));
	        }
        }
    });
});

// Updates vcode
VCode.addWorkflow('update', function(error, model, options, callback) {
	// model

	// Filter for updating
	var updater = function(doc) {
		if (model.id && doc.id === model.id)
			return model;

		return doc;
	};

	// Updates database file
	db.update(db.type == DB.MONGO_DB ? {query:{id:model.id}, operator:{$set:model}} : updater,  function(err) {
		if (err) {
            return callback(err);
        }

        return callback();
    });
});

// Gets a specific vcode
VCode.setGet(function(error, model, options, callback) {
	// options.id {String}
	// OR
	// options.target {String} options.code_type {String}

	var id, target, code_type;
	if (options.id)
		id = options.id
	if (options.target)
		target = options.target
	if (options.code_type)
		code_type = options.code_type

	getByIdentity(id, target, code_type, callback);
});

// Gets vcode by identity
function getByIdentity(id, target, code_type, callback) {
	// Filter for reading
	var filter = function(doc) {
		if (id && doc.id === id)
			return doc;
		if (target && code_type && doc.target === target && doc.code_type === code_type)
			return doc;
		return;
	};

	// Gets a specific document from DB
	var queryoptions = {};
	if (id)
		queryoptions = {id:id};
	if (target && code_type)
		queryoptions = {target:target,code_type:code_type};
	db.one(db.type == DB.MONGO_DB ? {query: queryoptions} : filter, function(err, doc) {
		if (err) {
			return callback(err, null);
		} else {
			return callback(null, doc);
		}
	});
}
