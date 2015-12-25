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
	'dateCompleted': Date,
	'datePaid': Date,
	'dateDelivered': Date,
	'price': Number,
	'deposit': Number,
	'products': {subschemaName:"OrderItem", type:
		[{
			'id': {type:String, required: true, index: true},
			'price': {type:Number, required: true},
			'deposit': {type:Number, required: true},
			'name': {type:String, required: true},
			'thumbnail': String,
			'count': {type:Number, required: true},
            'category' : {type:String, required: false},
            'dateDelivered': Date,
            'deliverStatus': {type:Number, required:true, default: DELIVERSTATUS.UNDELIVERED}
		}], required: true},
	'payStatus': {type:Number, required:true},
	'payType': {type:Number, required:true},
	'deliverStatus': {type:Number, required:true}, // 主订单发货状态，从商品发货状态统计得来 分为无发货、部分发货、已发货三种
	'confirmed': {type:Boolean, default:false},
	'paymentId': {type:String, required:true},
    'isClosed': {type:Boolean, required:true, default:false}
});

schema.index({dateCreated: -1});
schema.index({id:"text", buyerId:"text", buyerName:"text", buyerPhone:"text", consigneeName:"text", consigneePhone:"text", paymentId:"text"});

// Model
mongoose.model('order', schema);


// var Order = NEWSCHEMA('Order');
// // var OrderItem = NEWSCHEMA('OrderItem');


// OrderItem.define('id', String, true);
// OrderItem.define('price', Number, true);
// OrderItem.define('deposit', Number, true);
// OrderItem.define('name', String, true);
// OrderItem.define('thumbnail', String);
// OrderItem.define('count', Number, true);
// OrderItem.define('category', String, true);

// Order.define('id', String, true);
// Order.define('buyerId', String, true);
// Order.define('buyerName', String);
// Order.define('buyerPhone', String, true);
// Order.define('consigneeName', String, true);
// Order.define('consigneePhone', String, true);
// Order.define('consigneeAddress', String, true);
// Order.define('dateCreated', Date);
// Order.define('dateCompleted', Date);
// Order.define('datePaid', Date);
// Order.define('dateDelivered', Date);
// Order.define('price', Number);
// Order.define('deposit', Number);
// Order.define('products', '[OrderItem]', true);
// Order.define('payStatus', Number, true);
// Order.define('payType', Number, true);
// Order.define('deliverStatus', Number, true);
// Order.define('confirmed', Boolean);
// Order.define('paymentId', String, true); 

// var schema = {
// 	'id': {type:String, required:true},
// 	'buyerId': {type:String, required:false},
// 	'buyerName': String,
// 	'buyerPhone': {type:String, required:false},
// 	'consigneeName': {type:String, required:false},
// 	'consigneePhone': {type:String, required:false},
// 	'consigneeAddress': {type:String, required:false},
// 	'dateCreated': Date,
// 	'dateCompleted': Date,
// 	'datePaid': Date,
// 	'dateDelivered': Date,
// 	'price': Number,
// 	'deposit': Number,
// 	'products': {subschemaName:"OrderItem", type:
// 		[{
// 			'id': {type:String, required: true},
// 			'price': {type:Number, required: true},
// 			'deposit': {type:Number, required: true},
// 			'name': {type:String, required: true},
// 			'thumbnail': String,
// 			'count': {type:Number, required: true},
//             'category' : {type:String, required: false}
// 		}], required: true},
// 	'payStatus': {type:Number, required:true},
// 	'payType': {type:Number, required:true},
// 	'deliverStatus': {type:Number, required:true},
// 	'confirmed': Boolean,
// 	'paymentId': {type:String, required:true}
// };

// Order.DEFINE(schema);
// var db = DB('orders', schema);

// var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
// var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
// var PAYTYPE = require('../common/defs').PAYTYPE;

// // Sets default values
// Order.setDefault(function(name) {
// 	switch (name) {
// 		case 'dateCreated':
// 			return new Date();
//         case 'confirmed':
//             return false;
// 	}
// });

