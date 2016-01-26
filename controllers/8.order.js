
// API for e.g. Mobile application
// This API uses the website
var services = require('../services');
var UserService = services.user;
var OrderService = services.order;
var UseraddressService = services.useraddress;
var ProductService = services.product;
var CartService = services.cart;

exports.install = function() {
	F.route('/api/v2.0/order/getOderList',         getOders, ['post', 'get'], ['isLoggedIn']);
	F.route('/api/v2.0/order/getAppOrderList',     api10_getOders, ['post', 'get'], ['isLoggedIn']);
	F.route('/api/v2.0/order/addOrder',            addOrder, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/order/getOrderDetails',     api10_getOrderDetails, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/order/updateOrderPaytype',  updateOrderPaytype, ['post', 'get'], ['isLoggedIn']);
    F.route('/api/v2.0/order/confirmeOrder',       confirmOrder, ['post', 'get'], ['isLoggedIn']);

	// v1.0
	F.route('/app/order/getOderList',              api10_getOders, ['post', 'get'], ['isLoggedIn']);
	//fix api// F.route('/app/order/addOrder',                 addOrder, ['post', 'get'], ['isLoggedIn']);
    //fix api// F.route('/app/order/confirmReceipt',           confirmOrder, ['post', 'get'], ['isLoggedIn']);

    // v2.1
    F.route('/api/v2.1/order/addOrder',            addOrderBySKU, ['post'], ['isLoggedIn']);

};

var converter = require('../common/converter');
var api10 = converter.api10;
var calculatePrice = require('../common/calculator').calculatePrice;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var PAYTYPE = require('../common/defs').PAYTYPE;
var tools = require('../common/tools');

function getOdersList(callback) {
	var self = this;
	var page = self.data['page'];
    var max = self.data['max'];
	var type = self.data['type'] || self.data['typeValue'];//订单类型  所有的订单
    var userId = self.data['userId'];
    var locationUserId = self.data['locationUserId'];

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

function getOders() {
    var self = this;
    var type = self.data['type'] || self.data['typeValue'] || null;

    getOdersList.call(this, function(data, error) {
        if (data) {
            var items = data.items;
            var length = items.length;
            var arr = new Array(length);
            for (var i = 0; i < length; i++) {
                var item = items[i];
                var typeValue = type;
                // 订单合成状态
                if (!typeValue) {
                    item.typeValue = OrderService.orderType(item);
                }
                var orderInfo = {'totalPrice':item.price.toFixed(2), 'deposit':item.deposit.toFixed(2), 'dateCreated':item.dateCreated, 'orderStatus': OrderService.orderStatus(item)};
                if (item.payStatus == PAYMENTSTATUS.PAID && item.datePaid) {
                    orderInfo.datePaid = item.datePaid;
                }
                if (item.payStatus == DELIVERSTATUS.DELIVERED && item.dateDelivered) {
                    orderInfo.dateDelivered = item.dateDelivered;
                }
                if (item.confirmed && item.dateCompleted) {
                    orderInfo.dateCompleted = item.dateCompleted;
                }
                item.order = orderInfo;
            }
            self.respond(data);
        } else {
            self.respond({'code':'1001','message':'没有找到订单'});
        }
    });
}

function api10_getOders() {
    var self = this;
    var type = self.data['type'] || self.data['typeValue'] || null;

    getOdersList.call(this, function(data, error) {
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
                var orderInfo = {'totalPrice':item.price.toFixed(2), 'deposit':item.deposit.toFixed(2), 'dateCreated':item.dateCreated, 'orderStatus': OrderService.orderStatus(item)};
                if (item.payStatus == PAYMENTSTATUS.PAID && item.datePaid) {
                    orderInfo.datePaid = item.datePaid;
                }
                if (item.payStatus == DELIVERSTATUS.DELIVERED && item.dateDelivered) {
                    orderInfo.dateDelivered = item.dateDelivered;
                }
                if (item.confirmed && item.dateCompleted) {
                    orderInfo.dateCompleted = item.dateCompleted;
                }
                arr[i] = {
                    'typeValue':typeValue,
                    'orderId':item.id,
                    'orderNo':item.paymentId,
                    'totalPrice':item.price.toFixed(2),
                    'goodsCount':item.products ? item.products.length: 0,
                    'address':item.consigneeAddress,
                    'recipientName':item.consigneeName,
                    'recipientPhone':item.consigneePhone,
                    'typeLable':'',
                    'deposit': typeof(item.duePrice) != 'undefined' ? item.duePrice.toFixed(2) : item.deposit.toFixed(2),
                    'payType':item.payType,
                    'order': orderInfo,
                    'products': item.products || [],
                    'SKUs':item.SKUs || [],
                    'subOrders': item.subOrders || [],
                    'duePrice': typeof(data.duePrice) != 'undefined' ? item.duePrice.toFixed(2) : null,
                };

                if(arr[i].SKUs && arr[i].SKUs.length > 0){
                    // contains SKUs, need to convert into products to support old app
                    arr[i].SKUs.forEach(function(SKU){
                        var product = {id:SKU.productId, price:SKU.price.toFixed(2), deposit:SKU.deposit.toFixed(2), name:SKU.productName, thumbnail:SKU.thumbnail, count:SKU.count, category:SKU.category, dateDelivered:SKU.dateDelivered, dateSet:SKU.dateSet, deliverStatus:SKU.deliverStatus};
                        arr[i].products.push(product);
                    })
                }
                
            }
            result = {'code':'1000','message':'success','datas':{"total":data.count,"rows":arr,"page":data.page,"pages":data.pages}};
        } else {
            result = {'code':'1001','message':'没有找到订单'};
        }
        self.respond(result);
    });
}

