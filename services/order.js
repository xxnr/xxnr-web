/**
 * Created by zhouxin on 2015/11/29.
 */
var tools = require('../common/tools');
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var SUBORDERTYPE = require('../common/defs').SUBORDERTYPE;
var SUBORDERTYPEKEYS = require('../common/defs').SUBORDERTYPEKEYS;
var OrderModel = require('../models').order;
var UseOrdersNumberModel = require('../models').userordersnumber;
var OrderPaidLog = require('../models').orderpaidlog;
var moment = require('moment-timezone');

// Service
var OrderService = function(){};

// Method
// order type
OrderService.prototype.orderType = function (order) {
    if (order.payStatus == PAYMENTSTATUS.PAID) {
        if (order.deliverStatus == DELIVERSTATUS.DELIVERED) {
            if (order.confirmed) {
                return 4;
            }
            return 3;
        }
        return 2;
    } else if (order.payStatus == PAYMENTSTATUS.PARTPAID) {
        return 1;
    } else {
        if (order.isClosed) {
            return 0;
        }
        return 1;
    }
};

// order status
OrderService.prototype.orderStatus = function (order) {
    if (order.payStatus == PAYMENTSTATUS.PAID) {
        if (order.deliverStatus == DELIVERSTATUS.DELIVERED) {
            if (order.confirmed) {
                return {type:6, value:"已完成"};
            }
            return {type:5, value:"已发货"};
        } else {
        	if (order.deliverStatus == DELIVERSTATUS.PARTDELIVERED) {
        		return {type:4, value:"部分发货"};
        	}
        	return {type:3, value:"待发货"};
        }
    } else if (order.payStatus == PAYMENTSTATUS.PARTPAID) {
        return {type:2, value:"部分付款"};
    } else {
        if (order.isClosed) {
            return {type:0, value:"交易关闭"};
        }
        return {type:1, value:"待付款"};
    }
};

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
	var type = null;
	if (options.type) {
		type = U.parseInt(options.type);
	}

	var mongoOptions = {};
	
	// not Closed
	if (type === -1) {
        mongoOptions["$or"] = [{isClosed: { $ne: true }}, {payStatus: { $ne: PAYMENTSTATUS.UNPAID }}];
    }

	// closed
	if (type === 0) {
		mongoOptions["isClosed"] = { $eq: true };
		mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.UNPAID };
    }
	// unpaid(including: part paid)
	if (type === 1) {
		// mongoOptions["isClosed"] = { $ne: true };
		// mongoOptions["payStatus"] = { $ne: PAYMENTSTATUS.PAID };
        mongoOptions["$or"] = [{isClosed: { $ne: true }, payStatus: { $eq: PAYMENTSTATUS.UNPAID }}, {payStatus: { $eq: PAYMENTSTATUS.PARTPAID }}];
    }
	// paid and not delivered
	if (type === 2) {
		mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.PAID };
		mongoOptions["deliverStatus"] = { $eq: DELIVERSTATUS.UNDELIVERED };
	}
	// paid and delivered(including: part delivered)
	if (type === 3) {
		mongoOptions["confirmed"] = { $ne: true };
		mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.PAID };
		mongoOptions["deliverStatus"] = { $ne: DELIVERSTATUS.UNDELIVERED };
	} 
	// Completed
	if (type === 4) {
		mongoOptions["confirmed"] = { $eq: true };
		mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.PAID };
		mongoOptions["deliverStatus"] = { $eq: DELIVERSTATUS.DELIVERED };
	}

	if (options.buyer) {
		mongoOptions["buyerId"] = options.buyer;
	}

    // Prepares searching
    if (options.search) {
        mongoOptions.$text = {$search:options.search};
    }

	OrderModel.count(mongoOptions, function (err, count) {
        if (err) {
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

// New order
OrderService.prototype.add = function(options, callback) {
	var self = this;
	options.id = options.id || U.GUID(8);
	options.paymentId = options.paymentId || U.GUID(10);
	
	// create sub orders
	options = self.createSubOrders(options);
	// create payments
	options = self.createPayments(options);
	if (options && options.payments && options.payments.length === 0) {
		callback('not create payment');
		return;
	}
	var payment = options.payments[0];
	// check order deliver status
	options = self.checkDeliverStatus(options);

	// Inserts order into the database
    var order = new OrderModel(options);
    order.save(function(err) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, order, payment);
		
		// add user order number
		self.addUserOrderNumber({userId:order.buyerId});

		// Writes stats
		MODULE('webcounter').increment('orders');
	});

};

// Gets a specific order
OrderService.prototype.get = function(options, callback) {
	// options.id {String}

	var self = this;
	var nor = [];

	if (options.id && options.buyer) {
		nor.push({id:{$ne:options.id}, buyerId:{$ne:options.buyer}});
	}

	if (options.id) {
		nor.push({id:{$ne:options.id}});
	}

	if (options.paymentId) {
		nor.push({'payments.id':{$ne:options.paymentId}});
	}

	var mongoOptions = {};

	if (nor.length > 0) {
		mongoOptions = {$nor : nor};
	} else {
		callback(null, null, null);
		return;
	}

	OrderModel.findOne(mongoOptions, function(err, doc) {
		if (err) {
			callback(err);
			return;
		}
		
		// update order paystatus
		if (doc) {
			self.checkPayStatus({order:doc}, function(err, order, payment) {
				if (err) {
					console.error('OrderService get checkPayStatus err:', err);
					callback(null, doc, null);
					return;
				} else {
					callback(null, order ? order : doc.toObject(), payment ? payment : null);
					return;
				}
			});
		} else {
			callback(null, null, null);
		}
	});
};

// Updates specific order products
OrderService.prototype.updateProducts = function(options, callback) {

	// check order deliverStatus by all products
	var self = this;
	OrderModel.findOne({ id: options.id }, function (err, doc) {
		if (err) {
			callback(err);
			return;
		}
		if (doc) {
			doc.products.forEach(function (product) {
				if (options.products[product.id] && product.deliverStatus !== options.products[product.id].deliverStatus) {
					product.deliverStatus = options.products[product.id].deliverStatus;
					product.dateSet = new Date();
					if (product.deliverStatus === DELIVERSTATUS.DELIVERED) {
						product.dateDelivered = new Date();
					}
				}
			});
			// check order deliver status
			var order = self.checkDeliverStatus(doc);
			if (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED) {
				order.dateDelivered = new Date();
			}
			order.save(function(err) {
				if (err) {
					callback(err);
					return;
				}

				callback(null);
			});
		} else {
			callback('未查找到订单');
		}
	});
};

// Updates specific order SKUs
OrderService.prototype.updateSKUs = function(options, callback) {

	// check order deliverStatus by all SKUs
	var self = this;
	OrderModel.findOne({ id: options.id }, function (err, doc) {
		if (err) {
			callback(err);
			return;
		}
		if (doc) {
			doc.SKUs.forEach(function (sku) {
				if (options.SKUs[sku.ref] && sku.deliverStatus !== options.SKUs[sku.ref].deliverStatus) {
					sku.deliverStatus = options.SKUs[sku.ref].deliverStatus;
					sku.dateSet = new Date();
					if (sku.deliverStatus === DELIVERSTATUS.DELIVERED) {
						sku.dateDelivered = new Date();
					}
				}
			});
			// check order deliver status
			var order = self.checkDeliverStatus(doc);
			if (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED) {
				order.dateDelivered = new Date();
			}
			order.save(function(err) {
				if (err) {
					callback(err);
					return;
				}

				callback(null);
			});
		} else {
			callback('未查找到订单');
		}
	});
};

// Updates specific order payments
OrderService.prototype.updatePayments = function(options, callback) {

	// check order payStatus by all payments
	var self = this;
	var needCheck = false;
	OrderModel.findOne({ id: options.id }, function (err, doc) {
		if (err) {
			callback(err);
			return;
		}
		if (doc) {
			doc.payments.forEach(function (payment) {
				if (options.payments[payment.id] && options.payments[payment.id].suborderId && options.payments[payment.id].suborderId == payment.suborderId) {
					if (payment.payStatus !== options.payments[payment.id].payStatus || payment.payType !== options.payments[payment.id].payType) {
						if (payment.payStatus !== options.payments[payment.id].payStatus) {
							payment.payStatus = options.payments[payment.id].payStatus;
							needCheck = true;
							if (options.payments[payment.id].payStatus == PAYMENTSTATUS.PAID) {
								payment.datePaid = new Date();
							}
						}
						if (payment.payType !== options.payments[payment.id].payType) {
							payment.payType = options.payments[payment.id].payType;
						}
						payment.dateSet = new Date();
						if (options.user) {
							payment.backendUser = options.user._id;
							payment.backendUserAccount = options.user.account;
						}
					}
				}
			});
			doc.save(function(err) {
				if (err) {
					callback(err);
					return;
				}

				callback(null);
				if (needCheck) {
					self.checkPayStatus({order:doc}, function(err, order, payment) {
						if (err)
							console.error('OrderService updatePayments checkPayStatus err: ' + err);
					});
				}
			});
		} else {
			callback('未查找到订单');
		}
	});
};

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
// 				console.error('error occurred while aggregating orders, and error is ' + error);
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
OrderService.prototype.paid = function(id, paymentId, options, callback) {
	var self = this;
	// OrderModel.findOne({id: id, 'payments.id': paymentId}, function(err, order) {
	// 	if (err) {
 //            callback(err);
 //            return;
 //        }
 //        if (!order) {
 //            callback('订单不存在', {refund: true, refundReason: 1});
 //            return;
 //        }

	// 	var payment = {paymentId: paymentId};
	// 	if (options && options.price) {
	// 		payment.price = parseFloat(parseFloat(options.price).toFixed(2));;
	// 	}
	// 	var result = self.judgePaymentRefund(order, payment);
	// 	if (result && result.refund) {
	// 		callback('refund payment', result);
	// 		return;
	// 	}

	// Updates database file
	// OrderModel.update({id:id}, {$set:{payStatus:PAYMENTSTATUS.PAID, datepaid:new Date()}}, function(err, count) {
	var values = {'payments.$.payStatus':PAYMENTSTATUS.PAID, 'payments.$.datePaid':new Date()};
	if (options && options.price) {
		values['payments.$.price'] = parseFloat(parseFloat(options.price).toFixed(2));
	}
	if (options && options.payType) {
		values['payments.$.payType'] = options.payType;
	}
	// find and update the payment not PAID
	var query = { id: id, payments: { $elemMatch: { id: paymentId, payStatus: { $ne: PAYMENTSTATUS.PAID } } } };
	OrderModel.update(query, {$set:values}, function(err, count) {
        if (err) {
            callback(err);
            return;
        }

        if (count.n == 0) {
            callback('订单不存在', {refund: true, refundReason: 1});
            return;
        }

        // update order paystatus
        self.checkPayStatus({id:id}, function(err, order, payment) {
        	if (err) {
	            callback(err);
	            return;
	        }
			callback(null);
		});
	});
	// });
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
	});
};

