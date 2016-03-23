/**
 * Created by pepelu on 2016/3/4.
 */
var tools = require('../common/tools');
var services = require('../services');
var UserService = services.user;
var RSCService = services.RSC;
var OrderService = services.order;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var DELIVERYTYPE = require('../common/defs').DELIVERYTYPE;
var DELIVERYTYPENAME = require('../common/defs').DELIVERYTYPENAME;
var DeliveryCodeService = services.deliveryCode;

exports.install = function() {
    // RSC info related
    F.route('/api/v2.2/RSC/info/get',                   json_RSC_info_get,          ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/info/fill',                  process_RSC_info_fill,      ['post'],   ['isLoggedIn']);

    // RSC address query related
    F.route('/api/v2.2/RSC/address/province',           json_RSC_address_province_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/city',               json_RSC_address_city_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/county',             json_RSC_address_county_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/town',               json_RSC_address_town_query,     ['get'],    ['isLoggedIn']);

    F.route('/api/v2.2/RSC',                            json_RSC_query,                 ['get'],     ['isLoggedIn']);

    // RSC order related
    F.route('/api/v2.2/RSC/orderDetail',                    json_RSC_order_detail,      ['get'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/orders',                         json_RSC_orders_get,        ['get'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/order/deliverStatus/delivering', process_RSC_order_deliverStatus_delivering, ['post'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/order/selfDelivery',             process_self_delivery,        ['post'], ['isLoggedIn', 'isRSC']);
};

/**
 * fill RSC info. All RSC related info can only be filled once.
 */
function process_RSC_info_fill(){
    var self = this;
    var user = self.user;
    if(!user){
        self.respond({code:1001, message:'需要登录'});
        return;
    }

    var options = {};
    UserService.getById(user._id, function(err, user){
        if(!user.RSCInfo || !user.RSCInfo.name){
            if(!self.data.name) {
                self.respond({code: 1001, message: '请填写真实姓名'});
                return;
            } else{
                options.RSCInfo = {name:self.data.name};
            }
        }

        if(!user.RSCInfo || !user.RSCInfo.IDNo){
            if(!tools.isValidIdentityNo(self.data.IDNo)){
                self.respond({code:1001, message:'请填写正确的身份证号'});
                return;
            } else{
                if(options.RSCInfo){
                    options.RSCInfo.IDNo = self.data.IDNo;
                } else{
                    options.RSCInfo = {IDNo:self.data.IDNo};
                }
            }
        }

        if(!user.RSCInfo || !user.RSCInfo.phone){
            if(!tools.isPhone(self.data.phone)){
                self.respond({code:1001, message:'请填写正确的手机号'});
                return;
            } else{
                if(options.RSCInfo){
                    options.RSCInfo.phone = self.data.phone;
                } else{
                    options.RSCInfo = {phone:self.data.phone};
                }
            }
        }

        if(!user.RSCInfo || !user.RSCInfo.companyName){
            if(!self.data.companyName){
                self.respond({code:1001, message:'请填写公司门店名称'});
                return;
            } else {
                if(options.RSCInfo){
                    options.RSCInfo.companyName = self.data.companyName;
                } else{
                    options.RSCInfo = {companyName:self.data.companyName};
                }
            }
        }

        if(!user.RSCInfo || !user.RSCInfo.companyAddress){
            if(!self.data.companyAddress){
                self.respond({code:1001, message:'请填写网点地址'});
                return;
            } else if(!self.data.companyAddress.province){
                self.respond({code:1001, message:'请选择省份'});
                return;
            } else if (!self.data.companyAddress.city){
                self.respond({code:1001, message:'请选择城市'});
                return;
            } else{
                if(options.RSCInfo){
                    options.RSCInfo.companyAddress = self.data.companyAddress;
                } else{
                    options.RSCInfo = {companyAddress: self.data.companyAddress};
                }
            }
        }

        if(tools.isEmptyObject(options)){
            self.respond({code:1001, message:'没有可以更新的内容'});
            return;
        } else{
            options.userid = user.id;
        }

        UserService.update(options, function(err){
            if(err){
                self.respond({code:1001, message:'更新失败'});
                return;
            }

            self.respond({code:1000, message:'success'});
        })
    })
}

function json_RSC_info_get(){
    var self = this;
    if(!self.user){
        self.respond({code:1001, message:'需要登录'});
        return;
    }

    UserService.getRSCInfoById(self.user, function(err, user){
        if(err){
            self.respond({code:1001, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', RSCInfo:user.RSCInfo});
    })
}

function json_RSC_orders_get(){
    var self = this;
    var RSC = self.user;
    var page = U.parseInt(self.data.page, 1) - 1;
    var max = U.parseInt(self.data.max, 20);
    var type = U.parseInt(self.data.type);
    OrderService.getByRSC(RSC, page, max, type, function(err, orders, count, pageCount){
        if(err){
            self.respond({code:1002, message:'获取订单失败'});
            return;
        }

        generate_RSC_order_type(orders);
        self.respond({code:1000, message:'success', orders:orders, count:count, pageCount:pageCount});
    })
}

function process_RSC_order_deliverStatus_delivering(){
    var self = this;
    var user = self.user;
    var orderId = self.data.orderId;
    var SKURefs = self.data.SKURefs;
    if(!orderId){
        self.respond({code:1001, message:'需要订单号'});
        return;
    }

    if(!SKURefs){
        self.respond({code:1001, message:'需要SKURefs'});
        return;
    }

    OrderService.get({id:orderId}, function(err, order){
        if(err || !order){
            self.respond({code:1002, message:'获取订单失败'});
            return;
        }

        // check current status to see if the current status is OK for change deliver status
        // check if order belongs to this RSC
        if(!order.RSCInfo || !order.RSCInfo.RSC || user._id.toString() != order.RSCInfo.RSC.toString()){
            self.respond({code:1002, message:'没有权利修改这个订单'});
            return;
        }

        // check if the order ispaid
        if(order.payStatus != PAYMENTSTATUS.PAID){
            self.respond({code:1002, message:'该订单尚未完全支付'});
            return;
        }

        // check if order deliver status is deliver to home
        if(order.deliveryType != DELIVERYTYPE.SONGHUO.id){
            self.respond({code:1002, message:'该订单非送货到家'});
            return;
        }

        // check if the SKU belongs to this order and if this SKU is delivered to RSC
        if(!tools.isArray(order.SKUs)){
            self.respond({code:1002, message:'该订单无SKU'});
            return;
        }

        var needUpdate = false;
        var options = {id:order.id, SKUs:[]};
        for(var i = 0; i < order.SKUs.length; i++){
            var SKU = order.SKUs[i];
            if(SKURefs.indexOf(SKU.ref.toString()) != -1){
                if(SKU.deliverStatus == DELIVERSTATUS.RSCRECEIVED){
                    needUpdate = true;
                    options.SKUs[SKU.ref] = {deliverStatus:DELIVERSTATUS.DELIVERED};
                    break;
                }
            }
        }

        if(!needUpdate){
            self.respond({code:1002, message:'没有需要发货的订单'});
            return;
        }

        // all check done, start to update status
        OrderService.updateSKUs(options, function(err){
            if(err){
                self.respond({code:1002, message:'更新订单失败'});
                return;
            }

            self.respond({code:1000, message:'success'});
        })
    })
}

function json_RSC_address_province_query(){
    var self = this;
    if(!self.data.products){
        self.respond({code:1001, message:'请先选择商品'});
        return;
    }

    RSCService.getProvinceList(self.data.products.split(','), function(err, provinceList){
        if(err || !provinceList){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', provinceList: provinceList});
    })
}

function json_RSC_address_city_query(){
    var self = this;
    if(!self.data.products){
        self.respond({code:1001, message:'请先选择商品'});
        return;
    }

    if(!self.data.province){
        self.respond({code:1001, message:'请选择省'});
        return;
    }

    RSCService.getCityList(self.data.products.split(','), self.data.province, function(err, cityList){
        if(err || !cityList){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', cityList: cityList});
    })
}

function json_RSC_address_county_query(){
    var self = this;
    if(!self.data.products){
        self.respond({code:1001, message:'请先选择商品'});
        return;
    }

    if(!self.data.province){
        self.respond({code:1001, message:'请选择省'});
        return;
    }

    if(!self.data.city){
        self.respond({code:1001, message:'请选择市'});
        return;
    }

    RSCService.getCountyList(self.data.products.split(','), self.data.province, self.data.city, function(err, countyList){
        if(err || !countyList){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', countyList: countyList});
    })
}

function json_RSC_address_town_query(){
    var self = this;
    if(!self.data.products){
        self.respond({code:1001, message:'请先选择商品'});
        return;
    }

    if(!self.data.province){
        self.respond({code:1001, message:'请选择省'});
        return;
    }

    if(!self.data.city){
        self.respond({code:1001, message:'请选择市'});
        return;
    }

    RSCService.getTownList(self.data.products.split(','), self.data.province, self.data.city, self.data.county, function(err, townList){
        if(err || !townList){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', townList: townList});
    })
}

function json_RSC_query(){
    var self = this;
    if(!self.data.products){
        self.respond({code:1001, message:'请先选择商品'});
        return;
    }
    var page = U.parseInt(self.data.page, 1) - 1;
    var max = U.parseInt(self.data.max, 20);
    RSCService.getRSCList(self.data.products.split(','), self.data.province, self.data.city, self.data.county, self.data.town, page, max, function(err, RSCs, count, pageCount){
        if(err || !RSCs){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', RSCs: RSCs, count:count, pageCount:pageCount});
    })
}

function generate_RSC_order_type(orders){
    orders.forEach(function(order) {
        order.type = OrderService.RSCOrderStatus(order);
    })
}

function process_self_delivery() {
    var self = this;
    var orderId = self.data.orderId;
    var code = self.data.code;
    var SKURefs = self.data.SKURefs;
    var RSC = self.user;

    if (!orderId) {
        self.respond({code: 1001, message: 'orderId required'});
        return;
    }

    if (!code) {
        self.respond({code: 1001, message: 'code required'});
        return;
    }

    if (!SKURefs) {
        self.respond({code: 1001, message: 'SKURefs required'});
        return;
    }

    DeliveryCodeService.checkDeliveryCode(orderId, code, function (err, pass) {
        if (err || !pass) {
            self.respond({code: 1002, message: '验证提货码失败'});
            return;
        }

        OrderService.get({id:orderId}, function(err, order){
            if(err || !order){
                self.respond({code:1002, message:'获取订单失败'});
                return;
            }

            if(!order.RSCInfo || order.RSCInfo.RSC.toString() != RSC._id.toString()){
                self.respond({code:1002, message:'该订单不属于此网点'});
                return;
            }

            var deliverStatusOptions = {id: orderId, SKUs: []};
            var needConfirmSKURefs = [];
            SKURefs.forEach(function (SKURef) {
                deliverStatusOptions.SKUs[SKURef] = {deliverStatus: DELIVERSTATUS.DELIVERED};
            });

            order.SKUs.forEach(function(SKU){
                if(deliverStatusOptions.SKUs[SKU.ref]){
                    if(SKU.deliverStatus != DELIVERSTATUS.RSCRECEIVED) {
                        deliverStatusOptions.SKUs[SKU.ref] = null;
                    } else{
                        needConfirmSKURefs.push(SKU.ref.toString());
                    }
                }
            });

            OrderService.updateSKUs(deliverStatusOptions, function (err) {
                if (err) {
                    self.respond({code: 1002, message: '更新订单失败'});
                    return;
                }

                OrderService.confirm(orderId, needConfirmSKURefs, function (err) {
                    if (err) {
                        self.respond({code: 1002, message: err});
                        return;
                    }

                    self.respond({code: 1000, message: 'success'});
                })
            })
        })
    })
}

function json_RSC_order_detail(){
    var self = this;
    var orderId = self.data.orderId;
    var RSC = self.user;

    if(!orderId){
        self.respond({code:1001, message:'orderId required'});
        return;
    }

    if(!RSC){
        self.respond({code:1001, message:'need login'});
        return;
    }

    OrderService.get({id:orderId, 'RSCInfo.RSC':self.user}, function(err, order, returnPayment){
        if(err || !order){
            self.respond({code:1002, message:'获取订单详情失败'});
            return;
        }

        var orderInfo = {
            'id':order.id,
            'totalPrice': order.price.toFixed(2),
            'deposit': order.deposit.toFixed(2),
            'dateCreated': order.dateCreated,
            'deliveryType':{type:order.deliveryType, value:DELIVERYTYPENAME[order.deliveryType]},
            'orderStatus': OrderService.RSCOrderStatus(order),
            'consigneeName':order.consigneeName,
            'consigneePhone':order.consigneePhone,
            'consigneeAddress':order.consigneeAddress,
            'subOrders': order.subOrders,
            'payment':returnPayment
        };

        if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
            orderInfo.datePaid = order.datePaid;
        }
        if (order.deliverStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
            orderInfo.dateDelivered = order.dateDelivered;
        }
        if (order.deliverStatus == DELIVERSTATUS.RECEIVED && order.dateCompleted) {
            orderInfo.dateCompleted = order.dateCompleted;
        }

        if(tools.isArray(order.SKUs)){
            orderInfo.SKUList = [];
            order.SKUs.forEach(function(SKU){
                orderInfo.SKUList.push({
                    productId:SKU.productId,
                    price:SKU.price.toFixed(2),
                    deposit:SKU.deposit.toFixed(2),
                    productName:SKU.productName,
                    name:SKU.name,
                    thumbnail:SKU.thumbnail,
                    count:SKU.count,
                    category:SKU.category,
                    dateRSCReceived:SKU.dateRSCReceived,
                    dateDelivered:SKU.dateDelivered,
                    dateConfirmed:SKU.dateConfirmed,
                    additions:SKU.additions,
                    attributes:SKU.attributes,
                    deliverStatus:SKU.deliverStatus
                })
            })
        }

        if(tools.isArray(order.subOrders)){
            orderInfo.subOrders = [];
            order.subOrders.forEach(function(subOrder){
                orderInfo.subOrders.push({
                    id:subOrder.id,
                    price:subOrder.price.toFixed(2),
                    type:subOrder.type,
                    payStatus:subOrder.payStatus
                })
            })
        }

        self.respond({code:1000, message:'success', order:orderInfo});
    })
}
