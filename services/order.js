/**
 * Created by zhouxin on 2015/11/29.
 */
var tools = require('../common/tools');
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var SUBORDERTYPE = require('../common/defs').SUBORDERTYPE;
var SUBORDERTYPEKEYS = require('../common/defs').SUBORDERTYPEKEYS;
var DELIVERYTYPENAME = require('../common/defs').DELIVERYTYPENAME;
var OrderModel = require('../models').order;
var UseOrdersNumberModel = require('../models').userordersnumber;
var UserModel = require('../models').user;
var OrderPaidLog = require('../models').orderpaidlog;
var moment = require('moment-timezone');
var DELIVERYTYPE = require('../common/defs').DELIVERYTYPE;
var converter = require('../common/converter');
var api10 = converter.api10;
var mongoose = require('mongoose');
var DeliveryCodeModel = require('../models').deliveryCode;
var umengConfig = require('../configuration/umeng_config');
var UMENG = require('../modules/umeng');
var PayService = require('../services/pay');
var dri = require('../common/dri');

// Service
var OrderService = function(){};

// get orderInfo object of order
OrderService.prototype.get_orderInfo = function(order) {
	var self = this;
    if (!order) {
        return null;
    }
	var deliveryType = order.deliveryType ? order.deliveryType : DELIVERYTYPE.SONGHUO.id;
    var orderInfo = {
        'totalPrice':order.price.toFixed(2)                                                     // 总价
        , 'deposit':order.deposit.toFixed(2)                                                    // 定金
        , 'dateCreated':order.dateCreated                                                       // 订单创建时间
        , 'orderStatus': self.orderStatus(order)                                         		// 订单状态
        , 'deliveryType':{type:deliveryType, value:DELIVERYTYPENAME[deliveryType]}  // 配送方式
    };
    // 支付时间
    if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
        orderInfo.datePaid = order.datePaid;
    }
    // 待收货时间
    if (order.payStatus == PAYMENTSTATUS.PAID && order.deliverStatus !== DELIVERSTATUS.UNDELIVERED && order.datePendingDeliver) {
        orderInfo.datePendingDeliver = order.datePendingDeliver;
    }
    // 全部发货时间
    if (order.deliverStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
        orderInfo.dateDelivered = order.dateDelivered;
    }
    // 完成时间
    if (order.deliverStatus == DELIVERSTATUS.RECEIVED && order.dateCompleted) {
        orderInfo.dateCompleted = order.dateCompleted;
    }
    return orderInfo;
}

// Method
// order type
OrderService.prototype.orderType = function (order) {
    if (order.payStatus == PAYMENTSTATUS.PAID) {
		if (order.deliverStatus == DELIVERSTATUS.RECEIVED){
			return 4;
		} else if (order.deliverStatus == DELIVERSTATUS.DELIVERED || order.deliverStatus == DELIVERSTATUS.PARTDELIVERED) {
            return 3;
        } else {
        	if (order.deliverStatus == DELIVERSTATUS.RSCRECEIVED && order.deliveryType === DELIVERYTYPE.ZITI.id) {
        		return 3;
        	}
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
			} else {
				return {type:3, value:'待发货'};
			}
		} else if(order.deliverStatus === DELIVERSTATUS.RECEIVED){
			return {type:6, value:'已完成'};
		} else if(order.deliverStatus === DELIVERSTATUS.PARTDELIVERED || order.deliverStatus === DELIVERSTATUS.DELIVERED) {
			if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
				return {type:5, value:'待自提'};
			} else {
				return {type:4, value:'配送中'};
			}
		} else {
			return {type:3, value:'待发货'};
		}
	} else {
		if (order.isClosed) {
			return {type:0, value:'已关闭'};
		} else if (order.pendingApprove) {
			return {type:7, value:'付款待审核'};
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
			} else {
				return {type:4, value:'待配送'};
			}
		} else if (order.deliverStatus === DELIVERSTATUS.RECEIVED){
			return {type:7, value:'已完成'};
		} else if (order.deliverStatus === DELIVERSTATUS.PARTDELIVERED || order.deliverStatus === DELIVERSTATUS.DELIVERED) {
			if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
				return {type:5, value:'待自提'};
			} else {
				return {type:6, value:'配送中'};
			}
		} else {
			return {type:3, value:'待厂家发货'};
		}
	} else {
		if (order.isClosed) {
			return {type:0, value:'已关闭'};
		} else if (order.pendingApprove) {
			return {type:2, value:'付款待审核'};
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
	if(options.max > 50)
        options.max = 50;

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
		// old
		// mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.PAID };
		// mongoOptions["deliverStatus"] = { $eq: DELIVERSTATUS.UNDELIVERED };
		// new
		mongoOptions["$or"] = [{payStatus: { $eq: PAYMENTSTATUS.PAID }, deliverStatus: { $eq: DELIVERSTATUS.UNDELIVERED }}, 
								{payStatus: { $eq: PAYMENTSTATUS.PAID }, deliveryType: { $eq: DELIVERYTYPE.SONGHUO.id }, deliverStatus: { $eq: DELIVERSTATUS.RSCRECEIVED }}];
	}
	// paid and delivered(including: part delivered)
	if (type === 3) {
		// old
		// mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.PAID };
		// mongoOptions["deliverStatus"] = { $in: [DELIVERSTATUS.PARTDELIVERED, DELIVERSTATUS.DELIVERED, DELIVERSTATUS.RSCRECEIVED] };
		// new
		mongoOptions["$or"] = [{payStatus: { $eq: PAYMENTSTATUS.PAID }, deliverStatus: { $in: [DELIVERSTATUS.PARTDELIVERED, DELIVERSTATUS.DELIVERED] }}, 
								{payStatus: { $eq: PAYMENTSTATUS.PAID }, deliveryType: { $eq: DELIVERYTYPE.ZITI.id }, deliverStatus: { $eq: DELIVERSTATUS.RSCRECEIVED }}];
	} 
	// Completed
	if (type === 4) {
		mongoOptions["payStatus"] = { $eq: PAYMENTSTATUS.PAID };
		mongoOptions["deliverStatus"] = { $eq: DELIVERSTATUS.RECEIVED };
	}
	// need deliver to RSC
	if (type === 5) {
		mongoOptions["$or"] = [{payStatus: { $eq: PAYMENTSTATUS.PARTPAID }, depositPaid: { $eq: true }, SKUs: { $elemMatch: { deliverStatus: { $eq: DELIVERSTATUS.UNDELIVERED } } }}, 
								{payStatus: { $eq: PAYMENTSTATUS.PAID }, SKUs: { $elemMatch: { deliverStatus: { $eq: DELIVERSTATUS.UNDELIVERED } } }}];
	}
	// pendingApprove
	if (type === 6) {
		mongoOptions["$or"] = [{isClosed: { $ne: true }, payStatus: { $eq: PAYMENTSTATUS.UNPAID }, pendingApprove: { $eq: true }}, 
								{payStatus: { $ne: PAYMENTSTATUS.UNPAID }, pendingApprove: { $eq: true }}];
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
		//require('../modules/webcounter').increment('orders');
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
		//require('../modules/webcounter').increment('orders');
	});

};