// // Gets listing
// Order.setQuery(function(error, options, callback) {

// 	// options.search {String}
// 	// options.delivery {String}
// 	// options.type {String}
// 	// options.page {String or Number}
// 	// options.max {String or Number}
// 	// options.buyer

// 	options.page = U.parseInt(options.page) - 1;
// 	options.max = U.parseInt(options.max, 20);

// 	// Prepares searching
// 	if (options.search)
// 		options.search = options.search.toSearch();

// 	if (options.page < 0)
// 		options.page = 0;

// 	var take = U.parseInt(options.max);
// 	var skip = U.parseInt(options.page * options.max);
// 	var type = U.parseInt(options.type);

// 	// Filtering documents
// 	var filter = function(doc) {
// 		// unpaid
// 		if (type === 1 && doc.payStatus == PAYMENTSTATUS.PAID)
// 			return;
//  		// paid and not delivered
// 		if (type === 2 && (doc.payStatus == PAYMENTSTATUS.UNPAID || doc.deliverStatus == DELIVERSTATUS.DELIVERED))
// 			return;

// 		// paid and delivered
// 		if (type === 3 && (doc.deliverStatus == DELIVERSTATUS.UNDELIVERED || doc.confirmed))
// 			return;

// 		// Completed
// 		if (type === 4 && !doc.confirmed)
// 			return;

// 		if (options.buyer && (doc.buyerId !== options.buyer))
// 			return;

// 		return doc;
// 	};

// 	// Sorting documents
// 	var sorting = function(a, b) {
// 		if (new Date(a.dateCreated) > new Date(b.dateCreated))
// 			return -1;
// 		return 1;
// 	};

// 	var mongoOptions = {};

// 	{		
// 		// unpaid
// 		if (type === 1)
// 			mongoOptions["payStatus"] = { $ne:  PAYMENTSTATUS.PAID };

//  		// paid and not delivered
// 		if (type === 2){
// 			mongoOptions["payStatus"] = { $ne:  PAYMENTSTATUS.UNPAID };
// 			mongoOptions["deliverStatus"] = { $ne:  DELIVERSTATUS.DELIVERED };
// 		}

// 		// paid and delivered
// 		if (type === 3){
// 			mongoOptions["deliverStatus"] = { $ne:  DELIVERSTATUS.UNDELIVERED };
// 			mongoOptions["confirmed"] = { $ne:  true};
// 		} 
		
// 		// Completed
// 		if (type === 4 )
// 			mongoOptions["confirmed"] = true;

// 		if (options.buyer){
// 			mongoOptions["buyerId"] = options.buyer;
// 		}
// 	}

// 	db.all(db.type == DB.MONGO_DB ? mongoOptions : filter, db.type == DB.MONGO_DB ? {orderby:{dateCreated:-1}} :sorting, function(err, docs, count) {
// 		count = count || docs.length;
// 		var data = {};

// 		data.count = count;
// 		data.items = docs;

// 		// Gets page count
// 		data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);

// 		if (data.pages === 0)
// 			data.pages = 1;

// 		data.page = options.page + 1;

// 		// Returns data
// 		callback(data);

// 	}, skip, take);
// });

// // Creates order
// Order.addWorkflow('create', function(error, model, options, callback) {

// 	var price = 0;
// 	var count = 0;
//     var deposit = 0;

// 	for (var i = 0, length = model.products.length; i < length; i++) {
// 		var product = model.products[i];
// 		price += product.price * product.count;
//         deposit += (product.deposit?product.deposit:product.price) * product.count;
// 		count += product.count;
// 	}

// 	model.id = U.GUID(8);
// 	model.price = price;
// 	model.count = count;
//  model.deposit = deposit;

// 	if (model.isnewsletter) {
// 		var newsletter = GETSCHEMA('Newsletter').create();
// 		newsletter.email = model.email;
// 		newsletter.ip = model.ip;
// 		newsletter.$save();
// 	}

