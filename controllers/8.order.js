
// API for e.g. Mobile application
// This API uses the website
var services = require('../services');
var UserService = services.user;
var OrderService = services.order;
var UseraddressService = services.useraddress;
var ProductService = services.product;
var CartService = services.cart;
var DeliveryCodeService = services.deliveryCode;

exports.install = function() {
	//F.route('/api/v2.0/order/getOderList',         getOrders, ['post', 'get'], ['isLoggedIn']);
	//F.route('/api/v2.0/order/getAppOrderList',     api10_getOrders, ['post', 'get'], ['isLoggedIn']);
	//F.route('/api/v2.0/order/addOrder',            addOrder, ['post', 'get'], ['isLoggedIn', 'throttle']);
    //F.route('/api/v2.0/order/getOrderDetails',     api10_getOrderDetails, ['post', 'get'], ['isLoggedIn']);
    //F.route('/api/v2.0/order/updateOrderPaytype',  updateOrderPaytype, ['post', 'get'], ['isLoggedIn']);
    //F.route('/api/v2.0/order/confirmeOrder',       confirmOrder, ['post', 'get'], ['isLoggedIn']);

	// v1.0
	//F.route('/app/order/getOderList',              api10_getOrders, ['post', 'get'], ['isLoggedIn']);
	//fix api// F.route('/app/order/addOrder',                 addOrder, ['post', 'get'], ['isLoggedIn']);
    //fix api// F.route('/app/order/confirmReceipt',           confirmOrder, ['post', 'get'], ['isLoggedIn']);

    // v2.1
    //F.route('/api/v2.1/order/addOrder',            addOrderBySKU, ['post'], ['isLoggedIn', 'throttle']);

    // v2.2
    //F.route('/api/v2.2/order/confirmSKUReceived',   process_confirm_SKU_received, ['post'], ['isLoggedIn']);
    //F.route('/api/v2.2/order/getDeliveryCode',      json_get_delivery_code,     ['get'],    ['isLoggedIn']);
};

var converter = require('../common/converter');
var api10 = converter.api10;
var calculatePrice = require('../common/calculator').calculatePrice;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var tools = require('../common/tools');
var DELIVERYTYPE = require('../common/defs').DELIVERYTYPE;
var DELIVERYTYPENAME = require('../common/defs').DELIVERYTYPENAME;

function getOdersList(req, callback) {
	var page = req.data['page'];
    var max = req.data['max'];
	var type = req.data['type'] || req.data['typeValue'];//订单类型  所有的订单
    var userId = req.data['userId'];
    var locationUserId = req.data['locationUserId'];

    if (!userId) {
        callback();
        return;
    }

    var options = {};
	options.buyer = userId;
	options.page = page;
	options.type = type;
    options.max = max;

	OrderService.query(options, function(err, data) {
        if (err) {
            console.error('Order getOrdersList err:', err);
            callback();
            return;
        }

        callback(data);
	});
}

exports.getOrders = function(req, res, next) {
    var type = req.data['type'] || req.data['typeValue'] || null;

    getOdersList(req, function(data, error) {
        if (data) {
            var items = data.items;
            var length = items.length;
            var arr = new Array(length);
            for (var i = 0; i < length; i++) {
                var order = items[i];
                // var item = items[i];
                var typeValue = type;
                var item = {
                    'id':order.id,
                    'paymentId':order.paymentId,
                    'price':order.price,
                    'deposit':order.deposit,
                    'consigneeAddress':order.consigneeAddress,
                    'consigneeName':order.consigneeName,
                    'consigneePhone':order.consigneePhone,
                    'payType':order.payType,
                    'products':order.products || [],
                    'SKUs':order.SKUs || [],
                    'duePrice':typeof(order.duePrice) != 'undefined' ? parseFloat(order.duePrice.toFixed(2)) : null,
                    'deliveryType':order.deliveryType,
                    'payStatus':order.payStatus,
                    'deliverStatus':order.deliverStatus,
                    'RSCInfo':order.RSCInfo
                };
                // 订单合成状态
                if (!typeValue) {
                    item.typeValue = OrderService.orderType(order);
                } else {
                    item.typeValue = typeValue;
                }

                var orderInfo = OrderService.get_orderInfo(order);
                item.order = orderInfo;
                // 创建时间
                item.dateCreated = order.dateCreated;
                // 支付时间
                if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
                    item.datePaid = order.datePaid;
                }
                // 待收货时间
                if (order.payStatus == PAYMENTSTATUS.PAID && order.deliverStatus !== DELIVERSTATUS.UNDELIVERED && order.datePendingDeliver) {
                    item.datePendingDeliver = order.datePendingDeliver;
                }
                // 全部发货时间
                if (order.deliverStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
                    item.dateDelivered = order.dateDelivered;
                }
                // 完成时间
                if (order.deliverStatus == DELIVERSTATUS.RECEIVED && order.dateCompleted) {
                    item.dateCompleted = order.dateCompleted;
                }
                arr[i] = item;
            }

            data.items = arr;
            res.respond(data);
        } else {
            res.respond({'code':'1001','message':'没有找到订单'});
        }
    });
};

