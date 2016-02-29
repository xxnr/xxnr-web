/**
 * Created by pepelu on 2016/2/26.
 */
var mongoose = require('mongoose');
var ProductModel = require('../models').product;

// Service
var RSCService = function(){};

// Method
RSCService.prototype.getProvinceList = function(products, callback){
    //TODO:return province list by given product list
};

RSCService.prototype.getCityList = function(products, province, callback){
    //TODO:return city list by given product list and province
};

RSCService.prototype.getCountyList = function(products, province, city, callback){
    //TODO:return county list by given product list, province and city
};

RSCService.prototype.getTownList = function(products, province, city, county, callback){
    //TODO:return town list by given product list, province, city and county
};

RSCService.prototype.getRSCAddressList = function(products, province, city, county, town, callback){
    //TODO:return full RSC address by given product list, province, city, county and town
};

module.exports = new RSCService();