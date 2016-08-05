/**
 * Created by pepelu on 2016/8/5.
 */
var mongoose = require("mongoose");

var wechartSchema = new mongoose.Schema({
    access_token: {type:String, required:true},
    jsapi_ticket:{type:String, required:true}
});

mongoose.model('wechart', wechartSchema);