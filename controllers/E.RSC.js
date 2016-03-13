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

exports.install = function() {
    // RSC info related
    F.route('/api/v2.2/RSC/info/get',                   json_RSC_info_get,          ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/info/fill',                  process_RSC_info_fill,      ['post'],   ['isLoggedIn']);

    // RSC address query related
    F.route('/api/v2.2/RSC/address/province',           json_RSC_address_province_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/city',               json_RSC_address_city_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/county',             json_RSC_address_county_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/town',               json_RSC_address_town_query,     ['get'],    ['isLoggedIn']);

    // RSC order related
    // TODO: not tested/documented apis,
    F.route('/api/v2.2/RSC/orders',                         json_RSC_orders_get,        ['get'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/order/deliverStatus/delivering', process_RSC_order_deliverStatus_delivering, ['post'],    ['isLoggedIn', 'isRSC']);
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
    var type = self.data.type;
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
    var SKURef = self.data.SKURef;
    if(!orderId){
        self.respond({code:1001, message:'需要订单号'});
        return;
    }

    OrderService.get({id:orderId}, function(err, order){
        if(err || !order){
            self.respond({code:1002, message:'获取订单失败'});
            return;
        }

        // check current status to see if the current status is OK for change deliver status
        // check if order belongs to this RSC
        if(!order.RSCInfo || !order.RSCInfo.RSC || user._id != order.RSCInfo.RSC){
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
        if(!tools.isArray(orders.SKUs)){
            self.respond({code:1002, message:'该订单无SKU'});
            return;
        }

        var SKUBelongsToOrder = false;
        var SKUtoDeliver;
        for(var i = 0; i < orders.SKUs.length; i++){
            var SKU = orders.SKUs[i];
            if(SKU.ref == SKURef){
                SKUBelongsToOrder = true;
                if(SKU.deliverStatus != DELIVERSTATUS.RSCRECEIVED){
                    self.respond({code:1002, message:'该SKU还未到达服务站'});
                    return;
                } else{
                    SKUtoDeliver = SKU;
                    break;
                }
            }
        }

        if(!SKUBelongsToOrder){
            self.respond({code:1002, message:'该SKU不属于该订单'});
            return;
        }

        // all check done, start to update status
        var options = {id:order.id, SKUs:[]};
        options.SKUs[SKUtoDeliver.ref] = {deliverStatus: DELIVERSTATUS.DELIVERED};
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

    var page = U.parseInt(self.data.page, 1) - 1;
    var max = U.parseInt(self.data.max, 20);
    RSCService.getProvinceList(self.data.products.split(','), page, max, function(err, provinceList, RSCs, count, pageCount){
        if(err || !provinceList || !RSCs){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', provinceList: provinceList, RSCs: RSCs, count:count, pageCount:pageCount});
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

    var page = U.parseInt(self.data.page, 1) - 1;
    var max = U.parseInt(self.data.max, 20);
    RSCService.getCityList(self.data.products.split(','), self.data.province, page, max, function(err, cityList, RSCs, count, pageCount){
        if(err || !cityList || !RSCs){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', cityList: cityList, RSCs: RSCs, count:count, pageCount:pageCount});
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

    var page = U.parseInt(self.data.page, 1) - 1;
    var max = U.parseInt(self.data.max, 20);
    RSCService.getCountyList(self.data.products.split(','), self.data.province, self.data.city, page, max, function(err, countyList, RSCs, count, pageCount){
        if(err || !countyList || !RSCs){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', countyList: countyList, RSCs: RSCs, count:count, pageCount:pageCount});
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

    var page = U.parseInt(self.data.page, 1) - 1;
    var max = U.parseInt(self.data.max, 20);
    RSCService.getTownList(self.data.products.split(','), self.data.province, self.data.city, self.data.town, page, max, function(err, townList, RSCs, count, pageCount){
        if(err || !townList || !RSCs){
            self.respond({code:1002, message:'查询失败'});
            return;
        }

        self.respond({code:1000, message:'success', townList: townList, RSCs: RSCs, count:count, pageCount:pageCount});
    })
}

function generate_RSC_order_type(orders){
    /**
     * Order types
     * -1   :   已关闭
     * 1    :   待付款
     * 2    :   待审核
     * 3    :   待发货
     * 4    :   待配送(有一件商品为已到服务站，且配送方式为送货到家, 订单状态为已到服务站)
     * 5    :   待自提(有一件商品为已到服务站，且配送方式为自提, 订单状态为已到服务站)
     * 6    :   待收货(有一件商品为已发货(配送中),订单状态为部分发货或者已发货)
     * 7    :   已完成(全部商品为确认收货)
     */
    orders.forEach(function(order) {
        if (order.payStatus === PAYMENTSTATUS.PARTPAID) {
            if (order.pendingApprove) {
                order.type = 2;
            } else {
                order.type = 1;
            }
        } else if (order.payStatus === PAYMENTSTATUS.PAID) {
            if (order.deliverStatus === DELIVERSTATUS.RSCRECEIVED) {
                if (order.deliveryType === DELIVERYTYPE.ZITI.id) {
                    order.type = 5;
                } else if (order.deliveryType === DELIVERYTYPE.SONGHUO.id) {
                    order.type = 4;
                }
            } else if (order.deliverStatus === DELIVERSTATUS.PARTDELIVERED || order.deliverStatus === DELIVERSTATUS.DELIVERED) {
                if (order.confirmed) {
                    order.type = 7;
                } else {
                    order.type = 6;
                }
            } else {
                order.type = 3;
            }
        } else {
            if (order.pendingApprove) {
                order.type = 2;
            } else if (order.isClosed) {
                order.type = -1;
            } else {
                order.type = 1;
            }
        }
    })
}