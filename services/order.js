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
var DELIVERYTYPE = require('../common/defs').DELIVERYTYPE;
var converter = require('../common/converter');
var api10 = converter.api10;
var mongoose = require('mongoose');
var DeliveryCodeModel = require('../models').deliveryCode;

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

// order status for user
OrderService.prototype.orderStatus = function (order) {
	/**
	 * User order types
	 * 0	:	交易关闭
	 * 1	:	待付款
	 * 2	:	部分付款
	 * 3	:	待发货
	 * 4	:	配送中
	 * 5	:	待自提
	 * 6	:	已完成
	 * 7	:	付款待审核
	 */
	if (order.payStatus === PAYMENTSTATUS.PARTPAID) {
		if (order.pendingApprove) {
			return {type:7, value:'付款待审核'};
		} else {
			return {type:2, value:'部分付款'};
		}
	} else if (order.payStatus === PAYMENTSTATUS.PAID) {
		if (order.deliverStatus === DELIVERSTATUS.RSCRECEIVED) {
			if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
				return {type:5, value:'待自提'};
			} else if (order.deliveryType === DELIVERYTYPE.SONGHUO.id) {
				return {type:3, value:'待发货'};
			}
		} else if (order.deliverStatus === DELIVERSTATUS.PARTDELIVERED || order.deliverStatus === DELIVERSTATUS.DELIVERED) {
			if (order.confirmed) {
				return {type:6, value:'已完成'};
			} else {
				if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
					return {type:5, value:'待自提'};
				} else if (order.deliveryType === DELIVERYTYPE.SONGHUO.id) {
					return {type:4, value:'配送中'};
				}
			}
		} else {
			return {type:3, value:'待发货'};
		}
	} else {
		if (order.pendingApprove) {
			return {type:7, value:'付款待审核'};
		} else if (order.isClosed) {
			return {type:0, value:'已关闭'};
		} else {
			return {type:1, value:'待付款'};
		}
	}
};