// 	// Cleans unnecessary properties
// 	delete model.isnewsletter;
// 	delete model.isterms;
// 	delete model.isemail;

// 	// Inserts order into the database
// 	db.insert(model);

// 	// Returns response with order id
// 	callback(SUCCESS(true, model.id));

// 	// Writes stats
// 	MODULE('webcounter').increment('orders');

// 	// Sends email
// 	var mail = F.mail(model.email, 'Order # ' + model.id, '~mails/order', model);
// 	mail.bcc(F.config.custom.emailorderform);
// });

// Order.addWorkflow('add', function(error, model, options, callback) {
// 	model.id = model.id || U.GUID(8);
// 	model.paymentId = model.paymentId || U.GUID(10);
// 	// Inserts order into the database
//     var schema = GETSCHEMA('Order');
//     schema.make(model, function(err, order){
//         db.insert(order);
//     });

// 	// Returns response with order id
// 	callback(SUCCESS(true, model));

// 	// Writes stats
// 	MODULE('webcounter').increment('orders');

//     /*
// 	// Sends email
// 	var mail = F.mail(model.email, 'Order # ' + model.id, '~mails/order', model);
// 	mail.bcc(F.config.custom.emailorderform); */
// });

// // Gets a specific order
// Order.setGet(function(error, model, options, callback) {

// 	// options.id {String}

// 	var filter = function(doc) {
// 		if (options.id && options.buyer && doc.id !== options.id && doc.buyerId !== options.buyer)
// 			return;
// 		if (options.id && doc.id !== options.id)
// 			return;
// 		if (options.paymentId && doc.paymentId !== options.paymentId)
// 			return;
// 		return doc;
// 	};

// 	var nor = [];

// 	if (options.id && options.buyer){
// 		nor.push({id:{$ne:options.id}, buyerId:{$ne:options.buyer}});
// 	}

// 	if (options.id){
// 		nor.push({id:{$ne:options.id}});
// 	}

// 	if (options.paymentId){
// 		nor.push({paymentId:{$ne:options.paymentId}});
// 	}

// 	var mongoOptions = nor.length ? {$nor : nor} : {};

// 	db.one(db.type == DB.MONGO_DB ? mongoOptions : filter, function(err, doc) {
// 		if (doc)
// 			return callback(doc);
// 		error.push('error-404-order');
// 		callback();
// 	});
// });

// // Saves the order into the database
// Order.setSave(function(error, model, options, callback) {

// 	var isemail = model.isemail;

// 	// Cleans unnecessary properties
// 	delete model.isnewsletter;
// 	delete model.isterms;
// 	delete model.isemail;

// //	if (model.datecompleted)
// //		model.datecompleted = model.datecompleted.format();
// //	else if (model.iscompleted && !model.datecompleted)
// //		model.datecompleted = (new Date()).format();
// //
// //	if (model.datecreated)
// //		model.datecreated = model.datecreated.format();
// //
// //	if (model.ispaid && !model.datepaid)
// //		model.datepaid = (new Date()).format();

// 	var updater = function(doc) {
// 		if (doc.id !== model.id)
// 			return doc;
// 		return model;
// 	};

// 	// Update order in database
// 	db.update(db.type == DB.MONGO_DB ? {query:{id:model.id}, operator:{$set:model}} : updater, function() {
// 		// Returns response
// 		callback(SUCCESS(true));
// 	});

// 	if (!isemail)
// 		return;

// 	// Sends email
// 	var mail = F.mail(model.email, 'Order (update) # ' + model.id, '~mails/order-status', model);
// 	mail.bcc(F.config.custom.emailorderform);
// });

// // Removes order from DB
// Order.setRemove(function(error, id, callback) {

// 	// Filter for removing
// 	var updater = function(doc) {
// 		if (doc.id !== id)
// 			return doc;
// 		return null;
// 	};

// 	// Updates database file
// 	db.type == DB.MONGO_DB ? db.remove({id:id}, function(err){
// 			callback(err, err? 0 : 1);
// 		}) : db.update(updater, callback) ;
// });