exports.api10_getOrders = function(req, res, next) {
    var type = req.data['type'] || req.data['typeValue'] || null;

    getOdersList(req, function(data, error) {
        var result = {};

        if (data) {
            var items = data.items;
            var length = items.length;
            var arr = new Array(length);
            for (var i = 0; i < length; i++) {
                var item = items[i];
                var typeValue = type;
                // 订单合成状态
                if (!typeValue) {
                    typeValue = OrderService.orderType(item);
                }

                var orderInfo = OrderService.get_orderInfo(item);
                arr[i] = {
                    'typeValue':typeValue,
                    'orderId':item.id,
                    'orderNo':item.paymentId,
                    'totalPrice':item.price.toFixed(2),
                    'goodsCount':item.products ? item.products.length : 0,
                    'address':item.consigneeAddress,
                    'recipientName':item.consigneeName,
                    'recipientPhone':item.consigneePhone,
                    'typeLable':'',
                    // for old app pay price
                    'deposit': typeof(item.duePrice) != 'undefined' ? item.duePrice.toFixed(2) : item.deposit.toFixed(2),
                    'payType':item.payType,
                    'order': orderInfo,
                    'products': item.products || [],
                    'SKUs':item.SKUs || [],
                    'subOrders': item.subOrders || [],
                    'duePrice': typeof(item.duePrice) != 'undefined' ? item.duePrice.toFixed(2) : null,
                    'RSCInfo': item.RSCInfo
                };

                if(arr[i].SKUs && arr[i].SKUs.length > 0){
                    // contains SKUs, need to convert into products to support old app
                    arr[i].SKUs.forEach(function(SKU){
                        var product = {id:SKU.productId, price:SKU.price.toFixed(2), deposit:SKU.deposit.toFixed(2), name:SKU.productName, thumbnail:SKU.thumbnail, count:SKU.count, category:SKU.category, dateDelivered:SKU.dateDelivered, dateSet:SKU.dateSet, deliverStatus:SKU.deliverStatus};
                        arr[i].products.push(product);
                    });
                    arr[i].goodsCount = arr[i].products ? arr[i].products.length : 0;
                }
                
            }
            result = {'code':'1000','message':'success','datas':{"total":data.count,"rows":arr,"page":data.page,"pages":data.pages}};
        } else {
            result = {'code':'1001','message':'没有找到订单'};
        }
        res.respond(result);
    });
};

