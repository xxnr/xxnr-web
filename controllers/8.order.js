
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
            console.log('Order getOrdersList err:' + err);
            callback();
            return;
        }

        callback(data);
	});
}

function getOders() {
    var self = this;

    getOdersList.call(this, function(data, error) {
        if (data) {
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
                if (!typeValue) {
                    typeValue = orderType(item);
                }
                arr[i] = {
                    'typeValue':typeValue,
                    'orderId':item.id,
                    'orderNo':item.paymentId,
                    'totalPrice':item.price.toFixed(2),
                    'goodsCount': item.products ? item.products.length: 0,
                    'address':item.consigneeAddress,
                    'recipientName':item.consigneeName,
                    'recipientPhone':item.consigneePhone,
                    'typeLable':'',
                    'deposit':item.deposit.toFixed(2),
                    'payType':item.payType,
                    'products': item.products || []
                };
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
    var paymentId = U.GUID(10);

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

                var price = 0;
                var deposit = 0;
                var orderProducts = [];
                for(var i=0; i<cart.items.length; i++){
                    var product = api10.convertProduct(cart.items[i].product);
                    product.count = cart.items[i].count;
                    price += product.count * product.discountPrice;
                    deposit += product.count * (product.deposit?product.deposit:product.discountPrice);
                    orderProducts.push(product);
                }

                var order = {"id": U.GUID(10),
                    "buyerName":user.name,
                    "buyerPhone":user.account,
                    "buyerId":user.id,
                    "paymentId":paymentId,
                    "consigneeName":address.receiptpeople,
                    "consigneePhone":address.receiptphone,
                    "consigneeAddress":address.provincename + address.cityname + (address.countyname || '') + (address.townname || '') + address.address,
                    "price":price,
                    "deposit":deposit,
                    "products":orderProducts,
                    "payType":payType,
                    "payStatus":PAYMENTSTATUS.UNPAID,
                    "deliverStatus":DELIVERSTATUS.UNDELIVERED};

                OrderService.add(order, function(err, data, payment) {
                    if(err) {
                        console.log('Order addOrder err:' + err);
                        // Error TODO*
                        var response = {"code":1001, "mesage":"保存订单出错"};
                        self.respond(response);
                        return;
                    }
                    var paymentId = payment && payment.id ? payment.id : data.paymentId;
                    var payPrice = payment && typeof(payment.price) != 'undefined' ? payment.price : data.deposit;
                    var response = {'code':1000, 'id': data.id, 'paymentId':paymentId, 'price':data.price, 'deposit':payPrice.toFixed(2), 'payment':payment};
                    self.respond(response);
                    CartService.removeItems(shopCartId, orderProducts, function(){});
                });
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
            if (err) console.log('Order updateOrderPaytype err:' + err);
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
                console.log('Order updateOrderPaytype err:' + err);
                self.respond({'code':'1001','message':'未查询到订单'});
                return;
            }
        }
        OrderService.updatepayType({'paytype':paytype,'orderid':orderid,'paymentid':paymentid}, function(err) {
            if(err) {
                console.log('Order updateOrderPaytype err:' + err);
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
        if (err) {
            console.log('Order confirmOrder err:' + err);
            self.respond({'code':'1001','message':'未查询到订单'});
            return;
        }
        if (data && data.deliverStatus === DELIVERSTATUS.DELIVERED && data.payStatus === PAYMENTSTATUS.PAID && !data.confirmed) {
            OrderService.confirm(orderid, function(err){
                if(err) {
                    console.log('Order confirmOrder err:' + err);
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

    OrderService.get({'buyer':buyer,'id':orderid}, function(err, data, payment) {
        if (err) {
            console.log('Order getOrder err:' + err);
            callback(err);
        } else {
            callback(null, data, payment);
        }
    });
}

function api10_getOrderDetails() {
    var self = this;
    var locationUserId = self.data['locationUserId'];

    getOrder.call(this, function(err, data, payment) {
        var result = {};
        if (err) {
            console.log('Order api10_getOrderDetails err:' + err);
        }
        if (data) {
            var paymentId           = payment && payment.id ? payment.id : data.paymentId;
            var payPrice            = payment && typeof(payment.price) != 'undefined' ? payment.price : data.deposit;
            var order               = {};
            var productslength      = data.products? data.products.length: 0;
            var arr                 = new Array(productslength);
            order.id                = data.id;
            order.orderNo           = paymentId;
            order.totalPrice        = data.price.toFixed(2);
            order.dataSubmit        = data.dateCreated;
            order.recipientName     = data.consigneeName;
            order.recipientPhone    = data.consigneePhone;
            order.address           = data.consigneeAddress;
            order.remarks           = '';
            order.deliveryTime      = '';
            order.orderType         = orderType(data);
            order.deposit           = payPrice.toFixed(2);
            order.payStatus         = data.payStatus;
            order.deliverStatus     = data.deliverStatus;
            order.payType           = data.payType;
            order.confirmed         = data.confirmed;
            order.isClosed          = data.isClosed;
            order.payment           = payment;
            order.order             = {'totalPrice':data.price.toFixed(2),'deposit':data.deposit.toFixed(2)};
            for (var i=0; i < productslength; i++) {
                var product = data.products[i];
                arr[i] = {
                    'goodsName': product.name,
                    'goodsCount': product.count,
                    'unitPrice': product.price.toFixed(2),
                    'orderSubType': '',
                    'orderSubNo': '',
                    'originalPrice': product.price.toFixed(2),
                    'goodsId': product.id,
                    'imgs': product.thumbnail,
                    'deposit': product.deposit.toFixed(2),
                    'category': product.category
                }
            }
            order.orderGoodsList    = arr;
            result = {'code':'1000','message':'success','datas':{'total':1,'rows':order,'locationUserId':locationUserId}};
        } else {
            result = {'code':'1001','message':'未查询到订单'};
        }
        self.respond(result);
    });
}

function orderType(order) {
    // if ((order.payStatus == PAYMENTSTATUS.UNPAID && !order.isClosed) || order.payStatus == PAYMENTSTATUS.PARTPAID) {
    //     return 1;
    // } else if (order.payStatus == PAYMENTSTATUS.PAID && (order.deliverStatus == DELIVERSTATUS.UNDELIVERED || order.deliverStatus == DELIVERSTATUS.PARTDELIVERED)) {
    //     return 2;
    // } else if (order.payStatus == PAYMENTSTATUS.PAID && order.deliverStatus == DELIVERSTATUS.DELIVERED && !order.confirmed) {
    //     return 3;
    // } else if (order.confirmed) {
    //     return 4;
    // } else {
    //     return 0;
    // }

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
}

exports.getOders = getOdersList;