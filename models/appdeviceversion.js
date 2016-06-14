/**
 * Created by CAI on 2016/6/2.
 */
var mongoose = require('mongoose');
/**
 * app版本升级 version ：版本号 agent:手机系统 ios or android device_token:设备号
 */
var appdeviceversionSchema = new mongoose.Schema({
    'device_token': {type: String, required: true},
    'version': {type: String, required: true},
    'user_agent': {type: String, required: true},
    'date_update': {type: Date, default: Date.now},
    'date_create': {type: Date, default: Date.now}
}, {collection: 'appdeviceversion'});
appdeviceversionSchema.index({device_token: 1});
appdeviceversionSchema.index({date_update: 1});

mongoose.model('app_Device_Version', appdeviceversionSchema);

