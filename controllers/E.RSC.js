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
var AreaService = services.area;

exports.install = function() {
    // RSC info related
    //F.route('/api/v2.2/RSC/info/get',                   json_RSC_info_get,          ['get'],    ['isLoggedIn']);
    //F.route('/api/v2.2/RSC/info/fill',                  process_RSC_info_fill,      ['post'],   ['isLoggedIn']);

    // RSC address query related
    //F.route('/api/v2.2/RSC/address/province',           json_RSC_address_province_query,     ['get'],    ['isLoggedIn']);
    //F.route('/api/v2.2/RSC/address/city',               json_RSC_address_city_query,     ['get'],    ['isLoggedIn']);
    //F.route('/api/v2.2/RSC/address/county',             json_RSC_address_county_query,     ['get'],    ['isLoggedIn']);
    //F.route('/api/v2.2/RSC/address/town',               json_RSC_address_town_query,     ['get'],    ['isLoggedIn']);

    //F.route('/api/v2.2/RSC',                            json_RSC_query,                 ['get'],     ['isLoggedIn']);

    // RSC order related
    //F.route('/api/v2.2/RSC/orderDetail',                    json_RSC_order_detail,      ['get'],    ['isLoggedIn', 'isRSC']);
    //F.route('/api/v2.2/RSC/orders',                         json_RSC_orders_get,        ['get'],    ['isLoggedIn', 'isRSC']);
    //F.route('/api/v2.2/RSC/order/deliverStatus/delivering', process_RSC_order_deliverStatus_delivering, ['post'],    ['isLoggedIn', 'isRSC']);
    //F.route('/api/v2.2/RSC/order/selfDelivery',             process_self_delivery,        ['post'], ['isLoggedIn', 'isRSC', 'throttle']);
};

/**
 * fill RSC info. All RSC related info can only be filled once.
 */
exports.process_RSC_info_fill = function(req, res, next) {
    var user = req.user;
    if (!user) {
        res.respond({code: 1001, message: '需要登录'});
        return;
    }

    var options = {};
    UserService.getById(user._id, function (err, user) {
        if (!user.RSCInfo || !user.RSCInfo.name) {
            if (!req.data.name) {
                res.respond({code: 1001, message: '请填写真实姓名'});
                return;
            } else {
                options.RSCInfo = {name: req.data.name};
            }
        }

        if (!user.RSCInfo || !user.RSCInfo.IDNo) {
            if (!tools.isValidIdentityNo(req.data.IDNo)) {
                res.respond({code: 1001, message: '请填写正确的身份证号'});
                return;
            } else {
                if (options.RSCInfo) {
                    options.RSCInfo.IDNo = req.data.IDNo;
                } else {
                    options.RSCInfo = {IDNo: req.data.IDNo};
                }
            }
        }

        if (!user.RSCInfo || !user.RSCInfo.phone) {
            if (!tools.isPhone(req.data.phone)) {
                res.respond({code: 1001, message: '请填写正确的手机号'});
                return;
            } else {
                if (options.RSCInfo) {
                    options.RSCInfo.phone = req.data.phone;
                } else {
                    options.RSCInfo = {phone: req.data.phone};
                }
            }
        }

        if (!user.RSCInfo || !user.RSCInfo.companyName) {
            if (!req.data.companyName) {
                res.respond({code: 1001, message: '请填写公司门店名称'});
                return;
            } else {
                if (options.RSCInfo) {
                    options.RSCInfo.companyName = req.data.companyName;
                } else {
                    options.RSCInfo = {companyName: req.data.companyName};
                }
            }
        }

        if (!user.RSCInfo || !user.RSCInfo.companyAddress) {
            if (!req.data.companyAddress) {
                res.respond({code: 1001, message: '请填写网点地址'});
                return;
            } else if (!req.data.companyAddress.province) {
                res.respond({code: 1001, message: '请选择省份'});
                return;
            } else if (!req.data.companyAddress.city) {
                res.respond({code: 1001, message: '请选择城市'});
                return;
            } else if (!req.data.companyAddress.town) {
                res.respond({code: 1001, message: '请选择区县'});
                return;
            } else {
                if (options.RSCInfo) {
                    options.RSCInfo.companyAddress = req.data.companyAddress;
                } else {
                    options.RSCInfo = {companyAddress: req.data.companyAddress};
                }
            }
        }

        if (tools.isEmptyObject(options)) {
            res.respond({code: 1001, message: '没有可以更新的内容'});
            return;
        } else {
            options.userid = user.id;
        }

        var updator = function () {
            UserService.update(options, function (err) {
                if (err) {
                    res.respond({code: 1001, message: '更新失败'});
                    return;
                }

                res.respond({code: 1000, message: 'success'});
            })
        };

        if (options.RSCInfo && options.RSCInfo.companyAddress && options.RSCInfo.companyAddress.province) {
            AreaService.check_address(options.RSCInfo.companyAddress.province, options.RSCInfo.companyAddress.city, options.RSCInfo.companyAddress.county, options.RSCInfo.companyAddress.town, res, updator);
        } else {
            updator();
        }
    })
};