// order status for RSC
OrderService.prototype.RSCOrderStatus = function(order){
	/**
	 * RSC order types
	 * 0    :   已关闭
	 * 1    :   待付款
	 * 2    :   付款待审核
	 * 3    :   待厂家发货
	 * 4    :   待配送(有一件商品为已到服务站，且配送方式为送货到家, 订单状态为已到服务站)
	 * 5    :   待自提(有一件商品为已到服务站，且配送方式为自提, 订单状态为已到服务站或部分发货或已发货)
	 * 6    :   配送中(有一件商品为已发货(配送中),订单状态为部分发货或者已发货)
	 * 7    :   已完成(全部商品为确认收货)
	 */
	if (order.payStatus === PAYMENTSTATUS.PARTPAID) {
		if (order.pendingApprove) {
			return {type:2, value:'付款待审核'};
		} else {
			return {type:1, value:'待付款'};
		}
	} else if (order.payStatus === PAYMENTSTATUS.PAID) {
		if (order.deliverStatus === DELIVERSTATUS.RSCRECEIVED) {
			if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
				return {type:5, value:'待自提'};
			} else if (order.deliveryType === DELIVERYTYPE.SONGHUO.id) {
				return {type:4, value:'待配送'};
			}
		} else if (order.deliverStatus === DELIVERSTATUS.PARTDELIVERED || order.deliverStatus === DELIVERSTATUS.DELIVERED) {
			if (order.confirmed) {
				return {type:7, value:'已完成'};
			} else {
				if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
					return {type:5, value:'待自提'};
				} else if (order.deliveryType === DELIVERYTYPE.SONGHUO.id) {
					return {type:6, value:'配送中'};
				}
			}
		} else {
			return {type:3, value:'待厂家发货'};
		}
	} else {
		if (order.pendingApprove) {
			return {type:2, value:'付款待审核'};
		} else if (order.isClosed) {
			return {type:0, value:'已关闭'};
		} else {
			return {type:1, value:'待付款'};
		}
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

// 拆单（定金的商品和全款的商品拆分支付），并提交订单
OrderService.prototype.splitAndaddOrder = function(options, callback) {
	var self = this;
    var orders = {};
    var orderSKUs = [];
    var payType = options.payType || PAYTYPE.ZHIFUBAO;
    var addressInfo = null;
    var RSCInfo = null;
    if (!options.user) {
    	callback("用户不存在");
        return;
    }
    if (!options.SKU_items) {
    	callback("购物车为空");
        return;
    }
    if (options.deliveryType && options.deliveryType === DELIVERYTYPE['SONGHUO'].id) {
        if (!options.address) {
            callback("请先填写收货地址");
            return;
        } else {
        	addressInfo = {
        		"consigneeName": options.address.receiptpeople,
        		"consigneePhone": options.address.receiptphone,
        		"consigneeAddress": options.address.provincename + options.address.cityname + (options.address.countyname || '') + (options.address.townname || '') + options.address.address
        	};
        }
    } else if (options.deliveryType && options.deliveryType === DELIVERYTYPE['ZITI'].id) {
        if (!options.RSC || !options.RSCId) {
            callback("请先选择自提点");
            return;
        } else {
        	RSCInfo = {RSC: options.RSCId};
        	if (!options.RSC.RSCInfo || !options.RSC.RSCInfo.companyAddress || !options.RSC.RSCInfo.companyAddress.province.name || !options.RSC.RSCInfo.companyAddress.city.name) {
        		callback("自提点地址不完整");
            	return;
            }
        	RSCInfo.RSCAddress = options.RSC.RSCInfo.companyAddress.province.name + options.RSC.RSCInfo.companyAddress.city.name;
        	if (options.RSC.RSCInfo.companyAddress.county && options.RSC.RSCInfo.companyAddress.county.name) {
        		RSCInfo.RSCAddress += options.RSC.RSCInfo.companyAddress.county.name;
        	}
        	if (options.RSC.RSCInfo.companyAddress.town && options.RSC.RSCInfo.companyAddress.town.name) {
        		RSCInfo.RSCAddress += options.RSC.RSCInfo.companyAddress.town.name;
        	}
        	if (options.RSC.RSCInfo.companyAddress.details) {
        		RSCInfo.RSCAddress += options.RSC.RSCInfo.companyAddress.details;
        	}
        	if (options.RSC.RSCInfo.companyName) {
        		RSCInfo.companyName = options.RSC.RSCInfo.companyName;
        	}
        	if (options.RSC.RSCInfo.RSCPhone) {
        		RSCInfo.RSCPhone = options.RSC.RSCInfo.RSCPhone;
        	}
        }
        if (!options.consigneeName) {
            callback("请先填写收货人姓名");
            return;
        }
        if (!options.consigneePhone) {
            callback("请先填写收货人手机号");
            return;
        }
    } else {
        callback("请先选择正确的配送方式");
        return;
    }

    for (var i=0; i<options.SKU_items.length; i++) {
        var SKU = options.SKU_items[i].SKU;
        var product = options.SKU_items[i].product;
        if (!product.online) {
        	callback('无法添加下架商品');
            return;
        }

        if (!SKU.online) {
        	callback('无法添加下架SKU');
            return;
        }

        var additions = options.SKU_items[i].additions;
        var additionPrice = 0;
        additions.forEach(function(addition) {
            additionPrice += addition.price;
            if (!addition.ref) {
                addition.ref = addition._id;
            }
            
            delete addition._id;
        });
        product = api10.convertProduct(product);
        var SKU_to_add = {
        	ref: SKU._id,
        	productId: product.id,
	        price: SKU.price.platform_price,
	        deposit: product.deposit,
	        productName: product.name,
	        name: SKU.name,
	        thumbnail: product.thumbnail,
	        count: options.SKU_items[i].count,
	        category: product.category,
	        attributes: SKU.attributes
        };
        if (additions && additions.length > 0) {
            SKU_to_add.additions = additions;
        }

        var orderKey = "full";
        if (SKU_to_add.deposit) {
        	orderKey = "deposit";
        }
        if (!orders[orderKey]) {
            orders[orderKey] = {
                "buyerName":options.user.name,
                "buyerPhone":options.user.account,
                "buyerId":options.user.id,
                "price":0,
                "deposit":0,
                "SKUs":[],
                "payType":payType,
                "payStatus":PAYMENTSTATUS.UNPAID,
                "deliverStatus":DELIVERSTATUS.UNDELIVERED
            };
            orders[orderKey].id = U.GUID(10);
            orders[orderKey].paymentId = U.GUID(10);
            if (options.deliveryType === DELIVERYTYPE['ZITI'].id) {
            	orders[orderKey].RSCInfo = RSCInfo;
            	orders[orderKey].consigneeName = options.consigneeName;
                orders[orderKey].consigneePhone = options.consigneePhone;
                orders[orderKey].deliveryType = DELIVERYTYPE['ZITI'].id;
            } else {
            	orders[orderKey].consigneeName = addressInfo.consigneeName;
                orders[orderKey].consigneePhone = addressInfo.consigneePhone;
                orders[orderKey].consigneeAddress = addressInfo.consigneeAddress;
                orders[orderKey].deliveryType = DELIVERYTYPE['SONGHUO'].id;
            }
        }
        orders[orderKey].price +=  SKU_to_add.count * (SKU_to_add.price+additionPrice);
        if (SKU_to_add.deposit) {
        	orders[orderKey].deposit += SKU_to_add.count * SKU_to_add.deposit;
        }
        orders[orderKey].SKUs.push(SKU_to_add);
    	// need remove SKUs from shopcart
        orderSKUs.push(SKU_to_add);
    }

    var keys = Object.keys(orders);
    if (orders && keys.length > 0) {
        var order1, order2;
        if (orders['deposit']) {
            orders['deposit'].duePrice = orders['deposit'].deposit;
            order1 = orders['deposit'];
            if (orders['full']) {
                orders['full'].duePrice = orders['full'].price;
                order2 = orders['full'];
            }
        } else if (orders['full']) {
            orders['full'].duePrice = orders['full'].price;
            order1 = orders['full'];
        }
        if (order1) {
            try {
                self.add(order1, function(err, data, payment) {
                    if (err || !data) {
                        if (err) console.error('Order Service splitAndaddOrder order1 add err:', err);
                        callback('保存订单出错');
                        return;
                    }
                    var resultOrders = [];
                    var result = {'id': data.id, 'price':data.price.toFixed(2), 'deposit': data.deposit.toFixed(2), 'SKUs':data.SKUs || []};
                    if (payment) {
                        result.payment = {'paymentId':payment.id, 'price':payment.price.toFixed(2)};
                    }
                    resultOrders.push(result);

                    var orderId = data.id;
                    var paymentId = payment && payment.id ? payment.id : data.paymentId;
                    var price = data.price;
                    var payPrice = payment && typeof(payment.price) != 'undefined' ? payment.price : data.deposit && data.deposit > 0 ? data.deposit : data.price;
                    var response = {'code':1000, 'id': data.id, 'paymentId':paymentId, 'price':data.price.toFixed(2), 'deposit':payPrice.toFixed(2)};
                    if (order2) {
                        self.add(order2, function(err, data, payment) {
                            if (err || !data) {
                                if (err) console.error('Order Service splitAndaddOrder order2 add err:', err);
                                callback('保存订单出错');
                                self.remove({id:orderId}, function(err) {
                                    if (err) {
                                        console.error('Order Service splitAndaddOrder remove order1 err:', err);
                                    }
                                });
                                return;
                            }
                            result = {'id': data.id, 'price':data.price.toFixed(2), 'deposit': data.deposit.toFixed(2), 'SKUs':data.SKUs || []};
                            if (payment) {
                                result.payment = {'paymentId':payment.id, 'price':payment.price.toFixed(2)};
                            }
                            resultOrders.push(result);
                            response['orders'] = resultOrders;
                            callback(null, response, orderSKUs);
                            return;
                        });
                    } else {
                        response['orders'] = resultOrders;
                        callback(null, response, orderSKUs);
                        return;
                    }
                });
            } catch (e) {
                console.error('Order Service splitAndaddOrder orders err:', e);
                callback('保存订单出错');
                return;
            }
        } else {
            console.error('Order Service splitAndaddOrder err: not get the order..');
            callback('没有要保存的订单');
            return;
        }
    } else {
        console.error('Order Service splitAndaddOrder err: no orders info..');
        callback('获取订单信息出错');
        return;
    }
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
	var RSCReceived = false;
	var newReceivedSKUs = [];
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
					if(sku.deliverStatus === DELIVERSTATUS.RSCRECEIVED){
						sku.dateRSCReceived = new Date();
						RSCReceived = true;
						newReceivedSKUs.push(sku);
					}
				}
			});
			// check order deliver status
			var order = self.checkDeliverStatus(doc);
			order.save(function(err) {
				if (err) {
					callback(err);
					return;
				}

				callback(null);
			});

			if(RSCReceived && doc.deliveryType == DELIVERYTYPE.ZITI.id && doc.payStatus == PAYMENTSTATUS.PAID){
				self.generateDeliveryCode(doc.id, newReceivedSKUs);
			}
		} else {
			callback('未查找到订单');
		}
	});
};

