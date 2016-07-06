// 用户积分
var mongoose = require("mongoose");
var tools = require("../common/tools");
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var DELIVERYTYPE = require('../common/defs').DELIVERYTYPE;

var LoyaltyPointsLogsSchema = new mongoose.Schema({
	"user": {type: mongoose.Schema.ObjectId, ref: 'user', required: true},	// 用户
	"date": {type: Date, default: Date.now},                         		// 注册
    "points": {type:Number},                                                // 积分
    "event": {																// 事件
        "name": {type:String},												// 事件名
        "type": {type:Number}, 												// 事件类型
        "order": {type: mongoose.Schema.ObjectId, ref: 'order'},			// 获取积分的相关订单
        "gift": {type: mongoose.Schema.ObjectId, ref: 'rewardshopgift'}		// 积分兑换的礼品
    },
    "description": {type:String}											// 描述
});

LoyaltyPointsLogsSchema.index({"date":-1});
LoyaltyPointsLogsSchema.index({"event.type":1, "date":-1});
LoyaltyPointsLogsSchema.index({"user":1, "points":1, "date":-1});
LoyaltyPointsLogsSchema.index({"points":1, "date":-1});

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

var RewardshopGiftOrderSchema = new mongoose.Schema({
	'id': {type: String, required: true, index: true, unique: true},
	'buyerId': {type: String, required: false},
	'buyerName': {type: String},
	'buyerPhone': {type: String, required: false},
	'consigneeName': {type: String, required: false},
	'consigneePhone': {type: String, required: false},
	'consigneeAddress': {type: String, required: false},
	'deliveryType': {type: Number, default: DELIVERYTYPE.SONGHUO.id},				// 订单的配送方式
	'RSCInfo': {																	// 订单选择的自提点信息
		'RSC': {type: mongoose.Schema.ObjectId, ref: 'user'},						// 自提点的reference
		'companyName': {type: String},												// 自提点公司名
		'RSCAddress': {type: String},												// 自提点地址
		'RSCPhone': {type: String},													// 自提点联系电话
		'dateSet': {type: Date},													// 后台用户设置的日期
		'backendUser':{type: mongoose.Schema.ObjectId, ref:'backenduser'},			// 设置本条信息的后台用户
		'backendUserAccount':{type: String}											// 设置本条信息的后台用户账户
	},
	'dateCreated': {type: Date, default: Date.now},
	'gift': {
		'ref': {type: mongoose.Schema.ObjectId, ref: 'rewardshopgift', required: true},
		'id': {type: String, required: true, index: true},
		'name': {type: String, required: true},
		'category': {type: String, required: false},
		'thumbnail': {type: String},
		'points': {type: Number},
		'marketPrice': {type: Number},
		'online': {type: Number},
		'soldout': {type: Number}
	},
	'points': {type: Number},
	'deliverStatus': {type: Number, required: true}, 								// 发货状态 分为未发货、离开服务站、已收货
	'dateDelivered': {type: Date},													// 订单发货时间，订单中商品全部离开RSC的时间
	'dateCompleted': {type: Date},													// 订单完成时间
	'deliveryCode': {type: String},													// 提货码
	'dateSet': {type: Date},														// 后台用户设置的日期
	'backendUser':{type: mongoose.Schema.ObjectId, ref:'backenduser'},				// 设置本条信息的后台用户
	'backendUserAccount':{type: String}												// 设置本条信息的后台用户账户
});

RewardshopGiftOrderSchema.index({dateCreated: -1});
RewardshopGiftOrderSchema.index({buyerId: 1, dateCreated: -1});
RewardshopGiftOrderSchema.index({'RSCInfo.RSC': 1, dateCreated: -1});
RewardshopGiftOrderSchema.index({deliverStatus: 1, buyerId: 1, 'RSCInfo.RSC': 1, dateCreated: -1});

mongoose.model('rewardshopgiftorder', RewardshopGiftOrderSchema);