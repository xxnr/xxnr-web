/**
 * Created by zhouxin on 2015/11/29.
 */
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var OrderModel = require('../models').order;
var UseOrdersNumberModel = require('../models').userordersnumber;
var moment = require('moment-timezone');

// Service
OrderService = function(){};

// Method
// order type
OrderService.prototype.orderType = function (order) {
    if (order.payStatus == PAYMENTSTATUS.UNPAID && !order.isClosed) {
        return 1;
    } else if (order.payStatus == PAYMENTSTATUS.PAID && order.deliverStatus == DELIVERSTATUS.UNDELIVERED) {
        return 2;
    } else if (order.payStatus == PAYMENTSTATUS.PAID && order.deliverStatus == DELIVERSTATUS.DELIVERED && !order.confirmed) {
        return 3;
    } else if (order.confirmed) {
        return 4;
    } else {
        return 0;
    }
}

// Method
// Gets listing
OrderService.prototype.query = function(options, callback) {
	// options.search {String}
	// options.delivery {String}
	// options.type {String}
	// options.page {String or Number}
	// options.max {String or Number}
	// options.buyer

	options.page = U.parseInt(options.page) - 1;
	options.max = U.parseInt(options.max, 20);

	if (options.page < 0)
		options.page = 0;

	var take = U.parseInt(options.max);
	var skip = U.parseInt(options.page * options.max);
	var type = U.parseInt(options.type);

	var mongoOptions = {};
	
	// not Closed
	if (type === -1) {
        mongoOptions["$or"] = [{isClosed: { $ne: true }}, {payStatus: { $ne: PAYMENTSTATUS.UNPAID }}];
    }

	// unpaid
	if (type === 1) {
		mongoOptions["isClosed"] = { $ne: true };
        mongoOptions["payStatus"] = { $ne: PAYMENTSTATUS.PAID };
    }

	// paid and not delivered
	if (type === 2) {
		mongoOptions["payStatus"] = { $ne:  PAYMENTSTATUS.UNPAID };
		mongoOptions["deliverStatus"] = { $nin: [DELIVERSTATUS.DELIVERED, DELIVERSTATUS.PARTDELIVERED] };
	}
	// paid and delivered(including: part delivered)
	if (type === 3) {
		mongoOptions["deliverStatus"] = { $ne:  DELIVERSTATUS.UNDELIVERED };
		mongoOptions["confirmed"] = { $ne:  true};
	} 
	// Completed
	if (type === 4 )
		mongoOptions["confirmed"] = true;

	if (options.buyer) {
		mongoOptions["buyerId"] = options.buyer;
	}

    // Prepares searching
    if (options.search){
        mongoOptions.$text = {$search:options.search};
    }

	OrderModel.count(mongoOptions, function (err, count) {
        if(err) {
            callback(err);
            return;
        }
		OrderModel.find(mongoOptions).sort({dateCreated:-1}).skip(skip).limit(take).lean().exec(function(err, docs) {
			count = count || docs.length;
			var data = {};

			data.count = count;
			data.items = docs;

			// Gets page count
			data.pages = Math.floor(count / options.max) + (count % options.max ? 1 : 0);

			if (data.pages === 0)
				data.pages = 1;

			data.page = options.page + 1;

			// Returns data
			callback(null, data);
		});
	});
};

// Creates order (Old codes, maybe not use)
OrderService.prototype.create = function(options, callback) {
	var self = this;
	var price = 0;
	var count = 0;
    var deposit = 0;

	for (var i = 0, length = options.products.length; i < length; i++) {
		var product = options.products[i];
		price += product.price * product.count;
        deposit += (product.deposit?product.deposit:product.price) * product.count;
		count += product.count;
	}

	options.id = U.GUID(8);
	options.price = price;
	options.count = count;
    options.deposit = deposit;

	// Inserts order into the database
	var order = new OrderModel(options);
	order.save(function(err) {
		if (err) {
			callback(err);
			return;
		}
		// Returns response with order id
		callback(null, options.id);

		// add user order number
		self.addUserOrderNumber({userId:order.buyerId});

		// Writes stats
		MODULE('webcounter').increment('orders');
	});
};