exports.addOrder = function(req, res, next){
	var data = req.data;
	var userId = data['userId'];
    var shopCartId = data.shopCartId;
    var addressId = data['addressId'];
    var products = data['products'] || [];
    var payType = data['payType'] || PAYTYPE.ZHIFUBAO;

    if(products.length>0){
        products = JSON.parse(products);
    }

    if (!shopCartId) {
        res.respond({"code":1001, "message":"请选择购物车"});
        return;
    }

    if (!addressId) {
        res.respond({"code":1001, "message":"请先填写收货地址"});
        return;
    }

	UserService.get({"userid":userId}, function(err, user) {
        if(err || !user){
            res.respond({code:1001, message:'用户不存在'});
            return;
        }

		UseraddressService.get({"id": addressId}, function(err, address) {
            if(err || !address){
                res.respond({code:1001, message:'收货地址不存在'});
                return;
            }

            CartService.checkout(shopCartId, products, function(err, cart) {
                if(err || !cart){
                    res.respond({code:1001, message:'购物车不存在'});
                    return;
                }

                if(cart.items.length==0){
                    res.respond({code:1001, message:'购物车为空'});
                    return;
                }

                // 拆单 定金的商品和全款的商品拆分支付
                var orders = {};
                var orderProducts = [];
                for(var i=0; i<cart.items.length; i++){
                    var product = api10.convertProduct(cart.items[i].product);
                    product.count = cart.items[i].count;
                    if (product.deposit) {
                        if (!orders['deposit']) {
                            orders['deposit'] = {
                                "buyerName":user.name,
                                "buyerPhone":user.account,
                                "buyerId":user.id,
                                "consigneeName":address.receiptpeople,
                                "consigneePhone":address.receiptphone,
                                "consigneeAddress":address.provincename + address.cityname + (address.countyname || '') + (address.townname || '') + address.address,
                                "price":0,
                                "deposit":0,
                                "products":[],
                                "payType":payType,
                                "payStatus":PAYMENTSTATUS.UNPAID,
                                "deliverStatus":DELIVERSTATUS.UNDELIVERED
                            };
                            orders['deposit'].id = U.GUID(10);
                            orders['deposit'].paymentId = U.GUID(10);
                        }
                        orders['deposit'].price +=  product.count * product.discountPrice;
                        orders['deposit'].deposit += product.count * product.deposit;
                        orders['deposit'].products.push(product);
                    } else {
                        if (!orders['full']) {
                            orders['full'] = {
                                "buyerName":user.name,
                                "buyerPhone":user.account,
                                "buyerId":user.id,
                                "consigneeName":address.receiptpeople,
                                "consigneePhone":address.receiptphone,
                                "consigneeAddress":address.provincename + address.cityname + (address.countyname || '') + (address.townname || '') + address.address,
                                "price":0,
                                "deposit":0,
                                "products":[],
                                "payType":payType,
                                "payStatus":PAYMENTSTATUS.UNPAID,
                                "deliverStatus":DELIVERSTATUS.UNDELIVERED
                            };
                            orders['full'].id = U.GUID(10);
                            orders['full'].paymentId = U.GUID(10);
                        }
                        orders['full'].price +=  product.count * product.discountPrice;
                        orders['full'].products.push(product);
                    }
                    orderProducts.push(product);
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
                            OrderService.add(order1, function(err, data, payment) {
                                if (err || !data) {
                                    if (err) console.error('Order addOrder order1 err:', err);
                                    var response = {"code":1001, "message":"保存订单出错"};
                                    res.respond(response);
                                    return;
                                }
                                var resultOrders = [];
                                var result = {'id': data.id, 'price':data.price.toFixed(2), 'deposit': data.deposit.toFixed(2)};
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
                                    OrderService.add(order2, function(err, data, payment) {
                                        if (err || !data) {
                                            if (err) console.error('Order addOrder order2 err:', err);
                                            res.respond({"code":1001, "message":"保存订单出错"});
                                            OrderService.remove({id:orderId}, function(err) {
                                                if (err) {
                                                    console.error('Order addOrder remove order1 err:', err);
                                                }
                                            });
                                            return;
                                        }
                                        result = {'id': data.id, 'price':data.price.toFixed(2), 'deposit': data.deposit.toFixed(2)};
                                        if (payment) {
                                            result.payment = {'paymentId':payment.id, 'price':payment.price.toFixed(2)};
                                        }
                                        resultOrders.push(result);
                                        response['orders'] = resultOrders;
                                        res.respond(response);
                                        CartService.removeItems(shopCartId, orderProducts, function(){});
                                    });
                                } else {
                                    response['orders'] = resultOrders;
                                    res.respond(response);
                                    CartService.removeItems(shopCartId, orderProducts, function(){});
                                }
                            });
                        } catch (e) {
                            console.error('Order addOrder orders err:', e);
                            res.respond({"code":1001, "message":"保存订单出错"});
                            return;
                        }
                    } else {
                        console.error('Order addOrder err: not get the order..');
                        res.respond({"code":1001, "message":"没有要保存的订单"});
                        return;
                    }
                } else {
                    console.error('Order addOrder err: no orders info..');
                    res.respond({"code":1001, "message":"获取订单信息出错"});
                    return;
                }
			});
		});
	});
};

exports.updateOrderPaytype = function(req, res, next) {
    res.respond({code:'1000', message:'success'});
};

// user confirm order
exports.confirmOrder = function(req, res, next) {
    res.respond({code:1009, message:'API retired'});
};

