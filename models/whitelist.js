var mongoose = require('mongoose');

// Schema
var UserWhiteListSchema = new mongoose.Schema({
    'userId': {type:String, required:true, index: true, unique: true},  	// 用户ID
    'account': {type: String, required: true, index: true, unique: true},   // 用户账户（手机号）
    'dateCreated': {type: Date, default: Date.now}
});


// Model
mongoose.model('userwhitelist', UserWhiteListSchema);