OrderService.prototype.generateDeliveryCode = function(orderId, newArrivedSKUs){
	DeliveryCodeModel.findOne({orderId:orderId}, function(err, deliveryCode){
		if(!err){
			var newSKUReceivedProcessor = function(){
				// TODO : notify app new SKU can be self delivered
			};

			if(!deliveryCode || !deliveryCode.code){
				// generate code and insert
				var code = U.GUID(6);
				var newDeliveryCode = new DeliveryCodeModel({orderId:orderId, code: code});
				newDeliveryCode.save(function(err){
					if(err && 11000 != err.code){
						// if error is dup key err, it means we already has one record, we don't need to insert
						console.error(err);
					}

					newSKUReceivedProcessor();
				})
			} else{
				newSKUReceivedProcessor();
			}
		}
	})
}

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
	// Updates database file
	// OrderModel.update({id:id}, {$set:{payStatus:PAYMENTSTATUS.PAID, datepaid:new Date()}}, function(err, count) {
	var values = {'payments.$.payStatus':PAYMENTSTATUS.PAID, 'payments.$.datePaid':new Date(), pendingApprove:false};
	if (options && options.price) {
		values['payments.$.price'] = parseFloat(parseFloat(options.price).toFixed(2));
	}
	if (options && options.payType) {
		values['payments.$.payType'] = options.payType;
	}
	OrderModel.update({id:id,'payments.id':paymentId}, {$set:values}, function(err, count) {
        if (err) {
            callback(err);
            return;
        }

        if (count.n == 0) {
            callback('订单不存在');
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
};


// Sets order to confirmed 
OrderService.prototype.confirm = function(orderId, SKURefs, callback) {
	if(!orderId){
		callback('orderId required');
		return;
	}

	if(!SKURefs){
		callback('SKURefs required');
		return;
	}

	OrderModel.findOne({id:orderId}, function(err, order){
		if(err){
			console.error(err);
			callback('查询订单失败');
			return;
		}

		if(!order){
			callback('未找到订单');
			return;
		}

		var allConfirmed = true;
		order.SKUs.forEach(function (sku) {
			if (SKURefs.indexOf(sku.ref.toString()) != -1) {
				// we don't check if the deliver status is delivered right now to keep it's flexibility
				// if we find strong reason to check, we can add the check here
				sku.confirmed = true;
				sku.dateConfirmed = new Date();
			}

			if(!sku.confirmed){
				allConfirmed = false;
			}
		});

		if(allConfirmed){
			order.confirmed = true;
			order.dateCompleted = new Date();
		}

		order.save(function(err) {
			if (err) {
				console.error(err);
				callback('保存订单失败');
				return;
			}

			callback(null);
		});
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

// // get payment info when payorder
// OrderService.prototype.getPayOrderPaymentInfo = function(order, payment, payPrice, options, callback) {
// 	// user input price is null, not price Regexp, <= 0, > surplus price. use surplus price
// 	if (!payPrice || !tools.isPrice(payPrice.toString()) || !parseFloat(payPrice) || parseFloat(payPrice) < 0.01 || parseFloat(payPrice) >= payment.price || !payment.thirdPartyRecorded || payment.payStatus !== PAYMENTSTATUS.PAID) {
//         callback(null, payment, payment.price);
//         var query = {'id':order.id, 'payments.id':payment.id};
//         var values = {};
//         if (options && options.payType && payment.payType) {
//         	if (payment.payType !== options.payType) {
// 	            values['payments.$.payType'] = options.payType;
// 	        }
// 	    }
// 	    if (payPrice && (!payment.payPrice || parseFloat(payment.payPrice) !== parseFloat(payPrice))) {
// 	    	values['payments.$.payPrice'] = parseFloat(payPrice);
// 	    }
// 	    if (!U.isEmpty(values)) {
//             OrderModel.update(query, {'$set':values}, function(err, count) {
//             	if (err) {
// 		            console.error('OrderService getPayOrderPaymentInfo update payment payType or payPrice err:', err);
// 		            return;
// 		        }
// 		        if (count.n == 0) {
// 		        	console.error('OrderService getPayOrderPaymentInfo update payment payType or payPrice not find the doc.');
// 		            return;
// 		        }
//             });
//         }
//         return;
//     } else {
//         // // the price of user input, and equal last time inputted value.
//         // if (payment.payPrice && parseFloat(payment.payPrice) === parseFloat(payPrice)) {
//         //     callback(null, payment, payPrice);
//         // 	return;
//         // } else {
//         // the price of user input is a new one, not in the payment and not equal last time inputted value. need push one new payment
        
//         var query = {'id':order.id, 'payments.id':payment.id};
//         var values = {'$set':{}};
//         // the payment is existed in third-party platform Or the payment is unpaid. need close this payment and push a new payment.
//         if (payment.thirdPartyRecorded || payment.payStatus !== PAYMENTSTATUS.UNPAID) {
//             values['$set'] = {'payments.$.isClosed':true};
//         } else {
// 			payment.id = U.GUID(10);
// 			payment.dateCreated = new Date();
// 			values['$set'] = {'payments.$.id':payment.id, 'payments.$.dateCreated': payment.dateCreated};
// 			if (payPrice) {
// 				payment.payPrice = parseFloat(payPrice).toFixed(2);
// 				values['$set']['payments.$.payPrice'] = payment.payPrice;
// 			}
// 			if (options && options.payType) {
// 				payment.payType = options.payType;
// 				values['$set']['payments.$.payType'] = payment.payType;
// 			}
// 	    }
            
//         OrderModel.update(query, values, function(err, count) {
//         	if (err) {
// 	            console.error('OrderService getPayOrderPaymentInfo update payment err:', err);
// 	            callback(err);
// 	            return;
// 	        }
// 	        if (count.n == 0) {
// 	        	console.error('OrderService getPayOrderPaymentInfo update payment not find the doc.');
// 	            callback('not find the doc');
// 	            return;
// 	        }

// 	        // the payment is existed in third-party platform Or the payment is unpaid. need close this payment and push a new payment.
// 	        if (payment.thirdPartyRecorded || payment.payStatus !== PAYMENTSTATUS.UNPAID) {
// 		        var pushValues = {};
// 		        var newPayment = payment;
// 	            newPayment.id = U.GUID(10);
// 	            if (payPrice) {
// 	            	newPayment.payPrice = parseFloat(payPrice).toFixed(2);
// 	            }
// 	            if (options && options.payType) {
// 	            	newPayment.payType = options.payType;
// 	            }
// 	            newPayment.payStatus = PAYMENTSTATUS.UNPAID;
// 		        pushValues['$push'] = {'payments':newPayment};
//             	OrderModel.update(query, pushValues, function(err, count) {
// 					if (err) {
// 			            console.error('OrderService getPayOrderPaymentInfo update push payment err:', err);
// 			            callback(err);
// 			            return;
// 			        }
// 			        if (count.n == 0) {
// 			        	console.error('OrderService getPayOrderPaymentInfo update push payment not find the doc.');
// 			            callback('not find the doc');
// 			            return;
// 			        }

// 			        if (!payPrice) {
// 			        	payPrice = newPayment.price;
// 			        }
// 			        callback(null, newPayment, payPrice);
// 			        return;
// 			    });
// 			} else {
// 		        if (!payPrice) {
// 		        	payPrice = payment.price;
// 		        }
// 		        callback(null, payment, payPrice);
// 			    return;
// 			}
// 	    });
//     }
// };




// get payment info when payorder
OrderService.prototype.getPayOrderPaymentInfo = function(order, payment, payPrice, options, callback) {
    var query = {'id':order.id, 'payments.id':payment.id};
    var values = {};
    // the payment is existed in third-party platform Or the payment is unpaid. need close this payment and push a new payment.
    if (payment.thirdPartyRecorded || payment.payStatus !== PAYMENTSTATUS.UNPAID) {
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
	        var newPayment = payment;
            newPayment.id = U.GUID(10);
            if (payPrice) {
            	newPayment.payPrice = parseFloat(parseFloat(payPrice).toFixed(2));
            }
            if (options && options.payType) {
            	newPayment.payType = options.payType;
            }
            newPayment.payStatus = PAYMENTSTATUS.UNPAID;
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

		        if (!payPrice) {
		        	payPrice = newPayment.price;
		        }
		        callback(null, newPayment, payPrice);
		        return;
		    });
	    });
    } else {
    	// user input price is not null, price Regexp, > 0, <  payment price. use payPrice
    	if (payPrice && tools.isPrice(payPrice.toString()) && parseFloat(payPrice) && parseFloat(parseFloat(payPrice).toFixed(2)) >= 0.01 && parseFloat(parseFloat(payPrice).toFixed(2)) < payment.price) {
    		payment.id = U.GUID(10);
			payment.dateCreated = new Date();
			values = {'payments.$.id':payment.id, 'payments.$.dateCreated': payment.dateCreated, 'payments.$.isClosed': false};
			if (payPrice) {
				payment.payPrice = parseFloat(parseFloat(payPrice).toFixed(2));
				values['payments.$.payPrice'] = parseFloat(parseFloat(payPrice).toFixed(2));
			}
			if (options && options.payType) {
				payment.payType = options.payType;
				values['payments.$.payType'] = options.payType;
			}
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

		        if (!payPrice) {
		        	payPrice = payment.price;
		        }
		        callback(null, payment, payPrice);
			    return;
		    });
    	} else {
    		callback(null, payment, payment.price);
	        if (options && options.payType) {
	        	if (!payment.payType || payment.payType !== options.payType) {
		            values['$set'] = {'payments.$.payType': options.payType};
		        }
		    }
	    	if (payment.payPrice) {
	    		values['$unset'] = {'payments.$.payPrice': ""};
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
	            });
	        }
	        return;
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
	if (order && order.SKUs && order.SKUs.length > 0) {
		for (var i=0; i < order.SKUs.length; i++) {
			var sku = order.SKUs[i];
			if (!sku.deliverStatus) continue;

			if (i == 0) {
				order.deliverStatus = sku.deliverStatus;
				continue
			}

			switch(parseInt(order.deliverStatus)){
				case DELIVERSTATUS.UNDELIVERED:
					switch(parseInt(sku.deliverStatus)){
						case DELIVERSTATUS.DELIVERED:
							order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
							break;
						case DELIVERSTATUS.RSCRECEIVED:
						case DELIVERSTATUS.UNDELIVERED:
							order.deliverStatus = sku.deliverStatus;
							break;
					}
					break;
				case DELIVERSTATUS.RSCRECEIVED:
					switch(parseInt(sku.deliverStatus)){
						case DELIVERSTATUS.DELIVERED:
							order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
							break;
						case DELIVERSTATUS.RSCRECEIVED:
						case DELIVERSTATUS.UNDELIVERED:
							order.deliverStatus = DELIVERSTATUS.RSCRECEIVED;
							break;
					}
					break;
				case DELIVERSTATUS.DELIVERED:
					switch(parseInt(sku.deliverStatus)) {
						case DELIVERSTATUS.DELIVERED:
							order.deliverStatus = DELIVERSTATUS.DELIVERED;
							break;
						case DELIVERSTATUS.RSCRECEIVED:
						case DELIVERSTATUS.UNDELIVERED:
							order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
							break;
					}
					break;
				case DELIVERSTATUS.PARTDELIVERED:
					order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
					break;
			}
		}

		if (!order.deliverStatus) {
			order.deliverStatus = DELIVERSTATUS.UNDELIVERED;
		}

		if (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED) {
			order.dateDelivered = new Date();
		}
	} else {
		if (order && order.products) {
			for (var i=0; i < order.products.length; i++) {
				var product = order.products[i];
				if (!product.deliverStatus) continue;

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
			if (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED) {
				order.dateDelivered = new Date();
			}
		}
	}
	return order;
};