exports.json_RSC_info_get = function(req, res, next){
    if(!req.user){
        res.respond({code:1001, message:'需要登录'});
        return;
    }

    UserService.getRSCInfoById(req.user, function(err, user){
        if(err){
            res.respond({code:1001, message:'查询失败'});
            return;
        }

        res.respond({code:1000, message:'success', RSCInfo:user.RSCInfo});
    })
};

exports.json_RSC_orders_get = function(req, res, next){
    var RSC = req.user;
    var page = U.parseInt(req.data.page, 1) - 1;
    var max = U.parseInt(req.data.max, 20);
    var type = U.parseInt(req.data.type);
    var search = req.data.search;
    OrderService.getByRSC(RSC, page, max, type, function(err, orders, count, pageCount){
        if(err){
            res.respond({code:1002, message:'获取订单失败'});
            return;
        }

        generate_RSC_order_type(orders);
        res.respond({code:1000, message:'success', orders:orders, count:count, pageCount:pageCount});
    }, search)
};

exports.process_RSC_order_deliverStatus_delivering = function(req, res, next){
    var user = req.user;
    var orderId = req.data.orderId;
    var SKURefs = req.data.SKURefs;
    if(!orderId){
        res.respond({code:1001, message:'需要订单号'});
        return;
    }

    if(!SKURefs){
        res.respond({code:1001, message:'需要SKURefs'});
        return;
    }

    OrderService.get({id:orderId}, function(err, order){
        if(err || !order){
            res.respond({code:1002, message:'获取订单失败'});
            return;
        }

        // check current status to see if the current status is OK for change deliver status
        // check if order belongs to this RSC
        if(!order.RSCInfo || !order.RSCInfo.RSC || user._id.toString() != order.RSCInfo.RSC.toString()){
            res.respond({code:1002, message:'没有权利修改这个订单'});
            return;
        }

        // check if the order ispaid
        if(order.payStatus != PAYMENTSTATUS.PAID){
            res.respond({code:1002, message:'该订单尚未完全支付'});
            return;
        }

        // check if order deliver status is deliver to home
        if(order.deliveryType != DELIVERYTYPE.SONGHUO.id){
            res.respond({code:1002, message:'该订单非送货到家'});
            return;
        }

        // check if the SKU belongs to this order and if this SKU is delivered to RSC
        if(!tools.isArray(order.SKUs)){
            res.respond({code:1002, message:'该订单无SKU'});
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
                }
            }
        }

        if(!needUpdate){
            res.respond({code:1002, message:'没有需要发货的订单'});
            return;
        }

        // all check done, start to update status
        OrderService.updateSKUs(options, function(err){
            if(err){
                res.respond({code:1002, message:'更新订单失败'});
                return;
            }

            res.respond({code:1000, message:'success'});
        })
    })
};

exports.json_RSC_address_province_query = function(req, res, next){
    var options = null;
    if (typeof req.data.EPOS != 'undefined') {
        options = {EPOS:true};
    }
    if (req.data.gift) {
        if (options) {
            options.gift = req.data.gift;
        } else {
            options = {gift:req.data.gift};
        }
    }
    
    if(!req.data.products && !options){
        res.respond({code:1001, message:'请先选择商品'});
        return;
    }

    RSCService.getProvinceList(req.data.products?req.data.products.split(','):[], function(err, provinceList){
        if(err || !provinceList){
            res.respond({code:1002, message:'查询失败'});
            return;
        }

        res.respond({code:1000, message:'success', provinceList: provinceList});
    }, options);
};

exports.json_RSC_address_city_query = function(req, res, next){
    var options = null;
    if(typeof req.data.EPOS != 'undefined') {
        options = {EPOS:true};
    }
    if (req.data.gift) {
        if (options) {
            options.gift = req.data.gift;
        } else {
            options = {gift:req.data.gift};
        }
    }
    if(!req.data.products && !options){
        res.respond({code:1001, message:'请先选择商品'});
        return;
    }

    if(!req.data.province){
        res.respond({code:1001, message:'请选择省'});
        return;
    }

    RSCService.getCityList(req.data.products?req.data.products.split(','):[], req.data.province, function(err, cityList){
        if(err || !cityList){
            res.respond({code:1002, message:'查询失败'});
            return;
        }

        res.respond({code:1000, message:'success', cityList: cityList});
    }, options);
};

