// 用户积分
var mongoose = require("mongoose");
var tools = require("../common/tools");

var LoyaltyPointsLogsSchema = new mongoose.Schema({
	"user": {type: mongoose.Schema.ObjectId, ref: 'user', required: true},	// 用户
	"date": {type: Date, default: Date.now},                         		// 注册
    "points": {type:Number},                                                // 积分
    "event": {																// 事件
        "name": {type:String},												// 事件名
        "type": {type:Number}, 												// 事件类型
        "order": {type: mongoose.Schema.ObjectId, ref: 'order'}				// 积分兑换的相关订单
    },
    "description": {type:String}											// 描述
});

LoyaltyPointsLogsSchema.index({"date":-1});
LoyaltyPointsLogsSchema.index({"event.type":1, "date":-1});

mongoose.model("loyalty_points_logs", LoyaltyPointsLogsSchema);

var RewardshopGiftCategorySchema = new mongoose.Schema({
	'name': {type: String},
	'datecreated': {type: Date, default: Date.now},
	'deliveries': [{
		'deliveryType': {type: Number},										// 商品分类的配送方式
		'deliveryName': {type: String}										// 商品分类的配送方式Name
	}]
});

RewardshopGiftCategorySchema.index({'name':1, 'datecreated':-1});

mongoose.model('rewardshopgiftcategory', RewardshopGiftCategorySchema);

var RewardshopGiftSchema = new mongoose.Schema({
	'id': {type: String, required: true, unique: true},
	'name': {type: String, required: true},
	'pictures': [String],													// 主图
	'category': {
		'ref': {type: mongoose.Schema.ObjectId, ref: 'rewardshopgiftcategory', required: true}
	},
	'istop': {type: Boolean, default: false},
	'datecreated': {type: Date, default: Date.now},
	'dateupdated': {type: Date, default: Date.now},
	'appbody': {type: String},
	'marketPrice': {type: Number},
	'online': {type:Boolean, default:false},
	'soldout': {type:Boolean, default:false},
	'points': {type:Number, required: true}									// 换取商品所用积分
});

RewardshopGiftSchema.index({'online':1, 'soldout':1, 'category.ref':1, 'istop':1, 'datecreated':-1});
RewardshopGiftSchema.index({'soldout':1, 'category.ref':1, 'istop':1, 'datecreated':-1});
RewardshopGiftSchema.index({'category.ref':1, 'istop':1, 'datecreated':-1});
RewardshopGiftSchema.index({'name':1, 'istop':1, 'datecreated':-1});
RewardshopGiftSchema.index({'istop':1, 'datecreated':-1});

mongoose.model('rewardshopgift', RewardshopGiftSchema);