function addOrder(){
	var self = this;

	var data = self.data;
	var userId = data['userId'];
    var shopCartId = data.shopCartId;
    var addressId = data['addressId'];
    var products = data['products'] || [];
    var payType = data['payType'] || PAYTYPE.ZHIFUBAO;

    if(products.length>0){
        products = JSON.parse(products);
    }

    if (!shopCartId) {
        self.respond({"code":1001, "mesage":"请选择购物车"});
        return;
    }

    if (!addressId) {
        self.respond({"code":1001, "mesage":"请先填写收货地址"});
        return;
    }

	UserService.get({"userid":userId}, function(err, user) {
        if(err || !user){
            self.respond({code:1001, message:'用户不存在'});
            return;
        }

		UseraddressService.get({"id": addressId}, function(err, address) {
            if(err || !address){
                self.respond({code:1001, message:'收货地址不存在'});
                return;
            }

            CartService.checkout(shopCartId, products, function(err, cart) {
                if(err || !cart){
                    self.respond({code:1001, message:'购物车不存在'});
                    return;
                }

                if(cart.items.length==0){
                    self.respond({code:1001, message:'购物车为空'});
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
                                    var response = {"code":1001, "mesage":"保存订单出错"};
                                    self.respond(response);
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
                                            self.respond({"code":1001, "mesage":"保存订单出错"});
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
                                        self.respond(response);
                                        CartService.removeItems(shopCartId, orderProducts, function(){});
                                    });
                                } else {
                                    response['orders'] = resultOrders;
                                    self.respond(response);
                                    CartService.removeItems(shopCartId, orderProducts, function(){});
                                }
                            });
                        } catch (e) {
                            console.error('Order addOrder orders err:', e);
                            self.respond({"code":1001, "mesage":"保存订单出错"});
                            return;
                        }
                    } else {
                        console.error('Order addOrder err: not get the order..');
                        self.respond({"code":1001, "mesage":"没有要保存的订单"});
                        return;
                    }
                } else {
                    console.error('Order addOrder err: no orders info..');
                    self.respond({"code":1001, "mesage":"获取订单信息出错"});
                    return;
                }
			});
		});
	});
}

function updateOrderPaytype() {
	var self = this;
    var buyer = self.data.userId || null;
    var orderid = self.data.orderId || null;
    var paytype = self.data.payType || PAYTYPE.ZHIFUBAO;

    OrderService.get({'buyer':buyer,'id':orderid}, function(err, data, payment) {
        if (err || !data) {
            if (err) console.error('Order updateOrderPaytype err:', err);
            self.respond({'code':'1001','message':'未查询到订单'});
            return;
        }

        var paymentid = null;
        if (payment && payment.id) {
            paymentid = payment.id;
        } else {
            if (!paymentid && data && data.paymentId) {
                paymentid = data.paymentId;
            } else {
                console.error('Order updateOrderPaytype err:', err);
                self.respond({'code':'1001','message':'未查询到订单'});
                return;
            }
        }
        OrderService.updatepayType({'paytype':paytype,'orderid':orderid,'paymentid':paymentid}, function(err) {
            if(err) {
                console.error('Order updateOrderPaytype err:', err);
                self.respond({'code':'1001','message':'修改支付方式出错'});
                return;
            }
            self.respond({'code':'1000','message':'success'});
            return;
        });
    });
}