// Update order payType
OrderService.prototype.updatepayType = function(options, callback) {

	if (!options.paytype) {
		callback('请提交支付方式');
		return;
	}

	var setValue = {};
	if (options.paymentid) {
		setValue['payments.$.payType'] = options.paytype;
		setValue['payType'] = options.paytype;
	}

	// Updates order into the database
	OrderModel.update({id:options.orderid,'payments.id':options.paymentid}, {$set:setValue}, function(err, count) {
		// Record not exists
		if (err) {
            callback(err);
            return;
        }
		if (count.n == 0) {
			callback('订单不存在');
			return;
		}
		callback(null, count.n);
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
		console.error('OrderService addUserOrderNumber err: no userId');
		return;
	}

	UseOrdersNumberModel.findOne({userId:options.userId}, function (err, doc) {
		if (err) {
			console.error('OrderService addUserOrderNumber findOne err:', err);
			return;
		}
		if (doc) {
			UseOrdersNumberModel.update({userId:doc.userId}, {$inc:{numberForInviter: 1}, $set:{dateUpdated: new Date()}}, function(err, count) {
				// Record not exists
				if (err) {
		            console.error('OrderService addUserOrderNumber update err:', err);
		            return;
		        }
				if (count.n === 0) {
					console.error('OrderService addUserOrderNumber update not find doc');
				}
			});
		} else {
			var ordernumber = new UseOrdersNumberModel({userId:options.userId});
			ordernumber.save(function(err) {
				if (err) {
					console.error('OrderService addUserOrderNumber save err:', err);
				}
			});
		}
	});
};

// get payment info when payorder
OrderService.prototype.getPayOrderPaymentInfo = function(order, payment, payPrice, options, callback) {
	var self = this;
    var query = {'id':order.id, 'payments.id':payment.id};
    var values = {};
    if (payPrice && (tools.isPrice(payPrice.toString()) && parseFloat(payPrice) && parseFloat(parseFloat(payPrice).toFixed(2)) >= 0.01 && parseFloat(parseFloat(payPrice).toFixed(2)) < payment.price)) {
    // if (!payPrice || (tools.isPrice(payPrice.toString()) && parseFloat(payPrice) && parseFloat(parseFloat(payPrice).toFixed(2)) < 0.01 && parseFloat(parseFloat(payPrice).toFixed(2)) >= payment.price)) {
    	if ((!payment.payPrice && parseFloat(parseFloat(payment.price).toFixed(2)) == parseFloat(parseFloat(payPrice).toFixed(2))) || (payment.payPrice && parseFloat(parseFloat(payment.payPrice).toFixed(2)) == parseFloat(parseFloat(payPrice).toFixed(2)))) {
    		callback(null, payment, payPrice);
    		if (options && options.payType) {
	        	if (!payment.payType || payment.payType !== options.payType) {
		            values['$set'] = {'payments.$.payType': options.payType};
		        }
		    }
    		if (!payment.payPrice) {
	    		values['$set'] = {'payments.$.payPrice': parseFloat(parseFloat(payPrice).toFixed(2))};
	    	}
		    if (!U.isEmpty(values)) {
	            OrderModel.update(query, values, function(err, count) {
	            	if (err) {
			            console.error('OrderService getPayOrderPaymentInfo update payment payType or payPrice err:', err);
			            return;
			        }
			        if (count.n == 0) {
			        	console.error('OrderService getPayOrderPaymentInfo update payment payType or payPrice not find the doc.');
			            return;
			        }
			        return;
	            });
	        }
    	} else {
    		values = {'payments.$.isClosed':true};
	        OrderModel.update(query, {'$set':values}, function(err, count) {
		    	if (err) {
		            console.error('OrderService getPayOrderPaymentInfo update payment err:', err);
		            callback(err);
		            return;
		        }
		        if (count.n == 0) {
		        	console.error('OrderService getPayOrderPaymentInfo update payment not find the doc.');
		            callback('not find the doc');
		            return;
		        }
		        var pushValues = {};
	         	var paymentOption = {paymentId: U.GUID(10), slice: payment.slice, price: payment.price, suborderId: payment.suborderId};
				if (options && options.payType) {
	            	paymentOption.payType = options.payType;
	            } else {
	            	paymentOption.payType = payment.payType;
	            }
				var newPayment = self.createPayment(paymentOption);
				newPayment.payPrice = parseFloat(parseFloat(payPrice).toFixed(2));
		        pushValues['$push'] = {'payments':newPayment};
		        OrderModel.update(query, pushValues, function(err, count) {
					if (err) {
			            console.error('OrderService getPayOrderPaymentInfo update push payment err:', err);
			            callback(err);
			            return;
			        }
			        if (count.n == 0) {
			        	console.error('OrderService getPayOrderPaymentInfo update push payment not find the doc.');
			            callback('not find the doc');
			            return;
			        }
			    
			        callback(null, newPayment, payPrice);
			        return;
			    });
		    });
    	}
    } else {
    	if (!payment.payPrice || parseFloat(parseFloat(payment.payPrice).toFixed(2)) == parseFloat(parseFloat(payment.price).toFixed(2))) {
	    	callback(null, payment, payment.price);
	    	if (options && options.payType) {
	        	if (!payment.payType || payment.payType !== options.payType) {
		            values['$set'] = {'payments.$.payType': options.payType};
		        }
		    }
		    if (!U.isEmpty(values)) {
	            OrderModel.update(query, values, function(err, count) {
	            	if (err) {
			            console.error('OrderService getPayOrderPaymentInfo update payment payType or payPrice err:', err);
			            return;
			        }
			        if (count.n == 0) {
			        	console.error('OrderService getPayOrderPaymentInfo update payment payType or payPrice not find the doc.');
			            return;
			        }
			        return;
	            });
	        }
	    } else {
    		values = {'payments.$.isClosed':true};
	        OrderModel.update(query, {'$set':values}, function(err, count) {
		    	if (err) {
		            console.error('OrderService getPayOrderPaymentInfo update payment err:', err);
		            callback(err);
		            return;
		        }
		        if (count.n == 0) {
		        	console.error('OrderService getPayOrderPaymentInfo update payment not find the doc.');
		            callback('not find the doc');
		            return;
		        }
		        var pushValues = {};
				var paymentOption = {paymentId: U.GUID(10), slice: payment.slice, price: payment.price, suborderId: payment.suborderId};
				if (options && options.payType) {
	            	paymentOption.payType = options.payType;
	            } else {
	            	paymentOption.payType = payment.payType;
	            }
				var newPayment = self.createPayment(paymentOption);
		        pushValues['$push'] = {'payments':newPayment};
		        OrderModel.update(query, pushValues, function(err, count) {
					if (err) {
			            console.error('OrderService getPayOrderPaymentInfo update push payment err:', err);
			            callback(err);
			            return;
			        }
			        if (count.n == 0) {
			        	console.error('OrderService getPayOrderPaymentInfo update push payment not find the doc.');
			            callback('not find the doc');
			            return;
			        }
			    
			        callback(null, newPayment, newPayment.price);
			        return;
			    });
		    });
    	}
	}
};

// update the payment when the third-party platform recorded it
OrderService.prototype.updateThirdpartyPayment = function(paymentId) {
	var query = {'payments.id':paymentId};
	var values = {'$set':{'payments.$.thirdPartyRecorded':true}};
	OrderModel.update(query, values, function(err, count) {
		if (err) {
            console.error('OrderService updateThirdpartyPayment update payment err:', err);
        }
	});
};

// remove order(use for error handle)
OrderService.prototype.remove = function(options, callback) {
	var self = this;
	var orderId = null;
	if (options && options.id) {
		orderId = options.id;
	}
	
	if (!orderId) {
		callback('need order id');
		return;
	}
	var query = {};
	query.id = orderId;
	OrderModel.remove(query, function(err) {
		if (err) {
			callback(err);
			return;
		}

		callback(null);
	});

};


// For sub orders status //


// create sub order
OrderService.prototype.createSubOrders = function(order) {
	if (order && !order.subOrders) {
		if (order.price) {
			order.subOrders = [];
			if (order.deposit && order.deposit !== order.price) {
				var deposit = {'id':U.GUID(10), 'price':order.deposit, 'type':SUBORDERTYPE.DEPOSIT};
				var balance = {'id':U.GUID(10), 'price':parseFloat((order.price-order.deposit).toFixed(2)), 'type':SUBORDERTYPE.BALANCE};
				order.subOrders.push(deposit);
				order.subOrders.push(balance);
				order.firstsubOrder = {'id':deposit['id'],'price':deposit['price']};
			} else {
				var full = {'id':U.GUID(10), 'price':order.price, 'type':SUBORDERTYPE.FULL};
				order.subOrders.push(full);
				order.firstsubOrder = {'id':full['id'],'price':full['price']};
			}
		}
	}
	return order;
};

// create order payments
OrderService.prototype.createPayments = function(order) {
	var self = this;
	if (order) {
		if (!order.payments) {
			order.payments = [];
			var firstsubOrder = null;
			if (order.firstsubOrder && order.firstsubOrder.id && order.firstsubOrder.price)
				firstsubOrder = order.firstsubOrder;
			else {
				if (order.subOrders) {
					for (var i=0; i<order.subOrders.length; i++) {
						var subOrder = order.subOrders[i];
						if (subOrder['id'] && (subOrder['type'] === SUBORDERTYPE.DEPOSIT || subOrder['type'] === SUBORDERTYPE.FULL))
							firstsubOrder = {'id':subOrder['id'],'price':subOrder['price']};
					}
				}
			}
			if (firstsubOrder && firstsubOrder.id && firstsubOrder.price) {
				// var payment = {'id': order.paymentId || U.GUID(10), 'slice':1, 'price':firstsubOrder.price, 'suborderId':firstsubOrder.id};
				// if (order.payType)
				// 	payment.payType = order.payType;
				// order.payments.push(payment);
				var payment = self.createPayment({'paymentId':order.paymentId || U.GUID(10),'price':firstsubOrder.price,'suborderId':firstsubOrder.id,'payType':order.payType});
				if (payment)
					order.payments.push(payment);
			}
		}
	}
	return order;
};

// Create payment
/**
**	suborderPayment sub order payment input data
**	{
**	paymentId: null or new payment id (default GUID(10))
**	slice: null or this time of the suborder pay (default 1)
**	price: not null this pay price
**	suborderId: not null the suborder id
**	payType: null or this pay type (default alipay)
**	}
**/
OrderService.prototype.createPayment = function(suborderPayment) {
	var payment = null;
	if (suborderPayment && suborderPayment.suborderId && suborderPayment.price) {
		payment = {'id': suborderPayment.paymentId || U.GUID(10),
					'slice':suborderPayment.slice || 1,
					'price':suborderPayment.price,
					'suborderId':suborderPayment.suborderId,
					'payType':suborderPayment.payType || PAYTYPE.ZHIFUBAO,
					'dateCreated': new Date(),
					'payStatus': PAYMENTSTATUS.UNPAID
				};
	}
	return payment;
};

// Check order deliver status by all products or SKUs deliver status
OrderService.prototype.checkDeliverStatus = function(order) {
	var items = null;
	if (order && order.SKUs && order.SKUs.length > 0) {
		items = order.SKUs;
	} else {
		if (order && order.products && order.products.length > 0) {
			items = order.products;
		}
	}
	if (items && items.length > 0) {
		for (var i=0; i < items.length; i++) {
			var item = items[i];
			if (!item.deliverStatus) continue;

			if (i == 0) {
				order.deliverStatus = item.deliverStatus;
				continue
			}

			if (parseInt(item.deliverStatus) === DELIVERSTATUS.UNDELIVERED) {
				if (order.deliverStatus && (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED || parseInt(order.deliverStatus) === DELIVERSTATUS.PARTDELIVERED))
					order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
				else
					order.deliverStatus = DELIVERSTATUS.UNDELIVERED;
			} else {
				if (parseInt(item.deliverStatus) === DELIVERSTATUS.DELIVERED) {
					if (order.deliverStatus && (parseInt(order.deliverStatus) === DELIVERSTATUS.UNDELIVERED || parseInt(order.deliverStatus) === DELIVERSTATUS.PARTDELIVERED))
						order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
					else
						order.deliverStatus = DELIVERSTATUS.DELIVERED;
				}
			}
		}
	}
	if (!order.deliverStatus) {
		order.deliverStatus = DELIVERSTATUS.UNDELIVERED;
	}
	return order;
};

// Check order pay status by all sub orders payments' pay status and get order payment
OrderService.prototype.checkPayStatus = function(options, callback) {

	var self = this;
	if (options && options.order) {
		self.checkPayStatusDetail(options.order, function(err, order, payment) {
			if (err) {
				callback(err, null, null);
				return;
			}
			callback(null, order, payment);
			return;
		});
	} else {
		if (options && options.id) {
			OrderModel.findOne({id:options.id}, function(err, doc) {
				if (err) {
					callback(err, null, null);
					return;
				}
				if (doc) {
					self.checkPayStatusDetail(doc, function(err, order, payment) {
						if (err) {
							callback(err, null, null);
							return;
						}
						callback(null, order, payment);
						return;
					});
				} else {
					callback('not find order', null, null);
					return;
				}
			});
		} else {
			callback(null, null, null);
			return;
		}
	}
}

// Check order pay status by all sub orders payments' pay status and get order payment
OrderService.prototype.checkPayStatusDetail = function(order, callback) {
	var self = this;
	if (order) {
		var setValues = {};							// order need set values
		var pushValues = {};						// order need push values
		var orderPayStatus = PAYMENTSTATUS.UNPAID;	// default order paystatus
		var paidCount = 0;							// suborder paid count
		// var subOrdersPayments = {};					// suborder all payments
		var subOrdersInfo = {};						// suborder pay info
		var Payments = {};							// order payments
		var orderClosed = false;					// default order closed status is false
		var orderPayment = null;					// order payment info

		if (order && order.payments && order.payments.length > 0) {
			// if the order's all payments is closed, the order changes to closed
			orderClosed = true;
	       	for (var i = 0; i < order.payments.length; i++) {
		    	var payment = order.payments[i];

		    	// if the order's one payment is not closed, the order changes to not closed
		    	if (!payment.isClosed || payment.payStatus === PAYMENTSTATUS.PAID) {
		    		orderClosed = false;
		    	}

		    	// if (!subOrdersPayments.hasOwnProperty(payment.suborderId)) {
		    	// 	subOrdersPayments[payment.suborderId] = [];
		    	// }
		    	// subOrdersPayments[payment.suborderId].push(payment);
		    	if (!subOrdersInfo.hasOwnProperty(payment.suborderId)) {
		    		subOrdersInfo[payment.suborderId] = {paidPrice: 0, paidTimes: 0};
		    	}
		    	if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
					if (subOrdersInfo[payment.suborderId].paidPrice) {
						subOrdersInfo[payment.suborderId].paidPrice += payment.price;
					} else {
						subOrdersInfo[payment.suborderId].paidPrice = payment.price;
					}
					if (subOrdersInfo[payment.suborderId].paidTimes) {
						subOrdersInfo[payment.suborderId].paidTimes += 1;
					} else {
						subOrdersInfo[payment.suborderId].paidTimes = 1;
					}
				}

				if (typeof(payment.isClosed) != 'undefined' && payment.isClosed === false && parseInt(payment.payStatus) === PAYMENTSTATUS.UNPAID)
					subOrdersInfo[payment.suborderId].payment = payment;
	       	}
	    }

	    // if the order is not closed, fix order paystatus
	    if (!orderClosed) {
			if (order && order.subOrders) {
				for (var i=0; i < order.subOrders.length; i++) {
					var subOrder = order.subOrders[i];
					var subOrderPayStatus = subOrder.payStatus;
					// var payments = subOrdersPayments[subOrder.id] || [];
					var subOrderInfo = subOrdersInfo[subOrder.id] || {};
					var paidPrice = subOrderInfo.paidPrice || 0;
					var paidTimes = subOrderInfo.paidTimes || 0;
					var suborderPayment = subOrderInfo.payment || null;
					// for (var j = 0; j < payments.length; j++) {
					// 	var payment = payments[j];

					// 	if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
					// 		paidPrice += payment.price;
					// 		paidTimes += 1;
					// 	}

					// 	if (typeof(payment.isClosed) != 'undefined' && payment.isClosed === false && parseInt(payment.payStatus) === PAYMENTSTATUS.UNPAID)
					// 		suborderPayment = payment;
					// }

					// get suborder paystatus
					if (paidPrice >= parseFloat(parseFloat(subOrder.price).toFixed(2))) {
						subOrder.payStatus = PAYMENTSTATUS.PAID;
					} else {
						subOrder.payStatus = PAYMENTSTATUS.UNPAID;
						if (paidPrice > 0) {
							subOrder.payStatus = PAYMENTSTATUS.PARTPAID;
						}
					}
					// get order paystatus
					if (subOrder.payStatus === PAYMENTSTATUS.UNPAID || subOrder.payStatus === PAYMENTSTATUS.PARTPAID) {
						if (subOrder.payStatus === PAYMENTSTATUS.PARTPAID || orderPayStatus === PAYMENTSTATUS.PAID || orderPayStatus === PAYMENTSTATUS.PARTPAID)
							orderPayStatus = PAYMENTSTATUS.PARTPAID;
						else
							orderPayStatus = PAYMENTSTATUS.UNPAID;
					} else {
						orderPayStatus = PAYMENTSTATUS.PARTPAID;
						paidCount += 1;
					}

					Payments[subOrder.type] = {'payment':suborderPayment,'suborder':subOrder,'payprice':parseFloat((subOrder.price-paidPrice).toFixed(2)),'paidtimes':paidTimes};
					if (subOrder.payStatus !== subOrderPayStatus) {
						// set suborder paystatus
						var key = 'subOrders.' + i + '.payStatus';
						setValues[key] = subOrder.payStatus;
					}
				}
				if (order.subOrders.length > 0 && paidCount === order.subOrders.length) {
					orderPayStatus = PAYMENTSTATUS.PAID;
				}
			}

			// get order payment by suborder types
			var typekeysSort = SUBORDERTYPEKEYS;
			for (var i=0; i < typekeysSort.length; i++) {
				var key = SUBORDERTYPE[typekeysSort[i]];
				if (Payments[key]) {
					var subOrder = Payments[key].suborder;
					var payment = Payments[key].payment;
					if (subOrder['payStatus'] !== PAYMENTSTATUS.PAID) {
						// create new payment
						if (!payment) {
							payment = self.createPayment({'paymentId':U.GUID(10),'slice':(Payments[key].paidtimes+1),'price':Payments[key].payprice,'suborderId':subOrder.id});
							pushValues = {'payments':payment};
						}
						if (!orderPayment) {
							if (order.paymentId !== payment.id) {
								setValues['paymentId'] = payment.id;
							}
							if (!payment.payType || order.payType !== payment.payType) {
								setValues['payType'] = payment.payType || PAYTYPE.ZHIFUBAO;
							}
							if (order.duePrice !== payment.price) {
								setValues['duePrice'] = payment.price;
							}
							orderPayment = payment;
							break
						}
					}
				}
			}
			if (orderPayStatus !== order.payStatus) {
				setValues['payStatus'] = orderPayStatus;
				if (orderPayStatus === PAYMENTSTATUS.PAID) {
					setValues['datePaid'] = new Date();
				}
			}
			if (orderPayStatus === PAYMENTSTATUS.PAID) {
				if (order.duePrice !== 0) {
					setValues['duePrice'] = 0;
				}
				orderPayment = null;
			}
		}
		// update and return order info
		var values = {};
		if (setValues && !U.isEmpty(setValues)) {
			values['$set'] = setValues;
		}
		if (pushValues && !U.isEmpty(pushValues)) {
			values['$push'] = pushValues;
		}
		if (!U.isEmpty(values)) {
			OrderModel.findOneAndUpdate({id:order.id}, values, {new: true}, function(err, order) {
				if (err) {
		            console.error('OrderService checkPayStatus findOneAndUpdate err:', err);
		            callback(err);
		            return;
		        }
		
		        callback(null, order.toObject(), orderPayment);
		        return;
			});
		} else {
			callback(null, order.toObject(), orderPayment);
	        return;
		}
	} else {
		callback(null, order, null);
	    return;
	}
};

