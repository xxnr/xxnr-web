var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	'id':{ type:String,required:true, unique:true},
	'pictures': [String],
	'reference': String,
	'category': {type: String, required: true},
	'name': {type: String, required: true},
	'price': {type: Number, required: true},
	'istop': Boolean,
	'linker': String,
	'linker_category': String,
	'datecreated': {type:Date, default: Date.now},
	'positiveRating': Number,
	'discount': Number,
	'stars': Number,
	// delete by zhouxin
	//'brandId': String,
	'brandName': String,
	'deposit': Number,
	// add by zhouxin
	'description': String,
	'body': String,
	'standard': String,
	'support': String,
	// for car add by zhouxin
	'model': String, //车系
	'engine': String, //排量
	'gearbox': String, //变速器 手动挡
	'level': String, //车型 舒适型
	// add by zhouxin for app
	'app_body': String,
	'app_standard': String,
	'app_support': String,
	'presale': Boolean
});

mongoose.model('product', schema);