exports.json_RSC_address_county_query = function(req, res, next){
    var self = this;
    var options = null;
    if(typeof req.data.EPOS != 'undefined') {
        options = {EPOS:true};
    }
    if (req.data.gift) {
        if (options) {
            options.gift = req.data.gift;
        } else {
            options = {gift:req.data.gift};
        }
    }
    if(!req.data.products && !options){
        res.respond({code:1001, message:'请先选择商品'});
        return;
    }

    if(!req.data.province){
        res.respond({code:1001, message:'请选择省'});
        return;
    }

    if(!req.data.city){
        res.respond({code:1001, message:'请选择市'});
        return;
    }

    RSCService.getCountyList(req.data.products?req.data.products.split(','):[], req.data.province, req.data.city, function(err, countyList){
        if(err || !countyList){
            res.respond({code:1002, message:'查询失败'});
            return;
        }

        res.respond({code:1000, message:'success', countyList: countyList});
    }, options);
};

exports.json_RSC_address_town_query = function(req, res, next){
    var options = null;
    if(typeof req.data.EPOS != 'undefined') {
        options = {EPOS:true};
    }
    if (req.data.gift) {
        if (options) {
            options.gift = req.data.gift;
        } else {
            options = {gift:req.data.gift};
        }
    }
    if(!req.data.products && !options){
        res.respond({code:1001, message:'请先选择商品'});
        return;
    }

    if(!req.data.province){
        res.respond({code:1001, message:'请选择省'});
        return;
    }

    if(!req.data.city){
        res.respond({code:1001, message:'请选择市'});
        return;
    }

    RSCService.getTownList(req.data.products?req.data.products.split(','):[], req.data.province, req.data.city, req.data.county, function(err, townList){
        if(err || !townList){
            res.respond({code:1002, message:'查询失败'});
            return;
        }

        res.respond({code:1000, message:'success', townList: townList});
    }, options);
};

exports.json_RSC_query = function(req, res, next){
    var options = null;
    if(typeof req.data.EPOS != 'undefined') {
        options = {EPOS:true};
    }
    if (req.data.gift) {
        if (options) {
            options.gift = req.data.gift;
        } else {
            options = {gift:req.data.gift};
        }
    }
    if(!req.data.products && !options){
        res.respond({code:1001, message:'请先选择商品'});
        return;
    }
    var page = U.parseInt(req.data.page, 1) - 1;
    var max = U.parseInt(req.data.max, 20);
    RSCService.getRSCList(req.data.products?req.data.products.split(','):[], req.data.province, req.data.city, req.data.county, req.data.town, page, max, function(err, RSCs, count, pageCount){
        if(err || !RSCs){
            res.respond({code:1002, message:'查询失败'});
            return;
        }

        res.respond({code:1000, message:'success', RSCs: RSCs, count:count, pageCount:pageCount});
    }, null, options);
};

function generate_RSC_order_type(orders){
    orders.forEach(function(order) {
        order.type = OrderService.RSCOrderStatus(order);
        order.deliveryType = {type:order.deliveryType, value:DELIVERYTYPENAME[order.deliveryType]};
    })
}

exports.process_self_delivery = function(req, res, next) {
    var orderId = req.data.orderId;
    var code = req.data.code;
    var SKURefs = req.data.SKURefs;
    var RSC = req.user;

    if (!orderId) {
        res.respond({code: 1001, message: 'orderId required'});
        return;
    }

    if (!code) {
        res.respond({code: 1001, message: 'code required'});
        return;
    }

    if (!SKURefs) {
        res.respond({code: 1001, message: 'SKURefs required'});
        return;
    }

    DeliveryCodeService.checkDeliveryCode(orderId, code, function (err, pass) {
        if (err) {
            res.respond({code: 1002, message: '验证提货码失败'});
            return;
        }
        if (!pass) {
            res.respond({code: 1002, message: '自提码错误，请重新输入'});
            return;
        }

        OrderService.get({id:orderId}, function(err, order){
            if(err || !order){
                res.respond({code:1002, message:'获取订单失败'});
                return;
            }

            if(!order.RSCInfo || order.RSCInfo.RSC.toString() != RSC._id.toString()){
                res.respond({code:1002, message:'该订单不属于此网点'});
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
                    res.respond({code: 1002, message: '更新订单失败'});
                    return;
                }

                OrderService.confirm(orderId, needConfirmSKURefs, function (err) {
                    if (err) {
                        res.respond({code: 1002, message: err});
                        return;
                    }

                    res.respond({code: 1000, message: 'success'});
                })
            })
        })
    })
};

exports.json_RSC_order_detail = function(req, res, next){
    var orderId = req.data.orderId;
    var RSC = req.user;

    if(!orderId){
        res.respond({code:1001, message:'orderId required'});
        return;
    }

    if(!RSC){
        res.respond({code:1001, message:'need login'});
        return;
    }

    OrderService.get({id:orderId, 'RSC':req.user}, function(err, order, returnPayment){
        if(err || !order){
            res.respond({code:1002, message:'获取订单详情失败'});
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
                    ref:SKU.ref,
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

        res.respond({code:1000, message:'success', order:orderInfo});
    })
};