// // Clears DB
// Order.addWorkflow('clear', function(error, model, options, callback) {
// 	db.clear(NOOP);
// 	callback(SUCCESS(true));
// });

// // Gets some stats from orders for Dashboard
// Order.addOperation('dashboard', function(error, model, options, callback) {

// 	var stats = {};

// 	stats.completed = 0;
// 	stats.completed_price = 0;
// 	stats.pending = 0;
// 	stats.pending_price = 0;

// 	var prepare = function(doc) {

// 		if (doc.iscompleted) {
// 			stats.completed++;
// 			stats.completed_price += doc.price;
// 		} else {
// 			stats.pending++;
// 			stats.pending_price += doc.price;
// 		}

// 		// Saves memory
// 		return 0;
// 	};

// 	if(db.type === DB.MONGO_DB ){
// 		db.aggregate([ { 
// 		    $group: { 
// 		        _id: "$iscompleted",
//            		totalAmount: { $sum: "$price" },
//            		count: { $sum: 1 }
// 		    } 
// 		} ], function(error, result){
// 			if(error){
// 				console.log('error occurred while aggregating orders, and error is ' + error);
// 				result = [];
// 			}

// 			for(var i=0; i<result.length; i++){
// 				if(result[i]._id){
// 					stats.completed += result[i].count;
// 					stats.completed_price += result[i].totalAmount;
// 				}
// 				else{
// 					stats.pending += result[i].count;
// 					stats.pending_price += result[i].totalAmount;
// 				}
// 			}

// 			callback(stats);
// 		} );
// 	}
// 	else {
// 		db.all(prepare, function(err) {
// 			// Returns stats for dashboard
// 			callback(stats);
// 		});
// 	}
// });

// // Sets the payment status to paid
// Order.addWorkflow('paid', function(error, model, id, callback) {

// 	// Filter for update
// 	var updater = function(doc) {
// 		if (doc.id !== id)
// 			return doc;
// 		doc.payStatus = PAYMENTSTATUS.PAID;
// 		doc.datePaid = new Date();
// 		return doc;
// 	};

// 	// Updates database file
// 	db.update(db.type === DB.MONGO_DB ? { query:{id:id}, operator:{$set:{payStatus:PAYMENTSTATUS.PAID, datePaid:new Date()}} } : updater, callback);
// });


// // Sets order to confirmed 
// Order.addWorkflow('confirm', function(error, model, id, callback) {

// 	// Filter for update
// 	var updater = function(doc) {
// 		if (doc.id !== id)
// 			return doc;
// 		doc.confirmed = true;
// 		doc.dateCompleted = (new Date()).format();
// 		return doc;
// 	};

// 	// Updates database file
// 	db.update( db.type === DB.MONGO_DB ? 
// 		{ query:{id:id}, operator:{$set:{confirmed:true, dateCompleted : (new Date()).format()}}} : updater, function(err) {
// 		callback(SUCCESS(true));
// 	});
// });

// // Update order payType
// Order.addWorkflow('updatepayType', function(error, model, options, callback) {

// 	var count = 0;
// 	// Filter for update
// 	var updater = function(doc) {
// 		if (options.orderid && doc.id === options.orderid) {
//             if (options.paytype)
//                 doc.payType = options.paytype;
			
// 			count++;
// 			return doc;
// 		}
// 		return doc;
// 	};

// 	// Updates order into the database
// 	db.update(db.type === DB.MONGO_DB ? 
// 		{ query:{id:options.orderid}, operator:{$set:(options.paytype ? {payType: options.paytype} : {})}} : updater, function(err, updatedCount) {
// 			count = count || updatedCount || 0;
// 		// Record not exists
// 		if (count === 0) {
// 			error.push('order not in');
// 			callback({'code':'1001','message':'订单不存在'});
// 			return;
// 		} else {
// 			callback(count);
// 			return;
// 		}
// 	});
// });