OrderService.prototype.add = function(options, callback) {
	var self = this;

	options.id = options.id || U.GUID(8);
	options.paymentId = options.paymentId || U.GUID(10);
	// Inserts order into the database
    var order = new OrderModel(options);
    order.save(function(err) {
		if (err) {
			callback(err);
			return;
		}
		// Returns response with order id
		callback(null, options);

		// add user order number
		self.addUserOrderNumber({userId:order.buyerId});

		// Writes stats
		MODULE('webcounter').increment('orders');
	});

};

// Gets a specific order
OrderService.prototype.get = function(options, callback) {
	// options.id {String}

	var nor = [];

	if (options.id && options.buyer) {
		nor.push({id:{$ne:options.id}, buyerId:{$ne:options.buyer}});
	}

	if (options.id) {
		nor.push({id:{$ne:options.id}});
	}

	if (options.paymentId) {
		nor.push({paymentId:{$ne:options.paymentId}});
	}

	var mongoOptions = nor.length ? {$nor : nor} : {};

	OrderModel.findOne(mongoOptions, function(err, doc) {
		if (err) {
			callback(err);
			return;
		}
		return callback(null, doc);
	});
};

// Saves the order into the database
OrderService.prototype.save = function(options, callback) {

	// check order deliverStatus by all products
	var self = this;
	var order = self.checkDeliverStatus(options);
	// Update order in database
	OrderModel.update({id:order.id}, {$set:order}, function(err, count) {
        if (err) {
            callback(err);
            return;
        }

        if (count.n == 0) {
            callback('订单未找到');
            return;
        }

        callback(null);
        return;
	});

};

// Check order deliverStatus by all products' deliverStatus
OrderService.prototype.checkDeliverStatus = function(order) {
	if (order && order.products) {
		for (var i=0; i < order.products.length; i++) {
			var product = order.products[i];
			if (!product.deliverStatus) continue

			if (i == 0) {
				order.deliverStatus = product.deliverStatus;
				continue
			}

			if (parseInt(product.deliverStatus) === DELIVERSTATUS.UNDELIVERED) {
				if (order.deliverStatus && (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED || parseInt(order.deliverStatus) === DELIVERSTATUS.PARTDELIVERED))
					order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
				else
					order.deliverStatus = DELIVERSTATUS.UNDELIVERED;
			} else {
				if (order.deliverStatus && (parseInt(order.deliverStatus) === DELIVERSTATUS.UNDELIVERED || parseInt(order.deliverStatus) === DELIVERSTATUS.PARTDELIVERED))
					order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
				else
					order.deliverStatus = DELIVERSTATUS.DELIVERED;
			}
		}
		if (!order.deliverStatus) {
			order.deliverStatus = DELIVERSTATUS.UNDELIVERED;
		}
	}
	return order;
};

// // Removes order from DB
// OrderService.prototype.remove = function(id, callback) {

// 	// Updates database file
// 	db.remove({id:id}, function(err) {
// 		callback(err, err? 0 : 1);
// 	});
// };

// // Clears DB
// Order.addWorkflow('clear', function(error, model, options, callback) {
// 	db.clear(NOOP);
// 	callback(SUCCESS(true));
// });

// Gets some stats from orders for Dashboard
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

// Sets the payment status to paid
OrderService.prototype.paid = function(id, callback) {

	// Updates database file
	OrderModel.update({id:id}, {$set:{payStatus:PAYMENTSTATUS.PAID, datepaid:new Date()}}, function(err, count) {
        if (err) {
            callback(err);
            return;
        }

        if (count.n == 0) {
            callback('订单不存在');
            return;
        }

        callback(null);
        return;
	});
};