// save paid log for every pay notify
OrderService.prototype.savePaidLog = function(paidLog, callback) {
	try {
		if (paidLog && !paidLog.orderId) {
			OrderModel.findOne({'payments.id':{$ne:paidLog.paymentId}}, function(err, doc) {
				if (doc) {
					paidLog.orderId = order.id;
				}
				var orderPaidLog = new OrderPaidLog(paidLog);
			    orderPaidLog.save(function(err) {
					if (err) {
						console.error('OrderService savePaidLog save err:', err);
					}
				});
			});
		} else {
			var orderPaidLog = new OrderPaidLog(paidLog);
		    orderPaidLog.save(function(err) {
				if (err) {
					console.error('OrderService savePaidLog save err:', err);
				}
			});
		}
	} catch (e) {
        console.error('OrderService savePaidLog err:', e);
    }
};

// judge whether the order payment need refund
// params: order: the order of the payment; thePayment: {paymentId:String, price:Number}
// return: refund Object {refund:Bool, refundReason:Number}
OrderService.prototype.judgePaymentRefund = function(order, thePayment) {
	var self = this;
	if (order) {
		var theSubOrderId = null;		// the paymentId's subOrderId
		var subOrdersPayments = {};		// suborder all payments

		if (order && order.payments && order.payments.length > 0) {
	       	for (var i = 0; i < order.payments.length; i++) {
		    	var payment = order.payments[i];
		    	if (!subOrdersPayments.hasOwnProperty(payment.suborderId)) {
		    		subOrdersPayments[payment.suborderId] = 0;
		    	}
	    		if (payment.id == thePayment.paymentId) {
	    			// the payment in the order is paid
	    			if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
	    				return {refund: true, refundReason: 1};
	    			}
	    			theSubOrderId = payment.suborderId;
	    		}
	    		if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
					subOrdersPayments[payment.suborderId] += payment.price;
				}
	       	}
	    }
	    if (order && order.subOrders) {
			for (var i=0; i < order.subOrders.length; i++) {
				var subOrder = order.subOrders[i];
		    	if (theSubOrderId && subOrder.id == theSubOrderId) {
		    		var paidPrice = subOrdersPayments[theSubOrderId];
		    		if (thePayment.price) {
		    			paidPrice += parseFloat(thePayment.price);
		    		}
		       		if (parseFloat(parseFloat(paidPrice).toFixed(2)) > parseFloat(parseFloat(subOrder.price).toFixed(2))) {
		       			return {refund: true, refundReason: 2};
		       		} else {
						return {refund: false};
		       		}
		       	}
		    }
		}
	}
	return {refund: false};
};

module.exports = new OrderService();