// 拆单（定金的商品和全款的商品拆分支付），并提交订单
/**
 * split orders because skus have deposit or full price
 * @param  {object}   options  the skus infos
 * @param  {Function} callback callback function
 * @return {null}
 */
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
    // different deliveryType different address
    if (options.deliveryType && options.deliveryType === DELIVERYTYPE['SONGHUO'].id) {
    	if (!options.addressInfo) {
            callback("请先填写收货地址");
            return;
        }
    } else if (options.deliveryType && options.deliveryType === DELIVERYTYPE['ZITI'].id) {
    	if (!options.consigneeName) {
            callback("请先填写收货人姓名");
            return;
        }
        if (!options.consigneePhone) {
            callback("请先填写收货人手机号");
            return;
        }
        if (!options.RSCInfo || !options.RSCId) {
            callback("请先选择自提点");
            return;
        }
    } else {
        callback("请先选择正确的配送方式");
        return;
    }

    // push skus to orders
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
    	
    	var result = self.pushSKUtoOrders(orders, options.SKU_items[i], options);
    	if (result && result.length >= 2) {
	    	orders = result[0];
	    	var SKU_to_add = result[1];
	    	// need remove SKUs from shopcart
	        orderSKUs.push(SKU_to_add);
	    } else {
	    	callback('保存SKU失败');
            return;
	    }
    }

    // split orders then save
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

/**
 * push SKU info into saving orders
 * @param  {object} orders   the order info
 * @param  {object} SKU_item sku item info
 * @param  {object} options  input datas
 * @return {array}  return orders and sku info [orders, sku_to_add]
 */