// get order detail
function getOrder(req, callback) {
    var buyer = req.data.userId || null;
    var orderid = req.data.orderId || null;

    if (!orderid) {
        callback();
        return;
    }

    OrderService.get({'buyer':buyer,'id':orderid}, function(err, data, returnPayment) {
        if (err) {
            console.error('Order getOrder err:', err);
            callback(err);
        } else {
            if (data) {
                if (data.subOrders) {
                    var subOrdersPayments = {}; // suborder all payments
                    if (data && data.payments && data.payments.length > 0) {
                        for (var i = 0; i < data.payments.length; i++) {
                            var payment = data.payments[i];
                            if (!subOrdersPayments.hasOwnProperty(payment.suborderId)) {
                                subOrdersPayments[payment.suborderId] = [];
                            }
                            subOrdersPayments[payment.suborderId].push(payment);
                        }
                    }
                    if (data && data.subOrders && data.subOrders.length > 0) {
                        var subOrders = [];
                        for (var i=0; i < data.subOrders.length; i++) {
                            var subOrder = data.subOrders[i];
                            var payments = subOrdersPayments[subOrder.id] || [];
                            var paidPrice = 0;
                            var resultPayments = [];
                            if (returnPayment && returnPayment.suborderId && returnPayment.suborderId == subOrder.id) {
                                data.paySubOrderType = subOrder.type;
                            }
                            for (var j = 0; j < payments.length; j++) {
                                var payment = payments[j];
                                if (parseInt(payment.payStatus) == PAYMENTSTATUS.PAID) {
                                    var resultPayment = {dateCreated: payment.dateCreated,
                                                        id: payment.id,
                                                        payStatus: payment.payStatus,
                                                        payType: payment.payType,
                                                        price: payment.price.toFixed(2),
                                                        slice: payment.slice,
                                                        suborderId: payment.suborderId
                                                    };
                                    if (payment.datePaid) {
                                        resultPayment.datePaid = payment.datePaid;
                                    }
                                    resultPayments.push(resultPayment);
                                    paidPrice += payment.price;
                                }
                            }
                            subOrder.paidCount = resultPayments.length;
                            subOrder.paidPrice = paidPrice.toFixed(2);
                            subOrder.price = subOrder.price.toFixed(2);
                            if (paidPrice == subOrder.price && resultPayments.length == 1) {
                                subOrder.payType = resultPayments[0].payType;
                            } else {
                                if (resultPayments.length > 0) {
                                    subOrder.payments = resultPayments;
                                }
                            }
                            subOrders.push(subOrder);
                        }
                        data.subOrders = subOrders;
                    }
                }
                callback(null, data, returnPayment);
            } else {
                callback(null, data, returnPayment);
            }
        }
    });
}

