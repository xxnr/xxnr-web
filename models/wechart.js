/**
 * Created by pepelu on 2016/8/5.
 */
var mongoose = require("mongoose");

var wechartSchema = new mongoose.Schema({
    access_token: {type:String},
    access_token_update_time: {type:Date},
    access_token_expires_in: {type:String},
    jsapi_ticket:{type:String},
    jsapi_ticket_update_time: {type:Date},
    jsapi_ticket_expires_in:{type:String}
});

mongoose.model('wechart', wechartSchema);