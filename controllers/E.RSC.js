/**
 * Created by pepelu on 2016/3/4.
 */
var tools = require('../common/tools');
var services = require('../services');
var UserService = services.user;
var RSCService = services.RSC;

exports.install = function() {
    // Regional Service Centre apis
    F.route('/api/v2.2/RSC/info/get',                   json_RSC_info_get,          ['get'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/info/fill',                  process_RSC_info_fill,      ['post'],   ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/orders',                     json_RSC_orders_get,        ['get'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/order/deliverStatus/modify', process_RSC_order_deliverStatus_modify, ['post'],    ['isLoggedIn', 'isRSC']);
    F.route('/api/v2.2/RSC/address/province',           json_RSC_address_province_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/city',               json_RSC_address_city_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/county',             json_RSC_address_county_query,     ['get'],    ['isLoggedIn']);
    F.route('/api/v2.2/RSC/address/town',               json_RSC_address_town_query,     ['get'],    ['isLoggedIn']);

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
    // TODO:get order RSC should serve
    // return fields: 下单时间、订单号、收货人姓名、电话、商品名称及属性、总额、配送方式、订单状态
}

function process_RSC_order_deliverStatus_modify(){
    // TODO:modify order deliver status by given order
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