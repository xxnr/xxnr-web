var mongoose = require('mongoose');
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;

// Schema
var schema = new mongoose.Schema({
	'id': {type:String, required:true, index: true, unique: true},
	'buyerId': {type:String, required:false},
	'buyerName': String,
	'buyerPhone': {type:String, required:false},
	'consigneeName': {type:String, required:false},
	'consigneePhone': {type:String, required:false},
	'consigneeAddress': {type:String, required:false},
	'dateCreated': {type: Date, default: Date.now},
	'price': Number,
	'deposit': Number,
	'products': {subschemaName:"OrderItem", type:								// keep this to support old apis.
		[{
			'id': {type:String, required: true, index: true},
			'price': {type:Number, required: true},
			'deposit': {type:Number, required: true},
			'name': {type:String, required: true},
			'thumbnail': String,
			'count': {type:Number, required: true},
            'category' : {type:String, required: false},
            'dateDelivered': Date,
            'dateSet': Date,														// 人为设置的日期
            'deliverStatus': {type:Number, required:true, default: DELIVERSTATUS.UNDELIVERED}
		}]},
	'SKUs':[{
		'ref':{type:mongoose.Schema.ObjectId, ref:'SKU', required:true},
		'productId':{type:String, required:true},
		'price':{type:Number, required: true},
		'deposit':{type:Number, required:true},
		'name':{type:String, required:true},
		'productName':{type:String, required:true},
		'thumbnail':String,
		'count':{type:Number, required:true},
		'category':{type:String, required:false},
		'dateDelivered':Date,
		'dateSet': Date,
		'deliverStatus':{type:Number, required:true, default:DELIVERSTATUS.UNDELIVERED},
		'attributes':[{
			'ref':{type:mongoose.Schema.ObjectId, ref:'SKUAttributes', required:true},
			'name':{type:String, required:true},
			'value':{type:String, required:true}
		}],
		'additions':[{							// the additions added to order
			'ref':{type:mongoose.Schema.ObjectId, ref:'SKUAddition', required:true},
			'name':{type:String, required:true},
			'price':{type:Number, required:true}
		}]
	}],
	'payStatus': {type:Number, required:true, default: PAYMENTSTATUS.UNPAID},		// 主订单付款状态，从子订单付款状态统计得来 分为未付款、部分付款、已付款三种，只用来做查询
	'datePaid': Date,
	'deliverStatus': {type:Number, required:true}, 									// 主订单发货状态，从商品发货状态统计得来 分为无发货、部分发货、已发货三种，只用来做查询
	'dateDelivered': Date,
	'confirmed': {type:Boolean, default:false},
	'dateCompleted': Date,
	'paymentId': {type:String, required:true},										// 最新一笔支付的ID
	'payType': {type:Number, required:true},										// 最新一笔支付的支付方式
    'isClosed': {type:Boolean, required:true, default:false},						// 本订单是否关闭
    'payments': [{
		'id': {type:String, index: true, unique: true, required: true},				// 支付ID
		// 'stage': Number,															// 分期支付 第几期
		// 'stagePrice': Number,													// 本次分期需付总金额
        'slice': {type: Number, required: true},									// 支付的第几次
        'price': {type: Number, required: true},									// 本次支付的金额
        'payPrice': {type: Number},													// 用户选择支付的金额，用来判断是否需要生成新的payment
        'suborderId': {type: String, index: true, required: true},					// 所属子订单ID
        'dateCreated': {type: Date, default: Date.now},								// 生成日期
		'datePaid': Date,															// 支付日期
		'dateSet': Date,															// 人为设置的日期
		'payStatus': {type:Number, required:true, default: PAYMENTSTATUS.UNPAID},	// 支付状态
		'payType': {type:Number, required:true},									// 支付类型
		'isClosed': {type:Boolean, required:true, default:false},					// 本支付是否关闭
		'thirdPartyRecorded': {type:Boolean, default:false},						// 本支付是否在第三方支付平台生成
	}],
	'subOrders': [{
	    'id': {type: String, index: true, unique: true, required: true},			// 子订单ID
	    'price': {type: Number, required: true},									// 子订单金额
	    'type': {type: String, required: true},										// 子订单类型 'deposit' 'balance' 'full'
	    'payStatus': {type:Number, required:true, default: PAYMENTSTATUS.UNPAID},	// 子订单支付状态，从子订单付款状态统计得来 分为未付款、部分付款、已付款三种，只用来做查询
	    'stageId': String,															// 分期付款类型ID
	}],
	'duePrice': {type:Number},														// 剩余金额
	'deliveryType':{type:Number},													// 订单的配送方式
	'RSCInfo':{																		// 订单选择的自提点信息
		'RSC':{type:mongoose.Schema.ObjectId, ref:'user'},							// 自提点的reference
		'companyName':{type:String},												// 自提点公司名
		'RSCAddress': {type:String},												// 自提点地址
		'RSCPhone': {type:String}													// 自提点联系电话
	}
});

schema.index({dateCreated: -1});
schema.index({buyerId: 1, dateCreated: -1});
schema.index({isClosed: 1, payStatus: 1, buyerId: 1, dateCreated: -1});
schema.index({payStatus: 1, deliverStatus: 1, buyerId: 1, dateCreated: -1});
schema.index({confirmed: -1, payStatus: 1, deliverStatus: 1, buyerId: 1, dateCreated: -1});
schema.index({id:"text", buyerId:"text", buyerName:"text", buyerPhone:"text", consigneeName:"text", consigneePhone:"text", paymentId:"text"});
schema.index({'RSCInfo.RSC': 1, dateCreated: -1});

// Schema
var orderPaidLogSchema = new mongoose.Schema({
	'orderId': {type:String},						// 订单ID
	'suborderId': {type:String},					// 子订单ID
	'paymentId': {type:String, required:true},		// 支付ID
	'payType': {type:Number, required:true},		// 支付类型
	'price': {type: Number, required: true},		// 支付金额
	'datePaid': {type: Date, default: Date.now},	// 交易日期
	'queryId': {type:String}						// 银联或者支付宝的交易流水号
});
            
// Model
mongoose.model('order', schema);
mongoose.model('order_paid_log', orderPaidLogSchema);
// var orderModel = mongoose.model('order', schema);


// mongoose.set('debug', true);

// orderModel.on('index', function(err){
//    if(err){
//        console.error(err);
//    }else{
//        console.info()
//    }
// })

