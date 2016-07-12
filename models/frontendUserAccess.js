/**
 * Created by pepelu on 2016/2/5.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    route:{type:String, required:true},
    method:{type:String, required:true},
    user:{type:mongoose.Schema.ObjectId, ref:'user'},
    ip:{type:String, required:true},
    createdAt:{type:Date, required:true, default:Date.now},
    expireAt:{type:Date, required:true, expires:0},
    forwardedBy:{type:String}
});

schema.index({route:1, method:1, user:1, ip:1});

mongoose.model('frontendUserAccess', schema);