// user confirm order
function confirmOrder() {
    var self = this;
    var buyer = self.data.userId || null;
    var orderid = self.data.orderId || null;

    OrderService.get({'buyer':buyer,'id':orderid}, function(err, data) {
        if (err || !data) {
            if (err) console.error('Order confirmOrder err:', err);
            self.respond({'code':'1001','message':'未查询到订单'});
            return;
        }
        if (data && data.deliverStatus === DELIVERSTATUS.DELIVERED && data.payStatus === PAYMENTSTATUS.PAID && !data.confirmed) {
            OrderService.confirm(orderid, function(err) {
                if(err) {
                    console.error('Order confirmOrder err:', err);
                    self.respond({'code':'1001','message':'确认订单出错'});
                    return;
                }
                self.respond({'code':'1000','message':'success'});
                return;
            });
        } else {
            self.respond({'code':'1001','message':'此订单不能确认'});
        }
    });
}

// get order detail
function getOrder(callback) {
    var self = this;
    var buyer = self.data.userId || null;
    var orderid = self.data.orderId || null;

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

function api10_getOrderDetails() {
    var self = this;
    var locationUserId = self.data['locationUserId'];

    getOrder.call(this, function(err, data, payment) {
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
            var orderInfo = {'totalPrice':data.price.toFixed(2),'deposit':data.deposit.toFixed(2),'dateCreated':data.dateCreated, 'orderStatus': OrderService.orderStatus(data)};
            if (data.payStatus == PAYMENTSTATUS.PAID && data.datePaid) {
                orderInfo.datePaid = data.datePaid;
            }
            if (data.payStatus == DELIVERSTATUS.DELIVERED && data.dateDelivered) {
                orderInfo.dateDelivered = data.dateDelivered;
            }
            if (data.confirmed && data.dateCompleted) {
                orderInfo.dateCompleted = data.dateCompleted;
            }
            order.id                = data.id;
            order.orderNo           = paymentId;
            order.totalPrice        = data.price.toFixed(2);
            order.dataSubmit        = data.dateCreated;
            order.recipientName     = data.consigneeName;
            order.recipientPhone    = data.consigneePhone;
            order.address           = data.consigneeAddress;
            order.remarks           = '';
            order.deliveryTime      = '';
            // 订单合成状态
            order.orderType         = OrderService.orderType(data);
            order.deposit           = payPrice.toFixed(2);
            order.payStatus         = data.payStatus;
            order.deliverStatus     = data.deliverStatus;
            order.payType           = data.payType;
            order.confirmed         = data.confirmed;
            order.isClosed          = data.isClosed;
            order.order             = orderInfo;
            order.subOrders         = data.subOrders;
            if (payPrice && payPrice > 0) {
                order.duePrice      = payPrice.toFixed(2);
            }
            if (data.paySubOrderType) {
                order.paySubOrderType = data.paySubOrderType;
            }
            if (payment) {
                order.payment       = {'paymentId':payment.id, 'price':payment.price.toFixed(2), 'suborderId':payment.suborderId};
            }

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
                    'productName':SKU.productName
                };
            }

            if( SKUsLength > 0 ) {
                productArr = [];
                // contains SKUs, need to convert into products to support old app
                data.SKUs.forEach(function (SKU) {
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
                })
            }

            order.orderGoodsList  = productArr;
            order.SKUList = SKUArr;
            result = {'code':'1000','message':'success','datas':{'total':1,'rows':order,'locationUserId':locationUserId}};
        } else {
            result = {'code':'1001','message':'未查询到订单'};
        }
        self.respond(result);
    });
}