exports.api10_getOrderDetails = function(req, res, next) {
    var locationUserId = req.data['locationUserId'];

    getOrder(req, function(err, data, payment) {
        var result = {};
        if (err) {
            console.error('Order api10_getOrderDetails err:', err);
        }
        if (data) {
            var paymentId           = payment && payment.id ? payment.id : data.paymentId;
            var payPrice            = payment && typeof(payment.price) != 'undefined' ? payment.price : typeof(data.duePrice) != 'undefined' ? data.duePrice : 0;
            var order               = {};
            var productslength      = data.products? data.products.length: 0;
            var SKUsLength          = data.SKUs? data.SKUs.length: 0;
            var productArr          = new Array(productslength);
            var SKUArr              = new Array(SKUsLength);
            // var orderInfo = {'totalPrice':data.price.toFixed(2),'deposit':data.deposit.toFixed(2),'dateCreated':data.dateCreated, 'orderStatus': OrderService.orderStatus(data)};
            // if (data.payStatus == PAYMENTSTATUS.PAID && data.datePaid) {
            //     orderInfo.datePaid = data.datePaid;
            // }
            // if (data.deliverStatus == DELIVERSTATUS.DELIVERED && data.dateDelivered) {
            //     orderInfo.dateDelivered = data.dateDelivered;
            // }
            // if (data.deliverStatus == DELIVERSTATUS.RECEIVED && data.dateCompleted) {
            //     orderInfo.dateCompleted = data.dateCompleted;
            // }
            var orderInfo           = OrderService.get_orderInfo(data);
            order.id                = data.id;
            order.orderNo           = paymentId;
            order.totalPrice        = data.price.toFixed(2);
            order.dataSubmit        = data.dateCreated;
            // 订单Info
            order.order             = orderInfo;
            // 收货人信息
            order.recipientName     = data.consigneeName;
            order.recipientPhone    = data.consigneePhone;
            // 配送方式
            if (data.deliveryType && data.deliveryType === DELIVERYTYPE['ZITI'].id) {
                order.deliveryType  = {type:data.deliveryType, value:DELIVERYTYPENAME[data.deliveryType]};
                order.address       = data.RSCInfo && data.RSCInfo.RSCAddress ? data.RSCInfo.RSCAddress : '';
            } else {
                order.deliveryType  = {type:DELIVERYTYPE['SONGHUO'].id, value:DELIVERYTYPENAME[DELIVERYTYPE['SONGHUO'].id]};
                order.address       = data.consigneeAddress;
            }
            // RSC info
            if (data.RSCInfo) {
                order.RSCInfo       = data.RSCInfo;
            }
            order.remarks           = '';
            order.deliveryTime      = '';
            // 订单合成状态
            order.orderType         = OrderService.orderType(data);
            // 定金
            order.deposit           = payPrice.toFixed(2);
            // 支付状态
            order.payStatus         = data.payStatus;
            // 发货状态
            order.deliverStatus     = data.deliverStatus;
            order.payType           = data.payType;
            order.isClosed          = data.isClosed;
            // 分阶段
            order.subOrders         = data.subOrders;
            // 待付金额
            if (payPrice && payPrice > 0) {
                order.duePrice      = payPrice.toFixed(2);
            }
            // 当前正在支付的阶段
            if (data.paySubOrderType) {
                order.paySubOrderType = data.paySubOrderType;
            }
            // 当前支付的信息
            if (payment) {
                order.payment       = {'paymentId':payment.id, 'price':payment.price.toFixed(2), 'suborderId':payment.suborderId};
            }
            // 积分相关
            if (data.isRewardPoint) {
                order.isRewardPoint = data.isRewardPoint;
                order.rewardPoints = data.rewardPoints;
            } else {
                order.isRewardPoint = false;
            }
            // 订单中商品信息列表（旧的订单才会存在）
            for (var i=0; i < productslength; i++) {
                var product = data.products[i];
                productArr[i] = {
                    'goodsName': product.name,
                    'goodsCount': product.count,
                    'unitPrice': product.price.toFixed(2),
                    'orderSubType': '',
                    'orderSubNo': '',
                    'originalPrice': product.price.toFixed(2),
                    'goodsId': product.id,
                    'imgs': product.thumbnail,
                    'deposit': product.deposit.toFixed(2),
                    'category': product.category,
                    'deliverStatus': product.deliverStatus
                };
            }
            // 订单中SKU信息列表
            if( SKUsLength > 0 ) {
                productArr = [];
                for (var i=0; i < SKUsLength; i++) {
                    var SKU = data.SKUs[i];
                    SKUArr[i] = {
                        'name': SKU.name,
                        'count': SKU.count,
                        'price': SKU.price.toFixed(2),
                        'orderSubType': '',
                        'orderSubNo': '',
                        'goodsId': SKU.productId,
                        'imgs': SKU.thumbnail,
                        'deposit': SKU.deposit.toFixed(2),
                        'category': SKU.category,
                        'deliverStatus': SKU.deliverStatus,
                        'additions':SKU.additions,
                        'attributes':SKU.attributes,
                        'productName':SKU.productName,
                        'ref':SKU.ref
                    };
                    // 订单中SKU所属商品信息列表
                    // contains SKUs, need to convert into products to support old app
                    var product = {
                        'goodsName': SKU.productName,
                        'goodsCount': SKU.count,
                        'unitPrice': SKU.price.toFixed(2),
                        'orderSubType': '',
                        'orderSubNo': '',
                        'originalPrice': SKU.price.toFixed(2),
                        'goodsId': SKU.productId,
                        'imgs': SKU.thumbnail,
                        'deposit': SKU.deposit.toFixed(2),
                        'category': SKU.category,
                        'deliverStatus': SKU.deliverStatus
                    };

                    productArr.push(product);
                }
            }

            // 订单中SKU所属商品信息列表 contains SKUs, need to convert into products to support old app
            order.orderGoodsList  = productArr;
            // 订单中SKU信息列表
            order.SKUList = SKUArr;
            result = {'code':'1000','message':'success','datas':{'total':1,'rows':order,'locationUserId':locationUserId}};
        } else {
            result = {'code':'1001','message':'未查询到订单'};
        }
        res.respond(result);
    });
};