OrderService.prototype.pushSKUtoOrders = function (orders, SKU_item, options) {
	var SKU = SKU_item.SKU;
	var product = SKU_item.product;
	var additions = SKU_item.additions;
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
        count: SKU_item.count,
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
            "payType":options.payType || PAYTYPE.ZHIFUBAO,
            "payStatus":PAYMENTSTATUS.UNPAID,
            "deliverStatus":DELIVERSTATUS.UNDELIVERED
        };
        orders[orderKey].id = U.GUID(10);
        orders[orderKey].paymentId = U.GUID(10);
        if (options.deliveryType === DELIVERYTYPE['ZITI'].id) {
        	orders[orderKey].RSCInfo = options.RSCInfo;
        	orders[orderKey].consigneeName = options.consigneeName;
            orders[orderKey].consigneePhone = options.consigneePhone;
            orders[orderKey].deliveryType = DELIVERYTYPE['ZITI'].id;
        } else {
        	orders[orderKey].consigneeName = options.addressInfo.consigneeName;
            orders[orderKey].consigneePhone = options.addressInfo.consigneePhone;
            orders[orderKey].consigneeAddress = options.addressInfo.consigneeAddress;
            orders[orderKey].deliveryType = DELIVERYTYPE['SONGHUO'].id;
        }
    }
    orders[orderKey].price +=  SKU_to_add.count * (SKU_to_add.price+additionPrice);
    if (SKU_to_add.deposit) {
    	orders[orderKey].deposit += SKU_to_add.count * SKU_to_add.deposit;
    }
    orders[orderKey].SKUs.push(SKU_to_add);
    return [orders, SKU_to_add];
}

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

	if(options.RSC){
		nor.push({'RSCInfo.RSC':{$ne:options.RSC}});
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
					if (sku.deliverStatus === DELIVERSTATUS.DELIVERED) {
						sku.dateDelivered = new Date();
					}
					if (sku.deliverStatus === DELIVERSTATUS.RSCRECEIVED) {
						sku.dateRSCReceived = new Date();
						RSCReceived = true;
						newReceivedSKUs.push(sku);
					}
					if (sku.deliverStatus === DELIVERSTATUS.RECEIVED) {
						sku.dateConfirmed = new Date();
					}
					if (options.backendUser) {
						sku.dateSet = new Date();
						sku.backendUser = options.backendUser._id;
						sku.backendUserAccount = options.backendUser.account;
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

			if (RSCReceived) {
				if (doc.deliveryType == DELIVERYTYPE.ZITI.id && doc.payStatus == PAYMENTSTATUS.PAID) {
					self.generateDeliveryCodeandNotify(doc, newReceivedSKUs);
				} else if (doc.payStatus !== PAYMENTSTATUS.PAID) {
					// 有商品到服务站，通知用户付款
					self.umengSendCustomizedcast(umengConfig.types.pay, order.buyerId, 'user', {orderId: order.id});
				} else {
					// 已付款的配送到户订单有商品到服务站，通知RSC配送
					if (doc.deliveryType == DELIVERYTYPE.SONGHUO.id && doc.payStatus == PAYMENTSTATUS.PAID && order.RSCInfo) {
						self.umengSendCustomizedcast(umengConfig.types.delivery, order.RSCInfo.RSC, 'RSC', {orderId: order.id});
					}
				}
			}
		} else {
			callback('未查找到订单');
		}
	});
};