function addOrderBySKU(){
    var self = this;
    var data = self.data;
    var userId = data['userId'];
    var shopCartId = data.shopCartId;
    var addressId = data['addressId'];
    var SKUs = data['SKUs'] || [];
    var payType = data['payType'] || PAYTYPE.ZHIFUBAO;

    if (!shopCartId) {
        self.respond({"code":1001, "mesage":"请选择购物车"});
        return;
    }

    if (!addressId) {
        self.respond({"code":1001, "mesage":"请先填写收货地址"});
        return;
    }

    UserService.get({"userid":userId}, function(err, user) {
        if(err || !user){
            self.respond({code:1001, message:'用户不存在'});
            return;
        }

        UseraddressService.get({"id": addressId}, function(err, address) {
            if(err || !address){
                self.respond({code:1001, message:'收货地址不存在'});
                return;
            }

            CartService.checkoutSKU(shopCartId, SKUs, function(err, cart) {
                if(err || !cart){
                    self.respond({code:1001, message:'购物车不存在'});
                    return;
                }

                if(cart.SKU_items.length==0){
                    self.respond({code:1001, message:'购物车为空'});
                    return;
                }

                // 拆单 定金的商品和全款的商品拆分支付
                var orders = {};
                var orderSKUs = [];
                for(var i=0; i<cart.SKU_items.length; i++){
                    var SKU = cart.SKU_items[i].SKU;
                    var product = cart.SKU_items[i].product;
                    if(!product.online){
                        self.respond({code:1001, message:"无法添加下架商品"});
                        return;
                    }

                    if(!SKU.online){
                        self.respond({code:1001, message:"无法添加下架SKU"});
                        return;
                    }

                    var additions = cart.SKU_items[i].additions;
                    var additionPrice = 0;
                    additions.forEach(function(addition){
                        additionPrice += addition.price;
                        addition.ref = addition._id;
                        delete addition._id;
                    });
                    var SKU_to_add = {};
                    product = api10.convertProduct(product);
                    SKU_to_add.ref = SKU._id;
                    SKU_to_add.productId = product.id;
                    SKU_to_add.price = SKU.price.platform_price;
                    SKU_to_add.deposit = product.deposit;
                    SKU_to_add.productName = product.name;
                    SKU_to_add.name = SKU.name;
                    SKU_to_add.thumbnail = product.thumbnail;
                    SKU_to_add.count = cart.SKU_items[i].count;
                    SKU_to_add.category = product.category;
                    SKU_to_add.attributes = SKU.attributes;
                    SKU_to_add.additions = additions;
                    if (SKU_to_add.deposit) {
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
                                "SKUs":[],
                                "payType":payType,
                                "payStatus":PAYMENTSTATUS.UNPAID,
                                "deliverStatus":DELIVERSTATUS.UNDELIVERED
                            };
                            orders['deposit'].id = U.GUID(10);
                            orders['deposit'].paymentId = U.GUID(10);
                        }
                        orders['deposit'].price +=  SKU_to_add.count * (SKU_to_add.price+additionPrice);
                        orders['deposit'].deposit += SKU_to_add.count * SKU_to_add.deposit;
                        orders['deposit'].SKUs.push(SKU_to_add);
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
                                "SKUs":[],
                                "payType":payType,
                                "payStatus":PAYMENTSTATUS.UNPAID,
                                "deliverStatus":DELIVERSTATUS.UNDELIVERED
                            };
                            orders['full'].id = U.GUID(10);
                            orders['full'].paymentId = U.GUID(10);
                        }
                        orders['full'].price +=  SKU_to_add.count * (SKU_to_add.price+additionPrice);
                        orders['full'].SKUs.push(SKU_to_add);
                    }
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
                            OrderService.add(order1, function(err, data, payment) {
                                if (err || !data) {
                                    if (err) console.error('Order addOrder order1 err:', err);
                                    var response = {"code":1001, "mesage":"保存订单出错"};
                                    self.respond(response);
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
                                    OrderService.add(order2, function(err, data, payment) {
                                        if (err || !data) {
                                            if (err) console.error('Order addOrder order2 err:', err);
                                            self.respond({"code":1001, "mesage":"保存订单出错"});
                                            OrderService.remove({id:orderId}, function(err) {
                                                if (err) {
                                                    console.error('Order addOrder remove order1 err:', err);
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
                                        self.respond(response);
                                        CartService.removeSKUItems(shopCartId, orderSKUs, function(){});
                                    });
                                } else {
                                    response['orders'] = resultOrders;
                                    self.respond(response);
                                    CartService.removeSKUItems(shopCartId, orderSKUs, function(){});
                                }
                            });
                        } catch (e) {
                            console.error('Order addOrder orders err:', e);
                            self.respond({"code":1001, "mesage":"保存订单出错"});
                            return;
                        }
                    } else {
                        console.error('Order addOrder err: not get the order..');
                        self.respond({"code":1001, "mesage":"没有要保存的订单"});
                        return;
                    }
                } else {
                    console.error('Order addOrder err: no orders info..');
                    self.respond({"code":1001, "mesage":"获取订单信息出错"});
                    return;
                }
            });
        });
    });
}
exports.getOders = getOdersList;