var mongoose = require("mongoose");

var vcodeSchema = new mongoose.Schema({
    'id': String,					// vcode ID
    'code_type': String,			// register, resetpwd..
    'code': String,				// random string.
    'target': String,				// phone number or email address or session id.
    'target_type': String,		// phone, email or session.
    'valid_time': {type:Date, default:function(){return Date.now() + F.config.vcode_resend_valid;}},			// valid time
    'start_time': {type:Date, default:Date.now},			// start time
    'ttl': {type:Number, default:5}				// times to live
});

mongoose.model('vcode', vcodeSchema);
