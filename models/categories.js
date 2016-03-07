var mongoose = require('mongoose');
var sizeSchema = new mongoose.Schema({
	'width': Number,
	'height': Number
});

var categorySchema = new mongoose.Schema({
	'id': {type:String, required:true, unique:true},
	'parent': String,
	'productImgSize': {subschemaName:"Size", type: sizeSchema },
	'productThumbSize': {subschemaName:"Size", type: sizeSchema },
	'pictures': [String], // URL address to first 5 pictures
	'name': String,
	'url': String,
	'title': {type:String, required:true},
	'datecreated': Date,
	'deliveries':[{
		'deliveryType':{type: Number},									// 商品分类的配送方式
		'deliveryName':{type: String},									// 商品分类的配送方式Name
		'deliveryWeight':{type: Number}									// 商品分类的配送方式排序
	}]
});

mongoose.model('category', categorySchema);
