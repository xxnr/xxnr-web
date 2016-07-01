var mongoose = require("mongoose");
var vcode_config = require('../configuration/vcode_config');

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
vcodeSchema.index({target:1, target_type:1, code_type:1, code:1});

mongoose.model('vcode', vcodeSchema);

var graphVcodeSchema = new mongoose.Schema({
    'code_type': String,			// register, resetpwd..
    'code': String,				// random string.
    'target': String,				// phone number or email address or session id.
    'target_type': String,		// phone, email or session.
    'start_time': {type:Date, required:true, default:Date.now, expires: vcode_config.graphvcode_expire_time_in_ms},			// start time
    'ip': String
});
graphVcodeSchema.index({target:1, ip:1, target_type:1, code_type:1, code:1});

mongoose.model('graphvcode', graphVcodeSchema);

var ipThrottleSchema = new mongoose.Schema({
	'ip': String,
	'type': String,								// sms..
	'num': {type:Number, default:1},
    'start_time': {type:Date, required:true, default:Date.now, expires: vcode_config.ipthrottle_expire_time_in_ms}			// start time
});
ipThrottleSchema.index({ip:1, type:1});

mongoose.model('ipthrottle', ipThrottleSchema);

var dailySmsNumberSchema = new mongoose.Schema({
	'num': {type:Number, default:1},
    'date': {type:Date, required:true, default:Date.now, expires: vcode_config.dailysms_expire_time_in_ms}			// date
});

mongoose.model('dailysmsnumber', dailySmsNumberSchema);