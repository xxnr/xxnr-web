/**
 * Created by pepelu on 2016/2/26.
 */
var UserModel = require('../models').user;
var tools = require('../common/tools');

// Service
var RSCService = function(){};

// Method
RSCService.prototype.getProvinceList = function(products, callback) {
    var query = {RSCInfo: {$exists: true}};
    if (tools.isArray(products) && products.length > 0) {
        query['RSCInfo.products'] = {$all: products};
    }

    UserModel.find(query)
        .populate('RSCInfo.companyAddress.province')
        .populate('RSCInfo.companyAddress.city')
        .populate('RSCInfo.companyAddress.county')
        .populate('RSCInfo.companyAddress.town')
        .exec(function (err, RSCs) {
            if (err) {
                console.error(err);
                callback('error query RSCs:', err);
                return;
            }

            var provinceList = [];
            var provinces = {};
            RSCs.forEach(function (RSC) {
                var address = RSC.RSCInfo.companyAddress;
                if (address && address.province && !provinces[address.province._id]) {
                    provinces[address.province._id] = 1;
                    provinceList.push(address.province);
                }
            });

            callback(null, provinceList, RSCs);
        })
};

RSCService.prototype.getCityList = function(products, province, callback) {
    var query = {RSCInfo: {$exists: true}};
    if (tools.isArray(products) && products.length > 0) {
        query['RSCInfo.products'] = {$all: products};
    }

    if (province) {
        query['RSCInfo.companyAddress.province'] = province;
    }

    UserModel.find(query)
        .populate('RSCInfo.companyAddress.province')
        .populate('RSCInfo.companyAddress.city')
        .populate('RSCInfo.companyAddress.county')
        .populate('RSCInfo.companyAddress.town')
        .exec(function (err, RSCs) {
            if (err) {
                console.error(err);
                callback('error query RSCs:', err);
                return;
            }

            var cityList = [];
            var cities = {};
            RSCs.forEach(function (RSC) {
                var address = RSC.RSCInfo.companyAddress;
                if (address && address.city && !cities[address.city._id]) {
                    cities[address.city._id] = 1;
                    cityList.push(address.city);
                }
            });

            callback(null, cityList);
        })
};

RSCService.prototype.getCountyList = function(products, province, city, callback) {
    var query = {RSCInfo: {$exists: true}};
    if (tools.isArray(products) && products.length > 0) {
        query['RSCInfo.products'] = {$all: products};
    }

    if (province) {
        query['RSCInfo.companyAddress.province'] = province;
    }

    if (city) {
        query['RSCInfo.companyAddress.city'] = city;
    }

    UserModel.find(query)
        .populate('RSCInfo.companyAddress.province')
        .populate('RSCInfo.companyAddress.city')
        .populate('RSCInfo.companyAddress.county')
        .populate('RSCInfo.companyAddress.town')
        .exec(function (err, RSCs) {
            if (err) {
                console.error(err);
                callback('error query RSCs:', err);
                return;
            }

            var countyList = [];
            var counties = {};
            RSCs.forEach(function (RSC) {
                var address = RSC.RSCInfo.companyAddress;
                if (address && address.county && !counties[address.county._id]) {
                    counties[address.county._id] = 1;
                    countyList.push(address.county);
                }
            });

            callback(null, countyList);
        })
};

RSCService.prototype.getTownList = function(products, province, city, county, callback) {
    var query = {RSCInfo: {$exists: true}};
    if (tools.isArray(products) && products.length > 0) {
        query['RSCInfo.products'] = {$all: products};
    }

    if (province) {
        query['RSCInfo.companyAddress.province'] = province;
    }

    if (city) {
        query['RSCInfo.companyAddress.city'] = city;
    }

    if (county) {
        query['RSCInfo.companyAddress.county'] = county;
    }

    UserModel.find(query)
        .populate('RSCInfo.companyAddress.province')
        .populate('RSCInfo.companyAddress.city')
        .populate('RSCInfo.companyAddress.county')
        .populate('RSCInfo.companyAddress.town')
        .exec(function (err, RSCs) {
            if (err) {
                console.error(err);
                callback('error query RSCs:', err);
                return;
            }

            var townList = [];
            var towns = {};
            RSCs.forEach(function (RSC) {
                var address = RSC.RSCInfo.companyAddress;
                if (address && address.town && !towns[address.town._id]) {
                    towns[address.town._id] = 1;
                    townList.push(address.town);
                }
            });

            callback(null, townList);
        })
};