// Check order pay status by all sub orders payments' pay status and get order payment
OrderService.prototype.checkPayStatus = function(options, callback) {
	var self = this;
	var returnProcessor = function(order, payment){
		callback(null, order, payment);
		if(order.payStatus === PAYMENTSTATUS.PAID && order.deliveryType === DELIVERYTYPE.ZITI.id && order.deliverStatus === DELIVERSTATUS.RSCRECEIVED){
			var newReceivedSKUs = [];
			order.SKUs.forEach(function(SKU){
				if(SKU.deliverStatus == DELIVERSTATUS.RSCRECEIVED){
					newReceivedSKUs.push(SKU);
				}
			});
			self.generateDeliveryCode(order.id, newReceivedSKUs);
		}
	};

	if (options && options.order) {
		self.checkPayStatusDetail(options.order, function(err, order, payment) {
			if (err) {
				callback(err, null, null);
				return;
			}
			returnProcessor(order, payment);
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
						returnProcessor(order, payment);
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
		var subOrdersPayments = {};					// suborder all payments
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

		    	if (!subOrdersPayments.hasOwnProperty(payment.suborderId)) {
		    		subOrdersPayments[payment.suborderId] = [];
		    	}
		    	subOrdersPayments[payment.suborderId].push(payment);
	       	}
	    }

	    // if the order is not closed, fix order paystatus
	    if (!orderClosed) {
			if (order && order.subOrders) {
				for (var i=0; i < order.subOrders.length; i++) {
					var subOrder = order.subOrders[i];
					var subOrderPayStatus = subOrder.payStatus;
					var payments = subOrdersPayments[subOrder.id] || [];
					var paidPrice = 0;
					var paidTimes = 0;
					var suborderPayment = null;
					for (var j = 0; j < payments.length; j++) {
						var payment = payments[j];

						if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
							paidPrice += payment.price;
							paidTimes += 1;
						}

						if (typeof(payment.isClosed) != 'undefined' && payment.isClosed === false && parseInt(payment.payStatus) === PAYMENTSTATUS.UNPAID)
							suborderPayment = payment;
					}

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

// OrderService.prototype.checkPayStatus = function(orderId, callback) {

// 	var self = this;
// 	OrderModel.mapReduce({
// 		map: function () {
// 			var order = this;
// 			var setValues = {};							// order need set values
// 			var pushValues = {};						// order need push values
// 			var orderPayStatus = PAYMENTSTATUS.UNPAID;	// default order paystatus
// 			var paidCount = 0;							// suborder paid count
// 			var subOrdersPayments = {};					// suborder all payments
// 			var Payments = {};							// order payments
// 			var orderClosed = false;					// default order closed status is false

// 			if (order && order.payments && order.payments.length > 0) {
// 				// if the order's all payments is closed, the order changes to closed
// 				orderClosed = true;
// 		       	for (var i = 0; i < order.payments.length; i++) {
// 			    	var payment = order.payments[i];

// 			    	// if the order's one payment is not closed, the order changes to not closed
// 			    	if (!payment.isClosed || payment.payStatus === PAYMENTSTATUS.PAID) {
// 			    		orderClosed = false;
// 			    	}

// 			    	if (!subOrdersPayments.hasOwnProperty(payment.suborderId)) {
// 			    		subOrdersPayments[payment.suborderId] = [];
// 			    	}
// 			    	subOrdersPayments[payment.suborderId].push(payment);
// 		       	}
// 		    }

// 		    // if the order is not closed, fix order paystatus
// 		    if (!orderClosed) {
// 				if (order && order.subOrders) {
// 					for (var i=0; i < order.subOrders.length; i++) {
// 						var subOrder = order.subOrders[i];
// 						var subOrderPayStatus = subOrder.payStatus;
// 						var payments = subOrdersPayments[subOrder.id] || [];
// 						var paidPrice = 0;
// 						var paidTimes = 0;
// 						var orderPayment = null;
// 						for (var j = 0; j < payments.length; j++) {
// 							var payment = payments[j];

// 							if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
// 								paidPrice += payment.price;
// 								paidTimes += 1;
// 							}

// 							if (typeof(payment.isClosed) != 'undefined' && payment.isClosed === false && parseInt(payment.payStatus) === PAYMENTSTATUS.UNPAID)
// 								orderPayment = payment;
// 						}

// 						// get suborder paystatus
// 						if (paidPrice >= subOrder.price) {
// 							subOrder.payStatus = PAYMENTSTATUS.PAID;
// 						} else {
// 							subOrder.payStatus = PAYMENTSTATUS.UNPAID;
// 							if (paidPrice > 0) {
// 								subOrder.payStatus = PAYMENTSTATUS.PARTPAID;
// 							}
// 						}
// 						// get order paystatus
// 						if (subOrder.payStatus === PAYMENTSTATUS.UNPAID || subOrder.payStatus === PAYMENTSTATUS.PARTPAID) {
// 							if (subOrder.payStatus === PAYMENTSTATUS.PARTPAID || orderPayStatus === PAYMENTSTATUS.PAID || orderPayStatus === PAYMENTSTATUS.PARTPAID)
// 								orderPayStatus = PAYMENTSTATUS.PARTPAID;
// 							else
// 								orderPayStatus = PAYMENTSTATUS.UNPAID;
// 						} else {
// 							orderPayStatus = PAYMENTSTATUS.PARTPAID;
// 							paidCount += 1;
// 						}

// 						Payments[subOrder.type] = {'payment':orderPayment,'suborder':subOrder,'payprice':(subOrder.price-paidPrice),'paidtimes':paidTimes};
// 						if (subOrder.payStatus !== subOrderPayStatus) {
// 							// set suborder paystatus
// 							var key = 'subOrders.' + i + '.payStatus';
// 							setValues[key] = subOrder.payStatus;
// 						}
// 					}
// 					if (order.subOrders.length > 0 && paidCount === order.subOrders.length) {
// 						orderPayStatus = PAYMENTSTATUS.PAID;
// 					}
// 				}

// 				// get order payment by suborder types
// 				// var typekeys = ['deposit','balance','full'];
// 				var typekeysSort = SUBORDERTYPEKEYS;
// 				var orderPayment = null;
// 				// for (var i=0; i < typekeys.length; i++) {
// 				for (var i=0; i < typekeysSort.length; i++) {
// 					var key = SUBORDERTYPE[typekeysSort[i]];
// 					if (Payments[key]) {
// 						var subOrder = Payments[key].suborder;
// 						var payment = Payments[key].payment;
// 						if (subOrder['payStatus'] !== PAYMENTSTATUS.PAID) {
// 							// create new payment
// 							if (!payment) {
// 								payment = createPayment({'paymentId':U.GUID(10),'slice':(Payments[key].paidtimes+1),'price':Payments[key].payprice,'suborderId':subOrder.id});
// 								pushValues = {'payments':payment};
// 							}
// 							if (!orderPayment) {
// 								if (order.paymentId !== payment.id) {
// 									setValues['paymentId'] = payment.id;
// 								}
// 								if (!payment.payType || order.payType !== payment.payType) {
// 									setValues['payType'] = payment.payType || PAYTYPE.ZHIFUBAO;
// 								}
// 								if (order.duePrice !== payment.price) {
// 									setValues['duePrice'] = payment.price;
// 								}
// 								orderPayment = payment;
// 								break
// 							}
// 						}
// 					}
// 				}
// 				if (orderPayStatus !== order.payStatus) {
// 					setValues['payStatus'] = orderPayStatus;
// 					if (orderPayStatus === PAYMENTSTATUS.PAID) {
// 						setValues['datePaid'] = new Date();
// 					}
// 				}
// 			}
// 			emit(order.id, {'id':order.id, 'setValues':setValues, 'pushValues':pushValues, 'orderPayment':orderPayment, 'order':order});
// 		},
// 		reduce: function (key, values) {
// 			var result = {};
// 			for (var idx = 0; idx < values.length; idx++) {
// 				var value = values[idx];
// 				result[value.id] = {'setValues':value.setValues, 'pushValues':value.pushValues, 'orderPayment':value.orderPayment, 'order':value.order};
// 			}
// 			return result;
// 		},
// 		scope: {U:U, PAYTYPE:PAYTYPE, PAYMENTSTATUS:PAYMENTSTATUS, SUBORDERTYPE:SUBORDERTYPE, SUBORDERTYPEKEYS:SUBORDERTYPEKEYS, createPayment: self.createPayment},
// 		query: {id:orderId},
// 		out: {inline:1},
// 	}, function (err, results) {
// 		if (err) {
// 			console.error('OrderService checkPayStatus map reduce err:', err);
// 			callback(err);
// 			return;
// 		}
// 		var orderPayment = null;
// 		if (results && results.length > 0) {
// 			var result = results[0].value || null;
// 			var values = {};

// 			if (result && result.orderPayment) {
// 				orderPayment = result.orderPayment;
// 			}
// 			if (result && result.setValues && !U.isEmpty(result.setValues)) {
// 				values['$set'] = result.setValues;
// 			}
// 			if (result && result.pushValues && !U.isEmpty(result.pushValues)) {
// 				values['$push'] = result.pushValues;
// 			}
// 			if (!U.isEmpty(values)) {
// 				OrderModel.findOneAndUpdate({id:orderId}, values, {new: true}, function(err, order) {
// 					if (err) {
// 			            console.error('OrderService checkPayStatus findOneAndUpdate err:', err);
// 			            callback(err);
// 			            return;
// 			        }
			
// 			        callback(null, order.toObject(), orderPayment);
// 			        return;
// 				});
// 			} else {
// 				if (result && result['order']) {
// 					callback(null, result['order'], orderPayment);
// 			        return;
// 				} else {
// 					callback(null, null, orderPayment);
// 			        return;
// 				}
// 			}
// 		} else {
// 			callback(null, null, orderPayment);
// 			return;
// 		}
// 	});
// };

// save paid log for every pay
OrderService.prototype.savePaidLog = function(paidLog, callback) {
	try {
		var orderPaidLog = new OrderPaidLog(paidLog);
	    orderPaidLog.save(function(err) {
			if (err) {
				console.error('OrderService savePaidLog save err:', err);
			}
		});
	} catch (e) {
        console.error('OrderService savePaidLog err:', e);
    }
};

OrderService.prototype.getByRSC = function(RSC, page, max, type, callback){
	if(!RSC){
		callback('RSC needed');
		return;
	}

	var query = {'RSCInfo.RSC':RSC};

	if(page<0 || !page){
		page = 0;
	}

	if(max<0 || !max){
		max = 20;
	}

	if(max>50){
		max = 50;
	}

	if(type){
		switch(type){
			case 1:		//待付款
				query.payStatus = {$in:[PAYMENTSTATUS.UNPAID, PAYMENTSTATUS.PARTPAID]};
				query.pendingApprove = {$ne:true};
				query.isClosed = false;
				break;
			case 2:		//待审核
				query.pendingApprove = true;
				break;
			case 3:		//待配送
				query.payStatus = PAYMENTSTATUS.PAID;
				query.deliverStatus = DELIVERSTATUS.RSCRECEIVED;
				query.deliveryType = DELIVERYTYPE.SONGHUO.id;
				break;
			case 4:		//待自提
				query.payStatus = PAYMENTSTATUS.PAID;
				query.deliverStatus = DELIVERSTATUS.RSCRECEIVED;
				query.deliveryType = DELIVERYTYPE.ZITI.id;
				break;
			case 5:		//已完成
				query.payStatus = PAYMENTSTATUS.PAID;
				query.deliverStatus = DELIVERSTATUS.DELIVERED;
				query.confirmed = true;
				break;
			default:
				break;
		}
	}

	OrderModel.count(query, function(err, count){
		if(err){
			console.error(err);
			callback('error query order:', err);
			return;
		}

		OrderModel.find(query)
			.select('dateCreated id consigneeName consigneePhone SKUs price subOrders payments deliveryType pendingApprove confirmed payStatus deliverStatus')
			.sort({dateCreated:-1})
			.skip(page * max)
			.limit(max)
			.lean()
			.exec(function (err, orders) {
				if (err) {
					console.error(err);
					callback('error query order');
					return;
				}

				var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
				callback(null, orders || [], count, pageCount);
			})
	});
};

OrderService.prototype.changeToPendingApprove = function(orderId, callback){
	if(!orderId){
		callback('orderId required');
		return;
	}

	OrderModel.update({id:orderId}, {$set:{pendingApprove:true}}, function(err, numAffected){
		if(err){
			console.error(err);
			callback('update order error');
			return;
		}

		if(numAffected.updated <= 0){
			callback('no order updated');
			return;
		}

		callback();
	})
};

module.exports = new OrderService();