exports.addOrderBySKU = function(req, res, next){
    var data = req.data;
    var userId = data['userId'];
    var shopCartId = data.shopCartId;
    var addressId = data['addressId'];
    var SKUs = data['SKUs'] || [];
    var payType = data['payType'] || PAYTYPE.ZHIFUBAO;
    var deliveryType = data['deliveryType'] || DELIVERYTYPE['SONGHUO'].id;
    var RSCId = data['RSCId'] || null;
    var consigneePhone = data['consigneePhone'] || null;
    var consigneeName = data['consigneeName'] || null;

    if (!shopCartId) {
        res.respond({"code":1001, "message":"请选择购物车"});
        return;
    }

    if (deliveryType && parseInt(deliveryType) === DELIVERYTYPE['SONGHUO'].id) {
        if (!addressId) {
            res.respond({"code":1001, "message":"请先填写收货地址"});
            return;
        }
    } else if (deliveryType && parseInt(deliveryType) === DELIVERYTYPE['ZITI'].id) {
        if (!RSCId) {
            res.respond({"code":1001, "message":"请先选择自提点"});
            return;
        }
        if (!consigneePhone || !tools.isPhone(consigneePhone)) {
            res.respond({"code":1001, "message":"请先填写正确的收货人手机号"});
            return;
        }
        if (!consigneeName) {
            res.respond({"code":1001, "message":"请先填写收货人姓名"});
            return;
        }
    } else {
        res.respond({"code":1001, "message":"请先选择正确的配送方式"});
        return;
    }

    UserService.get({"userid":userId}, function(err, user) {
        if(err || !user){
            res.respond({code:1001, message:'用户不存在'});
            return;
        }

        CartService.checkoutSKU(shopCartId, SKUs, function(err, cart) {
            if(err || !cart){
                res.respond({code:1001, message:'购物车不存在'});
                return;
            }

            if(cart.SKU_items.length==0){
                res.respond({code:1001, message:'购物车为空'});
                return;
            }

            if (deliveryType && deliveryType === DELIVERYTYPE['SONGHUO'].id) {
                UseraddressService.get({"id": addressId}, function(err, address) {
                    if(err || !address){
                        res.respond({code:1001, message:'收货地址不存在'});
                        return;
                    }
                    var addOrderOptions = {};
                    addOrderOptions.user = user;
                    addOrderOptions.SKU_items = cart.SKU_items;
                    addOrderOptions.deliveryType = deliveryType;
                    // addOrderOptions.address = address;

                    addOrderOptions.addressInfo = {
                        "consigneeName": address.receiptpeople,
                        "consigneePhone": address.receiptphone,
                        "consigneeAddress": address.provincename + address.cityname + (address.countyname || '') + (address.townname || '') + address.address
                    };
                    OrderService.splitAndaddOrder(addOrderOptions, function(err, response, orderSKUs) {
                        if(err || !response){
                            res.respond({code:1001, message:err});
                            return;
                        }
                        res.respond(response);
                        if (orderSKUs) {
                            CartService.removeSKUItems(shopCartId, orderSKUs, function(){});
                        }
                    });
                });
            } else if (deliveryType && deliveryType === DELIVERYTYPE['ZITI'].id) {
                UserService.getRSCInfoById(RSCId, function(err, RSC) {
                    if(err || !RSC){
                        res.respond({code:1001, message:'自提点不存在'});
                        return;
                    }
                    if (!RSC.RSCInfo || !RSC.RSCInfo.companyAddress || !RSC.RSCInfo.companyAddress.province.name || !RSC.RSCInfo.companyAddress.city.name) {
                        callback("自提点地址不完整");
                        return;
                    }
                    var addOrderOptions = {};
                    addOrderOptions.user = user;
                    addOrderOptions.SKU_items = cart.SKU_items;
                    addOrderOptions.deliveryType = deliveryType;
                    addOrderOptions.RSCId = RSCId;
                    // addOrderOptions.RSC = RSC;
                    addOrderOptions.consigneeName = consigneeName;
                    addOrderOptions.consigneePhone = consigneePhone;

                    addOrderOptions.RSCInfo = {RSC: RSCId};
                    addOrderOptions.RSCInfo.RSCAddress = RSC.RSCInfo.companyAddress.province.name + RSC.RSCInfo.companyAddress.city.name;
                    if (RSC.RSCInfo.companyAddress.county && RSC.RSCInfo.companyAddress.county.name) {
                        addOrderOptions.RSCInfo.RSCAddress += RSC.RSCInfo.companyAddress.county.name;
                    }
                    if (RSC.RSCInfo.companyAddress.town && RSC.RSCInfo.companyAddress.town.name) {
                        addOrderOptions.RSCInfo.RSCAddress += RSC.RSCInfo.companyAddress.town.name;
                    }
                    if (RSC.RSCInfo.companyAddress.details) {
                        addOrderOptions.RSCInfo.RSCAddress += RSC.RSCInfo.companyAddress.details;
                    }
                    if (RSC.RSCInfo.companyName) {
                        addOrderOptions.RSCInfo.companyName = RSC.RSCInfo.companyName;
                    }
                    if (RSC.RSCInfo.phone) {
                        addOrderOptions.RSCInfo.RSCPhone = RSC.RSCInfo.phone;
                    }
                    OrderService.splitAndaddOrder(addOrderOptions, function(err, response, orderSKUs) {
                        if(err || !response){
                            res.respond({code:1001, message:err});
                            return;
                        }
                        res.respond(response);
                        // remove skus from shopcarts
                        if (orderSKUs) {
                            CartService.removeSKUItems(shopCartId, orderSKUs, function(){});
                        }
                        // save user input consignee and chose RSC
                        var userConsignee = {userId: user.id, consigneeName: consigneeName, consigneePhone: consigneePhone};
                        UserService.saveUserConsignee(userConsignee, function(err){});
                        var userRSC = {userId: user.id, RSCId: RSCId};
                        UserService.saveUserRSC(userRSC, function(err){});
                    });
                });
            } else {
                res.respond({"code":1001, "message":"请先选择配送方式"});
                return;
            }
        });
    });
};