OrderService.prototype.generateDeliveryCodeandNotify = function(order, newArrivedSKUs, callback){
	var self = this;
	DeliveryCodeModel.findOne({orderId:order.id}, function(err, deliveryCode){
		if(!err){
			var newSKUReceivedProcessor = function(){
				if(callback){
					DeliveryCodeModel.findOne({orderId:order.id}, function(err, deliveryCode){
						if(err){
							callback(err);
							return;
						}

						callback(null, deliveryCode);
					})
				}

				if(newArrivedSKUs){
					// umeng send message to app
					// 付款完成自提订单有商品到服务站，通知用户自提
					self.umengSendCustomizedcast(umengConfig.types.ziti, order.buyerId, 'user', {orderId: order.id});
					// 付款完成自提订单有商品到服务站，通知RSC提前准备自提商品
					if (order.RSCInfo) {
						self.umengSendCustomizedcast(umengConfig.types.ziti, order.RSCInfo.RSC, 'RSC', {orderId: order.id});
					}
				}
			};

			if(!deliveryCode || !deliveryCode.code){
				// generate code and insert
				var code = tools.generateAuthCode(7);
				var newDeliveryCode = new DeliveryCodeModel({orderId:order.id, code: code});
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
							needCheck = true;
							payment.payType = options.payments[payment.id].payType;
						}

						if (options.backendUser) {
							payment.dateSet = new Date();
							payment.backendUser = options.backendUser._id;
							payment.backendUserAccount = options.backendUser.account;
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
	if (options.backendUser) {
		values['payments.$.dateSet'] = new Date();
		values['payments.$.backendUser'] = options.backendUser._id;
		values['payments.$.backendUserAccount'] = options.backendUser.account;
	}
	if (options.RSC && options.RSC._id && options.RSC.RSCInfo) {
		values['payments.$.RSC'] = options.RSC._id;
		values['payments.$.RSCCompanyName'] = options.RSC.RSCInfo.companyName;
	}
	if (options.EPOSNo) {
		values['payments.$.EPOSNo'] = options.EPOSNo;
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
};


// Sets order to confirmed 
OrderService.prototype.confirm = function(orderId, SKURefs, callback) {
	var self = this;
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

		// 是否有商品收货
		var isConfirmed = false;
		var allConfirmed = true;
		order.SKUs.forEach(function (sku) {
			if (SKURefs.indexOf(sku.ref.toString()) != -1 && sku.deliverStatus == DELIVERSTATUS.DELIVERED) {
				sku.deliverStatus = DELIVERSTATUS.RECEIVED;
				sku.dateConfirmed = new Date();
				isConfirmed = true;
			}

			if(sku.deliverStatus != DELIVERSTATUS.RECEIVED){
				allConfirmed = false;
			}
		});

		if(allConfirmed){
			order.deliverStatus = DELIVERSTATUS.RECEIVED;
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
		if (isConfirmed) {
			// 自提订单有商品被自提，通知用户
			if (order.deliveryType == DELIVERYTYPE.ZITI.id) {
				self.umengSendCustomizedcast(umengConfig.types.zitiDone, order.buyerId, 'user', {orderId: order.id});
			}
		}
	});
};

// Update order payType
OrderService.prototype.updatepayType = function(options, callback) {
	var self = this;
	
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

		// update order paystatus
		self.checkPayStatus({id:options.orderid}, function(err, order, payment) {});
	});
};

OrderService.prototype.closeOrders = function(callback) {
    OrderModel.find({isClosed:false}, function(err, orders) {
        var count = 0;
		var closedPaymentCount = 0;
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

									closedPaymentCount++;
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

									count++;
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
                        OrderModel.update({_id: order._id}, {$set: {isClosed: true}}, function (err, numAffected) {
                            if (err) {
                                reject(err);
                                return;
                            }

							count++;
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
                callback(null, count, closedPaymentCount);
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
    var setValues = {};
    var newPayment = {};
    // pay price is logical
    if (payPrice && (tools.isPrice(payPrice.toString()) && parseFloat(payPrice) && parseFloat(parseFloat(payPrice).toFixed(2)) >= 0.01 && parseFloat(parseFloat(payPrice).toFixed(2)) < payment.price)) {
    	// this payPrice must equal the payment payPrice, avoiding alipay or unionpay created the payment
    	if (payment.payPrice && parseFloat(parseFloat(payment.payPrice).toFixed(2)) == parseFloat(parseFloat(payPrice).toFixed(2))) {
    		callback(null, payment, payPrice);
    		if (options && options.payType) {
	        	if (!payment.payType || payment.payType !== options.payType) {
		            setValues = {'payments.$.payType': options.payType};
		        }
		    }
    	} else {
    		setValues = {'payments.$.isClosed':true};
         	var paymentOption = {paymentId: U.GUID(10), slice: payment.slice, price: payment.price, suborderId: payment.suborderId};
			if (options && options.payType) {
            	paymentOption.payType = options.payType;
            } else {
            	paymentOption.payType = payment.payType;
            }
			newPayment = self.createPayment(paymentOption);
			newPayment.payPrice = parseFloat(parseFloat(payPrice).toFixed(2));
    	}
    } else {
    	// the payment payPrice is null or must equal the payment price, avoiding alipay or unionpay created the payment
    	if (!payment.payPrice || parseFloat(parseFloat(payment.payPrice).toFixed(2)) == parseFloat(parseFloat(payment.price).toFixed(2))) {
	    	callback(null, payment, payment.price);
    		if (options && options.payType) {
	        	if (!payment.payType || payment.payType !== options.payType) {
		            setValues = {'payments.$.payType': options.payType};
		        }
		    }
	    } else {
    		setValues = {'payments.$.isClosed':true};
			var paymentOption = {paymentId: U.GUID(10), slice: payment.slice, price: payment.price, suborderId: payment.suborderId};
			if (options && options.payType) {
            	paymentOption.payType = options.payType;
            } else {
            	paymentOption.payType = payment.payType;
            }
			newPayment = self.createPayment(paymentOption);
    	}
	}

	// update payment
	if (!U.isEmpty(setValues)) {
		OrderModel.update(query, {'$set':setValues}, function(err, count) {
	    	if (err) {
	            console.error('OrderService getPayOrderPaymentInfo update payment payType or close payment err:', err);
	            callback(err);
	            return;
	        }
	        if (count.n == 0) {
	        	console.error('OrderService getPayOrderPaymentInfo update payment not find the doc.');
	            callback('not find the doc');
	            return;
	        }
	        
	        // push newpayment
	        if (!U.isEmpty(newPayment)) {
		        OrderModel.update(query, {'$push':{'payments':newPayment}}, function(err, count) {
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
			    
			    	if (newPayment.payPrice) {
			        	callback(null, newPayment, newPayment.payPrice);
			        } else {
			        	callback(null, newPayment, newPayment.price);
			        }
			        return;
			    });
			}
	    });
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
	var oldStatus = order.deliverStatus;
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

			switch(parseInt(order.deliverStatus)){
				case DELIVERSTATUS.UNDELIVERED:
					switch(parseInt(item.deliverStatus)){
						case DELIVERSTATUS.DELIVERED:
						case DELIVERSTATUS.RECEIVED:
							order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
							break;
						case DELIVERSTATUS.RSCRECEIVED:
						case DELIVERSTATUS.UNDELIVERED:
							order.deliverStatus = item.deliverStatus;
							break;
					}
					break;
				case DELIVERSTATUS.RSCRECEIVED:
					switch(parseInt(item.deliverStatus)){
						case DELIVERSTATUS.DELIVERED:
						case DELIVERSTATUS.RECEIVED:
							order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
							break;
						case DELIVERSTATUS.RSCRECEIVED:
						case DELIVERSTATUS.UNDELIVERED:
							order.deliverStatus = DELIVERSTATUS.RSCRECEIVED;
							break;
					}
					break;
				case DELIVERSTATUS.DELIVERED:
					switch(parseInt(item.deliverStatus)) {
						case DELIVERSTATUS.DELIVERED:
						case DELIVERSTATUS.RECEIVED:
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
				case DELIVERSTATUS.RECEIVED:
					switch(parseInt(item.deliverStatus)) {
						case DELIVERSTATUS.DELIVERED:
						case DELIVERSTATUS.RSCRECEIVED:
						case DELIVERSTATUS.UNDELIVERED:
							order.deliverStatus = DELIVERSTATUS.PARTDELIVERED;
							break;
						case DELIVERSTATUS.RECEIVED:
							order.deliverStatus = DELIVERSTATUS.RECEIVED;
							break;
					}
			}
		}

		if (!order.deliverStatus) {
			order.deliverStatus = DELIVERSTATUS.UNDELIVERED;
		}

		// 待收货时间
		// 自提订单的待收货时间
		if (order.deliveryType === DELIVERYTYPE.ZITI.id && parseInt(order.payStatus) === PAYMENTSTATUS.PAID && parseInt(order.deliverStatus) === DELIVERSTATUS.RSCRECEIVED && order.deliverStatus != oldStatus) {
			order.datePendingDeliver = new Date();
		} else {
			// 送货到户订单的待收货时间
			if (order.deliveryType === DELIVERYTYPE.SONGHUO.id && parseInt(oldStatus) !== DELIVERSTATUS.PARTDELIVERED && parseInt(oldStatus) !== DELIVERSTATUS.DELIVERED && (parseInt(order.deliverStatus) === DELIVERSTATUS.PARTDELIVERED || parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED)) {
				order.datePendingDeliver = new Date();
			}
		}

		if (parseInt(order.deliverStatus) === DELIVERSTATUS.DELIVERED && order.deliverStatus != oldStatus) {
			order.dateDelivered = new Date();
		}

		if(parseInt(order.deliverStatus) === DELIVERSTATUS.RECEIVED  && order.deliverStatus != oldStatus){
			order.dateCompleted = new Date();
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
	var returnProcessor = function(oldOrder, newOrder, payment){
		callback(null, newOrder, payment);
		if(oldOrder.payStatus !== newOrder.payStatus && newOrder.payStatus === PAYMENTSTATUS.PAID && newOrder.deliveryType === DELIVERYTYPE.ZITI.id && newOrder.deliverStatus === DELIVERSTATUS.RSCRECEIVED){
			var newReceivedSKUs = [];
			newOrder.SKUs.forEach(function(SKU){
				if(SKU.deliverStatus == DELIVERSTATUS.RSCRECEIVED){
					newReceivedSKUs.push(SKU);
				}
			});
			self.generateDeliveryCodeandNotify(newOrder, newReceivedSKUs);
		}
	};

	if (options && options.order) {
		self._checkPayStatus(options.order, function(err, order, payment) {
			if (err) {
				callback(err, null, null);
				return;
			}
			returnProcessor(options.order, order, payment);
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
					self._checkPayStatus(doc, function(err, order, payment) {
						if (err) {
							callback(err, null, null);
							return;
						}
						returnProcessor(doc, order, payment);
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

/**
 * Check order pay status by all sub orders payments' pay status and get order payment
 * @param  {Object}   order    Order info in DB
 * @param  {Function} callback callback function
 * @return {null}     the end exec callback
 */
OrderService.prototype._checkPayStatus = function(order, callback) {
	var self = this;
	if (!order) {
		callback(null, order, null);
	    return;
	}

	var setValues = {};							// order need set values
	var pushValues = {};						// order need push values
	var orderPayStatus = PAYMENTSTATUS.UNPAID;	// default order paystatus
	var paidCount = 0;							// suborder paid count
	var subOrdersInfo = {};						// suborder pay info
	var Payments = {};							// order payments
	var orderClosed = false;					// default order closed status is false
	var orderPayment = null;					// order payment info
	var closePayments = [];						// need closed payments

	// order payments 
	if (order && order.payments && order.payments.length > 0) {
		// if the order's all payments is closed, the order changes to closed
		orderClosed = true;
       	for (var i = 0; i < order.payments.length; i++) {
	    	var payment = order.payments[i];

	    	// if the order's one payment is not closed, the order changes to not closed
	    	if (!payment.isClosed || payment.payStatus === PAYMENTSTATUS.PAID) {
	    		orderClosed = false;
	    	}

	    	// subOrdersInfo init
	    	if (!subOrdersInfo.hasOwnProperty(payment.suborderId)) {
	    		subOrdersInfo[payment.suborderId] = {paidPrice: 0, paidTimes: 0, payments:[]};
	    	}
	    	// subOrdersInfo paidPrice and paidTimes
	    	if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
				subOrdersInfo[payment.suborderId].paidPrice += payment.price;
				subOrdersInfo[payment.suborderId].paidTimes += 1;
			}

			// find suborders all unpaid payments
			if (payment.isClosed === false && parseInt(payment.payStatus) === PAYMENTSTATUS.UNPAID)
				subOrdersInfo[payment.suborderId].payments.push(payment);
       	}
    }

    // if the order is not closed, fix order paystatus
    if (!orderClosed || !order.isClosed) {
		if (order && order.subOrders) {
			// get suborders key/values pay infos
			for (var i=0; i < order.subOrders.length; i++) {
				var subOrder = order.subOrders[i];
				var subOrderPayStatus = subOrder.payStatus;
				var subOrderInfo = subOrdersInfo[subOrder.id] || {};
				var paidPrice = parseFloat((subOrderInfo.paidPrice || 0).toFixed(2));
				var paidTimes = subOrderInfo.paidTimes || 0;
				var payPrice = parseFloat((subOrder.price-paidPrice).toFixed(2));
				var suborderPayment = null;

				// suborder paystatus
				if (paidPrice >= parseFloat(parseFloat(subOrder.price).toFixed(2))) {
					subOrder.payStatus = PAYMENTSTATUS.PAID;
					// order paystatus
					orderPayStatus = PAYMENTSTATUS.PARTPAID;
					paidCount += 1;
				} else {
					subOrder.payStatus = PAYMENTSTATUS.UNPAID;
					if (paidPrice > 0) {
						subOrder.payStatus = PAYMENTSTATUS.PARTPAID;
					}
					// order paystatus
					if (subOrder.payStatus === PAYMENTSTATUS.PARTPAID || orderPayStatus === PAYMENTSTATUS.PAID || orderPayStatus === PAYMENTSTATUS.PARTPAID)
						orderPayStatus = PAYMENTSTATUS.PARTPAID;
					else
						orderPayStatus = PAYMENTSTATUS.UNPAID;
				}
				
				// payment price must eq the subOrder dueprice
				if (subOrderInfo.payments) {
					for (var j = 0; j < subOrderInfo.payments.length; j++) {
					 	var payment = subOrderInfo.payments[j];
					 	
						if (!suborderPayment && payPrice == payment.price) {
							suborderPayment = payment;
						} else {
					 		closePayments.push(payment);
					 	}
					}
				}
				// suborders type key/values pay infos
				Payments[subOrder.type] = {'payment':suborderPayment,'suborder':subOrder,'payprice':payPrice,'paidtimes':paidTimes};
				// set suborder paystatus
				if (subOrder.payStatus !== subOrderPayStatus) {
					var key = 'subOrders.' + i + '.payStatus';
					setValues[key] = subOrder.payStatus;
				}
			}
			// order paystatus
			if (order.subOrders.length > 0 && paidCount === order.subOrders.length) {
				orderPayStatus = PAYMENTSTATUS.PAID;
			}
		}

		// get order payment by suborders key/values pay infos
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
					// order info
					if (!orderPayment) {
						if (order.paymentId !== payment.id) {
							setValues['paymentId'] = payment.id;
						}
						if (!payment.payType || order.payType !== payment.payType) {
							setValues['payType'] = payment.payType || PAYTYPE.ZHIFUBAO;
						}
						if ((order.duePrice).toFixed(2) !== (payment.price).toFixed(2)) {
							setValues['duePrice'] = payment.price;
						}
						orderPayment = payment;
						break
					}
				} else {
					if (!order.depositPaid && key === SUBORDERTYPE.DEPOSIT) {
						setValues['depositPaid'] = true;
					}
				}
			}
		}
		// order pay status changed
		if (orderPayStatus !== order.payStatus) {
			setValues['payStatus'] = orderPayStatus;
			if (orderPayStatus === PAYMENTSTATUS.PAID) {
				// paid date
				setValues['datePaid'] = new Date();
				// 待收货时间
				// 自提订单的待收货时间
				if (order.deliveryType === DELIVERYTYPE.ZITI.id && parseInt(order.deliverStatus) === DELIVERSTATUS.RSCRECEIVED) {
					setValues['datePendingDeliver'] = new Date();
				}
			}
		}
		// order paid
		if (orderPayStatus === PAYMENTSTATUS.PAID) {
			if (order.duePrice !== 0) {
				setValues['duePrice'] = 0;
			}
			orderPayment = null;
			pushValues = {};
		}
		// offline pay pending approve
		setValues['pendingApprove'] = U.parseBoolean(orderPayment && tools.isOfflinePayType(orderPayment.payType), false);
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
		});
	} else {
		callback(null, order.toObject(), orderPayment);
	}

	// close need closed payments
	if (closePayments && closePayments.length > 0) {
		for (var i = 0; i < closePayments.length; i++) {
			var payment = closePayments[i];
			var query = {'id':order.id, 'payments.id':payment.id};
			var values = {'payments.$.isClosed':true};
        	OrderModel.update(query, {'$set':values}, function(err, count) {
		    	if (err) {
		            console.error('OrderService checkPayStatus close payment err:', err);
		        }
		    });
		}
	}

	// 已付款的配送到户订单有商品到服务站，通知RSC配送
	if (orderPayStatus !== order.payStatus && orderPayStatus === PAYMENTSTATUS.PAID) {
		if (order.deliveryType === DELIVERYTYPE.SONGHUO.id && parseInt(order.deliverStatus) === DELIVERSTATUS.RSCRECEIVED && order.RSCInfo) {
			self.umengSendCustomizedcast(umengConfig.types.delivery, order.RSCInfo.RSC, 'RSC', {orderId: order.id});
		}
	}
};

// save paid log for every pay notify
OrderService.prototype.savePaidLog = function(paidLog, callback) {
	try {
		if (paidLog && !paidLog.orderId) {
			OrderModel.findOne({'payments.id':{$eq:paidLog.paymentId}}, function(err, doc) {
				if (doc) {
					paidLog.orderId = doc.id;
				}
				var orderPaidLog = new OrderPaidLog(paidLog);
			    orderPaidLog.save(function(err) {
					if (err) {
						console.error('OrderService savePaidLog save err:', err, paidLog);
					}
				});
			});
		} else {
			var orderPaidLog = new OrderPaidLog(paidLog);
		    orderPaidLog.save(function(err) {
				if (err) {
					console.error('OrderService savePaidLog save err:', err, paidLog);
				}
			});
		}
	} catch (e) {
        console.error('OrderService savePaidLog err:', e, paidLog);
    }
};

OrderService.prototype.getByRSC = function(RSC, page, max, type, callback, search){
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
				query.deliverStatus = {$in:[DELIVERSTATUS.RSCRECEIVED, DELIVERSTATUS.PARTDELIVERED]};
				query.deliveryType = DELIVERYTYPE.SONGHUO.id;
				break;
			case 4:		//待自提
				query.payStatus = PAYMENTSTATUS.PAID;
				query.deliverStatus = {$in:[DELIVERSTATUS.RSCRECEIVED, DELIVERSTATUS.PARTDELIVERED]};
				query.deliveryType = DELIVERYTYPE.ZITI.id;
				break;
			case 5:		//已完成
				query.payStatus = PAYMENTSTATUS.PAID;
				query.deliverStatus = DELIVERSTATUS.RECEIVED;
				break;
			default:
				break;
		}
	}

	if (search) {
		query.$or = [{buyerPhone: new RegExp('^'+search)},
			{consigneePhone: new RegExp('^'+search)},
			{id: new RegExp('^'+search)}];
	}

	OrderModel.count(query, function(err, count){
		if(err){
			console.error(err);
			callback('error query order:', err);
			return;
		}

		OrderModel.find(query)
			.select('-_id -__v -products -buyerId -buyerPhone -buyerName -payments -paymentId -payType -SKUs.backendUser -SKUs.backendUserAccount -SKUs.dateSet -SKUs._id -subOrders._id')
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

// judge whether the order payment need refund
// params: order: the order of the payment; thePayment: {paymentId:String, price:Number}
// return: refund Object {refund:Bool, refundReason:Number}
// refundReason 1:payment已经被支付（重复支付） 2:支付完payment超过了本阶段的总额 3:paymentId未找到订单
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
	    				if (payment.payType === thePayment.payType) {
	    					return {refund: false, repeatNotify: true};
	    				}
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

// pay notify
// common pay notify function
OrderService.prototype.payNotify = function(paymentId, options){
    var self = this;

    // order paid
    self.get({"paymentId": paymentId}, function(err, order) {
        // TODO: log err
        if (err) {
            console.error('OrderService payNotify OrderService get err:', err);
            dri.sendDRI('[DRI] Fail to get order in order payNotify: ', 'paymentId:'+paymentId, err);
        }
        if (order) {
            var payment = {paymentId: paymentId};
            if (options && options.price) {
                payment.price = parseFloat(parseFloat(options.price).toFixed(2));
            }
            if (options && options.payType) {
                payment.payType = options.payType;
            }
            var result = self.judgePaymentRefund(order, payment);
            if (result && result.refund) {
                var paymentOptions = options;
                paymentOptions.paymentId = paymentId;
                if (!paymentOptions.orderId) {
                    paymentOptions.orderId = order.id;
                }
                if (result.refundReason) {
                    paymentOptions.refundReason = result.refundReason;
                }
                PayService.payRefund(paymentOptions);
                self.closedSpecialPayment(order.id, paymentId, options);
            } else {
            	if (result && result.repeatNotify) {
            		console.error('OrderService payNotify repeatNotify:', paymentId, options);
            	} else {
	                if ((order.payStatus||PAYMENTSTATUS.UNPAID) == PAYMENTSTATUS.UNPAID || order.payStatus == PAYMENTSTATUS.PARTPAID) {
	                    self.paid(order.id, paymentId, options, function(err, result) {
	                        if (err) {
	                            if (result && result.refund) {
	                                // *TODO refund
	                                var paymentOptions = options;
	                                paymentOptions.paymentId = paymentId;
	                                if (!paymentOptions.orderId) {
	                                    paymentOptions.orderId = order.id;
	                                }
	                                if (result.refundReason) {
	                                    paymentOptions.refundReason = result.refundReason;
	                                }
	                                PayService.payRefund(paymentOptions);
	                            } else {
	                                console.error('OrderService payNotify OrderService paid err:', err);
	                                // if err happen
	                                // send sms to dri
	                                var idsStr = 'orderId:' + order.id + ' paymentId:' + paymentId;
	                                dri.sendDRI('[DRI] Fail to update order in order payNotify: ', idsStr, err);
	                            }
	                        }
	                    }); // SchemaBuilderEntity.prototype.save = function(model, helper, callback, skip)
	                }
	            }
            }
        } else {
            // not find order by paymentId
            // refund or other methods
            var paymentOptions = options;
            paymentOptions.paymentId = paymentId;
            paymentOptions.refundReason = 3;
            PayService.payRefund(paymentOptions);
        }
    });

    // pay success log
    var payLog = options;
    payLog.paymentId = paymentId;
    self.savePaidLog(payLog);
};

// Sets the payment status to closed (the special bug, the one payment pay more than the price), payment 一次支付就超额了
OrderService.prototype.closedSpecialPayment = function(id, paymentId, options) {
	var self = this;

	// find and update the payment not PAID
	var query = { id: id, payments: { $elemMatch: { id: paymentId, payStatus: { $eq: PAYMENTSTATUS.UNPAID }, isClosed: false } } };
	var date = new Date();
	var values = {'payments.$.isClosed':true, 'payments.$.specialClosed':true, 'payments.$.dateSpecialClosed':date};
	if (options.backendUser) {
		values['payments.$.dateSet'] = date;
		values['payments.$.backendUser'] = options.backendUser._id;
		values['payments.$.backendUserAccount'] = options.backendUser.account;
	}
	if (options.RSC && options.RSC._id && options.RSC.RSCInfo) {
		values['payments.$.RSC'] = options.RSC._id;
		values['payments.$.RSCCompanyName'] = options.RSC.RSCInfo.companyName;
	}
	
	OrderModel.update(query, {$set:values}, function(err, count) {
        if (err) {
            console.error('OrderService closedSpecialPayment update err:', err, 'paymentId: '+paymentId, options);
            return;
        }

        if (count.n > 0) {
            console.error('OrderService closedSpecialPayment updated:', 'paymentId: '+paymentId, options);
        }
        return;
	});
};

OrderService.prototype.getPaymentInOrder = function (order, paymentId) {
	if(tools.isArray(order.payments)) {
		for (var i = 0; i < order.payments.length; i++) {
			var payment = order.payments[i];
			if (payment.id == paymentId) {
				return payment;
			}
		}
	}

	return null;
};

OrderService.prototype.updateRSCInfo = function(orderId, RSCInfo, callback) {
	if(!orderId){
		callback('orderId required');
		return;
	}

	if(!RSCInfo){
		callback('RSCInfo required');
		return;
	}

	OrderModel.update({id:orderId}, {$set:{RSCInfo:RSCInfo}}, function(err, numUpdated) {
		if(err){
			console.error(err);
			callback(err);
			return;
		}

		if(!numUpdated || numUpdated.updated == 0){
			callback('not updated');
			return;
		}

		callback();
	})
};

// umeng 自定义推送
OrderService.prototype.umengSendCustomizedcast = function(type, userId, userType, options) {
	if (userType == 'user') {
		UMENG.sendCustomizedcast(type, userId, userType, options);
	} else if (userType == 'RSC') {
		UserModel.findById(userId, function(err, user){
	        if(err){
	            console.error('OrderService umengSendCustomizedcast findById err:', err);
	            return;
	        }

	        if(!user) {
	            console.error('OrderService umengSendCustomizedcast findById not find user...');
	            return;
	        }

	        UMENG.sendCustomizedcast(type, user.id, userType, options);
	    });
	}
};

// Get orderInfo by id
OrderService.prototype.getById = function(id, callback) {

	if(!id) {
		callback(null, null, null);
		return;
	}

	var mongoOptions = {id: id};

	OrderModel.findOne(mongoOptions, function(err, doc) {
		if (err) {
			callback(err);
			return;
		}

		if (doc) {
			callback(null, doc.toObject());
			return;
		} else {
			callback(null, null);
		}
	});
};

OrderService.prototype.pendingDeliverToRSC = function(order){
    return (order.payStatus == PAYMENTSTATUS.PAID || (order.payStatus == PAYMENTSTATUS.PARTPAID && order.depositPaid)) && order.deliverStatus != DELIVERSTATUS.DELIVERED;
};

module.exports = new OrderService();