var mongoose = require('mongoose');

var userconsigneeSchema = new mongoose.Schema({
	'userId': {type:String, required: true},				// 用户ID
	'consigneeName': {type:String, required:true},			// 收货人姓名
	'consigneePhone': {type:String, required:true},			// 收货人电话
	'dateCreated': {type: Date, default: Date.now}			// 创建时间
});
userconsigneeSchema.index({userId: 1, dateCreated: -1});

var userRSCSchema = new mongoose.Schema({
	'userId': {type:String, required: true},				// 用户ID
	'RSC':{type:mongoose.Schema.ObjectId, ref:'user'},		// 用户服务过的RSC
	'dateCreated': {type: Date, default: Date.now}			// 创建时间
});
userRSCSchema.index({userId: 1, dateCreated: -1});

mongoose.model('userconsignee', userconsigneeSchema);
mongoose.model('userRSC', userRSCSchema);
