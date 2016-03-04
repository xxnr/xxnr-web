/**
 * Created by pepelu on 2016/2/26.
 */
var mongoose = require('mongoose');
var ProductModel = require('../models').product;
var UserModel = require('../models').user;
var tools = require('../common/tools');

// Service
var RSCService = function(){};

// Method
RSCService.prototype.getProvinceList = function(products, page, max, callback) {
    var query = {RSCInfo:{$exists:true}};
    if(tools.isArray(products) && products.length>0){
        query['RSCInfo.products'] = {$all: products};
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

    UserModel.count(query, function(err, count){
        if(err){
            console.error(err);
            callback('error query RSCs:', err);
            return;
        }

        UserModel.find(query)
            .populate('RSCInfo.companyAddress.province')
            .populate('RSCInfo.companyAddress.city')
            .populate('RSCInfo.companyAddress.county')
            .populate('RSCInfo.companyAddress.town')
            .select('RSCInfo')
            .skip(page * max)
            .limit(max)
            .exec(function (err, RSCs) {
                if (err) {
                    console.error(err);
                    callback('error query RSCs:', err);
                    return;
                }

                var provinceList = [];
                RSCs.forEach(function (RSC) {
                    if(RSC.RSCInfo.companyAddress && RSC.RSCInfo.companyAddress.province) {
                        provinceList.push(RSC.RSCInfo.companyAddress.province);
                    }
                });

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, provinceList, RSCs, count, pageCount);
            })
    })
};

RSCService.prototype.getCityList = function(products, province, page, max, callback){
    var query = {RSCInfo:{$exists:true}};
    if(tools.isArray(products) && products.length>0){
        query['RSCInfo.products'] = {$all: products};
    }

    if(province){
        query['RSCInfo.companyAddress.province'] = province;
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
            .select('RSCInfo')
            .skip(page * max)
            .limit(max)
            .exec(function (err, RSCs) {
                if (err) {
                    console.error(err);
                    callback('error query RSCs:', err);
                    return;
                }

                var cityList = [];
                RSCs.forEach(function (RSC) {
                    if (RSC.RSCInfo.companyAddress && RSC.RSCInfo.companyAddress.city) {
                        cityList.push(RSC.RSCInfo.companyAddress.city);
                    }
                });

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, cityList, RSCs, count, pageCount);
            })
    })
};

RSCService.prototype.getCountyList = function(products, province, city, page, max, callback){
    var query = {RSCInfo:{$exists:true}};
    if(tools.isArray(products) && products.length>0){
        query['RSCInfo.products'] = {$all: products};
    }

    if(province){
        query['RSCInfo.companyAddress.province'] = province;
    }

    if(city){
        query['RSCInfo.companyAddress.city'] = city;
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
            .select('RSCInfo')
            .skip(page * max)
            .limit(max)
            .exec(function (err, RSCs) {
                if (err) {
                    console.error(err);
                    callback('error query RSCs:', err);
                    return;
                }

                var countyList = [];
                RSCs.forEach(function (RSC) {
                    if (RSC.RSCInfo.companyAddress && RSC.RSCInfo.companyAddress.county) {
                        countyList.push(RSC.RSCInfo.companyAddress.county);
                    }
                });

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, countyList, RSCs, count, pageCount);
            })
    })
};

RSCService.prototype.getTownList = function(products, province, city, county, page, max, callback){
    var query = {RSCInfo:{$exists:true}};
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

    if(page<0 || !page){
        page = 0;
    }

    if(max<0 || !max){
        max = 10;
    }

    if(max>50){
        max = 50;
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
            .select('RSCInfo')
            .skip(page * max)
            .limit(max)
            .exec(function (err, RSCs) {
                if (err) {
                    console.error(err);
                    callback('error query RSCs:', err);
                    return;
                }

                var townList = [];
                RSCs.forEach(function (RSC) {
                    if (RSC.RSCInfo.companyAddress && RSC.RSCInfo.companyAddress.town) {
                        townList.push(RSC.RSCInfo.companyAddress.town);
                    }
                });

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, townList, RSCs, count, pageCount);
            })
    })
};

module.exports = new RSCService();