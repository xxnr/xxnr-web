var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
	id: {type: String, required: true, unique: true},
	pictures: [String],																// 主图
	reference: String,
	category: {type: String, required: true},
	name: {type: String, required: true},
	istop: {type: Boolean, default: false},
	linker: String,
	linker_category: String,
	datecreated: {type: Date, default: Date.now},
	positiveRating: Number,
	discount: Number,
	stars: Number,
	brandName: String,
	price:Number,
	deposit: Number,
	description: String,
	body: String,
	standard: String,
	support: String,
	app_body: String,
	app_standard: String,
	app_support: String,
	presale: {type:Boolean, default:false},
	brand: {type: mongoose.Schema.ObjectId, ref: 'brand'},
	attributes: [{								// all attributes of this product, used for product query
		ref: {type:mongoose.Schema.ObjectId, ref:'productAttribute', required:true},
		name: {type: String, required: true},
		value: {type: String, required: true},
		order:{type:Number}
	}],
	SKUAttributes: [{						// list all SKU attributes of this products, it's aggregated when add/update/delete sku of this product
		name: String,
		values: [{type: String, required: true}]
	}],
	SKUAdditions: [{								// list all additions of this products, it's aggregated when add/update/delete sku of this product
		ref: {type: mongoose.Schema.ObjectId, ref:'SKUAddition'},
		name:{type:String, required: true},
		price:{type:Number, required: true}
	}],
	SKUPrice: {									// min and max price of this product, it's aggregated when add/update/delete sku of this product
		min: {type: Number},
		max: {type: Number}
	},
	SKUMarketPrice:{
		min:{type:Number},
		max:{type:Number}
	},
	online:{type:Boolean, default:false},
	defaultSKU: {
		type: {
			ref: {type: mongoose.Schema.ObjectId, ref: 'SKU', required: true},
			name: {type: String},
			attributes: [{                                                             // sku attributes, list all attributes this sku has, will be like [{name:车型,value:舒适性}, {name:排量,value:1.5L}]
				ref: {type: mongoose.Schema.ObjectId, ref: 'SKUAttribute'},
				name: {type: String, required: true},         // attribute name
				value: {type: String, required: true},          // attribute value
				order: {type: Number}
			}],
			additions: [{                                                               // sku additions, list all additions of this sku, will be like [{name:全景天窗,price:2000}, {name:大灯, price:1000}]
				ref: {type: mongoose.Schema.ObjectId, ref: 'SKUAddition'},
				name: {type: String, required: true},
				price: {type: Number, required: true}
			}],
			price: {                                                                   // price of sku
				market_price: {type: Number},                  // market price
				platform_price: {type: Number, required: true} // platform price
			},
			online: {type: Boolean, default: false}
		},
		required:false
	},
	referencePrice:{											// 参考价格区间
		min:{type:Number},
		max:{type:Number}
	},
	tags: [{								// all tags of this product, used for product query
		ref: {type:mongoose.Schema.ObjectId, ref:'productTag', required:true},
		name: {type: String, required: true}
	}],
	rewardPoints:{type:Number}									// 完成商品所得积分
});

var productAttributeSchema = new mongoose.Schema({
	category:{type:String, required:true},
	brand: {type: mongoose.Schema.ObjectId, ref: 'brand'},
	name: {type:String, required:true},
	value:{type:String, required:true},
	order:{type:Number},
	display:{type:Boolean}
});

// indexes
productSchema.index({linker_category:1, brandName:1, 'attributes.value':1, 'SKUPrice.min':1, id:1});
productSchema.index({linker_category:1, brandName:1, 'tags.name':1, 'SKUPrice.min':1, id:1});
productAttributeSchema.index({category:1, brand:1, name:1});
productAttributeSchema.index({category:1, brand:1, name:1, value:1}, {unique:true});

var brandsProductsCollectionSchema = new mongoose.Schema({
	ref: {type: mongoose.Schema.ObjectId, ref: 'brand', required: true},
	brandId: {type: String, required: true, unique: true},
	brandName: {type: String, required: true},
	brandImg: {type: String, required: true},
	total: {type: Number},
	levels:[{
		name: {type: String, required: true},
		order: {type: Number},
		products:[{
			ref: {type: mongoose.Schema.ObjectId, ref: 'product'},
			id: {type: String, required: true},
			name: {type: String, required: true},
			unitPrice: {type: Number, required: true},
			brandId: {type: String, required: true},
			brandName: {type: String, required: true},
			imgUrl: {type: String, required: true},
			thumbnail: {type: String, required: true},
			originalPrice: {type: Number, required: true},
			presale: {type: Boolean, default: false},
			pictures:[{
				imgUrl: {type: String, required: true},
				thumbnail: {type: String, required: true},
				originalUrl: {type: String, required: true}
			}],
			categoryId: {type: String, required: true},
			tags: [{								// all tags of this product, used for product query
				ref: {type:mongoose.Schema.ObjectId, ref:'productTag', required:true},
				name: {type: String, required: true}
			}]
		}]
	}],
	date: {type: Date, default: Date.now}
});

var productTagSchema = new mongoose.Schema({
	category:{type:String, required:true},
	name: {type:String, required:true},
	dateCreated: {type: Date, default: Date.now},
	order: {type:Number, default: 0},
	productsNum: {type:Number, default: 0}
});
productTagSchema.index({name:1, category:1}, {unique:true});
productTagSchema.index({dateCreated:-1});
productTagSchema.index({category:1, productsNum:1, order:1, dateCreated:-1});

mongoose.model('product', productSchema);
mongoose.model('productAttribute', productAttributeSchema);
mongoose.model('brandsProductsCollection', brandsProductsCollectionSchema);
mongoose.model('productTag', productTagSchema);

//var schema = new mongoose.Schema({
//	'id':{ type:String,required:true, unique:true},
//	'pictures': [String],
//	'reference': String,
//	'category': {type: String, required: true},
//	'name': {type: String, required: true},
//	'price': {type: Number, required: true},
//	'istop': Boolean,
//	'linker': String,
//	'linker_category': String,
//	'datecreated': {type:Date, default: Date.now},
//	'positiveRating': Number,
//	'discount': Number,
//	'stars': Number,
//	// delete by zhouxin
//	//'brandId': String,
//	'brandName': String,
//	'deposit': Number,
//	// add by zhouxin
//	'description': String,
//	'body': String,
//	'standard': String,
//	'support': String,
//	// for car add by zhouxin
//	'model': String, //车系
//	'engine': String, //排量
//	'gearbox': String, //变速器 手动挡
//	'level': String, //车型 舒适型
//	// add by zhouxin for app
//	'app_body': String,
//	'app_standard': String,
//	'app_support': String,
//	'presale': Boolean
//});