RSCService.prototype.getRSCList = function(products, province, city, county, town, page, max, callback, search) {
    var query = {RSCInfo:{$exists:true}, typeVerified:{$all:[5]}};
    if(tools.isArray(products) && products.length>0){
        query['RSCInfo.products'] = {$all: products};
    }

    if(province){
        query['RSCInfo.companyAddress.province'] = province;
    }

    if(city){
        query['RSCInfo.companyAddress.city'] = city;
    }

    if(county){
        query['RSCInfo.companyAddress.county'] = county;
    }

    if(town){
        query['RSCInfo.companyAddress.town'] = town;
    }

    if(page<0 || !page){
        page = 0;
    }

    if(max<0 || !max){
        max = 10;
    }

    if(max>50){
        max = 50;
    }

    if(search){
        query.$or = [{'RSCInfo.name':new RegExp(search)}
            , {'RSCInfo.phone':new RegExp(search)}
            , {'RSCInfo.companyName':new RegExp(search)}];
    }

    UserModel.count(query, function(err, count) {
        if (err) {
            console.error(err);
            callback('error query RSCs:', err);
            return;
        }

        UserModel.find(query)
            .populate('RSCInfo.companyAddress.province')
            .populate('RSCInfo.companyAddress.city')
            .populate('RSCInfo.companyAddress.county')
            .populate('RSCInfo.companyAddress.town')
            .select('id RSCInfo.name RSCInfo.phone RSCInfo.companyName RSCInfo.companyAddress')
            .skip(page * max)
            .limit(max)
            .exec(function (err, RSCs) {
                if (err) {
                    console.error(err);
                    callback('error query RSCs:', err);
                    return;
                }

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, RSCs, count, pageCount);
            })
    })
};

RSCService.prototype.modifyRSCInfo = function(id, setOptions, callback){
    if(!id){
        callback('id required');
        return;
    }

    var setValues = {};
    if(setOptions.companyName)
        setValues['RSCInfo.companyName']= setOptions.companyName;
    if(setOptions.name)
        setValues['RSCInfo.name'] = setOptions.name;
    if(setOptions.IDNo)
        setValues['RSCInfo.IDNo'] = setOptions.IDNo;
    if(setOptions.phone)
        setValues['RSCInfo.phone'] = setOptions.phone;
    if(setOptions.province)
        setValues['RSCInfo.companyAddress.province'] = setOptions.province;
    if(setOptions.city)
        setValues['RSCInfo.companyAddress.city'] = setOptions.city;
    if(setOptions.county)
        setValues['RSCInfo.companyAddress.county'] = setOptions.county;
    if(setOptions.town)
        setValues['RSCInfo.companyAddress.town'] = setOptions.town;
    if(setOptions.detailAddress)
        setValues['RSCInfo.companyAddress.details'] = setOptions.detailAddress;
    if(setOptions.products && tools.isArray(setOptions.products))
        setValues['RSCInfo.products'] = setOptions.products;
    if(typeof setOptions.supportEPOS != 'undefined') {
        if (setOptions.supportEPOS) {
            setValues['RSCInfo.supportEPOS'] = true;
        } else {
            setValues['RSCInfo.supportEPOS'] = false;
        }
    }
        setValues['RSCInfo.EPOSNo'] = setOptions.EPOSNo;
    
    UserModel.update({id:id}, {$set:setValues}, function(err, numUpdated){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        if(numUpdated.updated == 0){
            callback('修改失败')
        }

        callback();
    })
};

module.exports = new RSCService();