// Sets order to confirmed 
OrderService.prototype.confirm = function(id, callback) {

	// Updates database file
	OrderModel.update({id:id}, {$set:{confirmed: true, dateCompleted: new Date()}}, function(err, count) {
		if (err) {
            callback(err);
            return;
        }

        if (count.n == 0) {
            callback('订单不存在');
            return;
        }

        callback(null);
        return;
	});
};

// Update order payType
OrderService.prototype.updatepayType = function(options, callback) {

	if (!options.paytype) {
		callback('请提交支付方式');
		return;
	}

	// Updates order into the database
	OrderModel.update({id:options.orderid}, {$set:(options.paytype ? {payType: options.paytype} : {})}, function(err, count) {
		// Record not exists
		if (err) {
            callback(err);
            return;
        }
		if (count.n === 0) {
			callback('订单不存在', {'code':'1001','message':'订单不存在'});
			return;
		}
		callback(null, count);
		return;
	});
};

OrderService.prototype.closeOrders = function(callback) {
    OrderModel.find({isClosed:false}, function(err, orders) {
        var count = 0;
        var promises = orders.map(function(order) {
            return new Promise(function(resolve, reject) {
                if(order.payments && order.payments.length > 0) {
                    // if order has sub payments, we should loop each payment to close it.
                    var orderClosed = true;
                    var paymentsupdator = order.payments.map(function (payment) {
                        return new Promise(function (resolve, reject) {
                            var dateCreated = moment(payment.dateCreated);
                            var UTCNow = moment(new Date());
                            var dayDiff = UTCNow.diff(dateCreated, 'days');

                            if (dayDiff >= 3) {
                                // need to close this payment
                                OrderModel.update({_id: order._id, 'payments._id': payment._id}, {$set: {'payments.$.isClosed': true}}, function (err, numAffected) {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }

                                    resolve();
                                })
                            } else {
                                orderClosed = false;
                                resolve();
                            }
                        });
                    });

                    Promise.all(paymentsupdator)
                        .then(function(){
                            // if we don't have un-expired payments, we close the whole order
                            if(orderClosed){
                                OrderModel.update({_id:order._id}, {$set:{isClosed:true}}, function(err, numAffected){
                                    if(err){
                                        reject(err);
                                        return;
                                    }

                                    resolve();
                                })
                            } else {
                                resolve();
                            }
                        })
                        .catch(function(err){
                            reject(err);
                        })
                } else {
                    // if order doesn't have sub payments, it means it's an old order, we judge by order.dateCreated
                    var dateCreated = moment(order.dateCreated);
                    var UTCNow = moment(new Date());
                    var dayDiff = UTCNow.diff(dateCreated, 'days');

                    if (dayDiff >= 3) {
                        count++;
                        OrderModel.update({_id: order._id}, {$set: {isClosed: true}}, function (err, numAffected) {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve();
                        })
                    } else {
                        resolve();
                    }
                }
            })
        });

        Promise.all(promises)
            .then(function() {
                callback(null, count);
            })
            .catch(function() {
                callback(err)
            })
    })
};

// add user order number
OrderService.prototype.addUserOrderNumber = function(options, callback) {

	if (!options.userId) {
		console.error('Order addUserOrderNumber err: no userId');
		return;
	}

	UseOrdersNumberModel.findOne({userId:options.userId}, function (err, doc) {
		if (err) {
			console.error('Order addUserOrderNumber findOne err:', err);
			return;
		}
		if (doc) {
			UseOrdersNumberModel.update({userId:doc.userId}, {$inc:{numberForInviter: 1}, $set:{dateUpdated: new Date()}}, function(err, count) {
				// Record not exists
				if (err) {
		            console.error('Order addUserOrderNumber update err:', err);
		            return;
		        }
				if (count.n === 0) {
					console.error('Order addUserOrderNumber update not find doc');
				}
			});
		} else {
			var ordernumber = new UseOrdersNumberModel({userId:options.userId});
			ordernumber.save(function(err) {
				if (err) {
					console.error('Order addUserOrderNumber save err:', err);
				}
			});
		}
	});
};

module.exports = new OrderService();