exports.process_confirm_SKU_received = function(req, res, next){
    var orderId = req.data.orderId;
    var SKURefs = req.data.SKURefs;
    var user = req.user;
    if(!orderId){
        res.respond({code:1001, message:'orderId required'});
        return;
    }

    if(!SKURefs){
        res.respond({code:1001, message:'SKURef required'});
        return;
    }

    if(!user){
        res.respond({code:1001, message:'请先登录'});
        return;
    }

    OrderService.get({id:orderId}, function(err, order) {
        if (err || !order) {
            res.respond({code: 1002, message: '获取订单失败'});
            return;
        }

        if (order.buyerId != user.id) {
            res.respond({code: 1002, message: '没有权利修改这个订单'});
            return;
        }

        OrderService.confirm(orderId, SKURefs, function (err) {
            if (err) {
                res.respond({code: 1002, message: err});
                return;
            }

            res.respond({code: 1000, message: 'success'});
        })
    })
};

exports.json_get_delivery_code = function(req, res, next){
    var user = req.user;
    var orderId = req.data.orderId;
    if(!orderId){
        res.respond({code:1001, message:'orderId required'});
        return;
    }

    OrderService.get({id:orderId}, function(err, order){
        if (err || !order) {
            res.respond({code: 1002, message: '获取订单失败'});
            return;
        }

        if (order.buyerId != user.id) {
            res.respond({code: 1002, message: '没有权利修改这个订单'});
            return;
        }

        DeliveryCodeService.getCodeByOrderId(orderId, function(err, code){
            if(err){
                res.respond({code:1002, message:err});
                return;
            }

            if(!code){
                if(order.payStatus == PAYMENTSTATUS.PAID
                    && order.deliveryType == DELIVERYTYPE.ZITI.id
                    && (order.deliverStatus == DELIVERSTATUS.RSCRECEIVED || order.deliverStatus == DELIVERSTATUS.PARTDELIVERED)){
                    OrderService.generateDeliveryCodeandNotify(order, null, function(err, deliveryCode){
                        if(err){
                            res.respond({code:1002, message:'该订单无提货码，请联系客服人员'});
                            return;
                        }

                        res.respond({code:1000, message:'success', deliveryCode:deliveryCode});
                    });
                } else{
                    res.respond({code:1002, message:'该订单没有要自提的商品'});
                }
            } else {
                res.respond({code: 1000, message: 'success', deliveryCode: code});
            }
        })
    })
};

exports.getOders = getOdersList;